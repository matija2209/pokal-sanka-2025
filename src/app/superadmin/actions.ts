'use server'

import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isMultiEventSchemaAvailable, isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getActiveEvent, getEventById } from '@/lib/events'
import { getUserByPersonAndEvent } from '@/lib/prisma/fetchers/user-fetchers'
import { deletePostForSuperadmin } from '@/lib/prisma/fetchers/post-fetchers'
import { getNextAvailableColor } from '@/lib/utils/colors'
import { uploadImage } from '@/lib/utils/image-upload'
import { requireAdmin, requireAuth, requireSuperadmin } from '@/lib/auth-utils'
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
  revalidatePath('/superadmin/drink-logs')
  revalidatePath('/superadmin/trivia')
  revalidatePath('/superadmin/bachelor')
  revalidatePath('/')
  revalidatePath('/dashboard')
}

function normalizeName(rawName: FormDataEntryValue | null): string {
  return typeof rawName === 'string' ? rawName.trim() : ''
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

function normalizeHexColor(rawColor: FormDataEntryValue | null): string | null {
  const value = typeof rawColor === 'string' ? rawColor.trim() : ''
  return HEX_COLOR_PATTERN.test(value) ? value : null
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
  return query ? `/superadmin/players?${query}` : '/superadmin/players'
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
  const color = normalizeHexColor(formData.get('color'))

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
      data: { name, ...(color ? { color } : {}) },
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

  try {
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

  const addToEvent = formData.get('addToEvent') === 'on' || formData.get('addToEvent') === 'true'
  const rawTeamId = typeof formData.get('teamId') === 'string' ? (formData.get('teamId') as string).trim() : ''
  const teamId = rawTeamId || null

  try {
    const person = await prisma.person.create({
      data: { name },
    })

    if (addToEvent && manageEventId) {
      const managedEvent = await requireSuperadminManagedEvent(formData)
      if (teamId) {
        const team = await prisma.team.findFirst({
          where: { id: teamId, eventId: managedEvent.id },
        })
        if (!team) {
          redirectManageError('invalid-team', manageEventId)
        }
      }
      await prisma.user.create({
        data: {
          name,
          eventId: managedEvent.id,
          personId: person.id,
          teamId: teamId,
        },
      })
    }

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error creating person:', error)
    redirectManageError('create-person-failed', manageEventId)
  }

  redirectManage(addToEvent ? 'player-created' : 'person-created', manageEventId)
}

export async function updatePersonAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const personId = typeof formData.get('personId') === 'string' ? formData.get('personId') as string : ''
  const name = normalizeName(formData.get('name'))
  const removeImage = formData.get('removeImage') === 'true'
  const personImage = formData.get('personImage') as File | null

  if (!personId) {
    redirectManageError('missing-person', manageEventId)
  }

  if (name.length < 2) {
    redirectManageError('invalid-person-name', manageEventId)
  }

  try {
    const updateData: { name: string; profile_image_url?: string | null } = { name }

    if (removeImage) {
      updateData.profile_image_url = null
    } else if (personImage && personImage.size > 0) {
      const imageUrl = await uploadImage(personImage, 'persons', personId)
      updateData.profile_image_url = imageUrl
    }

    await prisma.person.update({
      where: { id: personId },
      data: updateData,
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
  const rawTeamId = typeof formData.get('teamId') === 'string' ? (formData.get('teamId') as string).trim() : ''
  const teamId = rawTeamId || null

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

    if (teamId) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, eventId: managedEvent.id },
      })
      if (!team) {
        redirectManageError('invalid-team', manageEventId)
      }
    }

    await prisma.user.create({
      data: {
        name: playerName || person.name,
        eventId: managedEvent.id,
        personId: person.id,
        teamId: teamId,
      },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error creating player for person:', error)
    redirectManageError('create-player-failed', manageEventId)
  }

  redirectManage('player-created', manageEventId)
}

export async function bulkCreatePlayersForPersonsAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const rawPersonIds = formData.getAll('personIds')
  let personIds: string[] = []
  for (const entry of rawPersonIds) {
    if (typeof entry === 'string') {
      const trimmed = entry.trim()
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            personIds.push(...parsed.filter((id) => typeof id === 'string'))
            continue
          }
        } catch {
          // ignore
        }
      }
      if (trimmed.includes(',')) {
        personIds.push(...trimmed.split(',').map((id) => id.trim()).filter(Boolean))
      } else if (trimmed) {
        personIds.push(trimmed)
      }
    }
  }
  personIds = Array.from(new Set(personIds))

  if (personIds.length === 0) {
    redirectManageError('missing-person', manageEventId)
  }

  const rawTeamId = typeof formData.get('teamId') === 'string' ? (formData.get('teamId') as string).trim() : ''
  const teamId = rawTeamId || null

  const managedEvent = await requireSuperadminManagedEvent(formData)

  try {
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, eventId: managedEvent.id },
      })
      if (!team) {
        redirectManageError('invalid-team', manageEventId)
      }
    }

    const persons = await prisma.person.findMany({
      where: { id: { in: personIds } },
      select: { id: true, name: true },
    })

    const existingUsers = await prisma.user.findMany({
      where: {
        eventId: managedEvent.id,
        personId: { in: personIds },
      },
      select: { personId: true },
    })
    const existingPersonIdSet = new Set(existingUsers.map((u) => u.personId).filter(Boolean))

    const toCreate = persons.filter((p) => !existingPersonIdSet.has(p.id))

    if (toCreate.length > 0) {
      await prisma.user.createMany({
        data: toCreate.map((person) => ({
          name: person.name,
          eventId: managedEvent.id,
          personId: person.id,
          teamId: teamId,
        })),
      })
    }

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error bulk creating players for persons:', error)
    redirectManageError('batch-create-failed', manageEventId)
  }

  redirectManage('players-batch-created', manageEventId)
}

