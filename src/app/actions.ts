'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createUser, createUserForPerson, updateUserProfile, updateUserTeam, getUserByPersonAndEvent, getUserWithTeamById } from '@/lib/prisma/fetchers/user-fetchers'
import { createTeam, getAllTeams, getAllTeamsWithUsers, updateTeam } from '@/lib/prisma/fetchers/team-fetchers'
import { createDrinkLog } from '@/lib/prisma/fetchers/drink-log-fetchers'
import { setUserCookie, setPersonCookie, clearActiveUserCookie, getCurrentPersonId, getCurrentUser, clearUserCookie } from '@/lib/utils/cookies'
import { getNextAvailableColor } from '@/lib/utils/colors'
import { uploadImage } from '@/lib/utils/image-upload'
import { generateCommentaryForDrink, generateBulkDrinkCommentary, generateEnhancedCommentaryForDrink, generateEnhancedBulkDrinkCommentary } from '@/lib/services/commentary-generator'
import { captureCompleteState } from '@/lib/services/state-capture'
import { compareStates } from '@/lib/services/state-comparator'
import { createEnhancedLLMContext } from '@/lib/services/llm-preprocessor'
import { prisma } from '@/lib/prisma/client'
import { DRINK_TYPES } from '@/lib/prisma/types'
import { getDrinkPoints, getDrinkLabel } from '@/lib/utils/drinks'
import { getActiveEvent, getEventById, getEventBySlug, getEventEntryPathBySlug, setActiveEventCookie } from '@/lib/events'
import { getAuthSession } from '@/lib/auth-utils'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import { eventReadTag } from '@/lib/cache/event-read-models'
import type {
  UserActionState,
  TeamActionState,
  DrinkLogActionState,
  PostInteractionActionState
} from '@/lib/types/action-states'

function invalidateEventReadCache(eventId: string | null | undefined) {
  if (eventId) {
    updateTag(eventReadTag(eventId))
  }
}

