'use client'

import { useEffect, useState } from 'react'
import { Download, UserCog } from 'lucide-react'
import {
  createPlayerForPersonAction,
  deletePersonAction,
  deletePlayerAction,
  deleteTeamAction,
  updatePersonAction,
  updatePlayerAction,
  updateTeamAction,
} from '@/app/superadmin/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { AddablePersonRow, PlayerRow, TeamSummary } from './player-management-types'

type PlayerDetailSheetProps = {
  appUrl: string
  managedEventId: string
  managedEventName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  row: PlayerRow | null
  teams: TeamSummary[]
}

export function PlayerDetailSheet({
  appUrl,
  managedEventId,
  managedEventName,
  open,
  onOpenChange,
  row,
  teams,
}: PlayerDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        {row && (
          <div className="flex flex-col gap-6">
            <SheetHeader className="gap-2">
              <SheetTitle>{row.personName}</SheetTitle>
              <SheetDescription>
                Person ID: <span className="font-mono text-foreground">{row.personId}</span>
              </SheetDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">{row.totalPlayers} total player{row.totalPlayers === 1 ? '' : 's'}</Badge>
                <Badge>In selected event</Badge>
                {managedEventId && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`/superadmin/qr/${managedEventId}/${row.personId}`} download>
                      <Download data-icon="inline-start" />
                      Download QR
                    </a>
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="grid gap-6">
              <Card className="gap-4 py-4">
                <CardHeader>
                  <CardTitle>Person</CardTitle>
                  <CardDescription>Shared identity across all events.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <form action={updatePersonAction} encType="multipart/form-data" className="flex flex-col gap-4">
                    <input type="hidden" name="manageEventId" value={managedEventId} />
                    <input type="hidden" name="personId" value={row.personId} />

                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border shrink-0">
                        {row.personImageUrl ? (
                          <AvatarImage src={row.personImageUrl} alt={row.personName} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="text-base font-semibold">
                          {row.personName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <label htmlFor={`person-image-${row.personId}`} className="block text-sm font-medium text-foreground">
                          Shared Identity Photo
                        </label>
                        <Input
                          id={`person-image-${row.personId}`}
                          name="personImage"
                          type="file"
                          accept="image/*"
                          className="text-xs file:text-xs"
                        />
                        {row.personImageUrl && (
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                            <input type="checkbox" name="removeImage" value="true" className="rounded border-input" />
                            <span>Remove person photo</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`person-name-${row.personId}`} className="mb-2 block text-sm font-medium text-foreground">
                        Shared identity name
                      </label>
                      <Input
                        id={`person-name-${row.personId}`}
                        name="name"
                        defaultValue={row.personName}
                        required
                        minLength={2}
                        maxLength={120}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" variant="secondary">Save Person</Button>
                      <Button type="submit" formAction={deletePersonAction} variant="destructive">
                        Delete Person
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="gap-4 py-4">
                <CardHeader>
                  <CardTitle>Player in {managedEventName}</CardTitle>
                  <CardDescription>Edit the event-specific participant record.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <form action={updatePlayerAction} encType="multipart/form-data" className="flex flex-col gap-4">
                    <input type="hidden" name="manageEventId" value={managedEventId} />
                    <input type="hidden" name="playerId" value={row.activePlayer.id} />

                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border shrink-0">
                        {(row.activePlayer.profileImageUrl || row.personImageUrl) ? (
                          <AvatarImage
                            src={row.activePlayer.profileImageUrl || row.personImageUrl || ''}
                            alt={row.activePlayer.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="text-base font-semibold">
                          {row.activePlayer.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <label htmlFor={`player-image-${row.activePlayer.id}`} className="block text-sm font-medium text-foreground">
                          Event Avatar <span className="text-xs text-muted-foreground font-normal">(overrides Person photo for this event)</span>
                        </label>
                        <Input
                          id={`player-image-${row.activePlayer.id}`}
                          name="playerImage"
                          type="file"
                          accept="image/*"
                          className="text-xs file:text-xs"
                        />
                        {row.activePlayer.profileImageUrl && (
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                            <input type="checkbox" name="removeImage" value="true" className="rounded border-input" />
                            <span>Remove event avatar (reverts to Person photo)</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 md:items-end">
                      <div>
                        <label htmlFor={`player-name-${row.personId}`} className="mb-2 block text-sm font-medium text-foreground">
                          Player name (in event)
                        </label>
                        <Input
                          id={`player-name-${row.personId}`}
                          name="name"
                          defaultValue={row.activePlayer.name}
                          required
                          minLength={2}
                          maxLength={120}
                        />
                      </div>
                      <div>
                        <label htmlFor={`player-team-${row.personId}`} className="mb-2 block text-sm font-medium text-foreground">
                          Team
                        </label>
                        <select
                          id={`player-team-${row.personId}`}
                          name="teamId"
                          defaultValue={row.activePlayer.teamId ?? ''}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          <option value="">No team</option>
                          {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Save Player</Button>
                    </div>
                  </form>

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground border-t pt-3">
                    <span>
                      Player ID: <span className="font-mono text-foreground">{row.activePlayer.id}</span>
                    </span>
                    <span>
                      Team: <span className="font-medium text-foreground">{row.activePlayer.teamName ?? 'No team'}</span>
                    </span>
                  </div>

                  <form action={deletePlayerAction}>
                    <input type="hidden" name="manageEventId" value={managedEventId} />
                    <input type="hidden" name="playerId" value={row.activePlayer.id} />
                    <Button type="submit" variant="destructive">
                      Delete Player From Event
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="gap-4 py-4">
                <CardHeader>
                  <CardTitle>Invite</CardTitle>
                  <CardDescription>QR and direct invite links for this person in the selected event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border bg-background p-3 text-sm">
                    <div className="text-muted-foreground">Invite path</div>
                    <div className="break-all font-mono text-foreground">{row.invitePath || 'Unavailable'}</div>
                  </div>
                  {appUrl ? (
                    <div className="rounded-lg border bg-background p-3 text-sm">
                      <div className="text-muted-foreground">Invite URL</div>
                      <div className="break-all font-mono text-foreground">{`${appUrl}${row.invitePath}`}</div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="gap-4 py-4">
                <CardHeader>
                  <CardTitle>Other Event Records</CardTitle>
                  <CardDescription>Cross-event player records tied to the same person.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {row.otherEventRecords.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                        No other event records linked to this person.
                      </p>
                    ) : (
                      row.otherEventRecords.map((record) => (
                        <div key={record.id} className="flex flex-col gap-1 rounded-lg border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium text-foreground">{record.name}</span>
                          <span className="text-muted-foreground">{record.eventName}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

type AddPersonToEventSheetProps = {
  managedEventId: string
  managedEventName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AddablePersonRow | null
  allPersons?: AddablePersonRow[]
  teams?: TeamSummary[]
}

export function AddPersonToEventSheet({
  managedEventId,
  managedEventName,
  open,
  onOpenChange,
  row,
  allPersons = [],
  teams = [],
}: AddPersonToEventSheetProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(row?.personId ?? '')
  const [playerName, setPlayerName] = useState<string>(row?.personName ?? '')

  useEffect(() => {
    if (row) {
      setSelectedPersonId(row.personId)
      setPlayerName(row.personName)
    } else if (allPersons.length > 0 && (!selectedPersonId || !allPersons.some((p) => p.personId === selectedPersonId))) {
      setSelectedPersonId(allPersons[0].personId)
      setPlayerName(allPersons[0].personName)
    }
  }, [row, allPersons, selectedPersonId])

  const effectivePersons = allPersons.length > 0 ? allPersons : (row ? [row] : [])
  const activePerson = effectivePersons.find((p) => p.personId === selectedPersonId) ?? row ?? effectivePersons[0] ?? null

  const handlePersonSelectChange = (newPersonId: string) => {
    setSelectedPersonId(newPersonId)
    const person = effectivePersons.find((p) => p.personId === newPersonId)
    if (person) {
      setPlayerName(person.personName)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        {activePerson ? (
          <div className="flex flex-col gap-6">
            <SheetHeader className="gap-2">
              <SheetTitle>Add Player to {managedEventName}</SheetTitle>
              <SheetDescription>
                Select an existing person identity and create their player record for this event.
              </SheetDescription>
            </SheetHeader>

            <Card className="gap-4 py-4">
              <CardHeader>
                <CardTitle>Add Player</CardTitle>
                <CardDescription>Choose from the full list of existing people who are not yet in this event.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createPlayerForPersonAction} className="flex flex-col gap-4">
                  <input type="hidden" name="manageEventId" value={managedEventId} />
                  <input type="hidden" name="personId" value={activePerson.personId} />

                  <div>
                    <label htmlFor="select-person-id" className="mb-2 block text-sm font-medium text-foreground">
                      Person identity ({effectivePersons.length} available)
                    </label>
                    <select
                      id="select-person-id"
                      value={activePerson.personId}
                      onChange={(e) => handlePersonSelectChange(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {effectivePersons.map((person) => (
                        <option key={person.personId} value={person.personId}>
                          {person.personName} {person.totalPlayers > 0 ? `(${person.totalPlayers} other ${person.totalPlayers === 1 ? 'event' : 'events'})` : '(No other events)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="new-player-name" className="mb-2 block text-sm font-medium text-foreground">
                      Player name for this event
                    </label>
                    <Input
                      id="new-player-name"
                      name="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={120}
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Defaults to the person&apos;s identity name: <span className="font-semibold text-foreground">{activePerson.personName}</span>
                    </p>
                  </div>

                  {teams.length > 0 && (
                    <div>
                      <label htmlFor="new-player-team" className="mb-2 block text-sm font-medium text-foreground">
                        Team (optional)
                      </label>
                      <select
                        id="new-player-team"
                        name="teamId"
                        defaultValue=""
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="">No team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button type="submit">
                    <UserCog data-icon="inline-start" />
                    Add Player to {managedEventName}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="gap-4 py-4">
              <CardHeader>
                <CardTitle>Existing Event Records for {activePerson.personName}</CardTitle>
                <CardDescription>Cross-event records linked to this person.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activePerson.existingEventRecords.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      No other event records linked to this person.
                    </p>
                  ) : (
                    activePerson.existingEventRecords.map((record) => (
                      <div key={record.id} className="flex flex-col gap-1 rounded-lg border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-foreground">{record.name}</span>
                        <span className="text-muted-foreground">{record.eventName}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            All existing people are already registered in this event.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

type TeamDetailSheetProps = {
  managedEventId: string
  managedEventName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  row: TeamSummary | null
}

export function TeamDetailSheet({
  managedEventId,
  managedEventName,
  open,
  onOpenChange,
  row,
}: TeamDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {row && (
          <div className="flex flex-col gap-6">
            <SheetHeader className="gap-2">
              <SheetTitle>{row.name}</SheetTitle>
              <SheetDescription>Update or remove this team from {managedEventName}.</SheetDescription>
            </SheetHeader>

            <Card className="gap-4 py-4">
              <CardHeader>
                <CardTitle>Manage Team</CardTitle>
                <CardDescription>Rename the team or remove it if no linked players remain.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateTeamAction} className="flex flex-col gap-3">
                  <input type="hidden" name="manageEventId" value={managedEventId} />
                  <input type="hidden" name="teamId" value={row.id} />
                  <div className="flex-1">
                    <label htmlFor={`team-name-${row.id}`} className="mb-2 block text-sm font-medium text-foreground">
                      Team name
                    </label>
                    <Input
                      id={`team-name-${row.id}`}
                      name="name"
                      defaultValue={row.name}
                      required
                      minLength={2}
                      maxLength={120}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Team ID: <span className="font-mono text-foreground">{row.id}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="secondary">Save Team</Button>
                    <Button type="submit" formAction={deleteTeamAction} variant="destructive">
                      Delete Team
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
