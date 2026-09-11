'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PlayerGrid } from '@/components/users'
import { DrinkLogForm } from '@/components/drinks'
import type { QuickLogUser } from '@/lib/prisma/types'

type QuickLogTab = 'individual' | 'group'

interface QuickLogTabsProps {
  users: QuickLogUser[]
  currentUserId: string
  initialTab: QuickLogTab
}

export default function QuickLogTabs({ users, currentUserId, initialTab }: QuickLogTabsProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<QuickLogTab>(initialTab)

  useEffect(() => {
    if (searchParams.get('multi') === '1') {
      setActiveTab('group')
    }
  }, [searchParams])

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QuickLogTab)}>
      <TabsList>
        <TabsTrigger value="individual">Posamezno</TabsTrigger>
        <TabsTrigger value="group">Skupinsko</TabsTrigger>
      </TabsList>

      <TabsContent value="individual">
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50 shadow-sm">
          <PlayerGrid users={users} currentUserId={currentUserId} />
        </div>
      </TabsContent>

      <TabsContent value="group">
        <DrinkLogForm currentUserId={currentUserId} allUsers={users} forceMultiMode />
      </TabsContent>
    </Tabs>
  )
}
