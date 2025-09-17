import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { TeamSelectionForm } from '@/components/teams'

export default async function SelectTeamPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (currentUser.teamId) {
    redirect('/players')
  }
  
  const availableTeams = await getAllTeams()
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Izberite svojo ekipo</h1>
        <p className="text-gray-600">Pridružite se obstoječi ekipi ali ustvarite novo, da začnete tekmovati!</p>
      </div>
      
      <TeamSelectionForm 
        currentUserId={currentUser.id}
        availableTeams={availableTeams}
      />
    </div>
  )
}