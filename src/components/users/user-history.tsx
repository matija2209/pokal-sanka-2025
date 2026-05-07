'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, TrendingUp, Award, Clock } from 'lucide-react'
import { formatDistanceToNow, format, startOfDay, isToday, isYesterday } from 'date-fns'
import { sl } from 'date-fns/locale'
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
    return drinkType === 'REGULAR' ? 'Pivo' : 'Žganje'
  }

  const formatDateGroup = (date: Date) => {
    if (isToday(date)) return 'Danes'
    if (isYesterday(date)) return 'Včeraj'
    return format(date, 'dd. MMMM yyyy', { locale: sl })
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
          Zgodovina pijač
          <Badge variant="outline" className="ml-auto">
            {drinkHistory.length} pijač skupaj
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {drinkHistory.length === 0 ? (
          <div className="text-center py-8 ">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Še ni zgodovine pijač</p>
            <p className="text-sm">Začnite beležiti pijače, da vidite svojo zgodovino!</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {dailyStats.map((dayGroup) => (
              <div key={dayGroup.date.toISOString()}>
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card pb-2 border-b">
                  <h3 className="text-sm font-semibold ">
                    {formatDateGroup(dayGroup.date)}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {dayGroup.drinks.length} pijač
                  </Badge>
                  <div className="text-xs  ml-auto">
                    +{dayGroup.drinks.reduce((sum, drink) => sum + drink.points, 0)} točk
                  </div>
                </div>
                
                <div className="space-y-2 pl-2">
                  {dayGroup.drinks.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 rounded border border-border/60 p-2">
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
                        
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(log.createdAt), 'HH:mm')}</span>
                          <span>•</span>
                          <span>pred {formatDistanceToNow(new Date(log.createdAt), { locale: sl })}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="score-highlight rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                          +{log.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {user.drinkLogs.length > limit && (
              <div className="mt-4 pt-4 border-t text-center text-sm ">
                Prikazano {limit} od {user.drinkLogs.length} pijač skupaj
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
