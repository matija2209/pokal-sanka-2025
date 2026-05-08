import 'server-only'

import { cookies } from 'next/headers'
import { cache } from 'react'
import { prisma } from '@/lib/prisma/client'
import type { Event } from '@/lib/prisma/types'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

export const ACTIVE_EVENT_COOKIE_NAME = 'turnir-sanka-event-id'
export const DEFAULT_LEGACY_EVENT_SLUG = 'birthday-party-legacy'
export const DEFAULT_LEGACY_EVENT_NAME = 'Birthday Party'
export const DEFAULT_BACHELOR_EVENT_SLUG = 'bachelor-party'
export const DEFAULT_BACHELOR_EVENT_NAME = 'Bachelor Party'

function getLegacyFallbackEvent(): Event {
  return {
    id: 'legacy-single-event',
    slug: DEFAULT_LEGACY_EVENT_SLUG,
    name: DEFAULT_LEGACY_EVENT_NAME,
    isActive: true,
    createdAt: new Date(0),
  }
}

export const getAllEvents = cache(async (): Promise<Event[]> => {
  if (!(await isMultiEventSchemaAvailable())) {
    return [getLegacyFallbackEvent()]
  }

  return prisma.event.findMany({
    where: { isActive: true },
    orderBy: [
      { createdAt: 'asc' },
      { name: 'asc' },
    ],
  })
})

export const getEventById = cache(async (eventId: string): Promise<Event | null> => {
  if (!eventId) {
    return null
  }

  if (!(await isMultiEventSchemaAvailable())) {
    const legacyEvent = getLegacyFallbackEvent()
    return eventId === legacyEvent.id ? legacyEvent : null
  }

  return prisma.event.findUnique({
    where: { id: eventId },
  })
})

export const getEventBySlug = cache(async (slug: string): Promise<Event | null> => {
  if (!slug) {
    return null
  }

  if (!(await isMultiEventSchemaAvailable())) {
    const legacyEvent = getLegacyFallbackEvent()
    return slug === legacyEvent.slug ? legacyEvent : null
  }

  return prisma.event.findUnique({
    where: { slug },
  })
})

export async function getOrCreateDefaultEvents(): Promise<Event[]> {
  if (!(await isMultiEventSchemaAvailable())) {
    return [getLegacyFallbackEvent()]
  }

  const existingEvents = await prisma.event.findMany({
    orderBy: [
      { createdAt: 'asc' },
      { name: 'asc' },
    ],
  })

  if (existingEvents.length > 0) {
    return existingEvents
  }

  await prisma.event.createMany({
    data: [
      {
        slug: DEFAULT_LEGACY_EVENT_SLUG,
        name: DEFAULT_LEGACY_EVENT_NAME,
      },
      {
        slug: DEFAULT_BACHELOR_EVENT_SLUG,
        name: DEFAULT_BACHELOR_EVENT_NAME,
      },
    ],
    skipDuplicates: true,
  })

  return prisma.event.findMany({
    orderBy: [
      { createdAt: 'asc' },
      { name: 'asc' },
    ],
  })
}

export const getActiveEvent = cache(async (): Promise<Event | null> => {
  const eventCookieStore = await cookies()
  const activeEventId = eventCookieStore.get(ACTIVE_EVENT_COOKIE_NAME)?.value

  if (activeEventId) {
    const event = await getEventById(activeEventId)
    if (event) {
      return event
    }
  }

  const events = await getOrCreateDefaultEvents()
  const fallbackEvent = events[0] ?? null
  return fallbackEvent
})

/** HTML/meta brand line from the active event (for titles and descriptions). */
export async function getSiteBrandParts(): Promise<{
  eventName: string
  brand: string
}> {
  const activeEvent = await getActiveEvent()
  const eventName = activeEvent?.name?.trim() || 'Turnir'
  const brand = `Pokal Šanka — ${eventName}`
  return { eventName, brand }
}

export async function requireActiveEventId(): Promise<string> {
  const activeEvent = await getActiveEvent()

  if (!activeEvent) {
    throw new Error('No active event configured')
  }

  return activeEvent.id
}

export async function setActiveEventCookie(eventId: string): Promise<void> {
  const eventCookieStore = await cookies()
  eventCookieStore.set(ACTIVE_EVENT_COOKIE_NAME, eventId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}

export async function requireBachelorEventId(): Promise<string> {
  if (!(await isMultiEventSchemaAvailable())) {
    const legacy = getLegacyFallbackEvent()
    return legacy.id
  }

  let event = await getEventBySlug(DEFAULT_BACHELOR_EVENT_SLUG)

  if (!event) {
    event = await prisma.event.create({
      data: {
        slug: DEFAULT_BACHELOR_EVENT_SLUG,
        name: DEFAULT_BACHELOR_EVENT_NAME,
      },
    })
  }

  return event.id
}
