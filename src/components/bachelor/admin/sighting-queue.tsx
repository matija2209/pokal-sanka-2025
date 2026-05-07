'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  approveSightingAction,
  rejectSightingAction,
} from '@/app/superadmin/bachelor/actions'
import { Check, X, MapPin, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import type { PublicSighting } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'

interface SightingQueueProps {
  pendingSightings: PublicSighting[]
  approvedSightings: PublicSighting[]
  rejectedSightings: PublicSighting[]
}

type Tab = 'pending' | 'approved' | 'rejected'

export function SightingQueue({
  pendingSightings,
  approvedSightings,
  rejectedSightings,
}: SightingQueueProps) {
  const [tab, setTab] = useState<Tab>('pending')
  const [pending, setPending] = useState(pendingSightings)
  const [approved, setApproved] = useState(approvedSightings)
  const [rejected, setRejected] = useState(rejectedSightings)

  const handleApprove = async (id: string) => {
    const result = await approveSightingAction(id)
    if (result.success) {
      const item = pending.find((s) => s.id === id)
      if (item) {
        setPending((p) => p.filter((s) => s.id !== id))
        setApproved((a) => [{ ...item, status: 'approved' }, ...a])
      }
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleReject = async (id: string) => {
    const result = await rejectSightingAction(id, '')
    if (result.success) {
      const item = pending.find((s) => s.id === id)
      if (item) {
        setPending((p) => p.filter((s) => s.id !== id))
        setRejected((r) => [{ ...item, status: 'rejected' }, ...r])
      }
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const sightings = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected

  return (
    <div className="space-y-8">
      <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl border border-slate-300/50 shadow-inner">
        {(['pending', 'approved', 'rejected'] as Tab[]).map((t) => {
          const count =
            t === 'pending' ? pending.length : t === 'approved' ? approved.length : rejected.length
          const isActive = tab === t
          return (
            <Button
              key={t}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab(t)}
              className={`flex-1 font-black rounded-xl transition-all h-10 ${
                isActive 
                  ? 'bg-white text-slate-950 shadow-md hover:bg-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">
                {t} ({count})
              </span>
            </Button>
          )
        })}
      </div>

      {sightings.length === 0 ? (
        <Card className="bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-3xl">
          <CardContent className="p-16 text-center">
            <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold text-lg">No {tab} sightings found.</p>
            <p className="text-slate-400 text-sm mt-1 font-medium">When users log sightings, they will appear here for review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sightings.map((sighting) => (
            <Card key={sighting.id} className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {sighting.photoUrl && (
                    <div className="relative w-full h-64 border-b-2 border-slate-100 group">
                      <Image
                        src={sighting.photoUrl}
                        alt="Sighting"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 512px"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-slate-950/80 backdrop-blur-md text-white font-black border-0 uppercase tracking-widest text-[10px] px-3 py-1">
                          {sighting.actionType}
                        </Badge>
                        <Badge className="bg-rose-600 text-white font-black border-0 uppercase tracking-widest text-[10px] px-3 py-1 shadow-lg">
                          +{sighting.points} pts
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="p-6 flex-1 min-w-0 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {formatDistanceToNow(sighting.createdAt, { addSuffix: true })}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-full">
                          <MapPin className="w-3 h-3" />
                          {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
                        </div>
                      </div>

                      {sighting.submitterName && (
                        <h4 className="text-xl font-black text-slate-900 flex items-baseline gap-2">
                          {sighting.submitterName}
                          {sighting.submitterCountry && (
                            <span className="text-slate-400 font-bold text-sm">
                              from {sighting.submitterCountry}
                            </span>
                          )}
                        </h4>
                      )}

                      {sighting.message && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 relative">
                           <div className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</div>
                          <p className="text-sm text-slate-700 font-bold italic leading-relaxed">
                            &ldquo;{sighting.message}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                      {tab === 'pending' ? (
                        <div className="flex gap-3">
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
                            onClick={() => handleApprove(sighting.id)}
                          >
                            <Check className="w-5 h-5 mr-2" />
                            APPROVE
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black h-12 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95"
                            onClick={() => handleReject(sighting.id)}
                          >
                            <X className="w-5 h-5 mr-2" />
                            REJECT
                          </Button>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-2 font-black uppercase tracking-widest text-xs ${
                          sighting.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {sighting.status === 'approved' ? (
                            <>
                              <Check className="w-4 h-4" />
                              Approved {sighting.approvedAt && formatDistanceToNow(sighting.approvedAt, { addSuffix: true })}
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Rejected
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
