'use client'

import { useActionState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { logDrinkAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { DRINK_TYPES } from '@/lib/prisma/types'
import { getDrinksByCategory } from '@/lib/utils/drinks'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'
import { toast } from 'sonner'

interface DrinkSelectionDialogProps {
  selectedUser: UserWithTeamAndDrinks | null
  isOpen: boolean
  onClose: () => void
  onDrinkLogged: () => void
}

export default function DrinkSelectionDialog({ 
  selectedUser, 
  isOpen, 
  onClose, 
  onDrinkLogged 
}: DrinkSelectionDialogProps) {
  const [state, formAction, isPending] = useActionState(logDrinkAction, initialDrinkLogActionState)
  const categories = getDrinksByCategory()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onClose()
      onDrinkLogged()
    } else if (state.message && !state.success && state.type === 'error') {
      toast.error(state.message)
    }
  }, [state.success, state.message, state.type, onClose, onDrinkLogged])

  if (!selectedUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Beleži pijačo za {selectedUser.name}
          </DialogTitle>
          <div className="text-center text-sm ">
            {selectedUser.team ? (
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedUser.team.color }}
                />
                <span>{selectedUser.team.name}</span>
              </div>
            ) : (
              <span>Brez ekipe</span>
            )}
          </div>
        </DialogHeader>
        
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="userId" value={selectedUser.id} />
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                  <h3 className="font-semibold text-sm">
                    {category.name} ({category.description})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {category.drinks.map((drink) => (
                    <Button 
                      key={drink.type}
                      type="submit" 
                      name="drinkType" 
                      value={drink.type}
                      variant={drink.points === 3 ? "destructive" : "default"}
                      disabled={isPending}
                      className="h-12 text-sm font-medium"
                    >
                      <span className="flex flex-col items-center gap-0.5">
                        <span>{drink.label}</span>
                        <span className="text-xs opacity-80">+{drink.points} {drink.points === 1 ? 'točka' : drink.points === 2 ? 'točki' : 'točke'}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {isPending && (
            <div className="text-center text-sm ">
              Beležim pijačo...
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}