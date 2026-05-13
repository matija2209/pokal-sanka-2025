export type EventOption = {
  id: string
  name: string
}

export type TeamSummary = {
  id: string
  name: string
  playerCount: number
}

export type EventRecord = {
  id: string
  name: string
  eventId: string | null
  eventName: string
}

export type PlayerRow = {
  personId: string
  personName: string
  totalPlayers: number
  invitePath: string
  activePlayer: {
    id: string
    name: string
    teamId: string | null
    teamName: string | null
  }
  otherEventRecords: EventRecord[]
}

export type AddablePersonRow = {
  personId: string
  personName: string
  totalPlayers: number
  existingEventRecords: EventRecord[]
}
