export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getTeamWithUsersById } from '@/lib/prisma/fetchers'
import { getEventRankingSnapshot } from '@/lib/cache/event-read-models'
import { redirect, notFound } from 'next/navigation'
import { TeamStats } from '@/components/teams'
import { sortTeamsByScore } from '@/lib/utils/calculations'
import { getActiveEvent } from '@/lib/events'
import { Container } from '@/components/layout/container'


interface TeamDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  await connection()

  const resolvedParams = await params
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

  const [team, rankingSnapshot] = await Promise.all([
    getTeamWithUsersById(resolvedParams.id, currentEvent.id),
    getEventRankingSnapshot(currentEvent.id),
  ])
  
  if (!team) {
    notFound()
  }
  
  const allTeams = rankingSnapshot.teams
  const sortedTeams = sortTeamsByScore(allTeams)
  const teamRank = sortedTeams.findIndex(t => t.id === team.id) + 1
  
  const teamWithDrinks = allTeams.find(t => t.id === team.id)
  
  return (
    <Container size="mobile" className="px-0">
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
    </Container>
  )
}
