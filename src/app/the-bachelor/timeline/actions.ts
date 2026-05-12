'use server'

import { revalidatePath } from 'next/cache'
import { deleteSighting } from '@/lib/prisma/fetchers/sighting-fetchers'
import { requireAuth } from '@/lib/auth-utils'
import type { BachelorActionState } from '@/lib/types/action-states'

export async function deleteSightingFromTimelineAction(
  sightingId: string
): Promise<BachelorActionState> {
  try {
    await requireAuth()

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
    console.error('Error deleting sighting from timeline:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'error',
    }
  }
}
