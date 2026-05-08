import Link from 'next/link'
import { prisma } from '@/lib/prisma/client'
import { getActiveEvent, getAllEvents } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import {
  createTeamAction,
  createPersonAction,
  createPlayerForPersonAction,
  deleteTeamAction,
  deletePersonAction,
  deletePlayerAction,
  updateTeamAction,
  updateActiveEventName,
  updatePersonAction,
  updatePlayerAction,
} from './actions'

import { ResetDatabaseForm } from '@/components/superadmin/reset-db-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type SuperAdminPageProps = {
  searchParams?: Promise<{
    event?: string
    reset?: string
    manage?: string
    manageError?: string
    manageEventId?: string
  }>
}

const manageStatusLabels: Record<string, string> = {
  'team-created': 'Team created for the selected event.',
  'team-updated': 'Team updated successfully.',
  'team-deleted': 'Team deleted from the selected event.',
  'person-created': 'Person created successfully.',
  'person-updated': 'Person updated successfully.',
  'person-deleted': 'Person deleted successfully.',
  'player-created': 'Player created for the selected event.',
  'player-updated': 'Player updated successfully.',
  'player-deleted': 'Player deleted from the selected event.',
}

const manageErrorLabels: Record<string, string> = {
  'schema-required': 'Team, person, and player management requires the multi-event schema.',
  'invalid-team-name': 'Team name must be at least 2 characters long.',
  'missing-team': 'Team record was not found for the selected event.',
  'team-has-players': 'Delete or move players from that team first. Teams with linked players are protected.',
  'invalid-person-name': 'Person name must be at least 2 characters long.',
  'invalid-player-name': 'Player name must be at least 2 characters long.',
  'missing-person': 'Person record was not found.',
  'missing-player': 'Player record was not found for the selected event.',
  'person-has-players': 'Delete that person\'s player records first. Persons with linked players are protected.',
  'player-already-exists': 'That person already has a player in the selected event.',
  'invalid-team': 'Selected team does not belong to the selected event.',
  'no-active-event': 'No active event found.',
  'create-person-failed': 'Failed to create person.',
  'update-person-failed': 'Failed to update person.',
  'delete-person-failed': 'Failed to delete person.',
  'create-player-failed': 'Failed to create player.',
  'update-player-failed': 'Failed to update player.',
  'delete-player-failed': 'Failed to delete player.',
  'create-team-failed': 'Failed to create team.',
  'update-team-failed': 'Failed to update team.',
  'delete-team-failed': 'Failed to delete team.',
}

