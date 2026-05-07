'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Users } from 'lucide-react'
import { CreateUserForm, SelectExistingUserForm } from '@/components/users'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface ExistingPersonOption {
  id: string
  name: string
  teamName?: string | null
  teamColor?: string | null
}

interface EntryScreenProps {
  existingUsers: UserWithTeamAndDrinks[]
  existingPeople?: ExistingPersonOption[]
  knownPersonName?: string | null
  activeEventName?: string | null
}

type ViewMode = 'selection' | 'create' | 'existing' | 'join'

export default function EntryScreen({
  existingUsers,
  existingPeople = [],
  knownPersonName,
  activeEventName
}: EntryScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(knownPersonName ? 'join' : 'selection')

  if (viewMode === 'create') {
    return <CreateUserForm onBack={() => setViewMode('selection')} />
  }

  if (viewMode === 'join' && knownPersonName) {
    return (
      <CreateUserForm
        knownPersonName={knownPersonName}
        activeEventName={activeEventName}
        onBack={() => setViewMode('selection')}
      />
    )
  }

  if (viewMode === 'existing') {
    return (
      <SelectExistingUserForm 
        users={existingUsers}
        people={existingPeople}
        mode={existingPeople.length > 0 ? 'people' : 'users'}
        onBack={() => setViewMode('selection')} 
      />
    )
  }

  return (
    <div className="space-y-4">
      {knownPersonName && (
        <Card className="border-blue-200 bg-blue-50/90 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setViewMode('join')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Nadaljuj kot {knownPersonName}</h3>
                <p className="text-sm text-slate-700">
                  {activeEventName
                    ? `Vaša oseba je prepoznana, vendar se dogodku ${activeEventName} še niste pridružili.`
                    : 'Vaša oseba je prepoznana, vendar se temu dogodku še niste pridružili.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Account Option */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setViewMode('create')}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 " />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{knownPersonName ? 'Uporabi drugo osebo' : 'Ustvari nov račun'}</h3>
              <p className="text-sm ">
                {knownPersonName ? 'Ustvarite ločeno osebo za ta dogodek' : 'Nov igralec v turnirju'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select Existing Account Option */}
      {(existingPeople.length > 0 || existingUsers.length > 0) && (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setViewMode('existing')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {existingPeople.length > 0 ? 'Izberite, kdo ste' : 'Izberite obstoječ račun'}
                </h3>
                <p className="text-sm ">
                  {existingPeople.length > 0
                    ? `Prepoznamo ${existingPeople.length} ${existingPeople.length === 1 ? 'osebo' : 'oseb'} iz prejšnjih dogodkov`
                    : `Že sodelujem v turnirju (${existingUsers.length} ${existingUsers.length === 1 ? 'igralec' : 'igralcev'})`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Direct buttons for smaller screens */}
      <div className="flex flex-col gap-3 sm:hidden">
        <Button 
          onClick={() => setViewMode('create')}
          size="lg"
          className="w-full justify-start gap-3"
        >
          <UserPlus className="h-5 w-5" />
          {knownPersonName ? 'Uporabi drugo osebo' : 'Ustvari nov račun'}
        </Button>
        
        {(existingPeople.length > 0 || existingUsers.length > 0) && (
          <Button 
            onClick={() => setViewMode('existing')}
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3"
          >
            <Users className="h-5 w-5" />
            {existingPeople.length > 0
              ? `Izberite, kdo ste (${existingPeople.length})`
              : `Izberite obstoječ račun (${existingUsers.length})`}
          </Button>
        )}
      </div>
    </div>
  )
}
