'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HypeVoteForm } from '@/components/bachelor/hype-vote-form'
import { Flame, Lock, Unlock, CheckCircle2, Target, Clock3 } from 'lucide-react'
import type { HypeEvent } from '@prisma/client'

type HypeVoteItem = {
  id: string
  createdAt: Date
  voterName: string | null
  suggestion: string | null
}

interface HypeMeterProps {
  voteCount: number
  events: HypeEvent[]
  votes: HypeVoteItem[]
}

export function HypeMeter({ voteCount, events, votes }: HypeMeterProps) {
  const [showVoteForm, setShowVoteForm] = useState(false)
  const lockedEvents = events.filter((event) => event.status === 'locked')
  const recentVotes = votes.slice(0, 12)
  const activeEvent = lockedEvents
    .slice()
    .sort((a, b) => {
      const aRemaining = a.voteThreshold - a.voteCount
      const bRemaining = b.voteThreshold - b.voteCount
      return aRemaining - bRemaining
    })[0]

  return (
    <div className="space-y-6">
      <Card className="bg-muted/20 border-muted overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-primary to-orange-500" />
        <CardContent className="p-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <Flame className="w-10 h-10 mx-auto text-orange-500 animate-pulse" />
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
            </div>

            <p className="text-sm text-muted-foreground mb-2 leading-relaxed max-w-[320px] mx-auto">
              Vote for a predefined hype event and push it toward unlock. Every vote adds one hype point.
            </p>

            <div className="text-4xl font-bold font-lucky mb-1 tracking-tighter">
              {voteCount}{' '}
              <span className="text-sm font-sans text-muted-foreground uppercase font-normal tracking-normal">
                hype points
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground mb-6 uppercase tracking-widest">
              total public hype collected
            </p>
          </div>

          {activeEvent ? (
            <div className="rounded-2xl border border-primary/15 bg-background/60 p-4 mb-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/80">
                      Closest To Unlock
                    </p>
                  </div>
                  <p className="font-bold text-base leading-tight">{activeEvent.title}</p>
                  {activeEvent.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {activeEvent.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {activeEvent.voteCount}/{activeEvent.voteThreshold}
                </Badge>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden border border-muted-foreground/10 mb-2">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-primary to-orange-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (activeEvent.voteCount / activeEvent.voteThreshold) * 100)}%`,
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {Math.max(0, activeEvent.voteThreshold - activeEvent.voteCount)} more vote
                {activeEvent.voteThreshold - activeEvent.voteCount === 1 ? '' : 's'} to unlock this event.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/15 bg-background/60 p-4 mb-6 text-center">
              <p className="font-bold text-base">All current hype events are already unlocked or completed.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add more hype events in admin when you want the crowd to keep voting.
              </p>
            </div>
          )}

          {!showVoteForm ? (
            <button
              onClick={() => setShowVoteForm(true)}
              className="inline-flex w-full justify-center items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              disabled={lockedEvents.length === 0}
            >
              <Flame className="w-5 h-5 fill-current" />
              {lockedEvents.length === 0 ? 'NO EVENTS TO VOTE FOR' : 'VOTE FOR A HYPE EVENT'}
            </button>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <HypeVoteForm events={lockedEvents} onClose={() => setShowVoteForm(false)} />
            </div>
          )}
        </CardContent>
      </Card>

      {events.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
            <Unlock className="w-4 h-4" />
            Hype History
          </h3>
          {events.map((event) => {
            const statusIcon =
              event.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : event.status === 'unlocked' ? (
                <Unlock className="w-5 h-5 text-yellow-500" />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )
            const progress = Math.min(100, (event.voteCount / event.voteThreshold) * 100)

            return (
              <Card key={event.id} className="bg-muted/20 border-muted group transition-colors hover:bg-muted/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {statusIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-bold text-sm leading-tight">{event.title}</p>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter shrink-0">
                          {event.status}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                      <span>{event.voteCount} hype points</span>
                      <span>target {event.voteThreshold}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-muted-foreground/10">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 via-primary to-orange-500 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
          <Clock3 className="w-4 h-4" />
          Recent Hype Votes
        </h3>
        {recentVotes.length === 0 ? (
          <Card className="bg-muted/20 border-muted">
            <CardContent className="p-4 text-sm text-muted-foreground">
              No hype votes yet. Cast the first one.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentVotes.map((vote) => (
              <Card key={vote.id} className="bg-muted/20 border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight">
                        {vote.voterName?.trim() || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vote.suggestion?.trim() || 'No note left with this vote.'}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {new Date(vote.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
