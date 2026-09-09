'use client'

import { Card, CardContent } from '@/components/ui/card'
import UserAvatar from './user-avatar'
import { TeamBadge } from '@/components/teams/team-badge'
import type { QuickLogUser } from '@/lib/prisma/types'
import Link from 'next/link'

interface PlayerCardProps {
  user: QuickLogUser
  currentUserId: string
}

export default function PlayerCard({ user, currentUserId }: PlayerCardProps) {
  const isCurrentUser = user.id === currentUserId
  const teamColor = user.team?.color || '#6B7280'
  
  return (
    <Card
      className={`relative cursor-pointer transition-all hover:shadow-xl hover:scale-[1.03] border-2 group overflow-hidden ${
        isCurrentUser ? 'ring-2 ring-primary/40 bg-primary/5 border-primary/50' : 'hover:border-primary/30'
      }`}
      style={{ borderColor: isCurrentUser ? undefined : teamColor }}
    >
      <Link
        href={`/app/quick-log/${user.id}`}
        prefetch
        aria-label={`Beleži pijačo za ${user.name}`}
        className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
      {/* Decorative background element for team color */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-10 transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: teamColor }}
      />

      <CardContent className="p-4 relative z-10 pointer-events-none">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar */}
          <div className="relative">
            <UserAvatar user={user} size="md" className="ring-2 ring-background shadow-md" />
            {isCurrentUser && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                TI
              </div>
            )}
          </div>
          
          {/* User Name */}
          <div className="w-full">
            <h3 className="font-bold text-sm md:text-base truncate text-foreground leading-tight">
              {user.name}
            </h3>
            
            {/* Team Info */}
            <div className="flex items-center justify-center mt-1.5">
              <TeamBadge team={user.team} className="text-[10px] font-bold uppercase tracking-tight" />
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}
