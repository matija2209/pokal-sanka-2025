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
  
  const [singleState, singleFormAction, singleIsPending] = useActionState(logDrinkAction, initialDrinkLogActionState)
  const [multiState, multiFormAction, multiIsPending] = useActionState(logMultipleDrinksAction, initialMultiDrinkLogActionState)
  
  const state = isMultiMode ? multiState : singleState
  const formAction = isMultiMode ? multiFormAction : singleFormAction
  const isPending = isMultiMode ? multiIsPending : singleIsPending

  const handleModeToggle = (checked: boolean) => {
    setIsMultiMode(checked)
    setSelectedUserIds([])
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
            <Label htmlFor="multi-mode">Beleži za več ljudi</Label>
          </div>
          
          <div>
            <Label>{isMultiMode ? 'Igralci' : 'Igralec'}</Label>
            
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
                          <span className="text-gray-500">({user.team.name})</span>
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
                        <span className="text-gray-500">({user.team.name})</span>
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
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              name="drinkType" 
              value={DRINK_TYPES.REGULAR}
              variant="default"
              disabled={isPending || (isMultiMode && selectedUserIds.length === 0)}
              className="flex-1"
            >
              {isPending ? "Beležim..." : 
               isMultiMode ? `Navadno (+${selectedUserIds.length})` : "Navadno (+1)"}
            </Button>
            
            <Button 
              type="submit" 
              name="drinkType" 
              value={DRINK_TYPES.SHOT}
              variant="destructive" 
              disabled={isPending || (isMultiMode && selectedUserIds.length === 0)}
              className="flex-1"
            >
              {isPending ? "Beležim..." : 
               isMultiMode ? `Žganica (+${selectedUserIds.length * 2})` : "Žganica (+2)"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}