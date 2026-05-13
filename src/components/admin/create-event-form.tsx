'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  action: (formData: FormData) => void
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Event'}
    </Button>
  )
}

export function CreateEventForm({ action }: Props) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Create a new event and configure its landing page afterwards.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input id="name" name="name" placeholder="My Event" required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="my-event"
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate from name. Used in the URL: /event/<strong>my-event</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
