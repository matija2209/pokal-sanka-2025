'use client'

import { ArrowRight, Dice5, Loader2, PartyPopper, Sparkles, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isBachelorEvent } from '@/lib/events-shared'
import type { Event } from '@/lib/prisma/types'

const CARD_GRADIENTS = [
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-blue-600 via-indigo-600 to-violet-600',
  'from-rose-500 via-pink-500 to-fuchsia-600',
]

interface EventCardGridProps {
  events: Event[]
  playerCounts: Record<string, number>
  onSelect: (event: Event) => void
  pendingEventId?: string | null
  disabled?: boolean
}

export default function EventCardGrid({
  events,
  playerCounts,
  onSelect,
  pendingEventId,
  disabled,
}: EventCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {events.map((event, index) => {
        const isPendingCard = pendingEventId === event.id
        const bachelor = isBachelorEvent(event)
        const Icon = bachelor ? PartyPopper : Trophy
        const playerCount = playerCounts[event.id] ?? 0

        return (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event)}
            disabled={disabled}
            aria-busy={isPendingCard}
            className={cn(
              'group relative w-full overflow-hidden rounded-3xl border border-white/10 p-6 text-left shadow-lg transition-all',
              'hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] cursor-pointer',
              'disabled:opacity-60 disabled:pointer-events-none',
              'bg-gradient-to-br',
              CARD_GRADIENTS[index % CARD_GRADIENTS.length]
            )}
          >
            <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-white/10" />

            <div className="relative z-10 flex flex-col gap-4 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold tracking-tight">{event.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                  <Users className="h-3.5 w-3.5" />
                  {playerCount > 0
                    ? `${playerCount} ${playerCount === 1 ? 'igralec' : 'igralcev'}`
                    : 'Bodi prvi igralec'}
                </p>
              </div>

              {(event.isRandomTeams || event.isTriviaEnabled) && (
                <div className="flex flex-wrap gap-1.5">
                  {event.isRandomTeams && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                      <Dice5 className="h-3 w-3" />
                      Naključne ekipe
                    </span>
                  )}
                  {event.isTriviaEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                      Trivia
                    </span>
                  )}
                </div>
              )}

              <span className="inline-flex items-center gap-1 text-sm font-bold">
                {isPendingCard ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Vstopam...
                  </>
                ) : (
                  <>
                    Vstopi
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
