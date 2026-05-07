'use client'

import { useActionState } from 'react'
import { submitHypeVoteAction } from '@/app/the-bachelor/actions'
import { initialBachelorActionState } from '@/lib/types/action-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface HypeVoteFormProps {
  onClose: () => void
}

export function HypeVoteForm({ onClose }: HypeVoteFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitHypeVoteAction,
    initialBachelorActionState,
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      formRef.current?.reset()
      onClose()
    } else if (state.message && state.type === 'error') {
      toast.error(state.message)
    }
  }, [state, onClose])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <Input
        name="voterName"
        placeholder="Your name (optional)"
        className="h-10 text-sm"
      />
      <Input
        name="suggestion"
        placeholder="What should BWSK do? (optional)"
        className="h-10 text-sm"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isPending}
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
