'use server'

import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isMultiEventSchemaAvailable, isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getActiveEvent } from '@/lib/events'

const LEGACY_SINGLE_EVENT_ID = 'legacy-single-event'

/** Deletes all gameplay/app data for the active event only. Other events and the event row itself are kept. */
export async function resetActiveEventData() {
  if (!(await isMultiEventSchemaAvailable())) {
    redirect('/superadmin?reset=schema-required')
  }

  const activeEvent = await getActiveEvent()
  const eventId =
    activeEvent && activeEvent.id !== LEGACY_SINGLE_EVENT_ID
      ? activeEvent.id
      : (await prisma.event.findFirst({ orderBy: { createdAt: 'asc' } }))?.id

  if (!eventId) {
    redirect('/superadmin?reset=no-event')
  }

  try {
    if (await isTriviaAvailable()) {
      await prisma.triviaPowerUsage.deleteMany({ where: { eventId } })
      await prisma.triviaCategory.deleteMany({ where: { eventId } })
    }

    await prisma.publicSighting.deleteMany({ where: { eventId } })
    await prisma.hypeVote.deleteMany({ where: { eventId } })
    await prisma.hypeEvent.deleteMany({ where: { eventId } })
    await prisma.commentary.deleteMany({ where: { eventId } })

    const usersInEvent = await prisma.user.findMany({
      where: { eventId },
      select: { personId: true },
    })
    const personIdsToMaybeDelete = [
      ...new Set(
        usersInEvent.map((u) => u.personId).filter((id): id is string => id != null),
      ),
    ]

    await prisma.user.deleteMany({ where: { eventId } })
    await prisma.team.deleteMany({ where: { eventId } })

    if (personIdsToMaybeDelete.length > 0) {
      await prisma.person.deleteMany({
        where: {
          id: { in: personIdsToMaybeDelete },
          users: { none: {} },
        },
      })
    }

    console.log(`Event-scoped reset completed for eventId=${eventId}`)
  } catch (error) {
    console.error('Error resetting active event data:', error)
    throw new Error('Failed to reset active event data')
  }

  revalidatePath('/app')
  revalidatePath('/app/players')
  revalidatePath('/app/teams')
  revalidatePath('/app/feed')
  revalidatePath('/app/stats')
  revalidatePath('/app/profile')
  revalidatePath('/superadmin')
  revalidatePath('/superadmin/trivia')
  revalidatePath('/superadmin/bachelor')
  revalidatePath('/')
  revalidatePath('/dashboard')

  redirect('/superadmin?reset=success')
}

export async function updateActiveEventName(formData: FormData) {
  const rawName = formData.get('eventName')
  const eventName = typeof rawName === 'string' ? rawName.trim() : ''

  if (!eventName) {
    redirect('/superadmin?event=missing-name')
  }

  try {
    const activeEvent = await getActiveEvent()
    if (!activeEvent) {
      redirect('/superadmin?event=no-active-event')
    }

    await prisma.event.update({
      where: { id: activeEvent.id },
      data: { name: eventName },
    })

    revalidatePath('/app')
    revalidatePath('/app/players')
    revalidatePath('/app/teams')
    revalidatePath('/app/feed')
    revalidatePath('/app/stats')
    revalidatePath('/app/profile')
    revalidatePath('/superadmin')
    revalidatePath('/')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error updating active event name:', error)
    redirect('/superadmin?event=error')
  }

  redirect('/superadmin?event=updated')
}
