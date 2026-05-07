'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { HypeVoteForm } from '@/components/bachelor/hype-vote-form'
import { HYPE_VOTE_THRESHOLD } from '@/lib/utils/bachelor-points'
import { Flame, Lock, Unlock, CheckCircle2 } from 'lucide-react'
import type { HypeEvent } from '@prisma/client'

interface HypeMeterProps {
  voteCount: number
  events: HypeEvent[]
}

export function HypeMeter({ voteCount, events }: HypeMeterProps) {
  const [showVoteForm, setShowVoteForm] = useState(false)
  const votesUntilNext = HYPE_VOTE_THRESHOLD - (voteCount % HYPE_VOTE_THRESHOLD)
  const progress = ((HYPE_VOTE_THRESHOLD - votesUntilNext) / HYPE_VOTE_THRESHOLD) * 100

  return (
    <div className="space-y-6">
      <Card className="bg-muted/20 border-muted overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-primary to-orange-500" />
        <CardContent className="p-6 text-center">
          <div className="relative inline-block mb-4">
            <Flame className="w-10 h-10 mx-auto text-orange-500 animate-pulse" />
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed max-w-[280px] mx-auto">
            What should BWSK do next? Every <span className="text-foreground font-bold">{HYPE_VOTE_THRESHOLD} votes</span> unlocks a Hype Event.
          </p>
          
          <div className="text-4xl font-bold font-lucky mb-1 tracking-tighter">
            {votesUntilNext} <span className="text-sm font-sans text-muted-foreground uppercase font-normal tracking-normal">votes left</span>
          </div>
          
          <p className="text-[10px] text-muted-foreground mb-6 uppercase tracking-widest">
            to next Hype Event
          </p>
          
          <div className="relative h-3 mb-8 bg-muted rounded-full overflow-hidden border border-muted-foreground/10">
            <Progress value={progress} className="h-full transition-all duration-1000" />
          </div>

          {!showVoteForm ? (
            <button
              onClick={() => setShowVoteForm(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Flame className="w-5 h-5 fill-current" />
              VOTE NOW
            </button>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <HypeVoteForm onClose={() => setShowVoteForm(false)} />
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

            return (
              <Card key={event.id} className="bg-muted/20 border-muted group transition-colors hover:bg-muted/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {statusIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-tight">{event.title}</p>
                    {event.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-tighter shrink-0 ml-2">
                    {event.status}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
