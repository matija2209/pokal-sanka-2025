'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { logDrinkAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
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
  const [state, formAction, isPending] = useActionState(logDrinkAction, initialDrinkLogActionState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a Drink</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label>Player</Label>
            <Select name="userId" defaultValue={currentUserId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
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
          </div>

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
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Logging..." : "Regular (+1)"}
            </Button>
            
            <Button 
              type="submit" 
              name="drinkType" 
              value={DRINK_TYPES.SHOT}
              variant="destructive" 
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Logging..." : "Shot (+2)"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}