import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma/client'
import { getEventById } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

type RouteContext = {
  params: Promise<{
    eventId: string
  }>
}

function safeFileName(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, '_').replace(/^_+|_+$/g, '') || 'qr'
}

function getAppUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  return new URL(request.url).origin
}

export async function GET(request: Request, context: RouteContext) {
  if (!(await isMultiEventSchemaAvailable())) {
    return new NextResponse('Multi-event schema unavailable', { status: 400 })
  }

  const { eventId } = await context.params
  const event = await getEventById(eventId)
  if (!event) return new NextResponse('Event not found', { status: 404 })

  const url = new URL(request.url)
  const scope = url.searchParams.get('scope') ?? 'players'

  const players = await prisma.user.findMany({
    where: { eventId: event.id },
    include: { person: true },
    orderBy: { name: 'asc' },
  })

  const persons = scope === 'all'
    ? await prisma.person.findMany({ orderBy: { name: 'asc' } })
    : players.map((player) => player.person).filter((person): person is NonNullable<typeof person> => Boolean(person))

  if (persons.length === 0) {
    return new NextResponse('No invites to export', { status: 404 })
  }

  const appUrl = getAppUrl(request)
  const zip = new JSZip()
  const usedNames = new Set<string>()

  for (const person of persons) {
    const inviteUrl = `${appUrl}/invite/${event.slug}/${person.id}`
    const png = await QRCode.toBuffer(inviteUrl, {
      width: 800,
      margin: 2,
      errorCorrectionLevel: 'M',
    })

    let baseName = safeFileName(person.name)
    let candidate = `${baseName}.png`
    let counter = 2
    while (usedNames.has(candidate)) {
      candidate = `${baseName}-${counter}.png`
      counter += 1
    }
    usedNames.add(candidate)

    zip.file(candidate, png)
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
  const eventSlug = safeFileName(event.slug || event.name)
  const filename = `qr-codes-${eventSlug}.zip`

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
