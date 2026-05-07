import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { UserProfile } from '@/components/users'
import { TeamLogoForm } from '@/components/teams'
import type { Metadata } from 'next'
import { getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Moj Profil',
    description:
      'Vaš osebni profil v Pokal Šanka turnirju. Upravljajte svoj račun, nastavitve profila in ekipo.',
    keywords: ['profil', 'nastavitve', 'ekipa', 'uporabnik', 'upravljanje'],
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Moj Profil | ${brand}`,
      description: 'Upravljanje osebnega profila in nastavitev.',
      locale: 'sl_SI',
    },
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
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
          Moj Profil
        </h1>
        <p className="text-muted-foreground">
          Prilagodite svojo izkušnjo in upravljajte nastavitve ekipe.
        </p>
      </div>
      
      <div className="space-y-8">
        <UserProfile 
          currentUser={currentUser}
          availableTeams={availableTeams}
        />

        {currentUser.team && (
          <TeamLogoForm currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}
