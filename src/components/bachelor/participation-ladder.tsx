import { Card, CardContent } from '@/components/ui/card'
import { ACTION_POINTS, ACTION_FRIENDSHIP } from '@/lib/utils/bachelor-points'
import type { ActionType } from '@/lib/utils/bachelor-points'
import { Eye, MessageCircle, Hand, Camera, Star } from 'lucide-react'

const LEVELS: { type: ActionType; icon: typeof Eye; description: string }[] = [
  {
    type: 'spot',
    icon: Eye,
    description: 'Take a public photo and log the sighting from a respectful distance.',
  },
  {
    type: 'message',
    icon: MessageCircle,
    description: 'Add your name, country, or leave marriage advice for the groom.',
  },
  {
    type: 'say_hi',
    icon: Hand,
    description: 'Approach him and tell him "I tracked the groom."',
  },
  {
    type: 'photo_together',
    icon: Camera,
    description: 'Take a proper photo together with BWSK.',
  },
  {
    type: 'challenge',
    icon: Star,
    description: 'Complete a mini challenge together and become legendary.',
  },
]

export function ParticipationLadder() {
  return (
    <div className="space-y-3">
      {LEVELS.map((level, index) => {
        const Icon = level.icon
        const points = ACTION_POINTS[level.type]
        const friendship = ACTION_FRIENDSHIP[level.type]

        return (
          <Card
            key={level.type}
            className="bg-muted/20 border-muted hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                      LVL {index + 1}
                    </span>
                    <span className="font-bold text-sm sm:text-base">{friendship}</span>
                  </div>
                  <span className="text-xs text-primary font-black">
                    +{points} PTS
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                  {level.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
