'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Activity, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import UserAvatar from '@/components/users/user-avatar'
import TeamLogo from '@/components/teams/team-logo'
import Image from 'next/image'
import type { UserWithTeamAndDrinks, DrinkLogWithUserAndTeam, TeamWithStats } from '@/lib/prisma/types'
import type { Commentary } from '@/lib/prisma/fetchers/commentary-fetchers'
import { refreshDashboardAction } from '@/app/actions'
import { getDrinkLabel, getDrinkPoints } from '@/lib/utils/drinks'

interface DashboardDisplayProps {
  teams: TeamWithStats[]
  topPlayers: UserWithTeamAndDrinks[]
  recentActivity: DrinkLogWithUserAndTeam[]
  commentaries: Commentary[]
}

type DisplayMode = 'teams' | 'players' | 'activity' | 'commentary'

interface SlideHeaderProps {
  title: string
  icon: React.ReactNode
}

function SlideHeader({ title, icon }: SlideHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="font-lucky mb-6 flex items-center justify-center gap-6 text-6xl font-extrabold tracking-wider uppercase bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
        <Image src="/logo.jpg" alt="Pokal Šanka" width={60} height={60} className="rounded-lg shadow-lg" />
        <div className="flex items-center gap-4">
          {/* {icon} */}
          <span className="font-lucky font-black">{title}</span>
        </div>
      </h1>
    </div>
  )
}

