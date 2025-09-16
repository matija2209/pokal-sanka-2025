'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { updateUserTeamAction } from '@/app/actions'
import { initialUserActionState } from '@/lib/types/action-states'
import type { UserWithTeam, Team } from '@/lib/prisma/types'

interface UserProfileProps {
  currentUser: UserWithTeam
  availableTeams: Team[]
}

export default function UserProfile({ currentUser, availableTeams }: UserProfileProps) {
  const [state, formAction, isPending] = useActionState(updateUserTeamAction, initialUserActionState)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{currentUser.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Current Team</p>
            {currentUser.team ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: currentUser.team.color }}
                />
                <span className="font-medium">{currentUser.team.name}</span>
              </div>
            ) : (
              <Badge variant="outline">No Team</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Switch Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="userId" value={currentUser.id} />
            
            <div>
              <Select name="teamId" defaultValue={currentUser.teamId || 'no-team'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-team">No Team</SelectItem>
                  {availableTeams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: team.color }}
                        />
                        {team.name}
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
            
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}