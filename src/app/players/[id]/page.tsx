import { getCurrentUser } from '@/lib/utils/cookies'
import { getUserWithTeamAndDrinksById, getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect, notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { UserStats, UserHistory, UserAchievements } from '@/components/users'
import { sortUsersByScore, getUserRanking } from '@/lib/utils/calculations'

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
    redirect('/select-team')
  }
  
  const user = await getUserWithTeamAndDrinksById(resolvedParams.id)
  
  if (!user) {
    notFound()
  }
  
  const allUsers = await getAllUsersWithTeamAndDrinks()
  const userRank = getUserRanking(user.id, allUsers)
  
  return (
    <DashboardLayout currentUser={currentUser}>
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
              <span className="text-lg text-blue-600 font-medium">(You)</span>
            )}
          </div>
          <p className="text-gray-600">
            {user.team ? (
              <>Player statistics and performance in {user.team.name}</>
            ) : (
              'Player statistics and performance'
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
    </DashboardLayout>
  )
}