import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks, getRecentDrinkLogs } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { DrinkLogForm, RecentActivity } from '@/components/drinks'
import { Leaderboard } from '@/components/users'
import { sortUsersByScore } from '@/lib/utils/calculations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Igralci | Pokal Šanka - Matija Edition',
  description: 'Glavna nadzorna plošča turnirja. Beležite pijačo, spremljajte lestvico in tekmujte s prijatelji v Pokal Šanka turnirju.',
  keywords: ['igralci', 'lestvica', 'turnir', 'pitje', 'točke', 'tekmovanje'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Igralci - Pokal Šanka',
    description: 'Glavna nadzorna plošča turnirja za beleženje pijače in spremljanje lestvice.',
    locale: 'sl_SI'
  }
}

export default async function PlayersPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/select-team')
  }
  
  const [allUsers, recentDrinks] = await Promise.all([
    getAllUsersWithTeamAndDrinks(),
    getRecentDrinkLogs(20)
  ])
  
  const sortedUsers = sortUsersByScore(allUsers)
  
  const usersForDropdown = allUsers.map(user => ({
    id: user.id,
    name: user.name,
    team: user.team ? { name: user.team.name, color: user.team.color } : null
  }))
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Nadzorna plošča igralcev</h1>
          <p className="text-gray-600">Sledite svojemu pitju in tekmujte z drugimi igralci!</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Drink Logging Form */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <DrinkLogForm 
                currentUserId={currentUser.id}
                allUsers={usersForDropdown}
              />
              
              {/* Recent Activity */}
              <RecentActivity 
                recentDrinks={recentDrinks}
                limit={8}
              />
            </div>
          </div>
          
          {/* Enhanced Leaderboard */}
          <div className="lg:col-span-3">
            <Leaderboard 
              users={sortedUsers}
              currentUserId={currentUser.id}
              teamFilter={currentUser.teamId}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}