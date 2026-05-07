'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { calculateUserScore, getUserTriviaPoints } from '@/lib/utils/calculations'
import UserAvatar from './user-avatar'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface LeaderboardProps {
  users: UserWithTeamAndDrinks[]
  currentUserId: string
  teamFilter?: string | null
  triviaPointsMap?: Map<string, number>
}

export default function Leaderboard({ users, currentUserId, teamFilter, triviaPointsMap }: LeaderboardProps) {
  const [viewMode, setViewMode] = useState<'all' | 'team'>('all')
  
  const filteredUsers = teamFilter && viewMode === 'team' 
    ? users.filter(user => user.teamId === teamFilter)
    : users

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-primary trophy-glow" />
      case 2: return <Medal className="h-5 w-5 text-secondary-foreground/70" />
      case 3: return <Award className="h-5 w-5 text-accent-foreground" />
      default: return <div className="w-5 h-5 flex items-center justify-center">
        <span className="text-sm font-bold text-muted-foreground">#{position}</span>
      </div>
    }
  }

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      const classes = [
        'bg-primary text-primary-foreground',
        'bg-secondary text-secondary-foreground',
        'bg-accent text-accent-foreground',
      ]
      return <Badge className={`${classes[position - 1]} font-bold shadow-md`}>#{position}</Badge>
    }
    return <Badge variant="outline" className="font-medium">#{position}</Badge>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lestvica
          </CardTitle>
          {teamFilter && (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'all' | 'team')}>
              <TabsList>
                <TabsTrigger value="all">Vsi igralci</TabsTrigger>
                <TabsTrigger value="team">Moja ekipa</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ni najdenih igralcev
            </div>
          ) : (
            filteredUsers.map((user, index) => {
              const score = calculateUserScore(user.drinkLogs, getUserTriviaPoints(user.id, triviaPointsMap))
              const isCurrentUser = user.id === currentUserId
              const position = index + 1
              const regularDrinks = user.drinkLogs.filter(log => log.drinkType === 'REGULAR').length
              const shotDrinks = user.drinkLogs.filter(log => log.drinkType === 'SHOT').length
              
              return (
                <Link 
                  key={user.id} 
                  href={`/app/players/${user.id}`}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-lg cursor-pointer ${
                    isCurrentUser 
                      ? 'border-2 border-primary/30 bg-primary/5 shadow-md hover:border-primary/40'
                      : position <= 3
                        ? 'border border-accent/40 hover:border-accent/60'
                        : 'border border-transparent hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(position)}
                    
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="sm" />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            isCurrentUser ? 'text-primary' : ''
                          }`}>
                            {user.name}
                            {isCurrentUser && ' (Vi)'}
                          </span>
                          {position <= 3 && getPositionBadge(position)}
                        </div>
                        
                        {user.team && (
                          <span className="text-sm text-muted-foreground">
                            {user.team.name}
                          </span>
                        )}
                        
                        <div className="flex items-center gap-3 mt-1">
                          {regularDrinks > 0 && (
                            <span className="text-xs text-muted-foreground">
                              🍺 {regularDrinks}
                            </span>
                          )}
                          {shotDrinks > 0 && (
                            <span className="text-xs text-muted-foreground">
                              🥃 {shotDrinks}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      isCurrentUser ? 'text-primary' : position <= 3 ? 'text-accent-foreground' : ''
                    }`}>
                      {score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {score === 1 ? 'tocka' : score === 2 ? 'tocki' : score <= 4 ? 'tocke' : 'tock'}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
            {viewMode === 'all' 
              ? `Prikaz vseh ${filteredUsers.length} igralcev`
              : `Prikaz ${filteredUsers.length} članov ekipe`
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}
