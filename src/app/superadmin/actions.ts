'use server'

import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isMultiEventSchemaAvailable, isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getActiveEvent, getEventById } from '@/lib/events'
import { getUserByPersonAndEvent } from '@/lib/prisma/fetchers/user-fetchers'
import { deletePostForSuperadmin } from '@/lib/prisma/fetchers/post-fetchers'
import { getNextAvailableColor } from '@/lib/utils/colors'
import { requireAdmin } from '@/lib/auth-utils'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const LEGACY_SINGLE_EVENT_ID = 'legacy-single-event'

function revalidateAdminAndAppPaths() {
  revalidatePath('/app')
  revalidatePath('/app/players')
  revalidatePath('/app/teams')
  revalidatePath('/app/feed')
  revalidatePath('/app/stats')
  revalidatePath('/app/profile')
  revalidatePath('/superadmin')
  revalidatePath('/superadmin/posts')
  revalidatePath('/superadmin/trivia')
  revalidatePath('/superadmin/bachelor')
  revalidatePath('/')
  revalidatePath('/dashboard')
}

function normalizeName(rawName: FormDataEntryValue | null): string {
  return typeof rawName === 'string' ? rawName.trim() : ''
}

function resolveManageEventId(formData?: FormData): string | null {
  const rawManageEventId = formData?.get('manageEventId')
  return typeof rawManageEventId === 'string' && rawManageEventId.trim().length > 0
    ? rawManageEventId.trim()
    : null
}

function getManageRedirectPath(params: { status?: string; error?: string; manageEventId?: string | null }): string {
  const searchParams = new URLSearchParams()
  if (params.status) {
    searchParams.set('manage', params.status)
  }
  if (params.error) {
    searchParams.set('manageError', params.error)
  }
  if (params.manageEventId) {
    searchParams.set('manageEventId', params.manageEventId)
  }
  const query = searchParams.toString()
  return query ? `/superadmin?${query}` : '/superadmin'
}

function redirectManage(status: string, manageEventId?: string | null): never {
  redirect(getManageRedirectPath({ status, manageEventId }))
}

function redirectManageError(error: string, manageEventId?: string | null): never {
  redirect(getManageRedirectPath({ error, manageEventId }))
}

async function requireSuperadminActiveEvent(): Promise<NonNullable<Awaited<ReturnType<typeof getActiveEvent>>>> {
  const activeEvent = await getActiveEvent()
  if (!activeEvent) {
    redirectManageError('no-active-event')
  }

  return activeEvent
}

async function requireSuperadminManagedEvent(
  formData: FormData,
): Promise<NonNullable<Awaited<ReturnType<typeof getActiveEvent>>>> {
  const manageEventId = resolveManageEventId(formData)
  if (manageEventId) {
    const event = await getEventById(manageEventId)
    if (event) {
      return event
    }
  }

  return requireSuperadminActiveEvent()
}

export async function resetEventDataById(eventId: string) {
  if (await isTriviaAvailable()) {
    await prisma.triviaPowerUsage.deleteMany({ where: { eventId } })
    await prisma.triviaCategory.deleteMany({ where: { eventId } })
  }

  await prisma.publicSighting.deleteMany({ where: { eventId } })
  await prisma.hypeVote.deleteMany({ where: { eventId } })
  await prisma.hypeEvent.deleteMany({ where: { eventId } })
  await prisma.commentary.deleteMany({ where: { eventId } })
  await prisma.post.deleteMany({ where: { eventId } })
  await prisma.drinkLog.deleteMany({ where: { eventId } })

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
}

/** Deletes all gameplay/app data for the active event only. Other events and the event row itself are kept. */
export async function resetActiveEventData() {
  await requireAdmin()

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
    await resetEventDataById(eventId)

    console.log(`Event-scoped reset completed for eventId=${eventId}`)
  } catch (error) {
    console.error('Error resetting active event data:', error)
    throw new Error('Failed to reset active event data')
  }

  revalidateAdminAndAppPaths()

  redirect('/superadmin?reset=success')
}

export async function updateActiveEventName(formData: FormData) {
  await requireAdmin()

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

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error updating active event name:', error)
    redirect('/superadmin?event=error')
  }

  redirect('/superadmin?event=updated')
}

