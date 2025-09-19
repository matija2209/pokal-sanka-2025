'use client'

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
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2: return <Medal className="h-6 w-6 " />
      case 3: return <Award className="h-6 w-6 text-orange-500" />
      default: return <div className="w-6 h-6 flex items-center justify-center">
        <span className="text-sm font-bold ">#{position}</span>
      </div>
    }
  }

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-500']
      return <Badge className={`${colors[position - 1]} text-white`}>#{position}</Badge>
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
          Team Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTeams.length === 0 ? (
            <div className="text-center py-8 ">
              No teams found
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
                <div 
                  key={team.id} 
                  className={`p-6 rounded-lg border-2 transition-all ${
                    isCurrentUserTeam 
                      ? 'bg-blue-50 border-blue-200 shadow-md' 
                      : position <= 3
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                        : ' border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getRankIcon(position)}
                      
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                          style={{ backgroundColor: team.color }}
                        />
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold ${
                              isCurrentUserTeam ? 'text-blue-700' : ''
                            }`}>
                              {team.name}
                              {isCurrentUserTeam && ' (Your Team)'}
                            </h3>
                            {position <= 3 && getPositionBadge(position)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm ">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{memberCount} members</span>
                            </div>
                            {avgScore > 0 && (
                              <span>Avg: {avgScore.toFixed(1)} pts/member</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        isCurrentUserTeam 
                          ? 'text-blue-700' 
                          : position <= 3 
                            ? 'text-yellow-600' 
                            : ''
                      }`}>
                        {teamScore}
                      </div>
                      <div className="text-sm ">points</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs ">Team Progress</span>
                      <span className="text-xs ">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Team Members Preview */}
                  {team.users.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs ">Members:</span>
                      <div className="flex -space-x-2">
                        {team.users.slice(0, 5).map((user: any) => (
                          <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.users.length > 5 && (
                          <div className="h-6 w-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs ">+{team.users.length - 5}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Top performer indicator */}
                      {team.users.length > 0 && (
                        <div className="ml-auto text-xs ">
                          Top: {team.users
                            .map(u => ({ ...u, score: u.drinkLogs.reduce((s, l) => s + l.points, 0) }))
                            .sort((a, b) => b.score - a.score)[0]?.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
        
        {sortedTeams.length > 0 && (
          <div className="mt-6 pt-4 border-t text-center text-sm ">
            Showing all {sortedTeams.length} teams
          </div>
        )}
      </CardContent>
    </Card>
  )
}