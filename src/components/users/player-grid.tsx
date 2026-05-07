'use client'

import PlayerCard from './player-card'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'
import { useRouter } from 'next/navigation'

interface PlayerGridProps {
  users: UserWithTeamAndDrinks[]
  currentUserId: string
}

export default function PlayerGrid({ users, currentUserId }: PlayerGridProps) {
  const router = useRouter()

  const handleSelectPlayer = (user: UserWithTeamAndDrinks) => {
    router.push(`/app/quick-log/${user.id}`)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {users.map(user => (
        <PlayerCard
          key={user.id}
          user={user}
          currentUserId={currentUserId}
          onSelectPlayer={handleSelectPlayer}
        />
      ))}
    </div>
  )
}