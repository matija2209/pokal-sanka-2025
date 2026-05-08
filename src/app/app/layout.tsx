import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getActiveEvent, getAllEvents } from '@/lib/events'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentEvent, availableEvents] = await Promise.all([
    getActiveEvent(),
    getAllEvents(),
  ])

  if (!currentEvent) {
    redirect('/')
  }

  const currentUser = await getCurrentUser(currentEvent.id)

  if (!currentUser) {
    redirect('/')
  }

  return (
    <DashboardLayout
      currentUser={currentUser}
      currentEvent={currentEvent}
      availableEvents={availableEvents}
    >
      {children}
    </DashboardLayout>
  )
}
