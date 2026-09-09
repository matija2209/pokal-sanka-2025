export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeamsWithUsers } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { TeamSelectionForm, RandomTeamSpinner } from '@/components/teams'
import type { Metadata } from 'next'
import { getActiveEvent, getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Izbira Ekipe',
    description:
      'Izberite svojo ekipo za sodelovanje v Pokal Šanka turnirju. Pridružite se obstoječi ekipi ali ustvarite novo.',
    keywords: ['izbira ekipe', 'ekipa', 'turnir', 'pridružitev', 'nova ekipa'],
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Izbira Ekipe | ${brand}`,
      description: 'Izberite ali ustvarite svojo ekipo za turnir.',
      locale: 'sl_SI',
    },
  }
}


export default async function SelectTeamPage() {
  await connection()

  const currentEvent = await getActiveEvent()
  const currentUser = await getCurrentUser(currentEvent?.id)
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (currentUser.teamId) {
    redirect('/app/feed')
  }
  
  const availableTeams = await getAllTeamsWithUsers()
  const isRandomTeams = Boolean(currentEvent?.isRandomTeams)

  if (isRandomTeams) {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4">
        <RandomTeamSpinner
          currentUserId={currentUser.id}
          availableTeams={availableTeams}
        />
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Izbira ekipe</h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Pozdravljeni, <span className="font-semibold text-foreground">{currentUser.name}</span>! Za sodelovanje na turnirju se pridružite obstoječi ekipi ali ustvarite novo.
        </p>
      </div>
      
      <TeamSelectionForm 
        currentUserId={currentUser.id}
        currentUserName={currentUser.name}
        availableTeams={availableTeams}
        redirectUrl="/app/feed"
      />
    </div>
  )
}