export async function createTeamAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const name = normalizeName(formData.get('name'))
  if (name.length < 2) {
    redirectManageError('invalid-team-name', manageEventId)
  }

  const managedEvent = await requireSuperadminManagedEvent(formData)

  try {
    const existingTeams = await prisma.team.findMany({
      where: { eventId: managedEvent.id },
      orderBy: { name: 'asc' },
    })

    await prisma.team.create({
      data: {
        name,
        color: getNextAvailableColor(existingTeams),
        eventId: managedEvent.id,
      },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error creating team:', error)
    redirectManageError('create-team-failed', manageEventId)
  }

  redirectManage('team-created', manageEventId)
}

export async function updateTeamAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const teamId = typeof formData.get('teamId') === 'string' ? formData.get('teamId') as string : ''
  const name = normalizeName(formData.get('name'))

  if (!teamId) {
    redirectManageError('missing-team', manageEventId)
  }

  if (name.length < 2) {
    redirectManageError('invalid-team-name', manageEventId)
  }

  const managedEvent = await requireSuperadminManagedEvent(formData)

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, eventId: managedEvent.id },
      select: { id: true },
    })

    if (!team) {
      redirectManageError('missing-team', manageEventId)
    }

    await prisma.team.update({
      where: { id: teamId },
      data: { name },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error updating team:', error)
    redirectManageError('update-team-failed', manageEventId)
  }

  redirectManage('team-updated', manageEventId)
}

export async function deleteTeamAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const teamId = typeof formData.get('teamId') === 'string' ? formData.get('teamId') as string : ''
  if (!teamId) {
    redirectManageError('missing-team', manageEventId)
  }

  const managedEvent = await requireSuperadminManagedEvent(formData)

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, eventId: managedEvent.id },
      select: {
        id: true,
        _count: {
          select: { users: true },
        },
      },
    })

    if (!team) {
      redirectManageError('missing-team', manageEventId)
    }

    if (team._count.users > 0) {
      redirectManageError('team-has-players', manageEventId)
    }

    await prisma.team.delete({
      where: { id: teamId },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error deleting team:', error)
    redirectManageError('delete-team-failed', manageEventId)
  }

  redirectManage('team-deleted', manageEventId)
}

export async function createPersonAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const name = normalizeName(formData.get('name'))
  if (name.length < 2) {
    redirectManageError('invalid-person-name', manageEventId)
  }

  try {
    await prisma.person.create({
      data: { name },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error creating person:', error)
    redirectManageError('create-person-failed', manageEventId)
  }

  redirectManage('person-created', manageEventId)
}

export async function updatePersonAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const personId = typeof formData.get('personId') === 'string' ? formData.get('personId') as string : ''
  const name = normalizeName(formData.get('name'))

  if (!personId) {
    redirectManageError('missing-person', manageEventId)
  }

  if (name.length < 2) {
    redirectManageError('invalid-person-name', manageEventId)
  }

  try {
    await prisma.person.update({
      where: { id: personId },
      data: { name },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error updating person:', error)
    redirectManageError('update-person-failed', manageEventId)
  }

  redirectManage('person-updated', manageEventId)
}

export async function deletePersonAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const personId = typeof formData.get('personId') === 'string' ? formData.get('personId') as string : ''
  if (!personId) {
    redirectManageError('missing-person', manageEventId)
  }

  try {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: {
        _count: {
          select: { users: true },
        },
      },
    })

    if (!person) {
      redirectManageError('missing-person', manageEventId)
    }

    if (person._count.users > 0) {
      redirectManageError('person-has-players', manageEventId)
    }

    await prisma.person.delete({
      where: { id: personId },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error deleting person:', error)
    redirectManageError('delete-person-failed', manageEventId)
  }

  redirectManage('person-deleted', manageEventId)
}

export async function createPlayerForPersonAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const personId = typeof formData.get('personId') === 'string' ? formData.get('personId') as string : ''
  const playerName = normalizeName(formData.get('playerName'))

  if (!personId) {
    redirectManageError('missing-person', manageEventId)
  }

  const managedEvent = await requireSuperadminManagedEvent(formData)

  try {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { id: true, name: true },
    })

    if (!person) {
      redirectManageError('missing-person', manageEventId)
    }

    const existingUser = await getUserByPersonAndEvent(personId, managedEvent.id)
    if (existingUser) {
      redirectManageError('player-already-exists', manageEventId)
    }

    await prisma.user.create({
      data: {
        name: playerName || person.name,
        eventId: managedEvent.id,
        personId: person.id,
      },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error creating player for person:', error)
    redirectManageError('create-player-failed', manageEventId)
  }

  redirectManage('player-created', manageEventId)
}

