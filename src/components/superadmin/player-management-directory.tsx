'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Download, Plus, Search, Users } from 'lucide-react'
import {
  createPersonAction,
  createTeamAction,
} from '@/app/superadmin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AddPersonToEventSheet,
  PlayerDetailSheet,
  TeamDetailSheet,
} from '@/components/superadmin/player-management-sheets'
import type {
  AddablePersonRow,
  EventOption,
  PlayerRow,
  TeamSummary,
} from '@/components/superadmin/player-management-types'

type PlayerManagementDirectoryProps = {
  appUrl: string
  events: EventOption[]
  managedEventId: string
  managedEventName: string
  playersInManagedEvent: PlayerRow[]
  personsNotInManagedEvent: AddablePersonRow[]
  teams: TeamSummary[]
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function ActionLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Button asChild size="sm" variant="outline">
      <Link href={href}>{children}</Link>
    </Button>
  )
}

function EventSwitcher({
  events,
  managedEventId,
}: {
  events: EventOption[]
  managedEventId: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Scope</CardTitle>
        <CardDescription>Switch the event before creating, editing, or exporting player records.</CardDescription>
      </CardHeader>
      <CardContent>
        <form method="get" className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 md:max-w-sm">
            <label htmlFor="manageEventId" className="mb-2 block text-sm font-medium text-foreground">
              Manage players for event
            </label>
            <select
              id="manageEventId"
              name="manageEventId"
              defaultValue={managedEventId}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Switch Event</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function CreateSection({ managedEventId, managedEventName }: { managedEventId: string; managedEventName: string }) {
  return (
    <Collapsible defaultOpen className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Create Records</h2>
          <p className="text-sm text-muted-foreground">Add new teams and people without losing the directory context.</p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="grid gap-4 px-6 pb-6 lg:grid-cols-2">
          <Card className="gap-4 py-4">
            <CardHeader>
              <CardTitle>Create Team</CardTitle>
              <CardDescription>Creates a new team inside {managedEventName}.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createTeamAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="manageEventId" value={managedEventId} />
                <div className="flex-1">
                  <label htmlFor="newTeamName" className="mb-2 block text-sm font-medium text-foreground">
                    Team name
                  </label>
                  <Input
                    id="newTeamName"
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder="Enter team name"
                  />
                </div>
                <Button type="submit">
                  <Plus data-icon="inline-start" />
                  Create Team
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-4 py-4">
            <CardHeader>
              <CardTitle>Create Person</CardTitle>
              <CardDescription>Creates the shared identity first. Event-specific player records can be added later.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createPersonAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="manageEventId" value={managedEventId} />
                <div className="flex-1">
                  <label htmlFor="newPersonName" className="mb-2 block text-sm font-medium text-foreground">
                    Person name
                  </label>
                  <Input
                    id="newPersonName"
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder="Enter person name"
                  />
                </div>
                <Button type="submit">
                  <Plus data-icon="inline-start" />
                  Create Person
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function SnapshotCards({
  managedEventId,
  teams,
  totalPeople,
  playersInManagedEvent,
}: {
  managedEventId: string
  teams: TeamSummary[]
  totalPeople: number
  playersInManagedEvent: number
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="gap-2 py-4">
        <CardHeader>
          <CardDescription>Teams in event</CardDescription>
          <CardTitle className="text-3xl">{teams.length}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="gap-2 py-4">
        <CardHeader>
          <CardDescription>People total</CardDescription>
          <CardTitle className="text-3xl">{totalPeople}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="gap-2 py-4">
        <CardHeader>
          <CardDescription>Players in event</CardDescription>
          <CardTitle className="text-3xl">{playersInManagedEvent}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="gap-2 py-4">
        <CardHeader>
          <CardDescription>Bulk QR export</CardDescription>
          <div className="pt-1">
            {playersInManagedEvent > 0 ? (
              <Button asChild className="w-full">
                <a href={`/superadmin/qr/${managedEventId}`} download>
                  <Download data-icon="inline-start" />
                  Download ZIP
                </a>
              </Button>
            ) : (
              <Badge variant="outline">No players yet</Badge>
            )}
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

function PlayersTab({
  managedEventId,
  managedEventName,
  teams,
  appUrl,
  rows,
}: {
  managedEventId: string
  managedEventName: string
  teams: TeamSummary[]
  appUrl: string
  rows: PlayerRow[]
}) {
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [openPersonId, setOpenPersonId] = useState<string | null>(rows[0]?.personId ?? null)

  const filteredRows = useMemo(() => {
    const query = normalize(search)
    return rows.filter((row) => {
      const matchesQuery =
        !query ||
        normalize(row.personName).includes(query) ||
        normalize(row.activePlayer.name).includes(query) ||
        normalize(row.activePlayer.teamName ?? '').includes(query)
      const matchesTeam =
        teamFilter === 'all' ||
        (teamFilter === 'none' ? !row.activePlayer.teamId : row.activePlayer.teamId === teamFilter)
      return matchesQuery && matchesTeam
    })
  }, [rows, search, teamFilter])

  const openRow = filteredRows.find((row) => row.personId === openPersonId) ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Players in Event</h3>
          <p className="text-sm text-muted-foreground">Browse active event records first, then expand only the person you want to edit.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-64">
            <label htmlFor="player-search" className="mb-2 block text-sm font-medium text-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="player-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Person, player, or team"
                className="pl-9"
              />
            </div>
          </div>
          <div className="min-w-48">
            <label htmlFor="player-team-filter" className="mb-2 block text-sm font-medium text-foreground">
              Team filter
            </label>
            <select
              id="player-team-filter"
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="all">All teams</option>
              <option value="none">No team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
          No players match the current filters.
        </p>
      ) : (
        <Card className="gap-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Event records</TableHead>
                <TableHead>Invite</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const isOpen = row.personId === openPersonId
                return (
                  <TableRow key={row.personId}>
                    <TableCell className="font-medium">{row.personName}</TableCell>
                    <TableCell>{row.activePlayer.name}</TableCell>
                    <TableCell>
                      <Badge variant={row.activePlayer.teamName ? 'secondary' : 'outline'}>
                        {row.activePlayer.teamName ?? 'No team'}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.totalPlayers}</TableCell>
                    <TableCell>{row.invitePath ? <Badge variant="outline">Ready</Badge> : <Badge variant="outline">Unavailable</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenPersonId(isOpen ? null : row.personId)}
                        >
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                          {isOpen ? 'Hide' : 'Details'}
                        </Button>
                        <ActionLink href={`/superadmin/promote/${row.personId}`}>Promote</ActionLink>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <PlayerDetailSheet
        appUrl={appUrl}
        managedEventId={managedEventId}
        managedEventName={managedEventName}
        open={Boolean(openRow)}
        onOpenChange={(open) => !open && setOpenPersonId(null)}
        row={openRow}
        teams={teams}
      />
    </div>
  )
}

function AddToEventTab({
  managedEventId,
  managedEventName,
  rows,
}: {
  managedEventId: string
  managedEventName: string
  rows: AddablePersonRow[]
}) {
  const [search, setSearch] = useState('')
  const [openPersonId, setOpenPersonId] = useState<string | null>(rows[0]?.personId ?? null)

  const filteredRows = useMemo(() => {
    const query = normalize(search)
    return rows.filter((row) => {
      return !query || normalize(row.personName).includes(query)
    })
  }, [rows, search])

  const openRow = filteredRows.find((row) => row.personId === openPersonId) ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Add Existing People to Event</h3>
          <p className="text-sm text-muted-foreground">Reuse existing people and create only the missing player record for {managedEventName}.</p>
        </div>
        <div className="min-w-64">
          <label htmlFor="missing-player-search" className="mb-2 block text-sm font-medium text-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="missing-player-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Person name"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
          Everyone is already added to this event.
        </p>
      ) : (
        <Card className="gap-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Existing records</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const isOpen = row.personId === openPersonId
                return (
                  <TableRow key={row.personId}>
                    <TableCell className="font-medium">{row.personName}</TableCell>
                    <TableCell>{row.totalPlayers}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Not in selected event</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenPersonId(isOpen ? null : row.personId)}
                        >
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                          {isOpen ? 'Hide' : 'Add Player'}
                        </Button>
                        <ActionLink href={`/superadmin/promote/${row.personId}`}>Promote</ActionLink>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AddPersonToEventSheet
        managedEventId={managedEventId}
        managedEventName={managedEventName}
        open={Boolean(openRow)}
        onOpenChange={(open) => !open && setOpenPersonId(null)}
        row={openRow}
      />
    </div>
  )
}

function TeamsTab({
  managedEventId,
  managedEventName,
  rows,
}: {
  managedEventId: string
  managedEventName: string
  rows: TeamSummary[]
}) {
  const [search, setSearch] = useState('')
  const [openTeamId, setOpenTeamId] = useState<string | null>(rows[0]?.id ?? null)

  const filteredRows = useMemo(() => {
    const query = normalize(search)
    return rows.filter((row) => !query || normalize(row.name).includes(query))
  }, [rows, search])

  const openRow = filteredRows.find((row) => row.id === openTeamId) ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Teams</h3>
          <p className="text-sm text-muted-foreground">Rename or remove event teams from a compact registry.</p>
        </div>
        <div className="min-w-64">
          <label htmlFor="team-search" className="mb-2 block text-sm font-medium text-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="team-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Team name"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
          No teams found for this event.
        </p>
      ) : (
        <Card className="gap-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Players in event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const isOpen = row.id === openTeamId
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.playerCount}</TableCell>
                    <TableCell>
                      <Badge variant={row.playerCount > 0 ? 'secondary' : 'outline'}>
                        {row.playerCount > 0 ? 'In use' : 'Empty'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenTeamId(isOpen ? null : row.id)}
                      >
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                        {isOpen ? 'Hide' : 'Manage'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <TeamDetailSheet
        managedEventId={managedEventId}
        managedEventName={managedEventName}
        open={Boolean(openRow)}
        onOpenChange={(open) => !open && setOpenTeamId(null)}
        row={openRow}
      />
    </div>
  )
}

export default function PlayerManagementDirectory({
  appUrl,
  events,
  managedEventId,
  managedEventName,
  playersInManagedEvent,
  personsNotInManagedEvent,
  teams,
}: PlayerManagementDirectoryProps) {
  return (
    <div className="space-y-6">
      <EventSwitcher events={events} managedEventId={managedEventId} />

      <SnapshotCards
        managedEventId={managedEventId}
        teams={teams}
        totalPeople={playersInManagedEvent.length + personsNotInManagedEvent.length}
        playersInManagedEvent={playersInManagedEvent.length}
      />

      <CreateSection managedEventId={managedEventId} managedEventName={managedEventName} />

      <Tabs defaultValue="players" className="space-y-4">
        <TabsList>
          <TabsTrigger value="players">
            <Users data-icon="inline-start" />
            Players in Event ({playersInManagedEvent.length})
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus data-icon="inline-start" />
            Add to Event ({personsNotInManagedEvent.length})
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users data-icon="inline-start" />
            Teams ({teams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          <PlayersTab
            managedEventId={managedEventId}
            managedEventName={managedEventName}
            teams={teams}
            appUrl={appUrl}
            rows={playersInManagedEvent}
          />
        </TabsContent>

        <TabsContent value="add">
          <AddToEventTab
            managedEventId={managedEventId}
            managedEventName={managedEventName}
            rows={personsNotInManagedEvent}
          />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsTab
            managedEventId={managedEventId}
            managedEventName={managedEventName}
            rows={teams}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