export default async function SuperAdminPage({ searchParams }: SuperAdminPageProps) {
  const params = searchParams ? await searchParams : undefined
  const activeEvent = await getActiveEvent()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '') ?? ''
  const eventStatus = params?.event
  const resetStatus = params?.reset
  const manageStatus = params?.manage
  const manageError = params?.manageError
  const requestedManageEventId = params?.manageEventId?.trim() || ''
  const multiEventEnabled = await isMultiEventSchemaAvailable()
  const events = multiEventEnabled ? await getAllEvents() : []
  const managedEvent =
    (requestedManageEventId ? events.find((event) => event.id === requestedManageEventId) : null) ?? activeEvent
  const managedEventId = managedEvent?.id ?? ''

  const [teams, persons] = multiEventEnabled && managedEvent
    ? await Promise.all([
        prisma.team.findMany({
          where: { eventId: managedEvent.id },
          orderBy: { name: 'asc' },
        }),
        prisma.person.findMany({
          include: {
            users: {
              include: {
                team: true,
                event: true,
              },
              orderBy: [
                { createdAt: 'asc' },
                { name: 'asc' },
              ],
            },
          },
          orderBy: { name: 'asc' },
        }),
      ])
    : [[], []]

  const activeEventRoster = persons
    .map((person) => ({
      ...person,
      activePlayer: managedEvent ? person.users.find((user) => user.eventId === managedEvent.id) ?? null : null,
      totalPlayers: person.users.length,
      invitePath: managedEvent ? `/invite/${managedEvent.slug}/${person.id}` : '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  const playersInManagedEvent = activeEventRoster.filter((person) => person.activePlayer)
  const personsNotInManagedEvent = activeEventRoster.filter((person) => !person.activePlayer)

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

      <div className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-xl font-bold text-foreground">People & Players</h2>
          <p className="text-muted-foreground">
            A person is the shared identity across events. A player is that person&apos;s participant record inside the selected event.
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

        {!multiEventEnabled && (
          <p className="text-foreground font-bold bg-muted border-2 border-border rounded-xl px-4 py-3">
            Team, person, and player management is disabled until the multi-event schema is available.
          </p>
        )}

        {multiEventEnabled && (
          <>
            <div className="mb-6 rounded-xl border border-border bg-background/60 p-4">
              <form method="get" className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="w-full md:max-w-sm">
                  <label htmlFor="manageEventId" className="block text-sm font-bold text-foreground mb-2">
                    Manage players for event
                  </label>
                  <select
                    id="manageEventId"
                    name="manageEventId"
                    defaultValue={managedEventId}
                    className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Switch Event
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <form action={createTeamAction} className="border border-border rounded-xl p-5 bg-background/60">
                <input type="hidden" name="manageEventId" value={managedEventId} />
                <h3 className="text-lg font-bold text-foreground mb-2">Create Team</h3>
                <p className="text-sm text-muted-foreground mb-4">Creates a new team inside <span className="font-semibold text-foreground">{managedEvent?.name ?? 'the selected event'}</span>.</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="newTeamName" className="block text-sm font-bold text-foreground mb-2">
                      Team name
                    </label>
                    <input
                      id="newTeamName"
                      name="name"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Enter team name"
                      className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    Create Team
                  </button>
                </div>
              </form>

              <form action={createPersonAction} className="border border-border rounded-xl p-5 bg-background/60">
                <input type="hidden" name="manageEventId" value={managedEventId} />
                <h3 className="text-lg font-bold text-foreground mb-2">Create Person</h3>
                <p className="text-sm text-muted-foreground mb-4">Creates the cross-event identity. You can add the active-event player record after that.</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="newPersonName" className="block text-sm font-bold text-foreground mb-2">
                      Person name
                    </label>
                    <input
                      id="newPersonName"
                      name="name"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Enter person name"
                      className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    Create Person
                  </button>
                </div>
              </form>

              <div className="border border-border rounded-xl p-5 bg-background/60 xl:col-span-2">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Current Event Snapshot</h3>
                    <p className="text-sm text-muted-foreground">Use this panel to create or edit players for <span className="font-semibold text-foreground">{managedEvent?.name ?? 'the selected event'}</span>.</p>
                  </div>
                  {managedEventId && playersInManagedEvent.length > 0 && (
                    <a
                      href={`/superadmin/qr/${managedEventId}`}
                      download
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Download all QR codes (ZIP)
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-2xl font-black text-foreground">{teams.length}</div>
                    <div className="text-sm text-muted-foreground">Teams in event</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-2xl font-black text-foreground">{activeEventRoster.length}</div>
                    <div className="text-sm text-muted-foreground">People total</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-2xl font-black text-foreground">
                      {activeEventRoster.filter((person) => person.activePlayer).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Players in event</div>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="players" className="mb-2">
              <TabsList className="mb-4">
                <TabsTrigger value="players">Players in Event ({playersInManagedEvent.length})</TabsTrigger>
                <TabsTrigger value="add">Add to Event ({personsNotInManagedEvent.length})</TabsTrigger>
                <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="players" className="space-y-4">
                {playersInManagedEvent.length === 0 && (
                  <p className="text-muted-foreground rounded-xl border border-dashed border-border p-6 text-center">
                    No players in this event yet.
                  </p>
                )}

                {playersInManagedEvent.map((person) => (
                  <div key={person.id} className="rounded-xl border border-border bg-background/60 p-5">
                    <div className="flex flex-col gap-2 mb-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Person ID: <span className="font-mono">{person.id}</span>
                        </p>
                        {person.invitePath && (
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>
                              Invite path: <span className="font-mono text-foreground">{person.invitePath}</span>
                            </p>
                            {appUrl && (
                              <p className="break-all">
                                Invite URL: <span className="font-mono text-foreground">{`${appUrl}${person.invitePath}`}</span>
                              </p>
                            )}
                            {managedEventId && (
                              <p>
                                <a
                                  href={`/superadmin/qr/${managedEventId}/${person.id}`}
                                  download
                                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-accent/20 transition-colors"
                                >
                                  Download QR
                                </a>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-bold">
                        <span className="rounded-full border border-border bg-card px-3 py-1 text-foreground">
                          {person.totalPlayers} total player{person.totalPlayers === 1 ? '' : 's'}
                        </span>
                        <span className="rounded-full border border-accent/50 bg-accent/20 px-3 py-1 text-foreground">
                          In selected event
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.4fr] gap-5">
                      <div className="rounded-xl border border-border bg-card p-4">
                        <h4 className="text-sm font-bold text-foreground mb-3">Person</h4>
                        <form action={updatePersonAction} className="space-y-3">
                          <input type="hidden" name="manageEventId" value={managedEventId} />
                          <input type="hidden" name="personId" value={person.id} />
                          <div>
                            <label htmlFor={`person-name-${person.id}`} className="block text-sm font-medium text-foreground mb-2">
                              Shared identity name
                            </label>
                            <input
                              id={`person-name-${person.id}`}
                              name="name"
                              defaultValue={person.name}
                              required
                              minLength={2}
                              maxLength={120}
                              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="submit"
                              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                              Save Person
                            </button>
                          </div>
                        </form>

                        <form action={deletePersonAction} className="mt-3">
                          <input type="hidden" name="manageEventId" value={managedEventId} />
                          <input type="hidden" name="personId" value={person.id} />
                          <button
                            type="submit"
                            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/15 transition-colors"
                          >
                            Delete Person
                          </button>
                        </form>
                      </div>

                      <div className="rounded-xl border border-border bg-card p-4">
                        <h4 className="text-sm font-bold text-foreground mb-3">Player in {managedEvent?.name ?? 'Selected Event'}</h4>

                        <form action={updatePlayerAction} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <input type="hidden" name="manageEventId" value={managedEventId} />
                          <input type="hidden" name="playerId" value={person.activePlayer?.id ?? ''} />
                          <div className="md:col-span-1">
                            <label htmlFor={`player-name-${person.id}`} className="block text-sm font-medium text-foreground mb-2">
                              Player name
                            </label>
                            <input
                              id={`player-name-${person.id}`}
                              name="name"
                              defaultValue={person.activePlayer?.name ?? person.name}
                              required
                              minLength={2}
                              maxLength={120}
                              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label htmlFor={`player-team-${person.id}`} className="block text-sm font-medium text-foreground mb-2">
                              Team
                            </label>
                            <select
                              id={`player-team-${person.id}`}
                              name="teamId"
                              defaultValue={person.activePlayer?.teamId ?? ''}
                              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                            >
                              <option value="">No team</option>
                              {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="submit"
                            className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            Save Player
                          </button>
                        </form>

                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>Player ID: <span className="font-mono text-foreground">{person.activePlayer?.id}</span></span>
                          <span>Team: <span className="font-semibold text-foreground">{person.activePlayer?.team?.name ?? 'No team'}</span></span>
                        </div>

                        {person.activePlayer && (
                          <form action={deletePlayerAction} className="mt-4">
                            <input type="hidden" name="manageEventId" value={managedEventId} />
                            <input type="hidden" name="playerId" value={person.activePlayer.id} />
                            <button
                              type="submit"
                              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/15 transition-colors"
                            >
                              Delete Player From Event
                            </button>
                          </form>
                        )}

                        {person.users.length > 0 && (
                          <div className="mt-4 rounded-xl border border-border bg-background p-3">
                            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                              Other Event Records
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {person.users.map((user) => (
                                <div key={user.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                  <span className="text-foreground">{user.name}</span>
                                  <span>
                                    {user.event?.name ?? 'Unknown event'}
                                    {user.eventId === managedEvent?.id ? ' - selected event' : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="add" className="space-y-4">
                {personsNotInManagedEvent.length === 0 && (
                  <p className="text-muted-foreground rounded-xl border border-dashed border-border p-6 text-center">
                    Everyone is already added to this event.
                  </p>
                )}

                {personsNotInManagedEvent.map((person) => (
                  <div key={person.id} className="rounded-xl border border-border bg-background/60 p-5">
                    <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Person ID: <span className="font-mono">{person.id}</span>
                        </p>
                      </div>
                      <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                        Not in selected event
                      </span>
                    </div>

                    <form action={createPlayerForPersonAction} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <input type="hidden" name="manageEventId" value={managedEventId} />
                      <input type="hidden" name="personId" value={person.id} />
                      <div>
                        <label htmlFor={`new-player-name-${person.id}`} className="block text-sm font-medium text-foreground mb-2">
                          Player name for this event
                        </label>
                        <input
                          id={`new-player-name-${person.id}`}
                          name="playerName"
                          defaultValue={person.name}
                          maxLength={120}
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Add Player
                      </button>
                    </form>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="teams">
                <div className="rounded-xl border border-border bg-background/60 p-5">
                  <h3 className="text-lg font-bold text-foreground mb-2">Teams in {managedEvent?.name ?? 'Selected Event'}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Update names or delete teams that have no linked players.</p>
                  {teams.length === 0 ? (
                    <p className="text-muted-foreground rounded-xl border border-dashed border-border p-4 text-center">
                      No teams found for this event.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {teams.map((team) => (
                        <div key={team.id} className="rounded-xl border border-border bg-card p-4">
                          <form action={updateTeamAction} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                            <input type="hidden" name="manageEventId" value={managedEventId} />
                            <input type="hidden" name="teamId" value={team.id} />
                            <div>
                              <label htmlFor={`team-name-${team.id}`} className="block text-sm font-medium text-foreground mb-2">
                                Team name
                              </label>
                              <input
                                id={`team-name-${team.id}`}
                                name="name"
                                defaultValue={team.name}
                                required
                                minLength={2}
                                maxLength={120}
                                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                              />
                              <p className="mt-2 text-xs text-muted-foreground">
                                Team ID: <span className="font-mono text-foreground">{team.id}</span>
                              </p>
                            </div>
                            <button
                              type="submit"
                              className="rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                              Save Team
                            </button>
                          </form>

                          <form action={deleteTeamAction} className="mt-3">
                            <input type="hidden" name="manageEventId" value={managedEventId} />
                            <input type="hidden" name="teamId" value={team.id} />
                            <button
                              type="submit"
                              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/15 transition-colors"
                            >
                              Delete Team
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
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
