import { cookies } from 'next/headers'

const CURRENT_USER_COOKIE = 'current-user-id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get(CURRENT_USER_COOKIE)
    return userCookie?.value || null
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

export async function setCurrentUserId(userId: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(CURRENT_USER_COOKIE, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    })
  } catch (error) {
    console.error('Error setting current user ID:', error)
  }
}

export async function clearCurrentUserId(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(CURRENT_USER_COOKIE)
  } catch (error) {
    console.error('Error clearing current user ID:', error)
  }
}