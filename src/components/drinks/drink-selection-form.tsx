'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { logDrinkAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { getDrinksByCategory } from '@/lib/utils/drinks'
import type { UserWithTeam } from '@/lib/prisma/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface DrinkSelectionFormProps {
  selectedUser: UserWithTeam
}

export default function DrinkSelectionForm({ selectedUser }: DrinkSelectionFormProps) {
  const [state, formAction, isPending] = useActionState(logDrinkAction, initialDrinkLogActionState)
  const categories = getDrinksByCategory()
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      router.push('/app/quick-log')
    } else if (state.message && !state.success && state.type === 'error') {
      toast.error(state.message)
    }
  }, [state.success, state.message, state.type, router])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/app/quick-log"
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight">Beleži pijačo</h1>
          <p className="text-muted-foreground font-medium">za {selectedUser.name}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mb-8 p-4 bg-secondary/30 rounded-2xl border border-border/50">
        <span className="text-xl font-bold text-foreground leading-none">{selectedUser.name}</span>
        {selectedUser.team ? (
          <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-background border border-border/50 shadow-sm">
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: selectedUser.team.color }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{selectedUser.team.name}</span>
          </div>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">Brez ekipe</span>
        )}
      </div>
      
      <form action={formAction} className="space-y-8 relative">
        <input type="hidden" name="userId" value={selectedUser.id} />
        
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.name} className="space-y-4">
              <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 border-b border-border/50">
                <span className="text-xl">{category.emoji}</span>
                <h3 className="font-black text-sm uppercase tracking-widest text-primary/80">
                  {category.name}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.drinks.map((drink) => (
                  <Button 
                    key={drink.type}
                    type="submit" 
                    name="drinkType" 
                    value={drink.type}
                    variant={drink.points >= 3 ? "destructive" : "default"}
                    disabled={isPending}
                    className="h-16 text-lg font-bold shadow-md transition-all active:scale-[0.98] rounded-2xl"
                  >
                    <div className="flex justify-between items-center w-full px-2">
                      <span>{drink.label}</span>
                      <div className="bg-black/20 px-3 py-1 rounded-lg text-xs font-black backdrop-blur-sm">
                        +{drink.points} {drink.points === 1 ? 'TOČKA' : (drink.points === 2 ? 'TOČKI' : 'TOČKE')}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {isPending && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-3xl border border-border shadow-2xl">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <span className="text-lg font-black uppercase tracking-widest text-primary">Beležim...</span>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
