import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { getActiveEvent, getAllEvents } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import PlayerManagementDirectory from '@/components/superadmin/player-management-directory'

type SuperadminPlayersPageProps = {
  searchParams?: Promise<{
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
  'promoted': 'Person promoted to account successfully.',
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

export const dynamic = 'force-dynamic'

export default async function SuperadminPlayersPage({ searchParams }: SuperadminPlayersPageProps) {
  const params = searchParams ? await searchParams : undefined
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '') ?? ''
  const manageStatus = params?.manage
  const manageError = params?.manageError
  const requestedManageEventId = params?.manageEventId?.trim() || ''
  const multiEventEnabled = await isMultiEventSchemaAvailable()
  const activeEvent = await getActiveEvent()
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
  const teamPlayerCounts = new Map<string, number>()

  for (const person of playersInManagedEvent) {
    const teamId = person.activePlayer?.teamId
    if (teamId) {
      teamPlayerCounts.set(teamId, (teamPlayerCounts.get(teamId) ?? 0) + 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 md:p-8">
      <Link href="/superadmin" className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-primary mb-3 py-2">
        <ArrowLeft className="h-5 w-5" />
        Back to Superadmin
      </Link>

      <div className="bg-card text-card-foreground border-2 border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">People & Players</h1>
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
            <PlayerManagementDirectory
              appUrl={appUrl}
              events={events.map((event) => ({
                id: event.id,
                name: event.name,
              }))}
              managedEventId={managedEventId}
              managedEventName={managedEvent?.name ?? 'Selected Event'}
              playersInManagedEvent={playersInManagedEvent.map((person) => ({
                personId: person.id,
                personName: person.name,
                totalPlayers: person.totalPlayers,
                invitePath: person.invitePath,
                activePlayer: {
                  id: person.activePlayer!.id,
                  name: person.activePlayer?.name ?? person.name,
                  teamId: person.activePlayer?.teamId ?? null,
                  teamName: person.activePlayer?.team?.name ?? null,
                },
                otherEventRecords: person.users
                  .map((user) => ({
                    id: user.id,
                    name: user.name,
                    eventId: user.eventId,
                    eventName: user.event?.name ?? 'Unknown event',
                  }))
                  .filter((user) => user.eventId !== managedEventId),
              }))}
              personsNotInManagedEvent={personsNotInManagedEvent.map((person) => ({
                personId: person.id,
                personName: person.name,
                totalPlayers: person.totalPlayers,
                existingEventRecords: person.users.map((user) => ({
                  id: user.id,
                  name: user.name,
                  eventId: user.eventId,
                  eventName: user.event?.name ?? 'Unknown event',
                })),
              }))}
              teams={teams.map((team) => ({
                id: team.id,
                name: team.name,
                playerCount: teamPlayerCounts.get(team.id) ?? 0,
              }))}
            />
          </>
        )}
      </div>
    </div>
  )
}
