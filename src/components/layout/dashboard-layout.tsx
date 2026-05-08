'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout'
import type { Event, UserWithTeam } from '@/lib/prisma/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentUser: UserWithTeam
  currentEvent: Event
  availableEvents: Event[]
}

export default function DashboardLayout({ children, currentUser, currentEvent, availableEvents }: DashboardLayoutProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    // router.refresh() is fire-and-forget — reset after a short spin
    setTimeout(() => setIsRefreshing(false), 400)
  }

  return (
    <div className="min-h-screen ">
      <Navigation 
        currentUser={currentUser}
        currentEvent={currentEvent}
        availableEvents={availableEvents}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <main className="py-4 md:py-8">
        {children}
      </main>
    </div>
  )
}
