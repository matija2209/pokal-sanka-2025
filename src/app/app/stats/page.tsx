import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams, getAllUsersWithTeamAndDrinks, getUserWithTeamAndDrinksById, getRecentDrinkLogs, getRecentCommentaries, getAllTriviaResults } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { UserHistory, Leaderboard } from '@/components/users'
import { RecentActivity } from '@/components/drinks'
import { CommentaryDisplay } from '@/components/commentary'
import { TimelineDisplay } from '@/components/timeline'
import { getUserRanking, sortUsersByScore, getAllUsersTriviaPointsMap } from '@/lib/utils/calculations'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import type { Metadata } from 'next'
import { getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Statistike',
    description:
      'Statistike, lestvice in dosežki v Pokal Šanka turnirju. Poglejte svoje dosežke, lestvico igralcev in nedavno aktivnost.',
    keywords: ['statistike', 'lestvica', 'dosežki', 'aktivnost', 'turnir'],
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Statistike | ${brand}`,
      description: 'Statistike, lestvice in dosežki v turnirju.',
      locale: 'sl_SI',
    },
  }
}

export const dynamic = 'force-dynamic'

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

  // Trivia score integration
  const triviaAvailable = await isTriviaAvailable()
  let triviaPointsMap = new Map<string, number>()
  if (triviaAvailable) {
    const triviaResults = await getAllTriviaResults()
    triviaPointsMap = getAllUsersTriviaPointsMap(triviaResults)
  }

  const userRank = getUserRanking(currentUser.id, allUsers, triviaPointsMap)
  const sortedUsers = sortUsersByScore(allUsers, triviaPointsMap)
  
  return (
    <div className="w-full max-w-none px-0 text-foreground">
      <div className="text-center mb-6 border-b border-border pb-6">
        <h1 className="text-2xl font-bold leading-tight mb-2 text-foreground">Statistike in Lestvice</h1>
        <p className="text-sm text-muted-foreground">
          Poglejte svojo uvrstitev, dosežke in sledite aktivnosti turnirja.
        </p>
      </div>

      <div className="space-y-5">
        <Leaderboard
          users={sortedUsers}
          currentUserId={currentUser.id}
          teamFilter={currentUser.teamId}
          triviaPointsMap={triviaPointsMap}
        />

        <CommentaryDisplay commentaries={recentCommentaries} limit={8} showTitle={true} />

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Nedavne objave</h2>
          <TimelineDisplay limit={10} />
        </div>

        <RecentActivity recentDrinks={recentDrinks} limit={8} />

        {currentUserWithDrinks && <UserHistory user={currentUserWithDrinks} limit={15} />}
      </div>
    </div>
  )
}
