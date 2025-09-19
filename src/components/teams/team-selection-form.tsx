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
            <CardTitle>Pridružite se obstoječi ekipi</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={joinFormAction} className="space-y-4">
              <input type="hidden" name="userId" value={currentUserId} />
              
              <div>
                <Select name="teamId" required disabled={isJoinPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izberite ekipo za pridružitev" />
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
                {isJoinPending ? "Pridružujem se ekipi..." : "Pridruži se ekipi"}
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
            Ali
          </span>
        </div>
      </div>

      {/* Create New Team */}
      <Card>
        <CardHeader>
          <CardTitle>Ustvarite novo ekipo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createFormAction} className="space-y-4">
            <input type="hidden" name="userId" value={currentUserId} />
            
            <div>
              <Input 
                id="teamName"
                name="teamName" 
                placeholder="Vnesite ime ekipe" 
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
              {isCreatePending ? "Ustvarjam ekipo..." : "Ustvari in pridruži se ekipi"}
            </Button>
            
            <p className="text-sm ">
              Vaši ekipi bo dodeljena naključna barva
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}