import { getCurrentUser } from '@/lib/utils/cookies'
import { getTeamWithUsersById, getAllTeamsWithUsersAndDrinks } from '@/lib/prisma/fetchers'
import { redirect, notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { TeamStats } from '@/components/teams'
import { sortTeamsByScore } from '@/lib/utils/calculations'

interface TeamDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const resolvedParams = await params
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/select-team')
  }
  
  const team = await getTeamWithUsersById(resolvedParams.id)
  
  if (!team) {
    notFound()
  }
  
  // Convert to full team data for calculations
  const fullTeam = {
    ...team,
    users: team.users.map(user => ({
      ...user,
      drinkLogs: [] // We'll need to fetch this separately if needed
    }))
  }
  
  const allTeams = await getAllTeamsWithUsersAndDrinks()
  const sortedTeams = sortTeamsByScore(allTeams)
  const teamRank = sortedTeams.findIndex(t => t.id === team.id) + 1
  
  const teamWithDrinks = allTeams.find(t => t.id === team.id)
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div 
              className="w-8 h-8 rounded" 
              style={{ backgroundColor: team.color }}
            />
            <h1 className="text-3xl font-bold">{team.name}</h1>
          </div>
          <p className="text-gray-600">Team statistics and member performance</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {teamWithDrinks && (
            <TeamStats 
              team={teamWithDrinks}
              allTeams={allTeams}
              rank={teamRank}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}