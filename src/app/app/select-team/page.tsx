import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { TeamSelectionForm } from '@/components/teams'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Izbira Ekipe | Pokal Šanka - Matija Edition',
  description: 'Izberite svojo ekipo za sodelovanje v Pokal Šanka turnirju. Pridružite se obstoječi ekipi ali ustvarite novo.',
  keywords: ['izbira ekipe', 'ekipa', 'turnir', 'pridružitev', 'nova ekipa'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Izbira Ekipe - Pokal Šanka',
    description: 'Izberite ali ustvarite svojo ekipo za turnir.',
    locale: 'sl_SI'
  }
}

export const dynamic = 'force-dynamic'

export default async function SelectTeamPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (currentUser.teamId) {
    redirect('/app/players')
  }
  
  const availableTeams = await getAllTeams()
  
  return (
    <div className="w-full max-w-none px-0 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold leading-tight mb-2">Izberite svojo ekipo</h1>
        <p className="text-sm text-muted-foreground">Pridružite se obstoječi ekipi ali ustvarite novo, da začnete tekmovati!</p>
      </div>
      
      <TeamSelectionForm 
        currentUserId={currentUser.id}
        availableTeams={availableTeams}
      />
    </div>
  )
}
