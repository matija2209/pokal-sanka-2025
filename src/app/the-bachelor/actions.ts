'use server'

import { revalidatePath } from 'next/cache'
import { uploadImage } from '@/lib/utils/image-upload'
import { createSighting, getSightingById } from '@/lib/prisma/fetchers/sighting-fetchers'
import { createHypeVote, getHypeVoteCount, getNextLockedHypeEvent, incrementHypeEventVoteCount } from '@/lib/prisma/fetchers/hype-fetchers'
import { ACTION_POINTS, ACTION_FRIENDSHIP, HYPE_VOTE_THRESHOLD } from '@/lib/utils/bachelor-points'
import type { BachelorActionState } from '@/lib/types/action-states'

export async function submitSightingAction(
  prevState: BachelorActionState,
  formData: FormData
): Promise<BachelorActionState> {
  try {
    const actionType = (formData.get('actionType') as string) || 'spot'
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const submitterName = (formData.get('submitterName') as string) || undefined
    const submitterCountry = (formData.get('submitterCountry') as string) || undefined
    const message = (formData.get('message') as string) || undefined
    const photoUrlInput = (formData.get('photoUrl') as string) || null
    const photoFile = formData.get('photo') as File | null

    if (isNaN(latitude) || isNaN(longitude)) {
      return {
        success: false,
        message: 'Location is required. Please enable GPS or enter coordinates manually.',
        type: 'error',
        errors: { location: ['Location is required'] },
      }
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return {
        success: false,
        message: 'Invalid coordinates. Please check your location.',
        type: 'error',
        errors: { location: ['Invalid coordinates'] },
      }
    }

    if (!photoUrlInput && (!photoFile || photoFile.size === 0)) {
      return {
        success: false,
        message: 'Photo is required. Please take a photo of the sighting.',
        type: 'error',
        errors: { photo: ['Photo is required'] },
      }
    }

    let photoUrl: string
    if (photoUrlInput) {
      photoUrl = photoUrlInput
    } else {
      try {
        photoUrl = await uploadImage(photoFile!, 'sightings', Date.now().toString())
      } catch (error) {
        return {
          success: false,
          message: `Photo upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        }
      }
    }

    const points = ACTION_POINTS[actionType as keyof typeof ACTION_POINTS] || 1
    const friendshipLevel = ACTION_FRIENDSHIP[actionType as keyof typeof ACTION_FRIENDSHIP] || 'Witness'

    const sighting = await createSighting({
      photoUrl,
      latitude,
      longitude,
      submitterName,
      submitterCountry,
      message,
      actionType,
      points,
      friendshipLevel,
    })

    if (!sighting) {
      return {
        success: false,
        message: 'Failed to save sighting. Please try again.',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')

    return {
      success: true,
      message: 'Sighting logged successfully!',
      type: 'create',
      data: {
        sightingId: sighting.id,
        points,
        friendshipLevel,
        redirectUrl: `/the-bachelor/sighting/${sighting.id}/success`,
      },
    }
  } catch (error) {
    console.error('Error submitting sighting:', error)
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      type: 'error',
    }
  }
}

export async function submitHypeVoteAction(
  prevState: BachelorActionState,
  formData: FormData
): Promise<BachelorActionState> {
  try {
    const suggestion = (formData.get('suggestion') as string) || undefined
    const voterName = (formData.get('voterName') as string) || undefined

    const vote = await createHypeVote({ suggestion, voterName })

    if (!vote) {
      return {
        success: false,
        message: 'Failed to submit vote. Please try again.',
        type: 'error',
      }
    }

    const totalVotes = await getHypeVoteCount()
    const nextEvent = await getNextLockedHypeEvent()

    if (nextEvent) {
      const votesSinceLastUnlock = totalVotes % HYPE_VOTE_THRESHOLD
      const votesNeeded = HYPE_VOTE_THRESHOLD - votesSinceLastUnlock

      if (votesSinceLastUnlock === 0) {
        await incrementHypeEventVoteCount(nextEvent.id)

        revalidatePath('/the-bachelor')
        return {
          success: true,
          message: `Hype Event unlocked: "${nextEvent.title}"!`,
          type: 'update',
          data: { hypeVoteCount: totalVotes },
        }
      }

      revalidatePath('/the-bachelor')
      return {
        success: true,
        message: `Vote recorded! ${votesNeeded} more votes until next Hype Event.`,
        type: 'create',
        data: { hypeVoteCount: totalVotes },
      }
    }

    revalidatePath('/the-bachelor')
    return {
      success: true,
      message: 'Vote recorded!',
      type: 'create',
      data: { hypeVoteCount: totalVotes },
    }
  } catch (error) {
    console.error('Error submitting hype vote:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
      type: 'error',
    }
  }
}
