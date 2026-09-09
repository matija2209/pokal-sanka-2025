'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { switchActiveEventAction } from '@/app/actions'
import { isBachelorEvent } from '@/lib/events-shared'
import EventCardGrid from '@/components/events/event-card-grid'
import EntryScreen from '@/components/entry/entry-screen'
import type { ExistingPlayerOption } from '@/components/users/select-existing-user-form'
import type { Event } from '@/lib/prisma/types'

interface HomeEntryFlowProps {
  events: Event[]
  activeEvent: Event
  playerCounts: Record<string, number>
  landingPageEventIds: string[]
  existingPlayers: ExistingPlayerOption[]
  knownPersonName: string | null
}

type Phase = 'choose' | 'entry'

export default function HomeEntryFlow({
  events,
  activeEvent,
  playerCounts,
  landingPageEventIds,
  existingPlayers,
  knownPersonName,
}: HomeEntryFlowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [phase, setPhase] = useState<Phase>('choose')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    if (phase === 'choose' && selectedEventId && activeEvent.id === selectedEventId) {
      setPhase('entry')
    }
  }, [activeEvent.id, selectedEventId, phase])

  const handleSelect = (event: Event) => {
    setSelectedEventId(event.id)

    if (isBachelorEvent(event)) {
      startTransition(async () => {
        await switchActiveEventAction(event.id)
        router.push('/bwsk/enter')
      })
      return
    }

    if (landingPageEventIds.includes(event.id)) {
      startTransition(async () => {
        await switchActiveEventAction(event.id)
        router.push(`/event/${event.slug}`)
      })
      return
    }

    if (event.id === activeEvent.id) {
      setPhase('entry')
      return
    }

    startTransition(async () => {
      await switchActiveEventAction(event.id)
      router.refresh()
    })
  }

  const handleBack = () => {
    setPhase('choose')
    setSelectedEventId(null)
  }

  if (phase === 'entry') {
    return (
      <div className="w-full space-y-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Izberi drug dogodek
        </button>

        <div>
          <h2 className="text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {activeEvent.name}
          </h2>
        </div>

        <EntryScreen
          knownPersonName={knownPersonName}
          activeEventName={activeEvent.name}
          existingPlayers={existingPlayers}
        />
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          Izberi dogodek
        </h2>
        <p className="text-sm text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          Izberi turnir, kateremu se želiš pridružiti
        </p>
      </div>

      <EventCardGrid
        events={events}
        playerCounts={playerCounts}
        onSelect={handleSelect}
        pendingEventId={isPending ? selectedEventId : null}
        disabled={isPending}
      />
    </div>
  )
}