export async function updatePlayerAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  const playerId = typeof formData.get('playerId') === 'string' ? formData.get('playerId') as string : ''
  const name = normalizeName(formData.get('name'))
  const rawTeamId = typeof formData.get('teamId') === 'string' ? formData.get('teamId') as string : ''
  const teamId = rawTeamId || null
  const removeImage = formData.get('removeImage') === 'true'
  const playerImage = formData.get('playerImage') as File | null

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

    const updateData: { name: string; teamId: string | null; profile_image_url?: string | null } = {
      name,
      teamId,
    }

    if (removeImage) {
      updateData.profile_image_url = null
    } else if (playerImage && playerImage.size > 0) {
      const imageUrl = await uploadImage(playerImage, 'users', playerId)
      updateData.profile_image_url = imageUrl
    }

    await prisma.user.update({
      where: { id: playerId },
      data: updateData,
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

export async function deleteDrinkLogAction(formData: FormData) {
  const manageEventId = resolveManageEventId(formData)
  if (!(await isMultiEventSchemaAvailable())) {
    redirectManageError('schema-required', manageEventId)
  }

  const drinkLogId = typeof formData.get('drinkLogId') === 'string' ? formData.get('drinkLogId') as string : ''
  if (!drinkLogId) {
    redirectManageError('missing-drink-log', manageEventId)
  }

  const managedEvent = await requireSuperadminManagedEvent(formData)

  const drinkLog = await prisma.drinkLog.findFirst({
    where: { id: drinkLogId, eventId: managedEvent.id },
    select: { id: true },
  })

  if (!drinkLog) {
    redirectManageError('missing-drink-log', manageEventId)
  }

  try {
    await prisma.drinkLog.delete({
      where: { id: drinkLogId },
    })

    revalidateAdminAndAppPaths()
  } catch (error) {
    console.error('Error deleting drink log:', error)
    redirectManageError('delete-drink-log-failed', manageEventId)
  }

  redirectManage('drink-log-deleted', manageEventId)
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
    redirect('/superadmin/players?manage=promoted')
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
  redirect('/superadmin/players?manage=promoted')
}

// ── Event CRUD (superadmin only) ──

export async function updateEventAction(formData: FormData) {
  await requireSuperadmin()

  const eventId = (formData.get('eventId') as string | null)?.trim() ?? ''
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const rawSlug = (formData.get('slug') as string | null)?.trim() ?? ''
  const isActive = formData.get('isActive') === 'true'
  const isRandomTeams = formData.get('isRandomTeams') === 'true'
  const isTriviaEnabled = formData.get('isTriviaEnabled') === 'true'

  if (!eventId || name.length < 2) {
    redirect('/superadmin/events?error=invalid-fields')
  }

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } })
  if (!event) {
    redirect('/superadmin/events?error=event-not-found')
  }

  const slug = rawSlug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  if (!slug) {
    redirect('/superadmin/events?error=invalid-slug')
  }

  const existing = await prisma.event.findUnique({ where: { slug } })
  if (existing && existing.id !== eventId) {
    redirect(`/superadmin/events?error=slug-exists&slug=${encodeURIComponent(slug)}`)
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { name, slug, isActive, isRandomTeams, isTriviaEnabled },
  })

  revalidatePath('/superadmin/events')
  revalidatePath('/superadmin/trivia')
  revalidatePath('/admin')
  revalidatePath('/app/select-team')
  revalidatePath('/app/trivia/rules')
  revalidatePath('/app/trivia/scoreboard')
  revalidatePath('/app/trivia/conduct')
  revalidatePath(`/event/${slug}`)
  revalidatePath(`/event/${event.slug}`)
  redirect(`/superadmin/events?updated=${encodeURIComponent(slug)}`)
}

export async function deleteEventAction(formData: FormData) {
  await requireSuperadmin()

  const eventId = (formData.get('eventId') as string | null)?.trim() ?? ''
  if (!eventId) {
    redirect('/superadmin/events?error=missing-event')
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true, name: true },
  })
  if (!event) {
    redirect('/superadmin/events?error=event-not-found')
  }

  await prisma.eventLandingPage.deleteMany({ where: { eventId } })
  await prisma.event.delete({ where: { id: eventId } })

  revalidatePath('/superadmin/events')
  revalidatePath('/admin')
  redirect(`/superadmin/events?deleted=${encodeURIComponent(event.name)}`)
}

// ── User role management (superadmin only) ──

export async function updateUserRoleAction(formData: FormData) {
  await requireSuperadmin()

  const userId = (formData.get('userId') as string | null)?.trim() ?? ''
  const role = (formData.get('role') as string | null)?.trim() ?? ''

  if (!userId || !role) {
    redirect('/superadmin/users?error=missing-fields')
  }

  const validRoles = ['superadmin', 'eventAdmin', 'player']
  if (!validRoles.includes(role)) {
    redirect('/superadmin/users?error=invalid-role')
  }

  const authUser = await prisma.authUser.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })
  if (!authUser) {
    redirect('/superadmin/users?error=user-not-found')
  }

  const session = await requireAuth()
  if (authUser.id === session.user.id && role !== 'superadmin') {
    redirect('/superadmin/users?error=cannot-self-demote')
  }

  await prisma.authUser.update({
    where: { id: userId },
    data: { role },
  })

  revalidatePath('/superadmin/users')
  redirect(`/superadmin/users?updated=${encodeURIComponent(authUser.email)}`)
}
