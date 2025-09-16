import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { PlayerGrid } from '@/components/users'
import { sortUsersByScore } from '@/lib/utils/calculations'

export default async function QuickLogPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/select-team')
  }
  
  const allUsers = await getAllUsersWithTeamAndDrinks()
  const sortedUsers = sortUsersByScore(allUsers)
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Quick Drink Logging</h1>
          <p className="text-gray-600">Select a player to quickly log their drink</p>
        </div>
        
        <PlayerGrid 
          users={sortedUsers}
          currentUserId={currentUser.id}
        />
      </div>
    </DashboardLayout>
  )
}