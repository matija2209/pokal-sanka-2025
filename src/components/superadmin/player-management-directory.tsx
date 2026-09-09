'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Download, Plus, Search, UserPlus, Users } from 'lucide-react'
import {
  bulkCreatePlayersForPersonsAction,
  createPersonAction,
  createPlayerForPersonAction,
  createTeamAction,
} from '@/app/superadmin/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TeamBadge } from '@/components/teams/team-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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

function CreateSection({
  managedEventId,
  managedEventName,
  personsNotInManagedEvent,
  teams,
}: {
  managedEventId: string
  managedEventName: string
  personsNotInManagedEvent: AddablePersonRow[]
  teams: TeamSummary[]
}) {
  const [addPersonId, setAddPersonId] = useState<string>(personsNotInManagedEvent[0]?.personId ?? '')
  const [addPlayerName, setAddPlayerName] = useState<string>(personsNotInManagedEvent[0]?.personName ?? '')

  useEffect(() => {
    if (personsNotInManagedEvent.length > 0 && (!addPersonId || !personsNotInManagedEvent.some((p) => p.personId === addPersonId))) {
      setAddPersonId(personsNotInManagedEvent[0].personId)
      setAddPlayerName(personsNotInManagedEvent[0].personName)
    }
  }, [personsNotInManagedEvent, addPersonId])

  const selectedAddPerson = personsNotInManagedEvent.find((p) => p.personId === addPersonId) ?? personsNotInManagedEvent[0]

  return (
    <Collapsible defaultOpen className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Create Records</h2>
          <p className="text-sm text-muted-foreground">Add new teams, people, and event players without losing directory context.</p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="grid gap-4 px-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="gap-4 py-4">
            <CardHeader>
              <CardTitle>Create Team</CardTitle>
              <CardDescription>Creates a new team inside {managedEventName}.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createTeamAction} className="flex flex-col gap-3">
                <input type="hidden" name="manageEventId" value={managedEventId} />
                <div>
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
              <CardDescription>Creates a new shared identity with optional auto-add to {managedEventName}.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createPersonAction} className="flex flex-col gap-3">
                <input type="hidden" name="manageEventId" value={managedEventId} />
                <div>
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
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    name="addToEvent"
                    defaultChecked
                    className="h-4 w-4 rounded border-input"
                  />
                  Also add as player to {managedEventName}
                </label>
                {teams.length > 0 && (
                  <div>
                    <label htmlFor="newPersonTeam" className="mb-1 block text-xs font-medium text-muted-foreground">
                      Team (if adding to event)
                    </label>
                    <select
                      id="newPersonTeam"
                      name="teamId"
                      defaultValue=""
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="">No team</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <Button type="submit">
                  <Plus data-icon="inline-start" />
                  Create Person
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-4 py-4">
            <CardHeader>
              <CardTitle>Add Player to Event</CardTitle>
              <CardDescription>Add an existing person to {managedEventName}.</CardDescription>
            </CardHeader>
            <CardContent>
              {personsNotInManagedEvent.length === 0 ? (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  All existing people are already registered in this event.
                </p>
              ) : (
                <form action={createPlayerForPersonAction} className="flex flex-col gap-3">
                  <input type="hidden" name="manageEventId" value={managedEventId} />
                  <input type="hidden" name="personId" value={selectedAddPerson?.personId ?? ''} />
                  <div>
                    <label htmlFor="quickAddPersonSelect" className="mb-2 block text-sm font-medium text-foreground">
                      Person identity ({personsNotInManagedEvent.length} available)
                    </label>
                    <select
                      id="quickAddPersonSelect"
                      value={selectedAddPerson?.personId ?? ''}
                      onChange={(e) => {
                        const id = e.target.value
                        setAddPersonId(id)
                        const p = personsNotInManagedEvent.find((item) => item.personId === id)
                        if (p) setAddPlayerName(p.personName)
                      }}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {personsNotInManagedEvent.map((p) => (
                        <option key={p.personId} value={p.personId}>
                          {p.personName} {p.totalPlayers > 0 ? `(${p.totalPlayers} other ${p.totalPlayers === 1 ? 'event' : 'events'})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quickAddPlayerName" className="mb-2 block text-sm font-medium text-foreground">
                      Player name
                    </label>
                    <Input
                      id="quickAddPlayerName"
                      name="playerName"
                      value={addPlayerName}
                      onChange={(e) => setAddPlayerName(e.target.value)}
                      required
                      maxLength={120}
                    />
                  </div>
                  {teams.length > 0 && (
                    <div>
                      <label htmlFor="quickAddTeam" className="mb-2 block text-sm font-medium text-foreground">
                        Team (optional)
                      </label>
                      <select
                        id="quickAddTeam"
                        name="teamId"
                        defaultValue=""
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="">No team</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <Button type="submit">
                    <UserPlus data-icon="inline-start" />
                    Add Player
                  </Button>
                </form>
              )}
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
  const [openPersonId, setOpenPersonId] = useState<string | null>(null)

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

  const openRow = rows.find((row) => row.personId === openPersonId) ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Players in Event</h3>
          <p className="text-sm text-muted-foreground">Browse active event records first, then view details of the player you want to edit.</p>
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
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
          {rows.length === 0 ? (
            <div>
              <p className="font-medium text-foreground">No players in this event yet.</p>
              <p className="mt-1 text-sm">Add players using the &quot;Create Records&quot; section above or the &quot;Add to Event&quot; tab.</p>
            </div>
          ) : (
            <p>No players match the current filters.</p>
          )}
        </div>
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border shrink-0">
                          {(row.activePlayer.profileImageUrl || row.personImageUrl) ? (
                            <AvatarImage src={row.activePlayer.profileImageUrl || row.personImageUrl || ''} alt={row.personName} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {row.personName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{row.personName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{row.activePlayer.name}</TableCell>
                    <TableCell>
                      <TeamBadge
                        team={row.activePlayer.teamName ? { name: row.activePlayer.teamName, color: row.activePlayer.teamColor } : null}
                        emptyLabel="No team"
                      />
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
  teams,
  rows,
}: {
  managedEventId: string
  managedEventName: string
  teams: TeamSummary[]
  rows: AddablePersonRow[]
}) {
  const [search, setSearch] = useState('')
  const [openPersonId, setOpenPersonId] = useState<string | null>(null)
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([])

  const filteredRows = useMemo(() => {
    const query = normalize(search)
    return rows.filter((row) => {
      return !query || normalize(row.personName).includes(query)
    })
  }, [rows, search])

  const openRow = rows.find((row) => row.personId === openPersonId) ?? null

  const isAllFilteredSelected =
    filteredRows.length > 0 && filteredRows.every((row) => selectedPersonIds.includes(row.personId))
  const isSomeFilteredSelected =
    filteredRows.some((row) => selectedPersonIds.includes(row.personId))

  const handleToggleAll = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredRows.map((r) => r.personId))
      setSelectedPersonIds((prev) => prev.filter((id) => !filteredIdSet.has(id)))
    } else {
      const newSet = new Set([...selectedPersonIds, ...filteredRows.map((r) => r.personId)])
      setSelectedPersonIds(Array.from(newSet))
    }
  }

  const handleToggleRow = (personId: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Add Existing People to Event</h3>
          <p className="text-sm text-muted-foreground">Reuse existing people and create their player record for {managedEventName}.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
          <Button
            type="button"
            disabled={rows.length === 0}
            onClick={() => setOpenPersonId(filteredRows[0]?.personId ?? rows[0]?.personId ?? null)}
          >
            <Plus data-icon="inline-start" />
            Add Player from List
          </Button>
        </div>
      </div>

      {selectedPersonIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border-2 border-primary/40 bg-primary/5 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="px-3 py-1 text-sm font-medium">
              {selectedPersonIds.length} {selectedPersonIds.length === 1 ? 'person' : 'people'} selected
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPersonIds([])}
            >
              Clear selection
            </Button>
          </div>
          <form action={bulkCreatePlayersForPersonsAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="manageEventId" value={managedEventId} />
            {selectedPersonIds.map((id) => (
              <input key={id} type="hidden" name="personIds" value={id} />
            ))}
            {teams.length > 0 && (
              <select
                name="teamId"
                defaultValue=""
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">No team (individual)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
            <Button type="submit">
              <UserPlus data-icon="inline-start" />
              Add {selectedPersonIds.length} Player{selectedPersonIds.length === 1 ? '' : 's'} to {managedEventName}
            </Button>
          </form>
        </div>
      )}

      {filteredRows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
          {rows.length === 0
            ? 'All existing people are already registered in this event.'
            : 'No matching people found.'}
        </p>
      ) : (
        <Card className="gap-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]">
                  <Checkbox
                    checked={isAllFilteredSelected}
                    indeterminate={isSomeFilteredSelected}
                    onCheckedChange={handleToggleAll}
                    aria-label="Select all people"
                  />
                </TableHead>
                <TableHead>Person</TableHead>
                <TableHead>Existing records</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const isOpen = row.personId === openPersonId
                const isSelected = selectedPersonIds.includes(row.personId)
                return (
                  <TableRow key={row.personId} data-state={isSelected ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleRow(row.personId)}
                        aria-label={`Select ${row.personName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border shrink-0">
                          {row.personImageUrl ? (
                            <AvatarImage src={row.personImageUrl} alt={row.personName} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {row.personName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{row.personName}</span>
                      </div>
                    </TableCell>
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
        allPersons={rows}
        teams={teams}
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
  const [openTeamId, setOpenTeamId] = useState<string | null>(null)

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
                    <TableCell className="font-medium">
                      <TeamBadge team={row} />
                    </TableCell>
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

      <CreateSection
        managedEventId={managedEventId}
        managedEventName={managedEventName}
        personsNotInManagedEvent={personsNotInManagedEvent}
        teams={teams}
      />

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
            teams={teams}
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
