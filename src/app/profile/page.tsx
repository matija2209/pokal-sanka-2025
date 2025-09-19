import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
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

export default async function ProfilePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  const availableTeams = await getAllTeams()
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Vaš profil</h1>
          <p className="">Upravljajte svoj račun in nastavitve profila.</p>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Management */}
          <UserProfile 
            currentUser={currentUser}
            availableTeams={availableTeams}
          />

          {/* Team Logo Upload */}
          <TeamLogoForm currentUser={currentUser} />
        </div>
      </div>
    </DashboardLayout>
  )
}