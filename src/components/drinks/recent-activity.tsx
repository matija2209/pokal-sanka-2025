'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Activity, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { DrinkLogWithUser } from '@/lib/prisma/types'

interface RecentActivityProps {
  recentDrinks: DrinkLogWithUser[]
  limit?: number
}

export default function RecentActivity({ recentDrinks, limit = 10 }: RecentActivityProps) {
  const displayDrinks = recentDrinks.slice(0, limit)

  const getDrinkEmoji = (drinkType: string) => {
    return drinkType === 'REGULAR' ? '🍺' : '🥃'
  }

  const getDrinkLabel = (drinkType: string) => {
    return drinkType === 'REGULAR' ? 'Regular' : 'Shot'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayDrinks.length === 0 ? (
          <div className="text-center py-8 ">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No recent activity</p>
            <p className="text-sm">Start logging drinks to see activity here!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displayDrinks.map((log) => (
              <div key={log.id} className="flex items-center gap-3 card-mobile  rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {log.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.user.name}</span>
                    <span className="text-lg">{getDrinkEmoji(log.drinkType)}</span>
                    <Badge 
                      className={`text-xs achievement-badge ${
                        log.drinkType === 'SHOT' ? 'drink-shot' : 'drink-regular'
                      }`}
                    >
                      {getDrinkLabel(log.drinkType)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm ">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(log.createdAt))} ago</span>
                    <span>•</span>
                    <span>+{log.points} points</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 score-highlight px-2 py-1 rounded">
                    +{log.points}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {displayDrinks.length > 0 && recentDrinks.length > limit && (
          <div className="mt-4 pt-4 border-t text-center text-sm ">
            Showing {displayDrinks.length} of {recentDrinks.length} recent activities
          </div>
        )}
      </CardContent>
    </Card>
  )
}