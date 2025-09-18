import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { DrinkLogForm } from '@/components/drinks'
import { CreatePostForm } from '@/components/timeline'
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
  
  const allUsers = await getAllUsersWithTeamAndDrinks()
  
  const usersForDropdown = allUsers.map(user => ({
    id: user.id,
    name: user.name,
    team: user.team ? { name: user.team.name, color: user.team.color } : null
  }))
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Glavni interakcijski center</h1>
          <p className="text-gray-600">Beležite pijačo in delite svoje izkušnje!</p>
        </div>
        
        <div className="space-y-8 max-w-md mx-auto">
          <DrinkLogForm 
            currentUserId={currentUser.id}
            allUsers={usersForDropdown}
          />
          
          <CreatePostForm currentUser={currentUser} />
        </div>
      </div>
    </DashboardLayout>
  )
}