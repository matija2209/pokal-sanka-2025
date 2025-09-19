'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout'
import type { UserWithTeam } from '@/lib/prisma/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentUser: UserWithTeam
}

export default function DashboardLayout({ children, currentUser }: DashboardLayoutProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000) // Visual feedback
  }

  return (
    <div className="min-h-screen ">
      <Navigation 
        currentUser={currentUser}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <main className="py-4 md:py-8">
        {children}
      </main>
    </div>
  )
}