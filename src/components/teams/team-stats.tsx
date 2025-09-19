'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  Trophy, 
  Target,
  TrendingUp,
  Award
} from 'lucide-react'
import { calculateTeamScore, calculateUserScore } from '@/lib/utils/calculations'
import type { TeamWithUsersAndDrinks } from '@/lib/prisma/types'

interface TeamStatsProps {
  team: TeamWithUsersAndDrinks
  allTeams: TeamWithUsersAndDrinks[]
  rank?: number
}

export default function TeamStats({ team, allTeams, rank }: TeamStatsProps) {
  const teamScore = calculateTeamScore(team.users)
  const memberCount = team.users.length
  const totalDrinks = team.users.reduce((total, user) => total + user.drinkLogs.length, 0)
  
  // Calculate team averages
  const avgScorePerMember = memberCount > 0 ? teamScore / memberCount : 0
  const avgDrinksPerMember = memberCount > 0 ? totalDrinks / memberCount : 0
  
  // Get top performers in team
  const topPerformers = team.users
    .map(user => ({
      ...user,
      score: calculateUserScore(user.drinkLogs)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  
  // Calculate team progress relative to leader
  const maxTeamScore = Math.max(...allTeams.map(t => calculateTeamScore(t.users)), 1)
  const progressPercentage = (teamScore / maxTeamScore) * 100
  
  // Recent activity (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentLogs = team.users.flatMap(user => 
    user.drinkLogs.filter(log => new Date(log.createdAt) >= weekAgo)
  )
  const recentScore = recentLogs.reduce((total, log) => total + log.points, 0)

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded" 
              style={{ backgroundColor: team.color }}
            />
            {team.name} Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamScore}</div>
              <div className="text-sm ">Total Points</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{memberCount}</div>
              <div className="text-sm ">Members</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{avgScorePerMember.toFixed(1)}</div>
              <div className="text-sm ">Avg/Member</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{recentScore}</div>
              <div className="text-sm ">This Week</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress to Leading Team</span>
              <span className="text-sm ">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Team Rank Badge */}
          {rank && (
            <div className="flex justify-center">
              <Badge 
                variant={rank <= 3 ? "default" : "secondary"}
                className={rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : rank === 3 ? "bg-orange-500" : ""}
              >
                Team Rank #{rank} of {allTeams.length}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3  rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                      {index === 1 && <Award className="h-5 w-5 " />}
                      {index === 2 && <Award className="h-5 w-5 text-orange-500" />}
                    </div>
                    
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm ">
                        {user.drinkLogs.length} drinks
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold">{user.score}</div>
                    <div className="text-sm ">points</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({memberCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.users.map(user => {
              const userScore = calculateUserScore(user.drinkLogs)
              const userDrinks = user.drinkLogs.length
              
              return (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm ">
                        {userDrinks} drinks total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{userScore}</div>
                    <div className="text-sm ">points</div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {memberCount === 0 && (
            <div className="text-center py-8 ">
              No members in this team yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Team Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rank === 1 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-lg">🥇</span>
                <span className="text-sm font-medium">Team Leader</span>
              </div>
            )}
            
            {rank && rank <= 3 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-lg">🏆</span>
                <span className="text-sm font-medium">Top 3 Team</span>
              </div>
            )}
            
            {avgScorePerMember >= 10 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-lg">⭐</span>
                <span className="text-sm font-medium">High Performers</span>
              </div>
            )}
            
            {memberCount >= 5 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-lg">👥</span>
                <span className="text-sm font-medium">Big Team</span>
              </div>
            )}
            
            {recentScore >= 20 && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-medium">Very Active</span>
              </div>
            )}
            
            {totalDrinks >= 100 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-lg">💯</span>
                <span className="text-sm font-medium">Century Club</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}