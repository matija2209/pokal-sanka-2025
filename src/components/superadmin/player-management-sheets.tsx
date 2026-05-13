'use client'

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
            <SheetHeader className="px-0">
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
                  <form action={updatePersonAction} className="flex flex-col gap-3">
                    <input type="hidden" name="manageEventId" value={managedEventId} />
                    <input type="hidden" name="personId" value={row.personId} />
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
                <CardContent className="flex flex-col gap-3">
                  <form action={updatePlayerAction} className="grid gap-3 md:grid-cols-3 md:items-end">
                    <input type="hidden" name="manageEventId" value={managedEventId} />
                    <input type="hidden" name="playerId" value={row.activePlayer.id} />
                    <div>
                      <label htmlFor={`player-name-${row.personId}`} className="mb-2 block text-sm font-medium text-foreground">
                        Player name
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
                    <Button type="submit">Save Player</Button>
                  </form>

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
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
}

export function AddPersonToEventSheet({
  managedEventId,
  managedEventName,
  open,
  onOpenChange,
  row,
}: AddPersonToEventSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        {row && (
          <div className="flex flex-col gap-6">
            <SheetHeader className="px-0">
              <SheetTitle>{row.personName}</SheetTitle>
              <SheetDescription>
                Create the missing player record for {managedEventName}.
              </SheetDescription>
            </SheetHeader>

            <Card className="gap-4 py-4">
              <CardHeader>
                <CardTitle>Add Player</CardTitle>
                <CardDescription>The default player name starts from the shared person identity.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createPlayerForPersonAction} className="flex flex-col gap-3">
                  <input type="hidden" name="manageEventId" value={managedEventId} />
                  <input type="hidden" name="personId" value={row.personId} />
                  <div>
                    <label htmlFor={`new-player-name-${row.personId}`} className="mb-2 block text-sm font-medium text-foreground">
                      Player name for this event
                    </label>
                    <Input
                      id={`new-player-name-${row.personId}`}
                      name="playerName"
                      defaultValue={row.personName}
                      maxLength={120}
                    />
                  </div>
                  <Button type="submit">
                    <UserCog data-icon="inline-start" />
                    Add Player
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="gap-4 py-4">
              <CardHeader>
                <CardTitle>Existing Event Records</CardTitle>
                <CardDescription>Useful to confirm naming consistency before adding a new event player.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {row.existingEventRecords.map((record) => (
                    <div key={record.id} className="flex flex-col gap-1 rounded-lg border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-foreground">{record.name}</span>
                      <span className="text-muted-foreground">{record.eventName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            <SheetHeader className="px-0">
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
