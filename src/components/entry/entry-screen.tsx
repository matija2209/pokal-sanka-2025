'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Users } from 'lucide-react'
import { CreateUserForm, SelectExistingUserForm } from '@/components/users'
import type { UserWithTeamAndDrinks } from '@/lib/prisma/types'

interface EntryScreenProps {
  existingUsers: UserWithTeamAndDrinks[]
}

type ViewMode = 'selection' | 'create' | 'existing'

export default function EntryScreen({ existingUsers }: EntryScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('selection')

  if (viewMode === 'create') {
    return <CreateUserForm onBack={() => setViewMode('selection')} />
  }

  if (viewMode === 'existing') {
    return (
      <SelectExistingUserForm 
        users={existingUsers} 
        onBack={() => setViewMode('selection')} 
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Create New Account Option */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setViewMode('create')}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 " />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Ustvari nov račun</h3>
              <p className="text-sm ">
                Nov igralec v turnirju
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select Existing Account Option */}
      {existingUsers.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setViewMode('existing')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Izberite obstoječ račun</h3>
                <p className="text-sm ">
                  Že sodelujem v turnirju ({existingUsers.length} {existingUsers.length === 1 ? 'igralec' : 'igralcev'})
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
          Ustvari nov račun
        </Button>
        
        {existingUsers.length > 0 && (
          <Button 
            onClick={() => setViewMode('existing')}
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3"
          >
            <Users className="h-5 w-5" />
            Izberite obstoječ račun ({existingUsers.length})
          </Button>
        )}
      </div>
    </div>
  )
}