import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeamsWithUsersAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { TeamLeaderboard } from '@/components/teams'

export default async function TeamsPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/select-team')
  }
  
  const allTeams = await getAllTeamsWithUsersAndDrinks()
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Lestvica ekip</h1>
          <p className="text-gray-600">Poglejte, kako se vse ekipe odrežajo v turnirju!</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <TeamLeaderboard 
            teams={allTeams}
            currentUserTeamId={currentUser.teamId}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}