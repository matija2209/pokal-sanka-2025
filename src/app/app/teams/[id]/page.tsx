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
    <div className="w-full max-w-none px-0">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div 
            className="w-7 h-7 shrink-0 rounded" 
            style={{ backgroundColor: team.color }}
          />
          <h1 className="text-2xl font-bold leading-tight">{team.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">Statistike ekipe in uspešnost članov</p>
      </div>
      
      <div className="w-full">
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
