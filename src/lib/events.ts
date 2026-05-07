import 'server-only'

import { cookies } from 'next/headers'
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

export async function getAllEvents(): Promise<Event[]> {
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
}

export async function getEventById(eventId: string): Promise<Event | null> {
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
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
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
}

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

export async function getActiveEvent(): Promise<Event | null> {
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
