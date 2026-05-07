import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { UserProfile } from '@/components/users'
import { TeamLogoForm } from '@/components/teams'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moj Profil | Pokal Šanka - Matija Edition',
  description: 'Vaš osebni profil v Pokal Šanka turnirju. Upravljajte svoj račun, nastavitve profila in ekipo.',
  keywords: ['profil', 'nastavitve', 'ekipa', 'uporabnik', 'upravljanje'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Moj Profil - Pokal Šanka',
    description: 'Upravljanje osebnega profila in nastavitev.',
    locale: 'sl_SI'
  }
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }

  const availableTeams = await getAllTeams()
  
  return (
    <div className="w-full max-w-none px-0">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold leading-tight mb-2">Vaš profil</h1>
        <p className="text-sm text-muted-foreground">Upravljajte svoj račun in nastavitve profila.</p>
      </div>
      
      <div className="w-full space-y-6">
        <UserProfile 
          currentUser={currentUser}
          availableTeams={availableTeams}
        />

        <TeamLogoForm currentUser={currentUser} />
      </div>
    </div>
  )
}
