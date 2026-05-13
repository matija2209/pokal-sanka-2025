'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

function DeleteSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? 'Deleting...' : 'Delete Event'}
    </Button>
  )
}

export function DeleteEventButton() {
  return (
    <div className="flex items-center gap-3">
      <DeleteSubmitButton />
      <p className="text-xs text-muted-foreground">
        This action cannot be undone. All data scoped to this event will be lost.
      </p>
    </div>
  )
}
