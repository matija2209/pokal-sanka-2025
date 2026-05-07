import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DrinkLogForm } from '@/components/drinks'
import { CreatePostForm } from '@/components/timeline'
import type { Metadata } from 'next'
import { getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Igralci',
    description:
      'Glavna nadzorna plošča turnirja. Beležite pijačo, spremljajte lestvico in tekmujte s prijatelji v Pokal Šanka turnirju.',
    keywords: ['igralci', 'lestvica', 'turnir', 'pitje', 'točke', 'tekmovanje'],
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Igralci | ${brand}`,
      description: 'Glavna nadzorna plošča turnirja za beleženje pijače in spremljanje lestvice.',
      locale: 'sl_SI',
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function PlayersPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  const allUsers = await getAllUsersWithTeamAndDrinks()
  
  const usersForDropdown = allUsers.map(user => ({
    id: user.id,
    name: user.name,
    team: user.team ? { name: user.team.name, color: user.team.color } : null
  }))
  
  return (
    <div className="w-full max-w-none px-0">
      <div className="space-y-6 w-full">
        <DrinkLogForm 
          currentUserId={currentUser.id}
          allUsers={usersForDropdown}
        />
        
        <CreatePostForm currentUser={currentUser} />
      </div>
    </div>
  )
}
