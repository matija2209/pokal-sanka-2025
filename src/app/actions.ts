'use server'

import { revalidatePath } from 'next/cache'
import { createUser, updateUserTeam, getUserWithTeamById } from '@/lib/prisma/fetchers/user-fetchers'
import { createTeam, getAllTeams } from '@/lib/prisma/fetchers/team-fetchers'
import { createDrinkLog } from '@/lib/prisma/fetchers/drink-log-fetchers'
import { setUserCookie, getCurrentUser } from '@/lib/utils/cookies'
import { getNextAvailableColor } from '@/lib/utils/colors'
import { uploadImage } from '@/lib/utils/image-upload'
import { generateCommentaryForDrink } from '@/lib/services/commentary-generator'
import { prisma } from '@/lib/prisma/client'
import { DRINK_TYPES } from '@/lib/prisma/types'
import type { 
  UserActionState, 
  TeamActionState, 
  DrinkLogActionState 
} from '@/lib/types/action-states'

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

    const user = await createUser(name.trim())

    if (!user) {
      return {
        success: false,
        message: 'Failed to create user',
        type: 'error'
      }
    }

    await setUserCookie(user.id)

    return {
      success: true,
      message: 'Account created successfully!',
      type: 'create',
      data: {
        userId: user.id,
        redirectUrl: '/select-team'
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

    const user = await getUserWithTeamById(userId)

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        type: 'error'
      }
    }

    // Set user cookie
    await setUserCookie(user.id)

    // Revalidate paths
    revalidatePath('/')
    revalidatePath('/select-team')
    revalidatePath('/players')

    // Redirect based on team status
    const redirectUrl = user.teamId ? '/players' : '/select-team'

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

    revalidatePath('/players')
    revalidatePath('/profile')

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

    revalidatePath('/players')
    revalidatePath('/teams')

    return {
      success: true,
      message: `Team "${team.name}" created and joined successfully!`,
      type: 'create',
      data: {
        teamId: team.id,
        redirectUrl: '/players'
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

    revalidatePath('/players')
    revalidatePath('/teams')

    return {
      success: true,
      message: 'Joined team successfully!',
      type: 'update',
      data: {
        teamId,
        redirectUrl: '/players'
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

// Drink Log Actions
export async function logDrinkAction(
  prevState: DrinkLogActionState,
  formData: FormData
): Promise<DrinkLogActionState> {
  try {
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

    const points = drinkType === DRINK_TYPES.REGULAR ? 1 : 2

    const drinkLog = await createDrinkLog(userId, drinkType, points)

    if (!drinkLog) {
      return {
        success: false,
        message: 'Failed to log drink',
        type: 'error'
      }
    }

    // Generate commentary for this drink (async, don't await to avoid blocking)
    generateCommentaryForDrink(userId, drinkType, points).catch(error => {
      console.error('Commentary generation failed:', error)
    })

    revalidatePath('/players')
    revalidatePath('/teams')
    revalidatePath('/quick-log')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `${drinkType === DRINK_TYPES.REGULAR ? 'Regular' : 'Shot'} logged! +${points} points`,
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

    let updateData: any = { name: name.trim() }
    
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

    await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData
    })

    revalidatePath('/profile')
    revalidatePath('/players')
    revalidatePath('/quick-log')
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
      
      await prisma.team.update({
        where: { id: currentUser.teamId },
        data: { logo_image_url: imageUrl }
      })

      revalidatePath('/profile')
      revalidatePath('/players')
      revalidatePath('/dashboard')
      revalidatePath('/quick-log')
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
    
    const message = formData.get('message') as string
    const imageFile = formData.get('post-image') as File | null
    
    if (!message || !message.trim()) {
      return {
        success: false,
        message: 'Message is required',
        type: 'error'
      }
    }
    
    let imageUrl: string | null = null
    
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadImage(imageFile, 'posts', currentUser.id)
      } catch (error) {
        return {
          success: false,
          message: `Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
        }
      }
    }
    
    const post = await prisma.post.create({
      data: {
        userId: currentUser.id,
        message: message.trim(),
        image_url: imageUrl
      }
    })
    
    revalidatePath('/profile')
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