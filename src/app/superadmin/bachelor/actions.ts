'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  approveSighting,
  rejectSighting,
  updateSightingLocation,
  getAllSightings,
  deleteSighting,
} from '@/lib/prisma/fetchers/sighting-fetchers'
import {
  createHypeEvent,
  updateHypeEventStatus,
  deleteHypeEvent,
  deleteHypeVote,
} from '@/lib/prisma/fetchers/hype-fetchers'
import { getCurrentUser } from '@/lib/utils/cookies'
import type { BachelorActionState } from '@/lib/types/action-states'
import { requireBachelorEventId } from '@/lib/events'
import { resetEventDataById } from '@/app/superadmin/actions'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  return user
}

export async function approveSightingAction(
  sightingId: string
): Promise<BachelorActionState> {
  try {
    const admin = await requireAdmin()

    const result = await approveSighting(sightingId, admin.id)

    if (!result || result.count === 0) {
      return {
        success: false,
        message: 'Sighting not found or already processed',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/the-bachelor/timeline')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: 'Sighting approved!',
      type: 'update',
    }
  } catch (error) {
    console.error('Error approving sighting:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function rejectSightingAction(
  sightingId: string,
  adminNotes?: string
): Promise<BachelorActionState> {
  try {
    await requireAdmin()

    const result = await rejectSighting(sightingId, adminNotes)

    if (!result || result.count === 0) {
      return {
        success: false,
        message: 'Sighting not found or already processed',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: 'Sighting rejected.',
      type: 'update',
    }
  } catch (error) {
    console.error('Error rejecting sighting:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function updateSightingLocationAction(
  sightingId: string,
  latitude: number,
  longitude: number
): Promise<BachelorActionState> {
  try {
    await requireAdmin()

    const result = await updateSightingLocation(sightingId, latitude, longitude)

    if (!result || result.count === 0) {
      return {
        success: false,
        message: 'Sighting not found',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: 'Location updated.',
      type: 'update',
    }
  } catch (error) {
    console.error('Error updating sighting location:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function createHypeEventAction(
  _prevState: BachelorActionState,
  formData: FormData
): Promise<BachelorActionState> {
  try {
    await requireAdmin()

    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || undefined
    const voteThreshold = parseInt(formData.get('voteThreshold') as string) || 5

    if (!title || title.trim().length === 0) {
      return {
        success: false,
        message: 'Title is required',
        type: 'error',
        errors: { title: ['Title is required'] },
      }
    }

    const event = await createHypeEvent({
      title: title.trim(),
      description,
      voteThreshold,
    })

    if (!event) {
      return {
        success: false,
        message: 'Failed to create hype event',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: `Hype event "${event.title}" created!`,
      type: 'create',
    }
  } catch (error) {
    console.error('Error creating hype event:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function triggerHypeEventAction(
  eventId: string,
  status: string
): Promise<BachelorActionState> {
  try {
    await requireAdmin()

    const result = await updateHypeEventStatus(eventId, status)

    if (!result || result.count === 0) {
      return {
        success: false,
        message: 'Hype event not found',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: `Hype event ${status}!`,
      type: 'update',
    }
  } catch (error) {
    console.error('Error triggering hype event:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function deleteHypeEventAction(
  eventId: string
): Promise<BachelorActionState> {
  try {
    await requireAdmin()

    const result = await deleteHypeEvent(eventId)
    if (!result || result.count === 0) {
      return {
        success: false,
        message: 'Hype event not found.',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: 'Hype event deleted.',
      type: 'delete',
    }
  } catch (error) {
    console.error('Error deleting hype event:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function getPendingSightingsCount(): Promise<number> {
  try {
    const sightings = await getAllSightings('pending')
    return sightings.length
  } catch {
    return 0
  }
}

export async function deleteSightingAction(
  sightingId: string
): Promise<BachelorActionState> {
  try {
    await requireAdmin()

    const result = await deleteSighting(sightingId)
    if (!result || result.count === 0) {
      return {
        success: false,
        message: 'Sighting not found.',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/the-bachelor/timeline')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: 'Sighting deleted.',
      type: 'delete',
    }
  } catch (error) {
    console.error('Error deleting sighting:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function deleteHypeVoteAction(
  voteId: string
): Promise<BachelorActionState> {
  try {
    await requireAdmin()

    const result = await deleteHypeVote(voteId)
    if (!result || result.count === 0) {
      return {
        success: false,
        message: 'Hype vote not found.',
        type: 'error',
      }
    }

    revalidatePath('/the-bachelor')
    revalidatePath('/superadmin/bachelor')

    return {
      success: true,
      message: 'Hype vote deleted.',
      type: 'delete',
    }
  } catch (error) {
    console.error('Error deleting hype vote:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}

export async function resetBachelorEventData() {
  let redirectTarget = '/superadmin/bachelor?reset=success'

  try {
    await requireAdmin()

    const eventId = await requireBachelorEventId()
    await resetEventDataById(eventId)

    revalidatePath('/the-bachelor')
    revalidatePath('/the-bachelor/timeline')
    revalidatePath('/superadmin')
    revalidatePath('/superadmin/bachelor')
    revalidatePath('/superadmin/trivia')
  } catch (error) {
    console.error('Error resetting bachelor event data:', error)
    redirectTarget = '/superadmin/bachelor?reset=error'
  }

  redirect(redirectTarget)
}
