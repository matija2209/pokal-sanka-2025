'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Trophy, Medal, Award, Users, TrendingUp } from 'lucide-react'
import { calculateTeamScore, sortTeamsByScore } from '@/lib/utils/calculations'
import type { TeamWithUsersAndDrinks } from '@/lib/prisma/types'

interface TeamLeaderboardProps {
  teams: TeamWithUsersAndDrinks[]
  currentUserTeamId?: string | null
}

export default function TeamLeaderboard({ teams, currentUserTeamId }: TeamLeaderboardProps) {
  const sortedTeams = sortTeamsByScore(teams)
  
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-6 w-6" />
      case 2: return <Medal className="h-6 w-6" />
      case 3: return <Award className="h-6 w-6" />
      default: return <div className="w-6 h-6 flex items-center justify-center">
        <span className="text-sm font-bold">#{position}</span>
      </div>
    }
  }

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      return <Badge>#{position}</Badge>
    }
    return <Badge variant="outline">#{position}</Badge>
  }

  // Calculate max score for progress bars
  const maxScore = sortedTeams.length > 0 ? calculateTeamScore(sortedTeams[0].users) : 1

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ekipna Lestvica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTeams.length === 0 ? (
            <div className="text-center py-8">
              Ni najdenih ekip
            </div>
          ) : (
            sortedTeams.map((team, index) => {
              const teamScore = calculateTeamScore(team.users)
              const position = index + 1
              const isCurrentUserTeam = team.id === currentUserTeamId
              const memberCount = team.users.length
              const avgScore = memberCount > 0 ? teamScore / memberCount : 0
              const progressPercentage = maxScore > 0 ? (teamScore / maxScore) * 100 : 0
              
              return (
                <Link 
                  key={team.id} 
                  href={`/teams/${team.id}`}
                  className={`block p-6 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
                    isCurrentUserTeam 
                      ? 'border-blue-200  shadow-md hover:border-blue-300' 
                      : position <= 3
                        ? 'border-yellow-200  hover:border-yellow-300'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getRankIcon(position)}
                      
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm" 
                          style={{ backgroundColor: team.color }}
                        />
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold`}>
                              {team.name}
                              {isCurrentUserTeam && ' (Vaša Ekipa)'}
                            </h3>
                            {position <= 3 && getPositionBadge(position)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{memberCount} članov</span>
                            </div>
                            {avgScore > 0 && (
                              <span>Povpr: {avgScore.toFixed(1)} točk/član</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-3xl font-bold`}>
                        {teamScore}
                      </div>
                      <div className="text-sm">točk</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs">Napredek Ekipe</span>
                      <span className="text-xs">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Team Members Preview */}
                  {team.users.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Člani:</span>
                      <div className="flex -space-x-2">
                        {team.users.slice(0, 5).map((user: any) => (
                          <Avatar key={user.id} className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.users.length > 5 && (
                          <div className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs">+{team.users.length - 5}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Top performer indicator */}
                      {team.users.length > 0 && (
                        <div className="ml-auto text-xs">
                          Najboljši: {team.users
                            .map(u => ({ ...u, score: u.drinkLogs.reduce((s, l) => s + l.points, 0) }))
                            .sort((a, b) => b.score - a.score)[0]?.name}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              )
            })
          )}
        </div>
        
        {sortedTeams.length > 0 && (
          <div className="mt-6 pt-4 border-t text-center text-sm">
            Prikaz vseh {sortedTeams.length} ekip
          </div>
        )}
      </CardContent>
    </Card>
  )
}