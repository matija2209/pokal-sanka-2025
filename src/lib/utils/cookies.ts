import { cookies } from 'next/headers'
import { getUserWithTeamById } from '@/lib/prisma/fetchers'
import type { UserWithTeam } from '@/lib/prisma/types'

const USER_COOKIE_NAME = 'turnir-sanka-user-id'

export async function getCurrentUser(): Promise<UserWithTeam | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get(USER_COOKIE_NAME)
    
    if (!userCookie?.value) {
      return null
    }
    
    const user = await getUserWithTeamById(userCookie.value)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function setUserCookie(userId: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(USER_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  } catch (error) {
    console.error('Error setting user cookie:', error)
  }
}

export async function clearUserCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(USER_COOKIE_NAME)
  } catch (error) {
    console.error('Error clearing user cookie:', error)
  }
}