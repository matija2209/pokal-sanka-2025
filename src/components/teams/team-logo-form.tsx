'use client'

import { useActionState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateTeamLogoAction } from '@/app/actions'
import { initialTeamActionState } from '@/lib/types/action-states'
import MobileImageInput from '@/components/ui/mobile-image-input'
import TeamLogo from './team-logo'
import type { UserWithTeam } from '@/lib/prisma/types'

interface TeamLogoFormProps {
  currentUser: UserWithTeam
}

export default function TeamLogoForm({ currentUser }: TeamLogoFormProps) {
  const [state, formAction, isPending] = useActionState(updateTeamLogoAction, initialTeamActionState)

  if (!currentUser.team) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo ekipe</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <TeamLogo team={currentUser.team} size="lg" />
            <MobileImageInput
              name="team-logo"
              currentImageUrl={currentUser.team.logo_image_url}
              label="Logo ekipe"
            />
          </div>

          {state.message && !state.success && (
            <p className="text-red-500 text-sm">{state.message}</p>
          )}

          {state.message && state.success && (
            <p className="text-green-500 text-sm">{state.message}</p>
          )}
          
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Posodabljam..." : "Posodobi logo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}