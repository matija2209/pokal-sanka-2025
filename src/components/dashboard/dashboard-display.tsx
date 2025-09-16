'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Activity, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { UserWithTeamAndDrinks, DrinkLogWithUserAndTeam, TeamWithStats } from '@/lib/prisma/types'

interface DashboardDisplayProps {
  teams: TeamWithStats[]
  topPlayers: UserWithTeamAndDrinks[]
  recentActivity: DrinkLogWithUserAndTeam[]
}

type DisplayMode = 'teams' | 'players' | 'activity'

export default function DashboardDisplay({ teams, topPlayers, recentActivity }: DashboardDisplayProps) {
  const [currentMode, setCurrentMode] = useState<DisplayMode>('teams')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [countdown, setCountdown] = useState(15)

  // Auto-rotate between different views every 15 seconds
  useEffect(() => {
    const modes: DisplayMode[] = ['teams', 'players', 'activity']
    let modeIndex = 0

    const rotateMode = () => {
      modeIndex = (modeIndex + 1) % modes.length
      setCurrentMode(modes[modeIndex])
      setCountdown(15) // Reset countdown
    }

    const interval = setInterval(rotateMode, 15000) // 15 seconds
    return () => clearInterval(interval)
  }, [])

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
          🏆 TURNIR ŠANKA 🍻
        </h1>
        <div className="flex items-center justify-center gap-8 text-2xl">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            <span>{formatTime(currentTime)}</span>
          </div>
          <Badge className="text-xl px-4 py-2 bg-blue-600 hover:bg-blue-600">
            {currentMode === 'teams' ? 'Ekipe' : currentMode === 'players' ? 'Igralci' : 'Aktivnost'}
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
                  
                  <div 
                    className="w-12 h-12 rounded-full tv-team-indicator"
                    style={{ backgroundColor: team.color }}
                  />
                  
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
                  
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center border-4 border-white">
                    <span className="text-2xl font-bold text-white">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-4xl font-bold text-white">{player.name}</h3>
                      {player.team && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full tv-team-indicator"
                            style={{ backgroundColor: player.team.color }}
                          />
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
                  
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-lg font-bold text-white">
                      {activity.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-bold text-white">{activity.user.name}</span>
                      {activity.user.team && (
                        <div 
                          className="w-6 h-6 rounded-full tv-team-indicator"
                          style={{ backgroundColor: activity.user.team.color }}
                        />
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

      {/* Auto-refresh indicator with countdown */}
      <div className="fixed bottom-4 right-4 text-sm text-gray-400 bg-slate-800/80 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-white">{countdown}s</div>
          <div>
            Naslednji: <span className="font-semibold text-white">{currentMode === 'teams' ? 'Igralci' : currentMode === 'players' ? 'Aktivnost' : 'Ekipe'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}