'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  Activity
} from 'lucide-react'
import { calculateUserScore, calculateUserStreaks } from '@/lib/utils/calculations'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface UserStatsProps {
  user: UserWithTeamAndDrinks
  allUsers: UserWithTeamAndDrinks[]
  rank?: number
}

export default function UserStats({ user, allUsers, rank }: UserStatsProps) {
  const score = calculateUserScore(user.drinkLogs)
  const streak = calculateUserStreaks(user.drinkLogs)
  const regularDrinks = user.drinkLogs.filter(log => log.drinkType === 'REGULAR').length
  const shotDrinks = user.drinkLogs.filter(log => log.drinkType === 'SHOT').length
  
  // Calculate position relative to other players
  const maxScore = Math.max(...allUsers.map(u => calculateUserScore(u.drinkLogs)), 1)
  const progressPercentage = (score / maxScore) * 100
  
  // Recent activity (last 7 days)
  const recentLogs = user.drinkLogs.filter(log => {
    const logDate = new Date(log.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return logDate >= weekAgo
  })
  const recentScore = calculateUserScore(recentLogs)

  // Get achievement badges
  const getAchievements = () => {
    const achievements = []
    
    if (rank === 1) achievements.push({ icon: '🏆', label: 'Vodja', color: 'bg-yellow-500' })
    if (rank && rank <= 3) achievements.push({ icon: '🥉', label: 'Top 3', color: 'bg-orange-500' })
    if (streak >= 3) achievements.push({ icon: '🔥', label: `${streak} dni zapored`, color: 'bg-red-500' })
    if (shotDrinks >= 5) achievements.push({ icon: '🥃', label: 'Mojster žganja', color: 'bg-purple-500' })
    if (score >= 50) achievements.push({ icon: '💯', label: 'Visoke točke', color: 'bg-green-500' })
    if (recentScore >= 10) achievements.push({ icon: '⚡', label: 'Aktiven', color: 'bg-blue-500' })
    
    return achievements
  }

  const achievements = getAchievements()

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vaše statistike
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-500">Skupaj točk</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{regularDrinks}</div>
              <div className="text-sm text-gray-500">Pivo</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{shotDrinks}</div>
              <div className="text-sm text-gray-500">Žganje</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{recentScore}</div>
              <div className="text-sm text-gray-500">Ta teden</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Napredek do vodilnega</span>
              <span className="text-sm text-gray-500">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Rank Badge */}
          {rank && (
            <div className="flex justify-center">
              <Badge 
                variant={rank <= 3 ? "default" : "secondary"}
                className={rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : rank === 3 ? "bg-orange-500" : ""}
              >
                Mesto #{rank} od {allUsers.length}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Dosežki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{achievement.icon}</span>
                  <span className="text-sm font-medium">{achievement.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak Information */}
      {streak > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trenutni niz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                🔥 {streak} {streak === 1 ? 'dan' : 'dni'}
              </div>
              <p className="text-sm text-gray-600">
                Nadaljujte s pitjem, da ohranite svoj niz!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}