'use client'

import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { upsertEventLandingPageAction } from './actions'

interface Props {
  event: { id: string; slug: string; name: string }
  landingPage: {
    title: string
    description: string
    galleryImages: string[]
    ctaText: string
  } | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </Button>
  )
}

export function EventLandingPageForm({ event, landingPage }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Landing Page for {event.name}</CardTitle>
          <CardDescription>
            Configure what visitors see at{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/event/{event.slug}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertEventLandingPageAction} className="space-y-4">
            <input type="hidden" name="eventId" value={event.id} />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Welcome to My Event"
                required
                defaultValue={landingPage?.title ?? ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your event..."
                rows={4}
                defaultValue={landingPage?.description ?? ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="galleryImages">Gallery Images</Label>
              <Textarea
                id="galleryImages"
                name="galleryImages"
                placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                rows={4}
                defaultValue={landingPage?.galleryImages?.join('\n') ?? ''}
              />
              <p className="text-xs text-muted-foreground">One image URL per line.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaText">CTA Button Text</Label>
              <Input
                id="ctaText"
                name="ctaText"
                placeholder="Enter"
                defaultValue={landingPage?.ctaText ?? 'Enter'}
              />
            </div>

            <div className="flex gap-3">
              <SubmitButton />
              <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
                Back to Events
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(`/event/${event.slug}`, '_blank')}
              >
                Preview
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
