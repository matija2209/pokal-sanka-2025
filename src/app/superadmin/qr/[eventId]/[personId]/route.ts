import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma/client'
import { getEventById } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

type RouteContext = {
  params: Promise<{
    eventId: string
    personId: string
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

  const { eventId, personId } = await context.params

  const [event, person] = await Promise.all([
    getEventById(eventId),
    prisma.person.findUnique({ where: { id: personId } }),
  ])

  if (!event || !person) {
    return new NextResponse('Not found', { status: 404 })
  }

  const inviteUrl = `${getAppUrl(request)}/invite/${event.slug}/${person.id}`
  const png = await QRCode.toBuffer(inviteUrl, {
    width: 800,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  const filename = `${safeFileName(person.name)}.png`

  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
