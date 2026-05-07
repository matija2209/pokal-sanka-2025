'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { updateUserProfileAction } from '@/app/actions'
import { initialUserActionState } from '@/lib/types/action-states'
import MobileImageInput from '@/components/ui/mobile-image-input'
import UserAvatar from './user-avatar'
import type { UserWithTeam, Team } from '@/lib/prisma/types'

interface UserProfileProps {
  currentUser: UserWithTeam
  availableTeams: Team[]
}

export default function UserProfile({ currentUser, availableTeams }: UserProfileProps) {
  const [profileState, profileFormAction, profileIsPending] = useActionState(updateUserProfileAction, initialUserActionState)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Uredite profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={profileFormAction} className="space-y-6">
            <div className="flex flex-col items-center pb-4">
              <MobileImageInput
                name="profile-image"
                currentImageUrl={currentUser.profile_image_url}
                label="Slika profila"
                variant="avatar"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">
                  Ime in priimek
                </label>
                <Input
                  name="name"
                  defaultValue={currentUser.name}
                  required
                  minLength={2}
                  className="h-11 shadow-sm"
                  placeholder="Vnesite vaše ime"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">
                  Vaša ekipa
                </label>
                <Select name="teamId" defaultValue={currentUser.teamId || 'none'}>
                  <SelectTrigger className="h-11 shadow-sm">
                    <SelectValue placeholder="Izberite ekipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Brez ekipe</SelectItem>
                    {availableTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {profileState.message && !profileState.success && (
              <p className="text-red-500 text-sm">{profileState.message}</p>
            )}

            {profileState.message && profileState.success && (
              <p className="text-green-500 text-sm">{profileState.message}</p>
            )}
            
            <Button type="submit" disabled={profileIsPending} className="w-full">
              {profileIsPending ? "Posodabljam..." : "Posodobi profil"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}