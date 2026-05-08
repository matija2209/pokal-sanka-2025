import { NextResponse } from 'next/server'
import { DEFAULT_BACHELOR_EVENT_SLUG, getEventBySlug, setActiveEventCookie } from '@/lib/events'
import { setPersonCookie, setUserCookie, clearActiveUserCookie } from '@/lib/utils/cookies'
import { getUserByPersonAndEvent } from '@/lib/prisma/fetchers/user-fetchers'
import { prisma } from '@/lib/prisma/client'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

type InviteRouteContext = {
  params: Promise<{
    eventSlug: string
    personId: string
  }>
}

export async function GET(_request: Request, context: InviteRouteContext) {
  const { eventSlug, personId } = await context.params
  const entryRedirectPath = eventSlug === DEFAULT_BACHELOR_EVENT_SLUG ? '/bwsk/enter' : '/'

  if (!(await isMultiEventSchemaAvailable())) {
    return NextResponse.redirect(new URL('/', _request.url))
  }

  const [event, person] = await Promise.all([
    getEventBySlug(eventSlug),
    prisma.person.findUnique({
      where: { id: personId },
    }),
  ])

  if (!event || !person) {
    return NextResponse.redirect(new URL('/', _request.url))
  }

  await setActiveEventCookie(event.id)
  await setPersonCookie(person.id)

  const eventUser = await getUserByPersonAndEvent(person.id, event.id)

  if (eventUser) {
    await setUserCookie(eventUser.id, person.id)

    const redirectPath = eventSlug === DEFAULT_BACHELOR_EVENT_SLUG
      ? '/bwsk/enter'
      : (eventUser.teamId ? '/app/feed' : '/app/select-team')
    return NextResponse.redirect(new URL(redirectPath, _request.url))
  }

  await clearActiveUserCookie()
  return NextResponse.redirect(new URL(entryRedirectPath, _request.url))
}
