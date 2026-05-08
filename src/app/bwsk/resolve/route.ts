import { NextResponse } from 'next/server'
import { getEventBySlug, DEFAULT_BACHELOR_EVENT_SLUG, setActiveEventCookie } from '@/lib/events'
import { clearActiveUserCookie, getCurrentPersonId, setUserCookie } from '@/lib/utils/cookies'
import { getUserByPersonAndEvent } from '@/lib/prisma/fetchers/user-fetchers'

export async function GET(request: Request) {
  const bachelorEvent = await getEventBySlug(DEFAULT_BACHELOR_EVENT_SLUG)

  if (!bachelorEvent || !bachelorEvent.isActive) {
    return NextResponse.redirect(new URL('/bwsk/inactive', request.url))
  }

  await setActiveEventCookie(bachelorEvent.id)

  const currentPersonId = await getCurrentPersonId()
  if (currentPersonId) {
    const eventUser = await getUserByPersonAndEvent(currentPersonId, bachelorEvent.id)
    if (eventUser) {
      await setUserCookie(eventUser.id, currentPersonId)
    } else {
      await clearActiveUserCookie()
    }
  }

  return NextResponse.redirect(new URL('/bwsk/enter', request.url))
}
