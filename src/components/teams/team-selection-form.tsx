'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, PlusCircle, Sparkles, UserPlus, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { joinTeamAction, createTeamAction } from '@/app/actions'
import { initialTeamActionState } from '@/lib/types/action-states'
import type { TeamWithUsers } from '@/lib/prisma/types'

interface TeamSelectionFormProps {
  currentUserId: string
  currentUserName?: string
  availableTeams: TeamWithUsers[]
  redirectUrl?: string
}

function translateErrorMessage(message: string): string {
  if (!message) return ''
  if (message.includes('Team name might already exist') || message.includes('already exist')) {
    return 'Ekipa s tem imenom že obstaja. Prosimo, izberite drugo ime.'
  }
  if (message.includes('Team name is required')) {
    return 'Vnesite veljavno ime ekipe.'
  }
  if (message.includes('User ID and Team ID are required')) {
    return 'Prosimo, izberite ekipo.'
  }
  if (message.includes('Failed to join team')) {
    return 'Pridružitev ekipi ni uspela. Poskusite znova.'
  }
  if (message.includes('An unexpected error occurred')) {
    return 'Prišlo je do nepričakovane napake. Poskusite znova.'
  }
  return message
}

export default function TeamSelectionForm({ 
  currentUserId,
  currentUserName,
  availableTeams, 
  redirectUrl = '/app/feed' 
}: TeamSelectionFormProps) {
  const router = useRouter()
  const [submittingTeamId, setSubmittingTeamId] = useState<string | null>(null)

  const [joinState, joinFormAction, isJoinPending] = useActionState(joinTeamAction, initialTeamActionState)
  const [createState, createFormAction, isCreatePending] = useActionState(createTeamAction, initialTeamActionState)

  useEffect(() => {
    if (joinState.success && joinState.data?.redirectUrl) {
      router.push(joinState.data.redirectUrl)
    }
  }, [joinState.success, joinState.data?.redirectUrl, router])

  useEffect(() => {
    if (createState.success && createState.data?.redirectUrl) {
      router.push(createState.data.redirectUrl)
    }
  }, [createState.success, createState.data?.redirectUrl, router])

  useEffect(() => {
    if (!isJoinPending) {
      setSubmittingTeamId(null)
    }
  }, [isJoinPending])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* LEVA STRAN: Primarna možnost - Pridružitev ekipi */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Pridruži se obstoječi ekipi</h2>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 text-xs font-semibold">
              Priporočeno
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Izberite eno izmed ekip in se pridružite soigralcem.
          </p>
        </div>

        {joinState.message && !joinState.success && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{translateErrorMessage(joinState.message)}</span>
          </div>
        )}

        {joinState.message && joinState.success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Uspešno ste se pridružili ekipi! Preusmerjanje...</span>
          </div>
        )}

        {availableTeams.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold mb-1">Ni še ustvarjenih ekip</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Na tem turnirju trenutno še ni nobene ekipe. Bodite prvi in ustvarite novo ekipo na desni strani!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableTeams.map((team) => {
              const isThisSubmitting = isJoinPending && submittingTeamId === team.id
              const memberCount = team.users.length

              return (
                <div 
                  key={team.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200"
                >
                  {/* Zgornji del kartice: Barvni akcent + Ime ekipe + Števec */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-2 ring-background border border-black/10" 
                          style={{ backgroundColor: team.color || '#3b82f6' }}
                        />
                        <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                          {team.name}
                        </h3>
                      </div>

                      <Badge variant="secondary" className="shrink-0 text-xs px-2 py-0.5 gap-1 font-medium bg-muted/80">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {memberCount} {memberCount === 1 ? 'član' : memberCount === 2 ? 'člana' : memberCount === 3 || memberCount === 4 ? 'člani' : 'članov'}
                      </Badge>
                    </div>

                    {/* Člani ekipe */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Člani ekipe:
                      </div>

                      {team.users.length === 0 ? (
                        <p className="text-xs text-muted-foreground/80 italic py-1">
                          Ekipa še nima članov — bodi prvi!
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {team.users.map((member) => (
                            <div 
                              key={member.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-xs text-foreground/90 font-medium"
                            >
                              <Avatar className="h-4 w-4">
                                {member.profile_image_url && (
                                  <AvatarImage src={member.profile_image_url} alt={member.name} />
                                )}
                                <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">
                                  {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[120px]">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gumb za pridružitev */}
                  <div className="mt-5 pt-3">
                    <form 
                      action={joinFormAction} 
                      onSubmit={() => setSubmittingTeamId(team.id)}
                    >
                      <input type="hidden" name="userId" value={currentUserId} />
                      <input type="hidden" name="teamId" value={team.id} />
                      <Button 
                        type="submit" 
                        className="w-full justify-center gap-2 rounded-xl h-10 font-semibold transition-all"
                        disabled={isJoinPending}
                      >
                        {isThisSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Pridruževanje...</span>
                          </>
                        ) : (
                          <>
                            <span>Pridruži se</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* DESNA STRAN: Sekundarna možnost - Ustvari novo ekipo */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6 backdrop-blur-xs space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                <PlusCircle className="h-3.5 w-3.5" />
                Druga možnost
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Ustvari novo ekipo
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Nimate svoje ekipe na seznamu? Vnesite ime in ustvarite svojo skupino.
            </p>
          </div>

          <form action={createFormAction} className="space-y-4">
            <input type="hidden" name="userId" value={currentUserId} />
            
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-sm font-medium">
                Ime nove ekipe
              </Label>
              <Input 
                id="teamName"
                name="teamName" 
                placeholder="npr. Pivski asi" 
                required 
                disabled={isCreatePending}
                className="h-10 rounded-xl bg-background"
              />
              {createState.errors?.teamName && (
                <p className="text-destructive text-xs mt-1">
                  {createState.errors.teamName[0] === 'Team name is required' 
                    ? 'Ime ekipe je obvezno.' 
                    : createState.errors.teamName[0]}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-background/80 p-3 border border-border/50 text-xs text-muted-foreground flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                Vaši ekipi bo samodejno dodeljena edinstvena barva in takoj boste postali njen prvi član.
              </span>
            </div>

            {createState.message && !createState.success && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{translateErrorMessage(createState.message)}</span>
              </div>
            )}

            {createState.message && createState.success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Ekipa je bila uspešno ustvarjena! Preusmerjanje...</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full h-10 rounded-xl font-semibold transition-all hover:bg-secondary/80" 
              disabled={isCreatePending}
            >
              {isCreatePending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Ustvarjam ekipo...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Ustvari in se pridruži
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}