// User Actions
export async function createUserAction(
  prevState: UserActionState, 
  formData: FormData
): Promise<UserActionState> {
  try {
    const name = formData.get('name') as string

    if (!name || name.trim().length === 0) {
      return {
        success: false,
        message: 'Name is required',
        type: 'error',
        errors: { name: ['Name is required'] }
      }
    }

    if (name.trim().length < 2) {
      return {
        success: false,
        message: 'Name must be at least 2 characters long',
        type: 'error',
        errors: { name: ['Name must be at least 2 characters long'] }
      }
    }

    const activeEvent = await getActiveEvent()
    if (!activeEvent) {
      return {
        success: false,
        message: 'No active event found',
        type: 'error'
      }
    }

    const currentPersonId = await getCurrentPersonId()
    let user = currentPersonId
      ? await getUserByPersonAndEvent(currentPersonId, activeEvent.id)
      : null

    if (!user) {
      const createdUser = currentPersonId
        ? await createUserForPerson(currentPersonId, name.trim())
        : await createUser(name.trim())

      user = createdUser ? await getUserWithTeamById(createdUser.id) : null
    }

    if (!user) {
      return {
        success: false,
        message: 'Failed to create user',
        type: 'error'
      }
    }

    await setUserCookie(user.id, user.personId ?? undefined)
    invalidateEventReadCache(activeEvent.id)

    return {
      success: true,
      message: 'Account created successfully!',
      type: 'create',
      data: {
        userId: user.id,
        redirectUrl: '/app/select-team'
      }
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

export async function selectExistingUserAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const userId = formData.get('userId') as string

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
        type: 'error'
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        event: true,
      },
    })

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        type: 'error'
      }
    }

    invalidateEventReadCache(user.eventId)

    // Set user cookie
    await setUserCookie(user.id, user.personId ?? undefined)

    if (user.personId) {
      await setPersonCookie(user.personId)
    }

    if (user.eventId) {
      await setActiveEventCookie(user.eventId)
    }

    // Revalidate paths
    revalidatePath('/')
    revalidatePath('/app/select-team')
    revalidatePath('/app/players')
    revalidatePath('/app/feed')
    if (user.event?.slug) {
      revalidatePath(`/event/${user.event.slug}`)
    }

    // Redirect based on team status
    const redirectUrl = user.teamId ? '/app/feed' : '/app/select-team'

    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      type: 'update',
      data: {
        userId: user.id,
        redirectUrl
      }
    }
  } catch (error) {
    console.error('Error selecting existing user:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

export async function selectExistingPersonAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const personId = formData.get('personId') as string
    const returnTo = formData.get('returnTo') as string | null
    const targetEventId = (formData.get('eventId') as string) || null

    if (!personId) {
      return {
        success: false,
        message: 'Person ID is required',
        type: 'error'
      }
    }

    const multiEventEnabled = await isMultiEventSchemaAvailable()

    if (!multiEventEnabled) {
      return {
        success: false,
        message: 'Person selection is not available before migration',
        type: 'error'
      }
    }

    const event = targetEventId ? await getEventById(targetEventId) : await getActiveEvent()
    if (!event) {
      return {
        success: false,
        message: 'No event found',
        type: 'error'
      }
    }

    await setPersonCookie(personId)
    await setActiveEventCookie(event.id)

    let eventUser = await getUserByPersonAndEvent(personId, event.id)

    if (!eventUser) {
      const person = await prisma.person.findUnique({ where: { id: personId } })
      if (person) {
        const createdUser = await prisma.user.create({
          data: {
            name: person.name,
            personId: person.id,
            eventId: event.id,
          },
          include: {
            team: true,
            event: true,
            person: true,
          },
        })
        eventUser = createdUser
      }
    }

    if (eventUser) {
      await setUserCookie(eventUser.id, personId)
    } else {
      await clearActiveUserCookie()
    }

    revalidatePath('/')
    revalidatePath('/app/select-team')
    revalidatePath('/app/players')
    if (event.slug) {
      revalidatePath(`/event/${event.slug}`)
    }

    return {
      success: true,
      message: 'Identity selected successfully!',
      type: 'update',
      data: {
        redirectUrl: eventUser
          ? (eventUser.teamId ? '/app/feed' : '/app/select-team')
          : (returnTo?.trim() || (event.slug ? `/event/${event.slug}` : '/'))
      }
    }
  } catch (error) {
    console.error('Error selecting existing person:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

export async function switchActiveEventAction(eventId: string): Promise<UserActionState> {
  try {
    const event = await getEventById(eventId)
    if (!event) {
      return {
        success: false,
        message: 'Event not found',
        type: 'error'
      }
    }

    await setActiveEventCookie(event.id)

    const currentPersonId = await getCurrentPersonId()
    if (currentPersonId) {
      const eventUser = await getUserByPersonAndEvent(currentPersonId, event.id)
      if (eventUser) {
        await setUserCookie(eventUser.id, currentPersonId)
      }
    }

    revalidatePath('/')
    revalidatePath('/app/select-team')
    revalidatePath('/app/players')
    revalidatePath('/app/teams')
    revalidatePath('/app/stats')
    revalidatePath('/app/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Event switched successfully',
      type: 'update',
      data: {
        redirectUrl: '/'
      }
    }
  } catch (error) {
    console.error('Error switching active event:', error)
    return {
      success: false,
      message: 'Failed to switch event',
      type: 'error'
    }
  }
}

export async function finalizePersonClaimAction(
  eventSlug: string,
  personId: string,
): Promise<UserActionState> {
  try {
    if (!eventSlug || !personId) {
      return {
        success: false,
        message: 'Missing claim context',
        type: 'error',
      }
    }

    const [session, currentPersonId, event, person] = await Promise.all([
      getAuthSession(),
      getCurrentPersonId(),
      getEventBySlug(eventSlug),
      prisma.person.findUnique({ where: { id: personId } }),
    ])

    if (!session) {
      return {
        success: false,
        message: 'Not authenticated',
        type: 'error',
      }
    }

    if (!event || !person) {
      return {
        success: false,
        message: 'Invite is no longer valid',
        type: 'error',
      }
    }

    if (currentPersonId !== personId) {
      return {
        success: false,
        message: 'Claim session expired. Open your invite link again.',
        type: 'error',
      }
    }

    const authUser = await prisma.authUser.findUnique({
      where: { id: session.user.id },
      select: { personId: true },
    })

    if (authUser?.personId && authUser.personId !== personId) {
      return {
        success: false,
        message: 'This account is already linked to another person.',
        type: 'error',
      }
    }

    if (!authUser?.personId) {
      await prisma.authUser.update({
        where: { id: session.user.id },
        data: { personId },
      })
    }

    await setActiveEventCookie(event.id)
    await setPersonCookie(personId)

    const eventUser = await getUserByPersonAndEvent(personId, event.id)

    if (eventUser) {
      await setUserCookie(eventUser.id, personId)
    } else {
      await clearActiveUserCookie()
    }

    revalidatePath('/')
    revalidatePath('/app/select-team')
    revalidatePath('/app/players')
    revalidatePath('/app/feed')
    revalidatePath('/app/profile')
    revalidatePath('/bwsk/enter')

    return {
      success: true,
      message: 'Account claimed successfully!',
      type: 'update',
      data: {
        redirectUrl: eventUser
          ? (eventUser.teamId ? '/app/feed' : '/app/select-team')
          : getEventEntryPathBySlug(eventSlug),
      },
    }
  } catch (error) {
    console.error('Error finalizing person claim:', error)
    return {
      success: false,
      message: 'Failed to finish account claim',
      type: 'error',
    }
  }
}

export async function updateUserTeamAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const userId = formData.get('userId') as string
    const teamId = formData.get('teamId') as string

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
        type: 'error'
      }
    }

    const user = await updateUserTeam(userId, teamId && teamId !== 'no-team' ? teamId : null)

    if (!user) {
      return {
        success: false,
        message: 'Failed to update team',
        type: 'error'
      }
    }

    invalidateEventReadCache(user.eventId)

    revalidatePath('/app/players')
    revalidatePath('/app/profile')

    return {
      success: true,
      message: 'Team updated successfully!',
      type: 'update',
      data: { userId }
    }
  } catch (error) {
    console.error('Error updating user team:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

// Team Actions
export async function createTeamAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    const teamName = formData.get('teamName') as string
    const userId = formData.get('userId') as string

    if (!teamName || teamName.trim().length === 0) {
      return {
        success: false,
        message: 'Team name is required',
        type: 'error',
        errors: { teamName: ['Team name is required'] }
      }
    }

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
        type: 'error'
      }
    }

    const existingTeams = await getAllTeams()
    const color = getNextAvailableColor(existingTeams)

    const team = await createTeam(teamName.trim(), color)

    if (!team) {
      return {
        success: false,
        message: 'Failed to create team. Team name might already exist.',
        type: 'error',
        errors: { teamName: ['Team name might already exist'] }
      }
    }

    const updatedUser = await updateUserTeam(userId, team.id)

    if (!updatedUser) {
      return {
        success: false,
        message: 'Team created but failed to join',
        type: 'error'
      }
    }

    invalidateEventReadCache(team.eventId)

    revalidatePath('/app/players')
    revalidatePath('/app/teams')
    revalidatePath('/app/feed')

    return {
      success: true,
      message: `Team "${team.name}" created and joined successfully!`,
      type: 'create',
      data: {
        teamId: team.id,
        redirectUrl: '/app/feed'
      }
    }
  } catch (error) {
    console.error('Error creating team:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

export async function joinTeamAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    const userId = formData.get('userId') as string
    const teamId = formData.get('teamId') as string

    if (!userId || !teamId) {
      return {
        success: false,
        message: 'User ID and Team ID are required',
        type: 'error'
      }
    }

    const updatedUser = await updateUserTeam(userId, teamId)

    if (!updatedUser) {
      return {
        success: false,
        message: 'Failed to join team',
        type: 'error'
      }
    }

    invalidateEventReadCache(updatedUser.eventId)

    revalidatePath('/app/players')
    revalidatePath('/app/teams')
    revalidatePath('/app/feed')
    revalidatePath('/app/select-team')

    return {
      success: true,
      message: 'Joined team successfully!',
      type: 'update',
      data: {
        teamId,
        redirectUrl: '/app/feed'
      }
    }
  } catch (error) {
    console.error('Error joining team:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

export async function joinRandomTeamAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    const userId = formData.get('userId') as string
    const targetTeamId = formData.get('teamId') as string | null

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
        type: 'error'
      }
    }

    let teamId: string | undefined = targetTeamId || undefined

    if (!teamId) {
      const availableTeams = await getAllTeamsWithUsers()
      if (!availableTeams || availableTeams.length === 0) {
        return {
          success: false,
          message: 'Ni na voljo nobene ekipe za žreb.',
          type: 'error'
        }
      }

      // Balance teams: pick among teams with lowest member count
      const minMembers = Math.min(...availableTeams.map((t: any) => t.users.length))
      const candidates = availableTeams.filter((t: any) => t.users.length === minMembers)
      const chosen = candidates[Math.floor(Math.random() * candidates.length)]
      teamId = chosen.id
    }

    const updatedUser = await updateUserTeam(userId, teamId)

    if (!updatedUser) {
      return {
        success: false,
        message: 'Pridružitev ekipi ni uspela.',
        type: 'error'
      }
    }

    invalidateEventReadCache(updatedUser.eventId)

    revalidatePath('/app/players')
    revalidatePath('/app/teams')
    revalidatePath('/app/feed')

    return {
      success: true,
      message: 'Uspešno dodeljen v ekipo!',
      type: 'update',
      data: {
        teamId,
        redirectUrl: '/app/feed'
      }
    }
  } catch (error) {
    console.error('Error joining random team:', error)
    return {
      success: false,
      message: 'Prišlo je do nepričakovane napake pri žrebanju ekipe.',
      type: 'error'
    }
  }
}

