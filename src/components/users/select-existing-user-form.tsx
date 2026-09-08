'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { selectExistingUserAction } from '@/app/actions'
import { initialUserActionState } from '@/lib/types/action-states'

export interface ExistingPlayerOption {
  id: string
  name: string
  personName?: string | null
  profileImageUrl?: string | null
  teamName?: string | null
  teamColor?: string | null
}

interface SelectExistingUserFormProps {
  players: ExistingPlayerOption[]
  onBack: () => void
  returnTo?: string
}

export default function SelectExistingUserForm({
  players = [],
  onBack,
  returnTo,
}: SelectExistingUserFormProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [state, formAction, isPending] = useActionState(
    selectExistingUserAction,
    initialUserActionState
  )

  useEffect(() => {
    if (state.success && state.data?.redirectUrl) {
      router.push(state.data.redirectUrl)
    }
  }, [state.success, state.data?.redirectUrl, router])

  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return players
    const q = search.toLowerCase()
    return players.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.personName && p.personName.toLowerCase().includes(q))
    )
  }, [players, search])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="space-y-1.5">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Izberite svojega igralca
        </h3>
        <p className="text-sm text-muted-foreground">
          Poiščite svoje ime ali vzdevek na seznamu igralcev tega dogodka in vstopite v turnir.
        </p>

        <div className="relative pt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Poiščite po vzdevku ali imenu..."
            className="pl-9 h-10 bg-background"
            autoFocus
          />
        </div>
      </div>

      {state.message && !state.success && (
        <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">{state.message}</p>
      )}

      <div className="max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredPlayers.map((player) => (
            <form key={player.id} action={formAction} className="h-full">
              <input type="hidden" name="userId" value={player.id} />
              {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-full text-left rounded-2xl border border-border/70 bg-card p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all flex flex-col justify-between gap-2.5 group relative cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-sm sm:text-base shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {player.profileImageUrl ? (
                      <Image
                        src={player.profileImageUrl}
                        alt={player.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <span>{player.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {player.teamName ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2 py-0.5 max-w-[95px] sm:max-w-[120px]">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: player.teamColor || '#cbd5e1' }}
                      />
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                        {player.teamName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/70 bg-muted/40 rounded-full px-2 py-0.5">
                      Brez ekipe
                    </span>
                  )}
                </div>

                <div className="min-w-0 w-full">
                  <h4 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                    {player.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate font-normal">
                    {player.personName || '\u00A0'}
                  </p>
                </div>
              </button>
            </form>
          ))}
        </div>
      </div>

      {filteredPlayers.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          {search ? `Noben igralec se ne ujema z "${search}"` : 'V tem dogodku še ni dodeljenih igralcev'}
        </p>
      )}

      <div className="pt-2 border-t border-border/50">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onBack}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          ← Nazaj na ustvarjanje novega računa
        </Button>
      </div>
    </div>
  )
}
