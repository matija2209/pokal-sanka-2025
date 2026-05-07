import { Card, CardContent } from '@/components/ui/card'
import { Eye, MessageCircle, Trophy, Flame } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalSightings: number
    totalMessages: number
    totalChallenges: number
    totalPoints: number
    countriesCount: number
  }
  hypeVotes: number
}

export function StatsCards({ stats, hypeVotes }: StatsCardsProps) {
  const items = [
    { label: 'Sightings', value: stats.totalSightings, icon: Eye },
    { label: 'Hype Votes', value: hypeVotes, icon: Flame },
    { label: 'Total Points', value: stats.totalPoints, icon: Trophy },
    { label: 'Messages', value: stats.totalMessages, icon: MessageCircle },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="bg-muted/30 border-muted overflow-hidden">
            <CardContent className="p-3 sm:p-4 text-center">
              {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 sm:mb-2 text-primary" />}
              <div className="text-xl sm:text-3xl font-bold font-lucky leading-none">
                {item.value}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider">{item.label}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
