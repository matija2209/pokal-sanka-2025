import { getCurrentUser } from '@/lib/utils/cookies'
import { getUserWithTeamAndDrinksById, getAllUsersWithTeamAndDrinks, getAllTriviaResults } from '@/lib/prisma/fetchers'
import { redirect, notFound } from 'next/navigation'
import { UserStats, UserHistory, UserAchievements } from '@/components/users'
import { getUserRanking, getAllUsersTriviaPointsMap } from '@/lib/utils/calculations'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'

export const dynamic = 'force-dynamic'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const resolvedParams = await params
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  const user = await getUserWithTeamAndDrinksById(resolvedParams.id)
  
  if (!user) {
    notFound()
  }
  
  const allUsers = await getAllUsersWithTeamAndDrinks()

  // Trivia score integration
  const triviaAvailable = await isTriviaAvailable()
  let triviaPointsMap = new Map<string, number>()
  if (triviaAvailable) {
    const triviaResults = await getAllTriviaResults()
    triviaPointsMap = getAllUsersTriviaPointsMap(triviaResults)
  }

  const userRank = getUserRanking(user.id, allUsers, triviaPointsMap)
  
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          {user.team && (
            <div 
              className="w-8 h-8 rounded" 
              style={{ backgroundColor: user.team.color }}
            />
          )}
          <h1 className="text-3xl font-bold">{user.name}</h1>
          {user.id === currentUser.id && (
            <span className="text-lg text-blue-600 font-medium">(Vi)</span>
          )}
        </div>
        <p className="">
          {user.team ? (
            <>Statistike in uspešnost igralca v ekipi {user.team.name}</>
          ) : (
            'Statistike in uspešnost igralca'
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="space-y-8">
          <UserStats 
            user={user}
            allUsers={allUsers}
            rank={userRank}
          />
          
          <UserAchievements 
            user={user}
            allUsers={allUsers}
            rank={userRank}
          />
        </div>
        
        {/* Right Column */}
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
