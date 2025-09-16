'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, TrendingUp, Award, Clock } from 'lucide-react'
import { formatDistanceToNow, format, startOfDay, isToday, isYesterday } from 'date-fns'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface UserHistoryProps {
  user: UserWithTeamAndDrinks
  limit?: number
}

export default function UserHistory({ user, limit = 20 }: UserHistoryProps) {
  const drinkHistory = user.drinkLogs
    .slice(0, limit)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getDrinkEmoji = (drinkType: string) => {
    return drinkType === 'REGULAR' ? '🍺' : '🥃'
  }

  const getDrinkLabel = (drinkType: string) => {
    return drinkType === 'REGULAR' ? 'Regular' : 'Shot'
  }

  const formatDateGroup = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMMM dd, yyyy')
  }

  const groupDrinksByDate = () => {
    const grouped: { [key: string]: typeof drinkHistory } = {}
    
    drinkHistory.forEach(drink => {
      const dateKey = format(startOfDay(new Date(drink.createdAt)), 'yyyy-MM-dd')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(drink)
    })

    return Object.entries(grouped).map(([dateKey, drinks]) => ({
      date: new Date(dateKey),
      drinks: drinks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })).sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const dailyStats = groupDrinksByDate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Drink History
          <Badge variant="outline" className="ml-auto">
            {drinkHistory.length} total drinks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {drinkHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No drink history yet</p>
            <p className="text-sm">Start logging drinks to see your history!</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {dailyStats.map((dayGroup) => (
              <div key={dayGroup.date.toISOString()}>
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card pb-2 border-b">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {formatDateGroup(dayGroup.date)}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {dayGroup.drinks.length} drinks
                  </Badge>
                  <div className="text-xs text-gray-500 ml-auto">
                    +{dayGroup.drinks.reduce((sum, drink) => sum + drink.points, 0)} points
                  </div>
                </div>
                
                <div className="space-y-2 pl-2">
                  {dayGroup.drinks.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100">
                      <div className="text-lg">
                        {getDrinkEmoji(log.drinkType)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`text-xs achievement-badge ${
                              log.drinkType === 'SHOT' ? 'drink-shot' : 'drink-regular'
                            }`}
                          >
                            {getDrinkLabel(log.drinkType)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(log.createdAt), 'HH:mm')}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(log.createdAt))} ago</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600 score-highlight px-2 py-1 rounded">
                          +{log.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {user.drinkLogs.length > limit && (
              <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
                Showing {limit} of {user.drinkLogs.length} total drinks
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}