export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { redirect } from 'next/navigation'
import { EventFeed } from '@/components/timeline'
import type { Metadata } from 'next'
import { getActiveEvent, getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Feed',
    description: 'Zasebni feed dogodka z objavami, slikami in vecjimi trenutki turnirja.',
    keywords: ['feed', 'objave', 'slike', 'timeline', 'dogodek'],
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Feed | ${brand}`,
      description: 'Zasebni timeline dogodka z objavami in highlighti.',
      locale: 'sl_SI',
    },
  }
}


export default async function FeedPage() {
  await connection()

  const currentEvent = await getActiveEvent()
  const currentUser = await getCurrentUser(currentEvent?.id)

  if (!currentUser) {
    redirect('/')
  }

  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  return (
    <EventFeed currentUser={currentUser} currentEvent={currentEvent} />
  )
}
