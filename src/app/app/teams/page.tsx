export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getEventRankingSnapshot } from '@/lib/cache/event-read-models'
import { redirect } from 'next/navigation'
import { TeamLeaderboard } from '@/components/teams'
import type { Metadata } from 'next'
import { getActiveEvent, getSiteBrandParts } from '@/lib/events'

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


export default async function TeamsPage() {
  await connection()

  const currentEvent = await getActiveEvent()
  const currentUser = await getCurrentUser(currentEvent?.id)
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  if (!currentEvent) {
    redirect('/')
  }

  const { teams: allTeams } = await getEventRankingSnapshot(currentEvent.id)
  
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