export async function updatePlayerAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  const playerId = typeof formData.get('playerId') === 'string' ? formData.get('playerId') as string : ''
  const name = normalizeName(formData.get('name'))
  const rawTeamId = typeof formData.get('teamId') === 'string' ? formData.get('teamId') as string : ''
  const teamId = rawTeamId || null

  if (!playerId) {
    redirectManageError('missing-player', manageEventId)
  }

  if (name.length < 2) {
    redirectManageError('invalid-player-name', manageEventId)
  }

  const managedEvent = await requireSuperadminManagedEvent(formData)

  try {
    const player = await prisma.user.findFirst({
      where: { id: playerId, eventId: managedEvent.id },
      select: { id: true },
    })

    if (!player) {
      redirectManageError('missing-player', manageEventId)
    }

    if (teamId) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, eventId: managedEvent.id },
        select: { id: true },
      })

      if (!team) {
        redirectManageError('invalid-team', manageEventId)
      }
    }

    await prisma.user.update({
      where: { id: playerId },
      data: {
        name,
        teamId,
      },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error updating player:', error)
    redirectManageError('update-player-failed', manageEventId)
  }

  redirectManage('player-updated', manageEventId)
}

export async function deletePlayerAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  const playerId = typeof formData.get('playerId') === 'string' ? formData.get('playerId') as string : ''

  if (!playerId) {
    redirectManageError('missing-player', manageEventId)
  }

  const managedEvent = await requireSuperadminManagedEvent(formData)

  try {
    const player = await prisma.user.findFirst({
      where: { id: playerId, eventId: managedEvent.id },
      select: { id: true },
    })

    if (!player) {
      redirectManageError('missing-player', manageEventId)
    }

    await prisma.user.delete({
      where: { id: playerId },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error deleting player:', error)
    redirectManageError('delete-player-failed', manageEventId)
  }

  redirectManage('player-deleted', manageEventId)
}

export async function deletePostAction(formData: FormData) {
  const postId = typeof formData.get('postId') === 'string' ? formData.get('postId') as string : ''
  if (!postId) {
    redirect('/superadmin/posts?postError=missing-post')
  }

  try {
    const deletedPost = await deletePostForSuperadmin(postId)
    if (!deletedPost) {
      redirect('/superadmin/posts?postError=missing-post')
    }

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error deleting post:', error)
    redirect('/superadmin/posts?postError=delete-post-failed')
  }

  redirect('/superadmin/posts?post=deleted')
}

export async function promotePersonToAuthUser(formData: FormData) {
  await requireAdmin()

  const personId = formData.get('personId') as string
  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'player'

  if (!personId || !email || !password) {
    redirect(`/superadmin/promote/${personId}?error=missing-fields`)
  }

  const person = await prisma.person.findUnique({ where: { id: personId } })
  if (!person) {
    redirect(`/superadmin/promote/${personId}?error=person-not-found`)
  }

  const existing = await prisma.authUser.findUnique({ where: { email } })
  if (existing) {
    if (existing.personId && existing.personId !== personId) {
      redirect(`/superadmin/promote/${personId}?error=email-taken`)
    }
    await prisma.authUser.update({
      where: { id: existing.id },
      data: { personId },
    })
    redirect('/superadmin?manage=promoted')
  }

  await auth.api.createUser({
    headers: await headers(),
    body: {
      email,
      password,
      name: person.name,
      ...(role !== 'player' ? { role: role as "superadmin" | "eventAdmin" } : {}),
    },
  })

  await prisma.authUser.update({
    where: { email },
    data: { personId },
  })

  revalidateAdminAndAppPaths()
  redirect('/superadmin?manage=promoted')
}
