import Link from 'next/link'
import { prisma } from '@/lib/prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CreateEventForm } from '@/components/admin/create-event-form'
import { createEventAction } from '@/lib/actions/event-actions'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    updated?: string
    deleted?: string
    error?: string
    slug?: string
  }>
}

export default async function SuperadminEventsPage({ searchParams }: Props) {
  const events = await prisma.event.findMany({
    include: {
      landingPage: true,
      _count: { select: { users: true, teams: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const params = await searchParams

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Event Management</h1>
        <p className="text-muted-foreground mt-1">Full CRUD over all events. Superadmin only.</p>
      </div>

      {params.updated && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          Event <strong>{params.updated}</strong> updated successfully.
        </div>
      )}

      {params.deleted && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          Event <strong>{params.deleted}</strong> deleted.
        </div>
      )}

      {params.error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {params.error === 'invalid-fields' && 'Event ID and name are required.'}
          {params.error === 'invalid-slug' && 'Invalid slug format.'}
          {params.error === 'slug-exists' && (
            <>Slug <strong>{params.slug}</strong> is already in use.</>
          )}
          {params.error === 'event-not-found' && 'Event not found.'}
          {params.error === 'missing-event' && 'No event specified for deletion.'}
        </div>
      )}

      <div className="space-y-3 mb-8">
        {events.map((event) => (
          <Card key={event.id} className="hover:border-primary/20 transition-colors">
            <CardContent className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{event.name}</span>
                  <Badge variant={event.isActive ? 'default' : 'secondary'}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{event.slug}</code>
                  {' '}&middot;{' '}
                  {event.landingPage ? 'Landing page configured' : 'No landing page'}
                  {' '}&middot;{' '}
                  {event._count.users} player{event._count.users !== 1 ? 's' : ''}
                  {' '}&middot;{' '}
                  {event._count.teams} team{event._count.teams !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/superadmin/events/${event.slug}`}>Edit</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/${event.slug}`}>Landing Page</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/event/${event.slug}`} target="_blank">View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card className="border-dashed mb-8">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No events yet.</p>
          </CardContent>
        </Card>
      )}

      <CreateEventForm action={createEventAction} />
    </div>
  )
}
