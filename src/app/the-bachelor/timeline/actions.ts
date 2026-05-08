'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentPersonId } from '@/lib/utils/cookies'
import { deleteSighting } from '@/lib/prisma/fetchers/sighting-fetchers'
import type { BachelorActionState } from '@/lib/types/action-states'

const SUPERADMIN_PERSON_ID = 'person_cmfr8yyqg000ll104sxm0hkut'

export async function deleteSightingFromTimelineAction(
  sightingId: string
): Promise<BachelorActionState> {
  try {
    const personId = await getCurrentPersonId()
    if (personId !== SUPERADMIN_PERSON_ID) {
      return {
        success: false,
        message: 'Only superadmin can delete sightings.',
        type: 'error',
      }
    }

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
