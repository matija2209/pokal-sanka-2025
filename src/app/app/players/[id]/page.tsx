export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getUserWithTeamAndDrinksById } from '@/lib/prisma/fetchers'
import { getEventRankingSnapshot } from '@/lib/cache/event-read-models'
import { redirect, notFound } from 'next/navigation'
import { UserStats, UserHistory, UserAchievements } from '@/components/users'
import { getUserRanking, getAllUsersTriviaPointsMap } from '@/lib/utils/calculations'
import { getActiveEvent } from '@/lib/events'


interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  await connection()

  const resolvedParams = await params
  const activeEvent = await getActiveEvent()
  const currentUser = await getCurrentUser(activeEvent?.id)
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  if (!activeEvent) {
    redirect('/')
  }

  const [user, rankingSnapshot] = await Promise.all([
    getUserWithTeamAndDrinksById(resolvedParams.id, activeEvent.id),
    getEventRankingSnapshot(activeEvent.id),
  ])
  
  if (!user) {
    notFound()
  }
  
  // Trivia score integration
  const triviaAvailable = rankingSnapshot.triviaAvailable && activeEvent.isTriviaEnabled
  let triviaPointsMap = new Map<string, number>()
  if (triviaAvailable) {
    triviaPointsMap = getAllUsersTriviaPointsMap(rankingSnapshot.triviaResults)
  }

  const allUsers = rankingSnapshot.users

  const userRank = getUserRanking(user.id, allUsers, triviaPointsMap)
  
  return (
    <div className="w-full max-w-none px-0">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          {user.team && (
            <div 
              className="w-7 h-7 shrink-0 rounded" 
              style={{ backgroundColor: user.team.color }}
            />
          )}
          <h1 className="text-2xl font-bold leading-tight">{user.name}</h1>
          {user.id === currentUser.id && (
            <span className="whitespace-nowrap text-sm font-medium text-blue-600">(Vi)</span>
          )}
        </div>
        <p className="px-0 text-sm text-muted-foreground">
          {user.team ? (
            <>Statistike in uspešnost igralca v ekipi {user.team.name}</>
          ) : (
            'Statistike in uspešnost igralca'
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 w-full">
        <div className="space-y-6">
          <UserStats 
            user={user}
            allUsers={allUsers}
            rank={userRank}
            triviaPointsMap={triviaPointsMap}
          />
          
          <UserAchievements 
            user={user}
            allUsers={allUsers}
            rank={userRank}
          />
        </div>

        <div>
          <UserHistory 
            user={user}
            limit={20}
          />
        </div>
      </div>
    </div>
  )
}
