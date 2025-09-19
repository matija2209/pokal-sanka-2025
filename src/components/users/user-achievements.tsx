'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, Flame, Star, Calendar, TrendingUp } from 'lucide-react'
import { calculateUserScore } from '@/lib/utils/calculations'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface UserAchievementsProps {
  user: UserWithTeamAndDrinks
  allUsers: UserWithTeamAndDrinks[]
  rank: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  isUnlocked: boolean
  progress?: number
  maxProgress?: number
  category: 'milestone' | 'consistency' | 'competition' | 'special'
}

export default function UserAchievements({ user, allUsers, rank }: UserAchievementsProps) {
  const totalScore = calculateUserScore(user.drinkLogs)
  const regularDrinks = user.drinkLogs.filter(log => log.drinkType === 'REGULAR').length
  const shotDrinks = user.drinkLogs.filter(log => log.drinkType === 'SHOT').length
  const totalDrinks = user.drinkLogs.length
  
  // Calculate streak (simplified - consecutive days with drinks)
  const today = new Date()
  const drinkDates = user.drinkLogs.map(log => new Date(log.createdAt).toDateString())
  const uniqueDrinkDates = [...new Set(drinkDates)].sort()
  
  const achievements: Achievement[] = [
    // Milestone achievements
    {
      id: 'first_drink',
      name: 'Prvi požirek',
      description: 'Zabeležite svojo prvo pijačo',
      icon: <Trophy className="h-4 w-4 text-blue-500" />,
      isUnlocked: totalDrinks >= 1,
      category: 'milestone'
    },
    {
      id: 'ten_drinks',
      name: 'Začetek',
      description: 'Zabeležite 10 pijač',
      icon: <Target className="h-4 w-4 text-green-500" />,
      isUnlocked: totalDrinks >= 10,
      progress: Math.min(totalDrinks, 10),
      maxProgress: 10,
      category: 'milestone'
    },
    {
      id: 'fifty_drinks',
      name: 'Navdušenec',
      description: 'Zabeležite 50 pijač',
      icon: <Flame className="h-4 w-4 text-orange-500" />,
      isUnlocked: totalDrinks >= 50,
      progress: Math.min(totalDrinks, 50),
      maxProgress: 50,
      category: 'milestone'
    },
    {
      id: 'hundred_drinks',
      name: 'Centurion',
      description: 'Zabeležite 100 pijač',
      icon: <Star className="h-4 w-4 text-purple-500" />,
      isUnlocked: totalDrinks >= 100,
      progress: Math.min(totalDrinks, 100),
      maxProgress: 100,
      category: 'milestone'
    },
    
    // Competition achievements
    {
      id: 'top_three',
      name: 'Stopničke',
      description: 'Dosežite top 3 na lestvici',
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      isUnlocked: rank <= 3,
      category: 'competition'
    },
    {
      id: 'first_place',
      name: 'Prvak',
      description: 'Dosežite 1. mesto na lestvici',
      icon: <Trophy className="h-4 w-4 text-yellow-600 trophy-glow" />,
      isUnlocked: rank === 1,
      category: 'competition'
    },
    
    // Consistency achievements
    {
      id: 'daily_drinker',
      name: 'Dnevna navada',
      description: 'Beležite pijače 7 različnih dni',
      icon: <Calendar className="h-4 w-4 text-indigo-500" />,
      isUnlocked: uniqueDrinkDates.length >= 7,
      progress: Math.min(uniqueDrinkDates.length, 7),
      maxProgress: 7,
      category: 'consistency'
    },
    
    // Special achievements
    {
      id: 'balanced_drinker',
      name: 'Uravnotežen pristop',
      description: 'Beležite tako pivo kot žganje',
      icon: <TrendingUp className="h-4 w-4 text-teal-500" />,
      isUnlocked: regularDrinks > 0 && shotDrinks > 0,
      category: 'special'
    },
    {
      id: 'shot_specialist',
      name: 'Specialist za žganje',
      description: 'Zabeležite 20 žganj',
      icon: <Target className="h-4 w-4 text-red-500" />,
      isUnlocked: shotDrinks >= 20,
      progress: Math.min(shotDrinks, 20),
      maxProgress: 20,
      category: 'special'
    }
  ]

  const unlockedAchievements = achievements.filter(a => a.isUnlocked)
  const lockedAchievements = achievements.filter(a => !a.isUnlocked)

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'milestone': return 'bg-blue-100 text-blue-800'
      case 'competition': return 'bg-yellow-100 text-yellow-800'
      case 'consistency': return 'bg-green-100 text-green-800'
      case 'special': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 '
    }
  }

  const getCategoryLabel = (category: Achievement['category']) => {
    switch (category) {
      case 'milestone': return 'mejnik'
      case 'competition': return 'tekmovanje'
      case 'consistency': return 'vztrajnost'
      case 'special': return 'posebno'
      default: return 'ostalo'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Dosežki
          <Badge variant="outline" className="ml-auto">
            {unlockedAchievements.length} / {achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className=" p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Napredek dosežkov</span>
              <span className="text-sm ">
                {unlockedAchievements.length} / {achievements.length}
              </span>
            </div>
            <Progress 
              value={(unlockedAchievements.length / achievements.length) * 100} 
              className="h-2"
            />
          </div>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-green-700">
                🏆 Odklenjen ({unlockedAchievements.length})
              </h3>
              <div className="grid gap-3">
                {unlockedAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="mt-0.5">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{achievement.name}</span>
                        <Badge 
                          className={`text-xs ${getCategoryColor(achievement.category)}`}
                        >
                          {achievement.category}
                        </Badge>
                      </div>
                      <p className="text-xs  mb-1">{achievement.description}</p>
                      {achievement.maxProgress && (
                        <div className="text-xs text-green-600 font-medium">
                          Končano: {achievement.progress} / {achievement.maxProgress}
                        </div>
                      )}
                    </div>
                    <div className="text-green-600">
                      ✅
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 ">
                🔒 Zaklenjen ({lockedAchievements.length})
              </h3>
              <div className="grid gap-3">
                {lockedAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="flex items-start gap-3 p-3  border border-gray-200 rounded-lg opacity-75"
                  >
                    <div className="mt-0.5 opacity-50">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm ">{achievement.name}</span>
                        <Badge 
                          variant="outline"
                          className="text-xs"
                        >
                          {achievement.category}
                        </Badge>
                      </div>
                      <p className="text-xs  mb-2">{achievement.description}</p>
                      {achievement.maxProgress && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs ">
                            <span>Napredek: {achievement.progress || 0} / {achievement.maxProgress}</span>
                            <span>{Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)}%</span>
                          </div>
                          <Progress 
                            value={((achievement.progress || 0) / achievement.maxProgress) * 100} 
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}