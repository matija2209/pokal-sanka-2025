import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import NavShell from '@/components/layout/nav-shell'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getActiveEvent, getAllEvents } from '@/lib/events'

export const dynamic = 'force-dynamic'

async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
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
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }>
        {children}
      </Suspense>
    </DashboardLayout>
  )
}

function AppLayoutFallback() {
  return (
    <div className="min-h-screen">
      <NavShell />
      <main className="py-4 md:py-8">
        <div className="container mx-auto px-4 flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </main>
    </div>
  )
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<AppLayoutFallback />}>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  )
}
