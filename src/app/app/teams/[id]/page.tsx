import { getCurrentUser } from '@/lib/utils/cookies'
import { getTeamWithUsersById, getAllTeamsWithUsersAndDrinks } from '@/lib/prisma/fetchers'
import { redirect, notFound } from 'next/navigation'
import { TeamStats } from '@/components/teams'
import { sortTeamsByScore } from '@/lib/utils/calculations'

export const dynamic = 'force-dynamic'

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
    redirect('/app/select-team')
  }

  const team = await getTeamWithUsersById(resolvedParams.id)
  
  if (!team) {
    notFound()
  }
  
  const allTeams = await getAllTeamsWithUsersAndDrinks()
  const sortedTeams = sortTeamsByScore(allTeams)
  const teamRank = sortedTeams.findIndex(t => t.id === team.id) + 1
  
  const teamWithDrinks = allTeams.find(t => t.id === team.id)
  
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div 
            className="w-8 h-8 rounded" 
            style={{ backgroundColor: team.color }}
          />
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
        <p className="">Statistike ekipe in uspešnost članov</p>
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
  )
}
