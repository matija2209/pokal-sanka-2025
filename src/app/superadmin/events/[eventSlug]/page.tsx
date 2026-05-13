import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventLandingPageForm } from '@/components/admin/event-landing-page-form'
import { upsertEventLandingPageAction } from '@/lib/actions/event-actions'
import { updateEventAction, deleteEventAction } from '../../actions'
import { DeleteEventButton } from './delete-button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ eventSlug: string }>
}

export default async function SuperadminEventDetailPage({ params }: Props) {
  const { eventSlug } = await params

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      landingPage: true,
      _count: { select: { users: true, teams: true } },
    },
  })

  if (!event) notFound()

  const landingPage = event.landingPage
    ? {
        title: event.landingPage.title,
        description: event.landingPage.description,
        galleryImages: event.landingPage.galleryImages as string[],
        ctaText: event.landingPage.ctaText,
      }
    : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/superadmin/events">&larr; Back to Events</Link>
        </Button>
      </div>

      {/* Event Info + Edit Form */}
      <Card className="border-primary/20 mb-8">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Edit event properties. These changes affect all event-scoped data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateEventAction} className="space-y-4">
            <input type="hidden" name="eventId" value={event.id} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required minLength={2} defaultValue={event.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  required
                  pattern="[a-z0-9-]+"
                  defaultValue={event.slug}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="hidden" name="isActive" value={event.isActive ? 'true' : 'false'} id="isActiveHidden" />
              <Switch
                id="isActiveSwitch"
                defaultChecked={event.isActive}
                onCheckedChange={(checked) => {
                  const el = document.getElementById('isActiveHidden') as HTMLInputElement
                  if (el) el.value = String(checked)
                }}
              />
              <Label htmlFor="isActiveSwitch">Event is active</Label>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/event/${event.slug}`} target="_blank">View Landing Page</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="border-muted mb-8">
        <CardHeader>
          <CardTitle>Event Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{event._count.users}</p>
              <p className="text-sm text-muted-foreground">Players</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{event._count.teams}</p>
              <p className="text-sm text-muted-foreground">Teams</p>
            </div>
            <div className="text-center">
              <Badge variant={event.isActive ? 'default' : 'secondary'} className="text-sm">
                {event.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-xs">{event.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landing Page */}
      <div className="mb-8">
        <EventLandingPageForm
          event={event}
          landingPage={landingPage}
          action={upsertEventLandingPageAction}
          backUrl={`/superadmin/events/${event.slug}`}
        />
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this event will remove all associated data including its landing page.
            {event._count.users > 0 && (
              <span className="block mt-1 font-semibold text-destructive">
                Warning: This event has {event._count.users} player{event._count.users !== 1 ? 's' : ''}{' '}
                and {event._count.teams} team{event._count.teams !== 1 ? 's' : ''}.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={deleteEventAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <DeleteEventButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
