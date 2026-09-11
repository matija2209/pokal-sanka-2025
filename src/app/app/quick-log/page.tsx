export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getQuickLogUsers } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { getActiveEvent } from '@/lib/events'
import { Container } from '@/components/layout/container'
import { QuickLogTabs } from '@/components/quick-log'

interface QuickLogPageProps {
  searchParams?: Promise<{ multi?: string }>
}

export default async function QuickLogPage({ searchParams }: QuickLogPageProps) {
  await connection()

  const params = searchParams ? await searchParams : undefined
  const initialTab = params?.multi === '1' ? 'group' : 'individual'

  const currentEvent = await getActiveEvent()

  if (!currentEvent) {
    redirect('/')
  }

  const [currentUser, users] = await Promise.all([
    getCurrentUser(currentEvent.id),
    getQuickLogUsers(currentEvent.id),
  ])
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  return (
    <Container size="mobile" className="py-8">
      <QuickLogTabs users={users} currentUserId={currentUser.id} initialTab={initialTab} />
    </Container>
  )
}
