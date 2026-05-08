'use client'

import { Card, CardContent } from '@/components/ui/card'
import UserAvatar from './user-avatar'
import type { UserWithTeamAndScore } from '@/lib/prisma/types'

interface PlayerCardProps {
  user: UserWithTeamAndScore
  currentUserId: string
  onSelectPlayer: (user: UserWithTeamAndScore) => void
}

export default function PlayerCard({ user, currentUserId, onSelectPlayer }: PlayerCardProps) {
  const isCurrentUser = user.id === currentUserId
  const teamColor = user.team?.color || '#6B7280'
  
  return (
    <Card 
      className={`relative cursor-pointer transition-all hover:shadow-xl hover:scale-[1.03] border-2 group overflow-hidden ${
        isCurrentUser ? 'ring-2 ring-primary/40 bg-primary/5 border-primary/50' : 'hover:border-primary/30'
      }`}
      style={{ borderColor: isCurrentUser ? undefined : teamColor }}
      onClick={() => onSelectPlayer(user)}
    >
      {/* Decorative background element for team color */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-10 transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: teamColor }}
      />

      <CardContent className="p-4 relative z-10">
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
            {user.team ? (
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-inner border border-black/10"
                  style={{ backgroundColor: teamColor }}
                />
                <span className="text-xs font-bold text-muted-foreground truncate uppercase tracking-tight">
                  {user.team.name}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mt-1 block">Brez ekipe</span>
            )}
          </div>
          
          {/* Score */}
          <div className="pt-1 w-full border-t border-border/40 mt-1">
            <div className="text-xl font-black text-primary tracking-tighter">
              {user.score}
            </div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-widest">
              točk
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
