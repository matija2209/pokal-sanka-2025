'use client'

import { useState } from 'react'
import PlayerCard from './player-card'
import { DrinkSelectionDialog } from '@/components/drinks'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface PlayerGridProps {
  users: UserWithTeamAndDrinks[]
  currentUserId: string
}

export default function PlayerGrid({ users, currentUserId }: PlayerGridProps) {
  const [selectedUser, setSelectedUser] = useState<UserWithTeamAndDrinks | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSelectPlayer = (user: UserWithTeamAndDrinks) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDrinkLogged = () => {
    // The server action will trigger a revalidation of the page data
    // No additional action needed here
  }

  return (
    <>
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

      <DrinkSelectionDialog
        selectedUser={selectedUser}
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        onDrinkLogged={handleDrinkLogged}
      />
    </>
  )
}