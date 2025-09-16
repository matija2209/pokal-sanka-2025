'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { joinTeamAction, createTeamAction } from '@/app/actions'
import { initialTeamActionState } from '@/lib/types/action-states'
import type { Team } from '@/lib/prisma/types'

interface TeamSelectionFormProps {
  currentUserId: string
  availableTeams: Team[]
  redirectUrl?: string
}

export default function TeamSelectionForm({ 
  currentUserId, 
  availableTeams, 
  redirectUrl = '/players' 
}: TeamSelectionFormProps) {
  const router = useRouter()
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

  return (
    <div className="space-y-8">
      {/* Join Existing Team */}
      {availableTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Join Existing Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={joinFormAction} className="space-y-4">
              <input type="hidden" name="userId" value={currentUserId} />
              
              <div>
                <Label>Select Team</Label>
                <Select name="teamId" required disabled={isJoinPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team to join" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {joinState.message && !joinState.success && (
                <p className="text-red-500 text-sm">{joinState.message}</p>
              )}

              {joinState.message && joinState.success && (
                <p className="text-green-500 text-sm">{joinState.message}</p>
              )}
              
              <Button type="submit" disabled={isJoinPending}>
                {isJoinPending ? "Joining Team..." : "Join Team"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or
          </span>
        </div>
      </div>

      {/* Create New Team */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createFormAction} className="space-y-4">
            <input type="hidden" name="userId" value={currentUserId} />
            
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input 
                id="teamName"
                name="teamName" 
                placeholder="Enter team name" 
                required 
                disabled={isCreatePending}
              />
              {createState.errors?.teamName && (
                <p className="text-red-500 text-sm mt-1">{createState.errors.teamName[0]}</p>
              )}
            </div>

            {createState.message && !createState.success && (
              <p className="text-red-500 text-sm">{createState.message}</p>
            )}

            {createState.message && createState.success && (
              <p className="text-green-500 text-sm">{createState.message}</p>
            )}
            
            <Button type="submit" disabled={isCreatePending}>
              {isCreatePending ? "Creating Team..." : "Create & Join Team"}
            </Button>
            
            <p className="text-sm text-gray-500">
              A random color will be assigned to your team
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}