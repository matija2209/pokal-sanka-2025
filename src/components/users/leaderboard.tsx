'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'
import { calculateUserScore, getUserTriviaPoints, calculateTeamScore, sortTeamsByScore } from '@/lib/utils/calculations'
import UserAvatar from './user-avatar'
import { TeamBadge } from '@/components/teams/team-badge'
import type { UserWithTeamAndDrinks, TeamWithUsersAndDrinks } from '@/lib/prisma/types'

interface LeaderboardProps {
  users: UserWithTeamAndDrinks[]
  teams: TeamWithUsersAndDrinks[]
  currentUserId: string
  currentUserTeamId?: string | null
  triviaPointsMap?: Map<string, number>
}

export default function Leaderboard({ users, teams, currentUserId, currentUserTeamId, triviaPointsMap }: LeaderboardProps) {
  const [viewMode, setViewMode] = useState<'players' | 'teams'>('players')
  const sortedTeams = sortTeamsByScore(teams)

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
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'players' | 'teams')}>
            <TabsList>
              <TabsTrigger value="players">Igralci</TabsTrigger>
              <TabsTrigger value="teams">Ekipe</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {viewMode === 'players' ? (
            users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Ni najdenih igralcev
              </div>
            ) : (
              users.map((user, index) => {
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold ${
                              isCurrentUser ? 'text-primary' : ''
                            }`}>
                              {user.name}
                              {isCurrentUser && ' (Vi)'}
                            </span>
                            {position <= 3 && getPositionBadge(position)}
                          </div>
                          
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <TeamBadge team={user.team} className="text-xs px-2 py-0.5 max-w-[140px] sm:max-w-[200px] truncate" />
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1.5">
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
            )
          ) : (
            sortedTeams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Ni najdenih ekip
              </div>
            ) : (
              sortedTeams.map((team, index) => {
                const teamScore = calculateTeamScore(team.users)
                const isCurrentUserTeam = currentUserTeamId ? team.id === currentUserTeamId : false
                const position = index + 1
                const memberCount = team.users.length

                return (
                  <Link 
                    key={team.id} 
                    href={`/app/teams/${team.id}`}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-lg cursor-pointer ${
                      isCurrentUserTeam 
                        ? 'border-2 border-primary/30 bg-primary/5 shadow-md hover:border-primary/40'
                        : position <= 3
                          ? 'border border-accent/40 hover:border-accent/60'
                          : 'border border-transparent hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {getRankIcon(position)}
                      
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-background shadow-sm shrink-0" 
                          style={{ backgroundColor: team.color }}
                        />
                        
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold ${
                              isCurrentUserTeam ? 'text-primary' : ''
                            }`}>
                              {team.name}
                              {isCurrentUserTeam && ' (Vaša ekipa)'}
                            </span>
                            {position <= 3 && getPositionBadge(position)}
                          </div>
                          
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                              {memberCount} {memberCount === 1 ? 'član' : memberCount === 2 ? 'člana' : memberCount <= 4 ? 'člani' : 'članov'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isCurrentUserTeam ? 'text-primary' : position <= 3 ? 'text-accent-foreground' : ''
                      }`}>
                        {teamScore}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {teamScore === 1 ? 'točka' : teamScore === 2 ? 'točki' : teamScore <= 4 ? 'točke' : 'točk'}
                      </div>
                    </div>
                  </Link>
                )
              })
            )
          )}
        </div>
        
        {viewMode === 'players' ? (
          users.length > 0 && (
            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
              Prikaz vseh {users.length} igralcev
            </div>
          )
        ) : (
          sortedTeams.length > 0 && (
            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
              Prikaz vseh {sortedTeams.length} ekip
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
