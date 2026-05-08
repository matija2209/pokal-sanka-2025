'use client'

import { useActionState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  createHypeEventAction,
  triggerHypeEventAction,
  deleteHypeEventAction,
} from '@/app/superadmin/bachelor/actions'
import { initialBachelorActionState } from '@/lib/types/action-states'
import { Lock, Unlock, CheckCircle2, Plus } from 'lucide-react'
import { toast } from 'sonner'

type HypeEventItem = {
  id: string
  title: string
  description: string | null
  status: string
  voteCount: number
  voteThreshold: number
}

interface HypeManagerProps {
  events: HypeEventItem[]
}

export function HypeManager({ events }: HypeManagerProps) {
  const [createState, createAction, isCreating] = useActionState(
    createHypeEventAction,
    initialBachelorActionState,
  )

  useEffect(() => {
    if (createState.success) {
      toast.success(createState.message)
    } else if (createState.message && createState.type === 'error') {
      toast.error(createState.message)
    }
  }, [createState])

  const handleTrigger = async (eventId: string, status: string) => {
    const result = await triggerHypeEventAction(eventId, status)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = async (eventId: string) => {
    const result = await deleteHypeEventAction(eventId)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="space-y-10">
      <Card className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden transition-all hover:border-slate-300">
        <div className="bg-slate-50 border-b-2 border-slate-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Configure New Hype Event</h3>
          <Plus className="w-4 h-4 text-slate-400" />
        </div>
        <CardContent className="p-6">
          <form action={createAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Title *</label>
              <Input
                name="title"
                placeholder="e.g. Jump into the sea"
                required
                className="h-12 text-base border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-amber-500/20 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vote Threshold</label>
              <Input
                name="voteThreshold"
                type="number"
                placeholder="Default: 5"
                defaultValue={5}
                className="h-12 text-base border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-amber-500/20 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
              <Input
                name="description"
                placeholder="What will BWSK actually do?"
                className="h-12 text-base border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-amber-500/20 outline-none transition-all font-bold"
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <Button type="submit" disabled={isCreating} className="w-full bg-slate-950 hover:bg-slate-800 text-white font-black h-12 rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                {isCreating ? (
                  <span className="animate-pulse">CREATING EVENT...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    CREATE HYPE EVENT
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {events.length === 0 ? (
        <Card className="bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-3xl">
          <CardContent className="p-16 text-center">
            <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Unlock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold text-lg">No hype events yet.</p>
            <p className="text-slate-400 text-sm mt-1 font-medium">Create your first event above to start the hype!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 mb-2">Manage Active Events</h4>
          {events.map((event) => {
            const isCompleted = event.status === 'completed'
            const isUnlocked = event.status === 'unlocked'
            const isLocked = event.status === 'locked'

            const statusIcon = isCompleted ? (
              <div className="bg-emerald-100 p-3 rounded-2xl border-2 border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
            ) : isUnlocked ? (
              <div className="bg-amber-100 p-3 rounded-2xl border-2 border-amber-200 animate-pulse">
                <Unlock className="w-6 h-6 text-amber-700" />
              </div>
            ) : (
              <div className="bg-slate-100 p-3 rounded-2xl border-2 border-slate-200">
                <Lock className="w-6 h-6 text-slate-400" />
              </div>
            )

            return (
              <Card key={event.id} className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 group">
                <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    {statusIcon}
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1 justify-center sm:justify-start">
                      <p className="font-black text-xl text-slate-900 leading-tight">{event.title}</p>
                      <Badge className={`text-[9px] font-black uppercase tracking-widest border-0 px-2 py-0.5 w-fit mx-auto sm:mx-0 ${
                        isCompleted ? 'bg-emerald-600' : 
                        isUnlocked ? 'bg-amber-500 shadow-lg shadow-amber-100' : 'bg-slate-400'
                      }`}>
                        {event.status}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate-500 font-bold">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                      <div className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          Progress: {event.voteCount} / {event.voteThreshold}
                        </span>
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${isUnlocked || isCompleted ? 'bg-amber-500' : 'bg-slate-400'}`}
                            style={{ width: `${Math.min(100, (event.voteCount / event.voteThreshold) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    {isLocked && (
                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-amber-200 text-amber-700 font-black hover:bg-amber-50 hover:border-amber-300 rounded-2xl h-12 px-6 transition-all active:scale-95"
                        onClick={() => handleTrigger(event.id, 'unlocked')}
                      >
                        FORCE UNLOCK
                      </Button>
                    )}
                    {isUnlocked && (
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl h-12 px-6 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        onClick={() => handleTrigger(event.id, 'completed')}
                      >
                        MARK COMPLETED
                      </Button>
                    )}
                    {isCompleted && (
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] px-4">
                        MISSION ACCOMPLISHED
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      className="flex-1 font-black rounded-2xl h-12 px-6 transition-all active:scale-95"
                      onClick={() => handleDelete(event.id)}
                    >
                      DELETE EVENT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
