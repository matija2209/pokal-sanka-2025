'use client'

import { Card, CardContent } from '@/components/ui/card'
import { calculateUserScore } from '@/lib/utils/calculations'
import UserAvatar from './user-avatar'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface PlayerCardProps {
  user: UserWithTeamAndDrinks
  currentUserId: string
  onSelectPlayer: (user: UserWithTeamAndDrinks) => void
}

export default function PlayerCard({ user, currentUserId, onSelectPlayer }: PlayerCardProps) {
  const isCurrentUser = user.id === currentUserId
  const userScore = calculateUserScore(user.drinkLogs)
  const teamColor = user.team?.color || '#6B7280'
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${
        isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:'
      }`}
      style={{ borderColor: teamColor }}
      onClick={() => onSelectPlayer(user)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar */}
          <UserAvatar user={user} size="md" />
          
          {/* User Name */}
          <div>
            <h3 className="font-semibold text-sm md:text-base truncate">
              {user.name}
              {isCurrentUser && (
                <span className="text-blue-600 text-xs ml-1">(You)</span>
              )}
            </h3>
            
            {/* Team Info */}
            {user.team ? (
              <div className="flex items-center justify-center gap-1 mt-1">
                <div 
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: teamColor }}
                />
                <span 
                  className="text-xs font-medium truncate"
                  style={{ color: teamColor }}
                >
                  {user.team.name}
                </span>
              </div>
            ) : (
              <span className="text-xs ">No Team</span>
            )}
          </div>
          
          {/* Score */}
          <div className="text-center">
            <div className="text-lg font-bold ">
              {userScore}
            </div>
            <div className="text-xs ">
              points
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}