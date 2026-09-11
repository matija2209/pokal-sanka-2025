export const instant = false
import { connection } from 'next/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { sl } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import { getActiveEvent, getAllEvents } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import { getRecentCommentaries } from '@/lib/prisma/fetchers/commentary-fetchers'
import { deleteCommentaryAction } from '../actions'
import { Container } from '@/components/layout/container'

type SuperadminHighlightsPageProps = {
  searchParams?: Promise<{
    manage?: string
    manageError?: string
    manageEventId?: string
  }>
}

const manageStatusLabels: Record<string, string> = {
  'commentary-deleted': 'Highlight deleted successfully.',
}

const manageErrorLabels: Record<string, string> = {
  'schema-required': 'Feed highlight management requires the multi-event schema.',
  'missing-commentary': 'Highlight record was not found for the selected event.',
  'delete-commentary-failed': 'Failed to delete highlight.',
}

export default async function SuperadminHighlightsPage({ searchParams }: SuperadminHighlightsPageProps) {
  await connection()

  const params = searchParams ? await searchParams : undefined
  const manageStatus = params?.manage
  const manageError = params?.manageError
  const requestedManageEventId = params?.manageEventId?.trim() || ''

  const multiEventEnabled = await isMultiEventSchemaAvailable()
  const activeEvent = await getActiveEvent()
  const events = multiEventEnabled ? await getAllEvents() : []
  const managedEvent =
    (requestedManageEventId ? events.find((event) => event.id === requestedManageEventId) : null) ?? activeEvent
  const managedEventId = managedEvent?.id ?? ''

  const highlights = managedEvent ? await getRecentCommentaries(150, managedEvent.id) : []

  return (
    <Container size="lg" className="py-6 md:py-8">
      <Link href="/superadmin" className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-primary mb-3 py-2">
        <ArrowLeft className="h-5 w-5" />
        Back to Superadmin
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manage Feed Highlights</h1>
        <p className="text-muted-foreground mt-2">
          Delete auto-generated streak/highlight entries for {managedEvent?.name ?? 'the selected event'}.
        </p>
      </div>

      {manageStatus && manageStatusLabels[manageStatus] && (
        <p className="text-foreground font-bold bg-accent/20 border-2 border-accent/50 rounded-xl px-4 py-3 mb-6">
          {manageStatusLabels[manageStatus]}
        </p>
      )}

      {manageError && manageErrorLabels[manageError] && (
        <p className="text-destructive font-bold bg-destructive/10 border-2 border-destructive/40 rounded-xl px-4 py-3 mb-6">
          {manageErrorLabels[manageError]}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card">
        {highlights.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No highlights found.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {highlights.map((highlight) => (
              <article key={highlight.id} className="p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-foreground uppercase text-xs">{highlight.type}</span>
                      <span className="text-xs text-muted-foreground">Priority {highlight.priority}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(highlight.createdAt), 'PPp', { locale: sl })}
                      </span>
                    </div>

                    <p className="text-foreground break-words">{highlight.message}</p>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">Highlight ID: {highlight.id}</span>
                    </div>
                  </div>

                  <form action={deleteCommentaryAction}>
                    <input type="hidden" name="commentaryId" value={highlight.id} />
                    <input type="hidden" name="manageEventId" value={managedEventId} />
                    <button
                      type="submit"
                      className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/15 transition-colors"
                    >
                      Delete Highlight
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
