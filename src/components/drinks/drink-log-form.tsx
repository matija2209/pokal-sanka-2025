'use client'

import { useActionState, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { logDrinkAction, logMultipleDrinksAction } from '@/app/actions'
import { initialDrinkLogActionState, initialMultiDrinkLogActionState } from '@/lib/types/action-states'
import { DRINK_TYPES } from '@/lib/prisma/types'
import { getDrinkLabel, getDrinkPoints } from '@/lib/utils/drinks'
import DrinkSelectionModal from './drink-selection-modal'

interface DrinkLogFormProps {
  currentUserId: string
  allUsers: Array<{
    id: string
    name: string
    team?: {
      name: string
      color: string
    } | null
  }>
}

export default function DrinkLogForm({ currentUserId, allUsers }: DrinkLogFormProps) {
  const [isMultiMode, setIsMultiMode] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedDrink, setSelectedDrink] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [singleState, singleFormAction, singleIsPending] = useActionState(logDrinkAction, initialDrinkLogActionState)
  const [multiState, multiFormAction, multiIsPending] = useActionState(logMultipleDrinksAction, initialMultiDrinkLogActionState)
  
  const state = isMultiMode ? multiState : singleState
  const formAction = isMultiMode ? multiFormAction : singleFormAction
  const isPending = isMultiMode ? multiIsPending : singleIsPending

  const handleModeToggle = (checked: boolean) => {
    setIsMultiMode(checked)
    setSelectedUserIds([])
  }

  const handleDrinkSelect = (drinkType: string) => {
    setSelectedDrink(drinkType)
  }

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId])
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId))
    }
  }

  useEffect(() => {
    if (multiState.success && isMultiMode) {
      setSelectedUserIds([])
    }
  }, [multiState.success, isMultiMode])

  useEffect(() => {
    if (state.success) {
      setSelectedDrink('')
    }
  }, [state.success])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beleži pijačo</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="multi-mode"
              checked={isMultiMode}
              onCheckedChange={handleModeToggle}
              disabled={isPending}
            />
            <Label htmlFor="multi-mode" className='font-bold'>Beleži za več ljudi</Label>
          </div>
          
          <div>
            
            {!isMultiMode && (
              <Select name="userId" defaultValue={currentUserId} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Izberite igralca" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        {user.team && (
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: user.team.color }}
                          />
                        )}
                        <span>{user.name}</span>
                        {user.team && (
                          <span className="">({user.team.name})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isMultiMode && (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {allUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) => handleUserToggle(user.id, checked as boolean)}
                      disabled={isPending}
                    />
                    <input
                      type="hidden"
                      name="userIds"
                      value={user.id}
                      disabled={!selectedUserIds.includes(user.id)}
                    />
                    <Label htmlFor={`user-${user.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                      {user.team && (
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: user.team.color }}
                        />
                      )}
                      <span>{user.name}</span>
                      {user.team && (
                        <span className="">({user.team.name})</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isMultiMode && selectedUserIds.length === 0 && (
            <p className="text-orange-500 text-sm">Izberite vsaj enega igralca</p>
          )}

          {state.message && !state.success && (
            <p className="text-red-500 text-sm">{state.message}</p>
          )}

          {state.message && state.success && (
            <p className="text-green-500 text-sm">{state.message}</p>
          )}
          
          <div className="space-y-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                disabled={isPending}
                className="w-full justify-start "
              >
                {selectedDrink ? 
                  `${getDrinkLabel(selectedDrink)} (+${getDrinkPoints(selectedDrink)})` : 
                  "Izberi pijačo"
                }
              </Button>
            
            <Button 
              type="submit" 
              name="drinkType" 
              value={selectedDrink}
              variant="default"
              disabled={isPending || !selectedDrink || (isMultiMode && selectedUserIds.length === 0)}
              className="w-full"
            >
              {isPending ? "Beležim..." : 
               selectedDrink ? (
                 isMultiMode ? 
                   `Beleži ${getDrinkLabel(selectedDrink)} (+${getDrinkPoints(selectedDrink) * selectedUserIds.length})` :
                   `Beleži ${getDrinkLabel(selectedDrink)} (+${getDrinkPoints(selectedDrink)})`
               ) : "Izberi pijačo"
              }
            </Button>
          </div>

          <DrinkSelectionModal 
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSelectDrink={handleDrinkSelect}
            selectedDrink={selectedDrink}
          />
        </form>
      </CardContent>
    </Card>
  )
}