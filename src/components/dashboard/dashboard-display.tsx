'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Activity, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import UserAvatar from '@/components/users/user-avatar'
import TeamLogo from '@/components/teams/team-logo'
import type { UserWithTeamAndDrinks, DrinkLogWithUserAndTeam, TeamWithStats } from '@/lib/prisma/types'
import type { Commentary } from '@/lib/prisma/fetchers/commentary-fetchers'

interface DashboardDisplayProps {
  teams: TeamWithStats[]
  topPlayers: UserWithTeamAndDrinks[]
  recentActivity: DrinkLogWithUserAndTeam[]
  commentaries: Commentary[]
}

type DisplayMode = 'teams' | 'players' | 'activity' | 'commentary'

export default function DashboardDisplay({ teams, topPlayers, recentActivity, commentaries }: DashboardDisplayProps) {
  const [currentMode, setCurrentMode] = useState<DisplayMode>('teams')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [countdown, setCountdown] = useState(15)

  // Auto-rotate between different views every 15 seconds
  useEffect(() => {
    const modes: DisplayMode[] = commentaries.length > 0 
      ? ['teams', 'players', 'activity', 'commentary']
      : ['teams', 'players', 'activity']
    let modeIndex = 0

    const rotateMode = () => {
      modeIndex = (modeIndex + 1) % modes.length
      setCurrentMode(modes[modeIndex])
      setCountdown(15) // Reset countdown
    }

    const interval = setInterval(rotateMode, 15000) // 15 seconds
    return () => clearInterval(interval)
  }, [commentaries.length])

  // Update time and countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setCountdown(prev => prev > 1 ? prev - 1 : 15) // Count down from 15 to 1, then reset
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getDrinkEmoji = (drinkType: string) => {
    return drinkType === 'REGULAR' ? '🍺' : '🥃'
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-8 w-8 text-yellow-400 trophy-glow" />
      case 2: return <Trophy className="h-8 w-8 text-gray-400" />
      case 3: return <Trophy className="h-8 w-8 text-orange-400" />
      default: return <div className="h-8 w-8 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">#{position}</span>
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
    <div className="min-h-screen p-8 tv-dashboard">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="tv-title mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
          🏆 Pokal Šanka — Matija 2025 Edition🍻
        </h1>
        <div className="flex items-center justify-center gap-8 text-2xl">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            <span>{formatTime(currentTime)}</span>
          </div>
          <Badge className="text-xl px-4 py-2 bg-blue-600 hover:bg-blue-600">
            {currentMode === 'teams' ? 'Ekipe' : 
             currentMode === 'players' ? 'Igralci' : 
             currentMode === 'activity' ? 'Aktivnost' : 'Komentarji'}
          </Badge>
        </div>
      </div>

      {/* Team Rankings View */}
      {currentMode === 'teams' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="tv-subtitle mb-4 flex items-center justify-center gap-4 tv-animation-fade-in">
              <Users className="h-12 w-12 text-blue-400 tv-glow-effect" />
              LESTVICA EKIP
            </h2>
          </div>
          
          <div className="grid gap-6 max-w-6xl mx-auto">
            {teams.slice(0, 5).map((team, index) => (
              <Card key={team.id} className="tv-card p-8 tv-animation-slide-in">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-16 h-16">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <TeamLogo team={team} size="lg" />
                  
                  <div className="flex-1">
                    <h3 className="text-4xl font-bold text-white mb-2">{team.name}</h3>
                    <div className="flex items-center gap-6 text-xl text-gray-300">
                      <span>{team.memberCount} članov</span>
                      <span>•</span>
                      <span>{team.totalDrinks} pijač</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="tv-score text-yellow-400">
                      {team.totalScore}
                    </div>
                    <div className="text-lg text-gray-300">točk</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Top Players View */}
      {currentMode === 'players' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="tv-subtitle mb-4 flex items-center justify-center gap-4 tv-animation-fade-in">
              <Trophy className="h-12 w-12 text-yellow-400 trophy-glow tv-glow-effect" />
              NAJBOLJŠI IGRALCI
            </h2>
          </div>
          
          <div className="grid gap-6 max-w-6xl mx-auto">
            {topPlayers.map((player, index) => (
              <Card key={player.id} className="tv-card p-8 tv-animation-slide-in">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-16 h-16">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <UserAvatar user={player} size="lg" className="border-4 border-white" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-4xl font-bold text-white">{player.name}</h3>
                      {player.team && (
                        <div className="flex items-center gap-2">
                          <TeamLogo team={player.team} size="md" />
                          <Badge className="text-lg px-3 py-1" style={{ backgroundColor: player.team.color }}>
                            {player.team.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-xl text-gray-300">
                      <span>{player.drinkLogs.length} pijač</span>
                      <span>•</span>
                      <span>{player.drinkLogs.filter((d: any) => d.drinkType === 'REGULAR').length} 🍺</span>
                      <span>{player.drinkLogs.filter((d: any) => d.drinkType === 'SHOT').length} 🥃</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="tv-score text-green-400">
                      {player.drinkLogs.reduce((sum: number, log: any) => sum + log.points, 0)}
                    </div>
                    <div className="text-lg text-gray-300">točk</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity View */}
      {currentMode === 'activity' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="tv-subtitle mb-4 flex items-center justify-center gap-4 tv-animation-fade-in">
              <Activity className="h-12 w-12 text-green-400 tv-glow-effect" />
              ZADNJA AKTIVNOST
            </h2>
          </div>
          
          <div className="grid gap-4 max-w-6xl mx-auto">
            {recentActivity.slice(0, 8).map((activity) => (
              <Card key={activity.id} className="tv-card p-6 tv-animation-slide-in">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {getDrinkEmoji(activity.drinkType)}
                  </div>
                  
                  <UserAvatar user={activity.user} size="md" className="border-2 border-white" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-bold text-white">{activity.user.name}</span>
                      {activity.user.team && (
                        <TeamLogo team={activity.user.team} size="sm" />
                      )}
                      <Badge 
                        className={`text-lg px-3 py-1 ${
                          activity.drinkType === 'SHOT' ? 'bg-red-600 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-600'
                        }`}
                      >
                        {activity.drinkType === 'SHOT' ? 'Žganje' : 'Pivo'}
                      </Badge>
                    </div>
                    <div className="text-lg text-gray-400">
                      pred {formatDistanceToNow(new Date(activity.createdAt)).replace('about ', '').replace('minutes', 'min').replace('minute', 'min').replace('hours', 'h').replace('hour', 'h')}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400 tv-animation-fade-in">
                      +{activity.points}
                    </div>
                    <div className="text-sm text-gray-300">točk</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Commentary View */}
      {currentMode === 'commentary' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="tv-subtitle mb-4 flex items-center justify-center gap-4 tv-animation-fade-in">
              <Trophy className="h-12 w-12 text-purple-400 tv-glow-effect" />
              KOMENTARJI & DOSEŽKI
            </h2>
          </div>
          
          <div className="grid gap-6 max-w-6xl mx-auto">
            {commentaries.length === 0 ? (
              <Card className="tv-card p-8 tv-animation-slide-in">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-3xl font-bold text-white mb-2">Pripravljena scena!</h3>
                  <p className="text-xl text-gray-300">Komentarji se bodo prikazali, ko začnete piti...</p>
                </div>
              </Card>
            ) : (
              commentaries.slice(0, 6).map((commentary) => (
                <Card key={commentary.id} className="tv-card p-8 tv-animation-slide-in">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">
                      {commentary.type === 'milestone' ? '🏆' :
                       commentary.type === 'streak' ? '🔥' :
                       commentary.type === 'achievement' ? '🎊' :
                       commentary.type === 'team_event' ? '🚀' : '🎉'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge 
                          className={`text-lg px-3 py-1 ${
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
                        <div className="text-lg text-gray-400">
                          pred {formatDistanceToNow(new Date(commentary.createdAt)).replace('about ', '').replace('minutes', 'min').replace('minute', 'min').replace('hours', 'h').replace('hour', 'h')}
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-1">{commentary.message}</h3>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-4xl font-bold tv-animation-fade-in ${
                        commentary.priority >= 4 ? 'text-red-400' :
                        commentary.priority >= 3 ? 'text-orange-400' :
                        commentary.priority >= 2 ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {'★'.repeat(commentary.priority)}
                      </div>
                      <div className="text-sm text-gray-300">prioriteta</div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator with countdown */}
      <div className="fixed bottom-4 right-4 text-sm text-gray-400 bg-slate-800/80 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-white">{countdown}s</div>
          <div>
            Naslednji: <span className="font-semibold text-white">
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