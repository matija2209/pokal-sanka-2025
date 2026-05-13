'use server'

import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-utils'

export async function createEventAction(formData: FormData) {
  await requireAdmin()

  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const rawSlug = (formData.get('slug') as string | null)?.trim() ?? ''

  if (name.length < 2) {
    redirect('/admin?error=invalid-name')
  }

  const slug = rawSlug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  if (!slug) {
    redirect('/admin?error=invalid-slug')
  }

  const existing = await prisma.event.findUnique({ where: { slug } })
  if (existing) {
    redirect(`/admin?error=slug-exists&slug=${encodeURIComponent(slug)}`)
  }

  await prisma.event.create({
    data: { name, slug },
  })

  revalidatePath('/admin')
  redirect(`/admin?created=${encodeURIComponent(slug)}`)
}

export async function upsertEventLandingPageAction(formData: FormData) {
  await requireAdmin()

  const eventId = (formData.get('eventId') as string | null)?.trim() ?? ''
  const title = (formData.get('title') as string | null)?.trim() ?? ''
  const description = (formData.get('description') as string | null)?.trim() ?? ''
  const rawGallery = (formData.get('galleryImages') as string | null) ?? ''
  const ctaText = (formData.get('ctaText') as string | null)?.trim() || 'Enter'

  if (!eventId || !title) {
    redirect('/admin?error=missing-fields')
  }

  const galleryImages = rawGallery
    .split('\n')
    .map((u) => u.trim())
    .filter((u) => u.length > 0)

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } })
  if (!event) {
    redirect('/admin?error=event-not-found')
  }

  await prisma.eventLandingPage.upsert({
    where: { eventId },
    create: {
      eventId,
      title,
      description,
      galleryImages,
      ctaText,
    },
    update: {
      title,
      description,
      galleryImages,
      ctaText,
    },
  })

  revalidatePath('/admin')
  revalidatePath(`/event/${event.slug}`)
  redirect(`/admin?updated=${encodeURIComponent(event.slug)}`)
}
