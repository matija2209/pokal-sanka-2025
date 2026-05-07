import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeamsWithUsersAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { TeamLeaderboard } from '@/components/teams'
import type { Metadata } from 'next'
import { getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Ekipe',
    description:
      'Lestvica ekip v Pokal Šanka turnirju. Poglejte statistike svoje ekipe in tekmovalnih ekip.',
    keywords: ['ekipe', 'lestvica', 'statistike', 'turnir', 'tekmovanje'],
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Ekipe | ${brand}`,
      description: 'Lestvica ekip in statistike tekmovalnih skupin.',
      locale: 'sl_SI',
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  const allTeams = await getAllTeamsWithUsersAndDrinks()
  
  return (
    <div className="w-full max-w-none px-0">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold leading-tight mb-2">Lestvica ekip</h1>
        <p className="text-sm text-muted-foreground">Poglejte, kako se vse ekipe odrežajo v turnirju!</p>
      </div>
      
      <div className="w-full">
        <TeamLeaderboard 
          teams={allTeams}
          currentUserTeamId={currentUser.teamId}
        />
      </div>
    </div>
  )
}
