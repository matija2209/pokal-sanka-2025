'use client'

import PlayerCard from './player-card'
import type { QuickLogUser } from '@/lib/prisma/types'

interface PlayerGridProps {
  users: QuickLogUser[]
  currentUserId: string
}

export default function PlayerGrid({ users, currentUserId }: PlayerGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {users.map(user => (
        <PlayerCard
          key={user.id}
          user={user}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
