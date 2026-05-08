'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { switchActiveEventAction } from '@/app/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Event } from '@/lib/prisma/types'

interface EventSwitcherProps {
  events: Event[]
  currentEventId: string
  className?: string
}

export default function EventSwitcher({ events, currentEventId, className }: EventSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      defaultValue={currentEventId}
      disabled={isPending}
      onValueChange={(eventId) => {
        startTransition(async () => {
          const result = await switchActiveEventAction(eventId)
          if (result.success) {
            router.push(result.data?.redirectUrl ?? '/')
          }
        })
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select event" />
      </SelectTrigger>
      <SelectContent>
        {events.map(event => (
          <SelectItem key={event.id} value={event.id}>
            {event.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
