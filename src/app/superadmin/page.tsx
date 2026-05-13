import Link from 'next/link'
import { getActiveEvent } from '@/lib/events'
import { updateActiveEventName } from './actions'

import { ResetDatabaseForm } from '@/components/superadmin/reset-db-form'

type SuperAdminPageProps = {
  searchParams?: Promise<{
    event?: string
    reset?: string
  }>
}

export default async function SuperAdminPage({ searchParams }: SuperAdminPageProps) {
  const params = searchParams ? await searchParams : undefined
  const activeEvent = await getActiveEvent()
  const eventStatus = params?.event
  const resetStatus = params?.reset

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Super Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/superadmin/trivia"
          className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Trivia Manager</h2>
          <p className="text-muted-foreground font-medium">Manage quiz categories, questions, results, and player powers.</p>
        </Link>

        <Link
          href="/superadmin/bachelor"
          className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Bachelor Admin</h2>
          <p className="text-muted-foreground font-medium">Approve sightings and manage hype events for the bachelor party.</p>
        </Link>

        <Link
          href="/superadmin/events"
          className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Event Management</h2>
          <p className="text-muted-foreground font-medium">Create, edit, and delete events. Configure event landing pages.</p>
        </Link>

        <Link
          href="/superadmin/users"
          className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">User Management</h2>
          <p className="text-muted-foreground font-medium">Manage admin roles for authenticated users. Promote or demote users.</p>
        </Link>

        <Link
          href="/superadmin/players"
          className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">People & Players</h2>
          <p className="text-muted-foreground font-medium">Manage event rosters, shared identities, teams, invites, and QR codes.</p>
        </Link>

        <Link
          href="/the-bachelor/timeline"
          className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Bachelor Timeline</h2>
          <p className="text-muted-foreground font-medium">View the public timeline and delete posts as superadmin.</p>
        </Link>
      </div>

      <div className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">Active Event</h2>
        <p className="text-foreground text-base mb-6 bg-muted inline-block px-4 py-2 rounded-lg border border-border font-medium">
          Current event: <span className="font-black">{activeEvent?.name ?? 'No active event'}</span>
        </p>

        {eventStatus === 'updated' && (
          <p className="text-foreground font-bold bg-accent/20 border-2 border-accent/50 rounded-xl px-4 py-3 mb-6">
            Event name updated successfully.
          </p>
        )}
        {eventStatus === 'missing-name' && (
          <p className="text-foreground font-bold bg-muted border-2 border-border rounded-xl px-4 py-3 mb-6">
            Event name is required.
          </p>
        )}
        {eventStatus === 'no-active-event' && (
          <p className="text-foreground font-bold bg-muted border-2 border-border rounded-xl px-4 py-3 mb-6">
            No active event found.
          </p>
        )}
        {eventStatus === 'error' && (
          <p className="text-destructive font-bold bg-destructive/10 border-2 border-destructive/40 rounded-xl px-4 py-3 mb-6">
            Failed to update event name.
          </p>
        )}

        <form action={updateActiveEventName} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-md">
            <label htmlFor="eventName" className="block text-base font-bold text-foreground mb-2">
              Event name
            </label>
            <input
              id="eventName"
              name="eventName"
              defaultValue={activeEvent?.name ?? ''}
              className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-base font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="Enter event name"
              required
              maxLength={120}
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 font-bold py-4 px-6 rounded-xl transition-colors min-h-[56px] shadow-sm"
          >
            Save Event Name
          </button>
        </form>
      </div>

      <div className="rounded-xl border-2 border-destructive/30 bg-destructive/10 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-destructive mb-4 flex items-center gap-2">
          <span aria-hidden>⚠️</span> Danger Zone
        </h2>
        <p className="text-foreground font-bold text-base mb-6">
          This permanently deletes teams, users, feed posts, drink logs, commentary, trivia, and bachelor data for
          the <span className="underline">{activeEvent?.name ?? 'current'}</span> event only. Other events and event
          settings are not removed.
        </p>

        {resetStatus === 'success' && (
          <p className="text-foreground font-bold bg-accent/20 border-2 border-accent/50 rounded-xl px-4 py-3 mb-6">
            Event data reset completed.
          </p>
        )}
        {resetStatus === 'schema-required' && (
          <p className="text-foreground font-bold bg-muted border-2 border-border rounded-xl px-4 py-3 mb-6">
            Event-scoped reset needs the multi-event database schema (eventId columns). Use a full migration or
            contact support.
          </p>
        )}
        {resetStatus === 'no-event' && (
          <p className="text-foreground font-bold bg-muted border-2 border-border rounded-xl px-4 py-3 mb-6">
            No event found to reset. Create or select an active event first.
          </p>
        )}

        <ResetDatabaseForm eventName={activeEvent?.name ?? 'Unknown event'} />
      </div>
    </div>
  )
}
