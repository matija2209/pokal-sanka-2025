import { getAllSightings } from '@/lib/prisma/fetchers/sighting-fetchers'
import { getHypeEvents, getHypeVotes } from '@/lib/prisma/fetchers/hype-fetchers'
import { SightingQueue } from '@/components/bachelor/admin/sighting-queue'
import { HypeManager } from '@/components/bachelor/admin/hype-manager'
import { LayoutDashboard, Flame, ClipboardList } from 'lucide-react'
import { ResetBachelorDataForm } from '@/components/superadmin/reset-bachelor-data-form'
import { getEventBySlug, DEFAULT_BACHELOR_EVENT_NAME, DEFAULT_BACHELOR_EVENT_SLUG } from '@/lib/events'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteHypeVoteAction, deleteSightingAction } from './actions'

export const dynamic = 'force-dynamic'

type BachelorAdminPageProps = {
  searchParams?: Promise<{
    reset?: string
  }>
}

type TimelineRow = {
  id: string
  createdAt: Date
  status: string
  submitterName: string | null
  submitterCountry: string | null
  actionType: string
  points: number
  message: string | null
  latitude: number | null
  longitude: number | null
  source: 'sighting' | 'hype_vote'
}

type SightingTimelineSource = {
  id: string
  createdAt: Date
  status: string
  submitterName: string | null
  submitterCountry: string | null
  actionType: string
  points: number
  message: string | null
  latitude: number
  longitude: number
}

type HypeVoteTimelineSource = {
  id: string
  createdAt: Date
  voterName: string | null
  suggestion: string | null
}

export default async function BachelorAdminPage({ searchParams }: BachelorAdminPageProps) {
  const [pendingSightings, approvedSightings, rejectedSightings, allSightings, hypeEvents, hypeVotes] =
    await Promise.all([
      getAllSightings('pending'),
      getAllSightings('approved'),
      getAllSightings('rejected'),
      getAllSightings(),
      getHypeEvents(),
      getHypeVotes(),
    ])
  const [params, bachelorEvent] = await Promise.all([
    searchParams ? searchParams : Promise.resolve(undefined),
    getEventBySlug(DEFAULT_BACHELOR_EVENT_SLUG),
  ])
  const resetStatus = params?.reset
  const bachelorEventName = bachelorEvent?.name ?? DEFAULT_BACHELOR_EVENT_NAME
  const deleteSightingFormAction = async (sightingId: string) => {
    'use server'
    await deleteSightingAction(sightingId)
  }
  const deleteHypeVoteFormAction = async (voteId: string) => {
    'use server'
    await deleteHypeVoteAction(voteId)
  }
  const sightingRows: TimelineRow[] = allSightings.map((sighting: SightingTimelineSource) => ({
    id: sighting.id,
    createdAt: sighting.createdAt,
    status: sighting.status,
    submitterName: sighting.submitterName,
    submitterCountry: sighting.submitterCountry,
    actionType: sighting.actionType,
    points: sighting.points,
    message: sighting.message,
    latitude: sighting.latitude,
    longitude: sighting.longitude,
    source: 'sighting',
  }))
  const timelineRows: TimelineRow[] = [
    ...sightingRows,
    ...hypeVotes.map((vote: HypeVoteTimelineSource) => ({
      id: vote.id,
      createdAt: vote.createdAt,
      status: 'submitted',
      submitterName: vote.voterName ?? 'Anonymous',
      submitterCountry: null,
      actionType: 'hype_vote',
      points: 1,
      message: vote.suggestion ?? null,
      latitude: null,
      longitude: null,
      source: 'hype_vote' as const,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wider mb-1">
              <LayoutDashboard className="w-4 h-4" />
              Superadmin Portal
            </div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tight">
              Bachelor Admin
            </h1>
          </div>
        </header>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg">
                <ClipboardList className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Sighting Moderation
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</span>
              <span className="bg-rose-600 text-white px-3 py-1 rounded-md text-sm font-black shadow-md shadow-rose-200">
                {pendingSightings.length}
              </span>
            </div>
          </div>
          <SightingQueue
            pendingSightings={pendingSightings}
            approvedSightings={approvedSightings}
            rejectedSightings={rejectedSightings}
          />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-200 pb-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Flame className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hype Event Manager</h2>
          </div>
          <HypeManager events={hypeEvents} />
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between mb-8 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg">
                <ClipboardList className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Timeline Entries Table
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Total: {timelineRows.length}
            </span>
          </div>

          <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-300">
                  <TableHead className="font-black text-slate-900">Time</TableHead>
                  <TableHead className="font-black text-slate-900">Status</TableHead>
                  <TableHead className="font-black text-slate-900">Submitter</TableHead>
                  <TableHead className="font-black text-slate-900">Action</TableHead>
                  <TableHead className="font-black text-slate-900">Points</TableHead>
                  <TableHead className="font-black text-slate-900">Message</TableHead>
                  <TableHead className="font-black text-slate-900">Location</TableHead>
                  <TableHead className="text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timelineRows.map((entry) => (
                  <TableRow key={entry.id} className="border-slate-200">
                    <TableCell className="font-semibold text-slate-900">
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="uppercase font-bold text-slate-900">{entry.status}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {entry.submitterName ?? 'Anonymous'}
                      {entry.submitterCountry ? ` (${entry.submitterCountry})` : ''}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {entry.actionType}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">{entry.points}</TableCell>
                    <TableCell className="max-w-[280px] truncate text-slate-800 font-medium">
                      {entry.message ?? '-'}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {entry.latitude !== null && entry.longitude !== null
                        ? `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.source === 'sighting' ? (
                        <form action={deleteSightingFormAction.bind(null, entry.id)}>
                          <button
                            type="submit"
                            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                          >
                            Delete
                          </button>
                        </form>
                      ) : entry.source === 'hype_vote' ? (
                        <form action={deleteHypeVoteFormAction.bind(null, entry.id)}>
                          <button
                            type="submit"
                            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                          >
                            Delete
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border-2 border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h2 className="text-2xl font-black text-rose-900 tracking-tight mb-4">Bachelor Danger Zone</h2>
          <p className="text-slate-800 font-medium mb-6">
            This deletes all data tied to <span className="font-black">{bachelorEventName}</span> only. The bachelor
            event row stays in place, but sightings, hype, trivia, teams, users, posts, drink logs, and commentary
            for that event are permanently removed.
          </p>

          {resetStatus === 'success' && (
            <p className="text-emerald-950 font-bold bg-emerald-100 border-2 border-emerald-300 rounded-xl px-4 py-3 mb-6">
              Bachelor event data deleted.
            </p>
          )}
          {resetStatus === 'error' && (
            <p className="text-rose-950 font-bold bg-rose-100 border-2 border-rose-300 rounded-xl px-4 py-3 mb-6">
              Failed to delete bachelor event data.
            </p>
          )}

          <ResetBachelorDataForm eventName={bachelorEventName} />
        </section>
      </div>
    </div>
  )
}
