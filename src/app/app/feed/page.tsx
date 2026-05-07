import { getCurrentUser } from '@/lib/utils/cookies'
import { redirect } from 'next/navigation'
import { EventFeed } from '@/components/timeline'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feed | Pokal Šanka - Matija Edition',
  description: 'Zasebni feed dogodka z objavami, slikami in vecjimi trenutki turnirja.',
  keywords: ['feed', 'objave', 'slike', 'timeline', 'dogodek'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Feed - Pokal Šanka',
    description: 'Zasebni timeline dogodka z objavami in highlighti.',
    locale: 'sl_SI',
  },
}

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/')
  }

  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  return (
    <EventFeed currentUser={currentUser} />
  )
}
