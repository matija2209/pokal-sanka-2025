'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitHypeVoteAction } from '@/app/the-bachelor/actions'
import { initialBachelorActionState } from '@/lib/types/action-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import type { HypeEvent } from '@prisma/client'

interface HypeVoteFormProps {
  events: HypeEvent[]
  onClose: () => void
}

export function HypeVoteForm({ events, onClose }: HypeVoteFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitHypeVoteAction,
    initialBachelorActionState,
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? '')

  useEffect(() => {
    setSelectedEventId(events[0]?.id ?? '')
  }, [events])

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      formRef.current?.reset()
      onClose()
    } else if (state.message && state.type === 'error') {
      toast.error(state.message)
    }
  }, [state, onClose])

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
        No locked hype events are waiting for votes right now.
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="hypeEventId" value={selectedEventId} />

      <Select value={selectedEventId} onValueChange={setSelectedEventId}>
        <SelectTrigger className="h-10 w-full text-sm">
          <SelectValue placeholder="Choose a hype event" />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.title} ({event.voteCount}/{event.voteThreshold})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        name="voterName"
        placeholder="Your name (optional)"
        className="h-10 text-sm"
      />
      <Input
        name="suggestion"
        placeholder="Optional note for this hype event"
        className="h-10 text-sm"
      />

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isPending || !selectedEventId}
          className="flex-1"
          size="sm"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          {isPending ? 'Submitting...' : 'Submit vote'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
