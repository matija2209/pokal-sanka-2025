'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Users } from 'lucide-react'
import { CreateUserForm, SelectExistingUserForm } from '@/components/users'
import type { ExistingPlayerOption } from '@/components/users/select-existing-user-form'

interface EntryScreenProps {
  knownPersonName?: string | null
  activeEventName?: string | null
  existingPlayers?: ExistingPlayerOption[]
  returnTo?: string
}

type ViewMode = 'selection' | 'create' | 'join' | 'existing'

export default function EntryScreen({
  knownPersonName,
  activeEventName,
  existingPlayers = [],
  returnTo,
}: EntryScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(knownPersonName ? 'join' : 'selection')

  if (viewMode === 'create') {
    return <CreateUserForm onBack={() => setViewMode('selection')} returnTo={returnTo} />
  }

  if (viewMode === 'join' && knownPersonName) {
    return (
      <CreateUserForm
        knownPersonName={knownPersonName}
        activeEventName={activeEventName}
        returnTo={returnTo}
        onBack={() => setViewMode('selection')}
      />
    )
  }

  if (viewMode === 'existing') {
    return (
      <SelectExistingUserForm
        players={existingPlayers}
        returnTo={returnTo}
        onBack={() => setViewMode('selection')}
      />
    )
  }

  return (
    <div className="w-full space-y-4">
      {knownPersonName && (
        <Card className="w-full border-blue-200 bg-blue-50/90 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setViewMode('join')}>
          <CardContent className="w-full p-4 sm:p-6">
            <div className="flex w-full items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-blue-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">Nadaljuj kot</h3>
                <p className="mt-1 inline-flex max-w-full rounded-full bg-blue-700 px-3 py-1 text-base font-bold text-white sm:text-lg">
                  <span className="truncate">{knownPersonName}</span>
                </p>
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

      {/* Players Assigned to Event Option */}
      {existingPlayers.length > 0 && (
        <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer border-emerald-500/30 bg-card hover:border-emerald-500/60"
              onClick={() => setViewMode('existing')}>
          <CardContent className="w-full p-4 sm:p-6">
            <div className="flex w-full items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">Sem že na seznamu / Obstoječ igralec</h3>
                <p className="text-sm text-muted-foreground">
                  Izberite svoje ime ({existingPlayers.length} igralcev v dogodku) in vstopite
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Account Option */}
      <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setViewMode('create')}>
        <CardContent className="w-full p-4 sm:p-6">
          <div className="flex w-full items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold">{knownPersonName ? 'Uporabi drugo osebo' : 'Ustvari nov račun'}</h3>
              <p className="text-sm text-muted-foreground">
                {knownPersonName ? 'Ustvarite ločeno osebo za ta dogodek' : 'Nov igralec v turnirju'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Direct buttons for smaller screens */}
      <div className="flex flex-col gap-3 sm:hidden">
        {existingPlayers.length > 0 && (
          <Button
            onClick={() => setViewMode('existing')}
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          >
            <Users className="h-5 w-5 text-emerald-600" />
            Sem na seznamu ({existingPlayers.length})
          </Button>
        )}
        <Button 
          onClick={() => setViewMode('create')}
          size="lg"
          className="w-full justify-start gap-3"
        >
          <UserPlus className="h-5 w-5" />
          {knownPersonName ? 'Uporabi drugo osebo' : 'Ustvari nov račun'}
        </Button>
      </div>
    </div>
  )
}
