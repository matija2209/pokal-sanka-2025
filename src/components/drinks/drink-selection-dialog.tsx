'use client'

import { useActionState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { logDrinkAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { DRINK_TYPES } from '@/lib/prisma/types'
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
          <div className="text-center text-sm text-gray-600">
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
          
          <div className="grid grid-cols-1 gap-4">
            <Button 
              type="submit" 
              name="drinkType" 
              value={DRINK_TYPES.REGULAR}
              variant="default"
              disabled={isPending}
              className="h-16 text-lg font-semibold"
            >
              <span className="flex flex-col items-center gap-1">
                <span>🍺 Navadno pivo</span>
                <span className="text-sm font-normal">+1 točka</span>
              </span>
            </Button>
            
            <Button 
              type="submit" 
              name="drinkType" 
              value={DRINK_TYPES.SHOT}
              variant="destructive" 
              disabled={isPending}
              className="h-16 text-lg font-semibold"
            >
              <span className="flex flex-col items-center gap-1">
                <span>🥃 Žganica</span>
                <span className="text-sm font-normal">+2 točki</span>
              </span>
            </Button>
          </div>
          
          {isPending && (
            <div className="text-center text-sm text-gray-600">
              Beležim pijačo...
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}