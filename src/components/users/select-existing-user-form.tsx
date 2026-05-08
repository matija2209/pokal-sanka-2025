'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { selectExistingPersonAction, selectExistingUserAction } from '@/app/actions'
import { initialUserActionState } from '@/lib/types/action-states'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface ExistingPersonOption {
  id: string
  name: string
  teamName?: string | null
  teamColor?: string | null
}

interface SelectExistingUserFormProps {
  users?: UserWithTeamAndDrinks[]
  people?: ExistingPersonOption[]
  onBack: () => void
  mode?: 'users' | 'people'
  returnTo?: string
}

export default function SelectExistingUserForm({
  users = [],
  people = [],
  onBack,
  mode = 'users',
  returnTo,
}: SelectExistingUserFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    mode === 'people' ? selectExistingPersonAction : selectExistingUserAction,
    initialUserActionState
  )

  useEffect(() => {
    if (state.success && state.data?.redirectUrl) {
      router.push(state.data.redirectUrl)
    }
  }, [state.success, state.data?.redirectUrl, router])

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'people' ? 'Kdo ste?' : 'Izberite svoj račun'}</CardTitle>
        <p className="text-sm ">
          {mode === 'people'
            ? 'Najprej izberite svojo osebo, nato se lahko pridružite trenutnemu dogodku.'
            : 'Kliknite na svoje ime za vstop v turnir'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.message && !state.success && (
          <p className="text-red-500 text-sm">{state.message}</p>
        )}

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {mode === 'people' ? people.map((person) => (
            <form key={person.id} action={formAction}>
              <input type="hidden" name="personId" value={person.id} />
              {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
              <Button
                type="submit"
                variant="outline"
                disabled={isPending}
                className="w-full p-4 h-auto justify-start text-left hover:"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold ">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{person.name}</span>
                      {person.teamName && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: person.teamColor || '#cbd5e1' }}
                          />
                          <Badge variant="secondary" className="text-xs">
                            {person.teamName}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-xs ">
                      Izberite osebo in jo po potrebi pridružite trenutnemu dogodku
                    </p>
                  </div>
                </div>
              </Button>
            </form>
          )) : users.map((user) => (
            <form key={user.id} action={formAction}>
              <input type="hidden" name="userId" value={user.id} />
              {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
              <Button
                type="submit"
                variant="outline"
                disabled={isPending}
                className="w-full p-4 h-auto justify-start text-left hover:"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold ">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      {user.team && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: user.team.color }}
                          />
                          <Badge variant="secondary" className="text-xs">
                            {user.team.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {!user.team && (
                      <p className="text-xs ">Potrebna izbira ekipe</p>
                    )}
                  </div>
                </div>
              </Button>
            </form>
          ))}
        </div>

        {(mode === 'people' ? people.length === 0 : users.length === 0) && (
          <p className="text-center  py-4">
            Ni še obstoječih računov
          </p>
        )}

        <div className="pt-4 border-t">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBack}
            className="w-full"
          >
            ← Nazaj na ustvarjanje novega računa
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
