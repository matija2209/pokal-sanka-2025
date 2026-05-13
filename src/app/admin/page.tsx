import Link from 'next/link'
import { prisma } from '@/lib/prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CreateEventForm } from './create-event-form'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ created?: string; updated?: string; error?: string; slug?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const events = await prisma.event.findMany({
    include: { landingPage: true },
    orderBy: { createdAt: 'desc' },
  })

  const params = await searchParams

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground mt-1">Manage events and their landing pages.</p>
      </div>

      {params.created && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          Event <strong>{params.created}</strong> created successfully.{' '}
          <Link href={`/admin/${params.created}`} className="underline font-medium">
            Configure landing page
          </Link>
        </div>
      )}

      {params.updated && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          Landing page for <strong>{params.updated}</strong> saved successfully.
        </div>
      )}

      {params.error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {params.error === 'invalid-name' && 'Event name must be at least 2 characters.'}
          {params.error === 'invalid-slug' && 'Invalid slug. Use lowercase letters, numbers, and hyphens.'}
          {params.error === 'slug-exists' && (
            <>
              Slug <strong>{params.slug}</strong> is already in use. Choose a different slug.
            </>
          )}
          {params.error === 'missing-fields' && 'Event ID and title are required.'}
          {params.error === 'event-not-found' && 'Event not found.'}
        </div>
      )}

      {events.length > 0 && (
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
                    Slug: <code className="text-xs bg-muted px-1 py-0.5 rounded">{event.slug}</code>
                    {' '}&middot;{' '}
                    {event.landingPage ? 'Landing page configured' : 'No landing page'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/${event.slug}`}>
                      {event.landingPage ? 'Edit' : 'Configure'}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/event/${event.slug}`} target="_blank">
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {events.length === 0 && (
        <Card className="border-dashed mb-8">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No events yet. Create your first event below.</p>
          </CardContent>
        </Card>
      )}

      <CreateEventForm />
    </div>
  )
}
