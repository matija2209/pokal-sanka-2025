import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams, getAllUsersWithTeamAndDrinks, getUserWithTeamAndDrinksById } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { UserProfile, UserStats, UserHistory, UserAchievements } from '@/components/users'
import { getUserRanking } from '@/lib/utils/calculations'

export default async function ProfilePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  const availableTeams = await getAllTeams()
  const allUsers = await getAllUsersWithTeamAndDrinks()
  const currentUserWithDrinks = await getUserWithTeamAndDrinksById(currentUser.id)
  const userRank = getUserRanking(currentUser.id, allUsers)
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Vaš profil</h1>
          <p className="text-gray-600">Upravljajte svoj račun in si oglejte statistične podatke o vaši učinkovitosti.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Profile Management */}
            <UserProfile 
              currentUser={currentUser}
              availableTeams={availableTeams}
            />
            
            {/* User Achievements */}
            {currentUserWithDrinks && (
              <UserAchievements 
                user={currentUserWithDrinks}
                allUsers={allUsers}
                rank={userRank}
              />
            )}
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* User Statistics */}
            {currentUserWithDrinks && (
              <UserStats 
                user={currentUserWithDrinks}
                allUsers={allUsers}
                rank={userRank}
              />
            )}
            
            {/* Drink History */}
            {currentUserWithDrinks && (
              <UserHistory 
                user={currentUserWithDrinks}
                limit={15}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}