export default function DashboardDisplay({ teams, topPlayers, recentActivity, commentaries }: DashboardDisplayProps) {
  const [currentMode, setCurrentMode] = useState<DisplayMode>('teams')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [countdown, setCountdown] = useState(15)
  const [cycleCount, setCycleCount] = useState(0)
  const [isFirstCycle, setIsFirstCycle] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Auto-rotate between different views every 15 seconds
  useEffect(() => {
    const modes: DisplayMode[] = commentaries.length > 0 
      ? ['teams', 'players', 'activity', 'commentary']
      : ['teams', 'players', 'activity']
    let modeIndex = 0

    const rotateMode = () => {
      const newIndex = (modeIndex + 1) % modes.length
      
      // Detect cycle completion (returning to first mode)
      if (newIndex === 0 && !isFirstCycle) {
        setCycleCount(prev => prev + 1)
      }
      
      if (modeIndex === 0) setIsFirstCycle(false)
      modeIndex = newIndex
      setCurrentMode(modes[modeIndex])
      setCountdown(15) // Reset countdown
    }

    const interval = setInterval(rotateMode, 15000) // 15 seconds
    return () => clearInterval(interval)
  }, [commentaries.length, isFirstCycle])

  // Update time and countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setCountdown(prev => prev > 1 ? prev - 1 : 15) // Count down from 15 to 1, then reset
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Handle cycle completion - trigger refresh
  useEffect(() => {
    if (cycleCount > 0) {
      startTransition(() => {
        refreshDashboardAction()
      })
    }
  }, [cycleCount])

  const getDrinkEmoji = (drinkType: string) => {
    const points = getDrinkPoints(drinkType)
    return points === 1 ? '🍺' : points === 3 ? '🍸' : '🥃'
  }

  const getDrinkStats = (drinkLogs: any[]) => {
    const stats: Record<number, number> = {}
    drinkLogs.forEach((log: any) => {
      const points = getDrinkPoints(log.drinkType)
      stats[points] = (stats[points] || 0) + 1
    })
    return stats
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-8 w-8 text-yellow-400" />
      case 2: return <Trophy className="h-8 w-8 text-gray-400" />
      case 3: return <Trophy className="h-8 w-8 text-orange-400" />
      default: return <div className="h-8 w-8 flex items-center justify-center">
        <span className="text-2xl font-bold">#{position}</span>
      </div>
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen p-8 relative  overflow-hidden">
      {/* Neon background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.5) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
      {/* Top-left clock */}
      <div className="fixed top-4 left-4 z-10">
        <div className="flex items-center gap-2 text-2xl text-white bg-slate-800/90 px-4 py-2 rounded-lg backdrop-blur-sm">
          <Clock className="h-6 w-6 text-white" />
          <span className="text-white font-bold">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Team Rankings View */}
      {currentMode === 'teams' && (
        <div className="space-y-6">
          <SlideHeader 
            title="Ekipna Lestvica" 
            icon={<Users className="h-12 w-12 text-blue-400" />} 
          />
          
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-4">
            {teams.map((team, index) => (
              <Card key={team.id}>
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <TeamLogo team={team} size="md" />
                  
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-1">{team.name}</h3>
                    <div className="flex items-center gap-4 text-lg">
                      <span>{team.memberCount} članov</span>
                      <span>•</span>
                      <span>{team.totalDrinks} pijač</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-5xl font-bold text-yellow-400">
                      {team.totalScore}
                    </div>
                    <div className="text-base">točk</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Players View */}
      {currentMode === 'players' && (
        <div className="space-y-6">
          <SlideHeader 
            title="Posamezična Lestvica" 
            icon={<Trophy className="h-12 w-12 text-yellow-400" />} 
          />
          
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-4">
            {topPlayers.map((player, index) => (
              <Card key={player.id} className='bg-transparent border-red-50'>
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <UserAvatar user={player} size="md" className="border-2 border-white" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-3xl font-bold">{player.name}</h3>
                      {player.team && (
                        <div className="flex items-center gap-2">
                          <TeamLogo team={player.team} size="sm" />
                          <Badge className="text-base px-2 py-1" style={{ backgroundColor: player.team.color }}>
                            {player.team.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-lg">
                      <span>{player.drinkLogs.length} pijač</span>
                      <span>•</span>
                      {(() => {
                        const stats = getDrinkStats(player.drinkLogs)
                        return Object.entries(stats).map(([points, count]) => (
                          <span key={points}>{count} {points === '1' ? '🍺' : points === '3' ? '🍸' : '🥃'}</span>
                        ))
                      })()}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-5xl font-bold text-green-400">
                      {player.drinkLogs.reduce((sum: number, log: any) => sum + log.points, 0)}
                    </div>
                    <div className="text-base">točk</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity View */}
      {currentMode === 'activity' && (
        <div className="space-y-6">
          <SlideHeader 
            title="Zadnja Aktivnost" 
            icon={<Activity className="h-12 w-12 text-green-400" />} 
          />
          
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-3">
            {recentActivity.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="text-3xl">
                    {getDrinkEmoji(activity.drinkType)}
                  </div>
                  
                  <UserAvatar user={activity.user} size="sm" className="border-2 border-white" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xl font-bold">{activity.user.name}</span>
                      {activity.user.team && (
                        <TeamLogo team={activity.user.team} size="sm" />
                      )}
                      <Badge 
                        className={`text-sm px-2 py-0.5 ${
                          getDrinkPoints(activity.drinkType) === 3 ? 'bg-purple-600 hover:bg-purple-600' :
                          getDrinkPoints(activity.drinkType) === 2 ? 'bg-red-600 hover:bg-red-600' : 
                          'bg-blue-600 hover:bg-blue-600'
                        }`}
                      >
                        {getDrinkLabel(activity.drinkType)}
                      </Badge>
                    </div>
                    <div className="text-base text-gray-400">
                      pred {formatDistanceToNow(new Date(activity.createdAt)).replace('about ', '').replace('minutes', 'min').replace('minute', 'min').replace('hours', 'h').replace('hour', 'h')}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      +{activity.points}
                    </div>
                    <div className="text-sm">točk</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Commentary View */}
      {currentMode === 'commentary' && (
        <div className="space-y-6">
          <SlideHeader 
            title="Novinarski Kotiček" 
            icon={<Trophy className="h-12 w-12 text-purple-400" />} 
          />
          
          <div className="max-w-6xl mx-auto">
            {commentaries.length === 0 ? (
              <Card>
                <CardContent className="text-center">
                  <div className="text-3xl mb-3">🎉</div>
                  <h3 className="text-2xl font-bold mb-2">Pripravljena scena!</h3>
                  <p className="text-lg">Komentarji se bodo prikazali, ko začnete piti...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
              {commentaries.map((commentary) => (
                <Card key={commentary.id}>
                  <CardContent className="flex items-center gap-4 py-5">
                    <div className="text-4xl">
                      {commentary.type === 'milestone' ? '🏆' :
                       commentary.type === 'streak' ? '🔥' :
                       commentary.type === 'achievement' ? '🎊' :
                       commentary.type === 'team_event' ? '🚀' : '🎉'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge 
                          className={`text-sm px-2 py-1 ${
                            commentary.priority >= 4 ? 'bg-red-600 hover:bg-red-600' :
                            commentary.priority >= 3 ? 'bg-orange-600 hover:bg-orange-600' :
                            commentary.priority >= 2 ? 'bg-blue-600 hover:bg-blue-600' :
                            'bg-gray-600 hover:bg-gray-600'
                          }`}
                        >
                          {commentary.type === 'milestone' ? 'Mejnik' :
                           commentary.type === 'streak' ? 'Niz' :
                           commentary.type === 'achievement' ? 'Dosežek' :
                           commentary.type === 'team_event' ? 'Ekipa' : 'Vzpodbuda'}
                        </Badge>
                        <div className="text-base text-gray-400">
                          pred {formatDistanceToNow(new Date(commentary.createdAt)).replace('about ', '').replace('minutes', 'min').replace('minute', 'min').replace('hours', 'h').replace('hour', 'h')}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold font-roboto">{commentary.message}</h3>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        commentary.priority >= 4 ? 'text-red-400' :
                        commentary.priority >= 3 ? 'text-orange-400' :
                        commentary.priority >= 2 ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {'★'.repeat(commentary.priority)}
                      </div>
                      <div className="text-sm">prioriteta</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator for refresh */}
      {isPending && (
        <div className="fixed top-4 right-20 text-sm bg-blue-600 px-3 py-2 rounded-lg z-20">
          Refreshing data...
        </div>
      )}

      {/* Auto-refresh indicator with countdown */}
      <div className="fixed bottom-4 right-4 text-sm text-gray-400 bg-slate-800/80 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold">{countdown}s</div>
          <div>
            Naslednji: <span className="font-semibold">
              {currentMode === 'teams' ? 'Igralci' : 
               currentMode === 'players' ? 'Aktivnost' : 
               currentMode === 'activity' ? (commentaries.length > 0 ? 'Komentarji' : 'Ekipe') :
               'Ekipe'}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}