// Drink Log Actions
export async function logDrinkAction(
  prevState: DrinkLogActionState,
  formData: FormData
): Promise<DrinkLogActionState> {
  try {
    console.log('🚀 logDrinkAction called with:', { userId: formData.get('userId'), drinkType: formData.get('drinkType') })
    
    const userId = formData.get('userId') as string
    const drinkType = formData.get('drinkType') as string

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
        type: 'error'
      }
    }

    if (!drinkType || !Object.values(DRINK_TYPES).includes(drinkType as any)) {
      return {
        success: false,
        message: 'Valid drink type is required',
        type: 'error'
      }
    }

    const points = getDrinkPoints(drinkType)

    // ✨ NEW: Capture state BEFORE drink logging
    console.log('📊 Capturing state before drink logging...')
    const beforeState = await captureCompleteState()

    const drinkLog = await createDrinkLog(userId, drinkType, points)

    if (!drinkLog) {
      return {
        success: false,
        message: 'Failed to log drink',
        type: 'error'
      }
    }

    invalidateEventReadCache(drinkLog.eventId)

    // ✨ NEW: Capture state AFTER drink logging and compare
    console.log('📊 Capturing state after drink logging and comparing...')
    const afterState = await captureCompleteState()
    const stateComparison = compareStates(beforeState, afterState)
    
    // If significant changes detected, use enhanced commentary
    if (stateComparison.significantChanges.length > 0) {
      console.log('🎯 Significant changes detected:', stateComparison.significantChanges.length)
      
      // Get user name for context
      const userName = afterState.users[userId]?.name || 'Unknown User'
      
      generateEnhancedCommentaryForDrink(
        stateComparison.significantChanges,
        { userId, userName, drinkType, points }
      ).catch(error => {
        console.error('❌ Enhanced commentary generation failed:', error)
      })
    } else {
      // Use regular commentary if no significant changes
      console.log('🍻 No significant changes, using regular commentary')
      generateCommentaryForDrink(userId, drinkType, points).catch(error => {
        console.error('❌ Commentary generation failed:', error)
      })
    }

    revalidatePath('/app/players')
    revalidatePath('/app/feed')
    revalidatePath('/app/teams')
    revalidatePath('/app/quick-log')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `${getDrinkLabel(drinkType)} logged! +${points} points`,
      type: 'create',
      data: {
        drinkLogId: drinkLog.id,
        points
      }
    }
  } catch (error) {
    console.error('Error logging drink:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

export async function logMultipleDrinksAction(
  prevState: DrinkLogActionState,
  formData: FormData
): Promise<DrinkLogActionState> {
  try {
    console.log('🚀 logMultipleDrinksAction called')
    
    const userIds = formData.getAll('userIds') as string[]
    const drinkType = formData.get('drinkType') as string

    if (!userIds || userIds.length === 0) {
      return {
        success: false,
        message: 'At least one user must be selected',
        type: 'error'
      }
    }

    if (!drinkType || !Object.values(DRINK_TYPES).includes(drinkType as any)) {
      return {
        success: false,
        message: 'Valid drink type is required',
        type: 'error'
      }
    }

    const points = getDrinkPoints(drinkType)

    // ✨ NEW: Capture state BEFORE bulk drink logging
    console.log('📊 Capturing state before bulk drink logging...')
    const beforeState = await captureCompleteState()

    const drinkLogPromises = []
    for (const userId of userIds) {
      drinkLogPromises.push(createDrinkLog(userId, drinkType, points))
    }

    const drinkLogs = await Promise.all(drinkLogPromises)
    
    // Check if any drink logs failed
    const failedLogs = drinkLogs.filter(log => !log)
    if (failedLogs.length > 0) {
      return {
        success: false,
        message: `Failed to log drinks for ${failedLogs.length} user(s)`,
        type: 'error'
      }
    }

    invalidateEventReadCache(drinkLogs[0]?.eventId)

    // ✨ NEW: Capture state AFTER bulk logging and compare
    console.log('📊 Capturing state after bulk logging and comparing...')
    const afterState = await captureCompleteState()
    const stateComparison = compareStates(beforeState, afterState)
    
    const totalPoints = points * userIds.length
    
    // Always use enhanced commentary for bulk operations due to higher likelihood of significant changes
    if (stateComparison.significantChanges.length > 0) {
      console.log('🎯 Significant bulk changes detected:', stateComparison.significantChanges.length)
      
      // Get user names and teams for context
      const users = userIds.map(userId => {
        const user = afterState.users[userId]
        return {
          id: userId,
          name: user?.name || 'Unknown User',
          teamName: user?.team?.name
        }
      }).filter(u => u.name !== 'Unknown User')
      
      generateEnhancedBulkDrinkCommentary(
        stateComparison.significantChanges,
        users,
        drinkType,
        totalPoints
      ).catch(error => {
        console.error('❌ Enhanced bulk commentary generation failed:', error)
      })
    } else {
      // Use regular bulk commentary if no significant changes
      console.log('🔥 No significant changes, using regular bulk commentary')
      generateBulkDrinkCommentary(userIds, drinkType, totalPoints).catch(error => {
        console.error('❌ Bulk commentary generation failed:', error)
      })
    }

    revalidatePath('/app/players')
    revalidatePath('/app/feed')
    revalidatePath('/app/teams')
    revalidatePath('/app/quick-log')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `${getDrinkLabel(drinkType)} logged for ${userIds.length} people! +${points * userIds.length} total points`,
      type: 'create',
      data: {
        drinkLogId: drinkLogs[0]?.id || '',
        points: points * userIds.length
      }
    }
  } catch (error) {
    console.error('Error logging multiple drinks:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

// Profile Image Actions
export async function updateUserProfileAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: 'Not authenticated',
        type: 'error'
      }
    }

    const name = formData.get('name') as string
    const teamId = formData.get('teamId') as string
    const profileImage = formData.get('profile-image') as File

    console.log('Profile image upload:', {
      hasFile: !!profileImage,
      fileName: profileImage?.name,
      fileSize: profileImage?.size,
      fileType: profileImage?.type
    })

    if (!name || name.trim().length < 2) {
      return {
        success: false,
        message: 'Name must be at least 2 characters long',
        type: 'error',
        errors: { name: ['Name must be at least 2 characters long'] }
      }
    }

    const updateData: { name: string; teamId?: string | null; profile_image_url?: string } = { name: name.trim() }
    
    if (teamId && teamId !== 'none') {
      updateData.teamId = teamId
    }

    // Handle profile image upload
    if (profileImage && profileImage.size > 0) {
      try {
        const imageUrl = await uploadImage(profileImage, 'users', currentUser.id)
        updateData.profile_image_url = imageUrl
      } catch (error) {
        return {
          success: false,
          message: `Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
        }
      }
    }

    const updatedUser = await updateUserProfile(currentUser.id, updateData)
    if (!updatedUser) {
      return {
        success: false,
        message: 'Failed to update profile',
        type: 'error'
      }
    }

    invalidateEventReadCache(updatedUser.eventId)

    if (updateData.profile_image_url && currentUser.personId) {
      try {
        await prisma.person.update({
          where: { id: currentUser.personId },
          data: { profile_image_url: updateData.profile_image_url },
        })
      } catch (personErr) {
        console.error('Failed to sync profile image to linked person:', personErr)
      }
    }

    revalidatePath('/app/profile')
    revalidatePath('/app/players')
    revalidatePath('/app/feed')
    revalidatePath('/app/quick-log')
    revalidatePath('/dashboard')
    revalidatePath('/')

    return {
      success: true,
      message: 'Profile updated successfully!',
      type: 'update'
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

export async function updateTeamLogoAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.teamId) {
      return {
        success: false,
        message: 'No team assigned',
        type: 'error'
      }
    }

    const logoImage = formData.get('team-logo') as File
    
    console.log('Team logo upload:', {
      hasFile: !!logoImage,
      fileName: logoImage?.name,
      fileSize: logoImage?.size,
      fileType: logoImage?.type
    })
    
    if (!logoImage || logoImage.size === 0) {
      return {
        success: false,
        message: 'No logo file provided',
        type: 'error'
      }
    }

    try {
      const imageUrl = await uploadImage(logoImage, 'teams', currentUser.teamId)
      
      const updatedTeam = await updateTeam(currentUser.teamId, { logo_image_url: imageUrl })
      if (!updatedTeam) {
        return {
          success: false,
          message: 'Failed to update team logo',
          type: 'error'
        }
      }

      invalidateEventReadCache(updatedTeam.eventId)

      revalidatePath('/app/profile')
      revalidatePath('/app/players')
      revalidatePath('/app/feed')
      revalidatePath('/dashboard')
      revalidatePath('/app/quick-log')
      revalidatePath('/')

      return {
        success: true,
        message: 'Team logo updated successfully!',
        type: 'update'
      }
    } catch (error) {
      return {
        success: false,
        message: `Logo upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      }
    }
  } catch (error) {
    console.error('Error updating team logo:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

// Post Actions
export async function createPostAction(
  prevState: DrinkLogActionState,
  formData: FormData
): Promise<DrinkLogActionState> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: 'Not authenticated',
        type: 'error'
      }
    }
    
    const message = (formData.get('message') as string | null)?.trim() ?? ''
    const imageUrl = (formData.get('imageUrl') as string | null)?.trim() || null
    const rawAssets = formData.get('assets')
    const assets = parsePostAssets(rawAssets)
    
    if (!message && !imageUrl && assets.length === 0) {
      return {
        success: false,
        message: 'Message or media is required',
        type: 'error'
      }
    }
    
    const isMultiEventEnabled = await isMultiEventSchemaAvailable()
    const activeEvent = isMultiEventEnabled ? await getActiveEvent() : null
    if (isMultiEventEnabled && !activeEvent) {
      return {
        success: false,
        message: 'No active event found',
        type: 'error'
      }
    }

    const post = await prisma.post.create({
      data: {
        ...(activeEvent ? { eventId: activeEvent.id } : {}),
        userId: currentUser.id,
        message,
        image_url: imageUrl,
        // New event posts are private by product decision. Legacy callers can still use imageUrl.
        isPrivate: true,
        ...(assets.length > 0
          ? {
              assets: {
                create: assets.map((asset, sortOrder) => ({
                  url: asset.url,
                  mediaType: asset.mediaType,
                  sortOrder,
                })),
              },
            }
          : {}),
      }
    })
    invalidateEventReadCache(post.eventId)
    
    revalidatePath('/app/profile')
    revalidatePath('/app/feed')
    revalidatePath('/the-bachelor')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Post created successfully!',
      type: 'create',
      data: {
        drinkLogId: post.id,
        points: 0
      }
    }
  } catch (error) {
    console.error('Error creating post:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

const MAX_POST_ASSETS = 10
const MAX_POST_ASSET_BYTES = 100 * 1024 * 1024
const MAX_POST_TOTAL_BYTES = 500 * 1024 * 1024

type SubmittedPostAsset = {
  url: string
  mediaType: 'image' | 'video'
  size: number
}

function parsePostAssets(value: FormDataEntryValue | null): SubmittedPostAsset[] {
  if (typeof value !== 'string' || !value) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('Invalid media payload')
  }

  if (!Array.isArray(parsed) || parsed.length > MAX_POST_ASSETS) {
    throw new Error(`A post can contain at most ${MAX_POST_ASSETS} media files.`)
  }

  const assets = parsed.map((asset): SubmittedPostAsset => {
    if (!asset || typeof asset !== 'object') throw new Error('Invalid media payload')
    const candidate = asset as Record<string, unknown>
    if (typeof candidate.url !== 'string' || !candidate.url.trim()) throw new Error('Invalid media URL')
    try {
      const url = new URL(candidate.url)
      if (url.protocol !== 'https:') throw new Error('Invalid media URL')
    } catch {
      throw new Error('Invalid media URL')
    }
    if (candidate.mediaType !== 'image' && candidate.mediaType !== 'video') {
      throw new Error('Invalid media type')
    }
    const size = candidate.size
    if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0 || size > MAX_POST_ASSET_BYTES) {
      throw new Error('A media file exceeds the 100 MB limit.')
    }
    return { url: candidate.url, mediaType: candidate.mediaType, size }
  })

  if (assets.reduce((total, asset) => total + asset.size, 0) > MAX_POST_TOTAL_BYTES) {
    throw new Error('Post media exceeds the 500 MB total limit.')
  }

  return assets
}

