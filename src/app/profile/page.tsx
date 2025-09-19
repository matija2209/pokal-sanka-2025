import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams, getAllUsersWithTeamAndDrinks, getUserWithTeamAndDrinksById, getRecentDrinkLogs } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { UserProfile, UserStats, UserHistory, UserAchievements, Leaderboard } from '@/components/users'
import { TeamLogoForm } from '@/components/teams'
import { RecentActivity } from '@/components/drinks'
import { CreatePostForm, TimelineDisplay } from '@/components/timeline'
import { getUserRanking, sortUsersByScore } from '@/lib/utils/calculations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moj Profil | Pokal Šanka - Matija Edition',
  description: 'Vaš osebni profil v Pokal Šanka turnirju. Poglejte svoje statistike, dosežke, zgodovino pijače in upravljajte svojo ekipo.',
  keywords: ['profil', 'statistike', 'dosežki', 'zgodovina', 'ekipa', 'uporabnik'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Moj Profil - Pokal Šanka',
    description: 'Osebni profil, statistike in dosežki v turnirju.',
    locale: 'sl_SI'
  }
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  const [availableTeams, allUsers, currentUserWithDrinks, recentDrinks] = await Promise.all([
    getAllTeams(),
    getAllUsersWithTeamAndDrinks(),
    getUserWithTeamAndDrinksById(currentUser.id),
    getRecentDrinkLogs(20)
  ])
  
  const userRank = getUserRanking(currentUser.id, allUsers)
  const sortedUsers = sortUsersByScore(allUsers)
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Vaš profil</h1>
          <p className="">Upravljajte svoj račun in si oglejte statistične podatke o vaši učinkovitosti.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Profile Management */}
            <UserProfile 
              currentUser={currentUser}
              availableTeams={availableTeams}
            />

            {/* Team Logo Upload */}
            <TeamLogoForm currentUser={currentUser} />
            
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
            
            {/* Create Post */}
            <CreatePostForm currentUser={currentUser} />

            {/* Timeline */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Nedavne objave</h2>
              <TimelineDisplay limit={10} />
            </div>

            {/* Recent Activity */}
            <RecentActivity 
              recentDrinks={recentDrinks}
              limit={8}
            />

            {/* Leaderboard */}
            <Leaderboard 
              users={sortedUsers}
              currentUserId={currentUser.id}
              teamFilter={currentUser.teamId}
            />

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