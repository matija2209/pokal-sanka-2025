import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams, getAllUsersWithTeamAndDrinks, getUserWithTeamAndDrinksById, getRecentDrinkLogs, getRecentCommentaries } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { UserHistory, Leaderboard } from '@/components/users'
import { RecentActivity } from '@/components/drinks'
import { CommentaryDisplay } from '@/components/commentary'
import { TimelineDisplay } from '@/components/timeline'
import { getUserRanking, sortUsersByScore } from '@/lib/utils/calculations'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Statistike | Pokal Šanka - Matija Edition',
  description: 'Statistike, lestvice in dosežki v Pokal Šanka turnirju. Poglejte svoje dosežke, lestvico igralcev in nedavno aktivnost.',
  keywords: ['statistike', 'lestvica', 'dosežki', 'aktivnost', 'turnir'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Statistike - Pokal Šanka',
    description: 'Statistike, lestvice in dosežki v turnirju.',
    locale: 'sl_SI'
  }
}

export default async function StatsPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  const [allUsers, currentUserWithDrinks, recentDrinks, recentCommentaries] = await Promise.all([
    getAllUsersWithTeamAndDrinks(),
    getUserWithTeamAndDrinksById(currentUser.id),
    getRecentDrinkLogs(20),
    getRecentCommentaries(15)
  ])
  
  const userRank = getUserRanking(currentUser.id, allUsers)
  const sortedUsers = sortUsersByScore(allUsers)
  
  return (
    <DashboardLayout currentUser={currentUser}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Statistike in Lestvice</h1>
          <p className="">Poglejte svojo uvrstitev, dosežke in sledite aktivnosti turnirja.</p>
        </div>
        
        <div className="space-y-6">
          {/* Leaderboard */}
          <Leaderboard 
            users={sortedUsers}
            currentUserId={currentUser.id}
            teamFilter={currentUser.teamId}
          />

          {/* Commentary Section */}
          <CommentaryDisplay 
            commentaries={recentCommentaries}
            limit={8}
            showTitle={true}
          />

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

          {/* Drink History */}
          {currentUserWithDrinks && (
            <UserHistory 
              user={currentUserWithDrinks}
              limit={15}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}