// Like Actions
export async function toggleLikeAction(
  postId: string
): Promise<{ success: boolean; liked: boolean; likeCount: number; message?: string }> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, liked: false, likeCount: 0, message: 'Not authenticated' }
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, eventId: true }
    })
    if (!post) {
      return { success: false, liked: false, likeCount: 0, message: 'Post not found' }
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId: currentUser.id } }
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
    } else {
      await prisma.like.create({
        data: { postId, userId: currentUser.id, eventId: post.eventId }
      })
    }

    const likeCount = await prisma.like.count({ where: { postId } })

    invalidateEventReadCache(post.eventId)
    revalidatePath('/app/feed')

    return { success: true, liked: !existing, likeCount }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, liked: false, likeCount: 0, message: 'An unexpected error occurred' }
  }
}

// Comment Actions
export async function addCommentAction(
  prevState: PostInteractionActionState,
  formData: FormData
): Promise<PostInteractionActionState> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { success: false, message: 'Not authenticated', type: 'error' }
    }

    const postId = formData.get('postId') as string
    const message = (formData.get('message') as string)?.trim()

    if (!postId) {
      return { success: false, message: 'Missing post', type: 'error' }
    }
    if (!message) {
      return { success: false, message: 'Comment cannot be empty', type: 'error' }
    }
    if (message.length > 500) {
      return { success: false, message: 'Comment is too long (max 500 characters)', type: 'error' }
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, eventId: true }
    })
    if (!post) {
      return { success: false, message: 'Post not found', type: 'error' }
    }

    const comment = await prisma.comment.create({
      data: { postId, userId: currentUser.id, eventId: post.eventId, message },
      include: { user: { select: { id: true, name: true, profile_image_url: true } } }
    })

    invalidateEventReadCache(post.eventId)
    revalidatePath('/app/feed')

    return {
      success: true,
      message: 'Comment added',
      type: 'create',
      data: { commentId: comment.id, postId, comment }
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error'
    }
  }
}

// Logout Action
export async function logoutAction(): Promise<UserActionState> {
  try {
    await clearUserCookie()
    
    return {
      success: true,
      message: 'Successfully logged out',
      type: 'update',
      data: {
        redirectUrl: '/'
      }
    }
  } catch (error) {
    console.error('Error logging out:', error)
    return {
      success: false,
      message: 'An unexpected error occurred during logout',
      type: 'error'
    }
  }
}

// Dashboard Refresh Action
export async function refreshDashboardAction(path: string = '/dashboard'): Promise<void> {
  try {
    // Revalidate all dashboard-related paths to clear cache
    revalidatePath(path)
    revalidatePath('/app/players')
    revalidatePath('/app/teams')
    revalidatePath('/')

    // Force hard refresh by redirecting to current page
    redirect(path)
  } catch (error) {
    console.error('Error refreshing dashboard:', error)
    // Graceful fallback - still try to redirect
    redirect(path)
  }
}
