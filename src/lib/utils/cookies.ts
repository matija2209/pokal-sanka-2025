import { cookies } from 'next/headers'
import { cache } from 'react'
import { getUserWithTeamById } from '@/lib/prisma/fetchers'
import type { UserWithTeam } from '@/lib/prisma/types'
import { ACTIVE_EVENT_COOKIE_NAME } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

const USER_COOKIE_NAME = 'turnir-sanka-user-id'
const PERSON_COOKIE_NAME = 'turnir-sanka-person-id'

export const getCurrentUser = cache(async (eventId?: string): Promise<UserWithTeam | null> => {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get(USER_COOKIE_NAME)

    if (!userCookie?.value) {
      return null
    }

    const user = await getUserWithTeamById(userCookie.value, eventId)
    if (!user) {
      return null
    }

    if ((await isMultiEventSchemaAvailable()) && !user.eventId) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
})

export async function setUserCookie(userId: string, personId?: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(USER_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    if (personId) {
      cookieStore.set(PERSON_COOKIE_NAME, personId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }
  } catch (error) {
    console.error('Error setting user cookie:', error)
  }
}

export async function setPersonCookie(personId: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(PERSON_COOKIE_NAME, personId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  } catch (error) {
    console.error('Error setting person cookie:', error)
  }
}

export async function getCurrentPersonId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(PERSON_COOKIE_NAME)?.value ?? null
  } catch (error) {
    console.error('Error getting current person ID:', error)
    return null
  }
}

export async function clearActiveUserCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(USER_COOKIE_NAME)
  } catch (error) {
    console.error('Error clearing active user cookie:', error)
  }
}

export async function clearUserCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(USER_COOKIE_NAME)
    cookieStore.delete(PERSON_COOKIE_NAME)
    cookieStore.delete(ACTIVE_EVENT_COOKIE_NAME)
  } catch (error) {
    console.error('Error clearing user cookie:', error)
  }
}
