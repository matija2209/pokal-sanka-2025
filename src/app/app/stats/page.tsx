export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
// import { getUserWithTeamAndDrinksById } from '@/lib/prisma/fetchers'
import { getEventActivitySnapshot, /* getEventFeedSnapshot, */ getEventRankingSnapshot } from '@/lib/cache/event-read-models'
import { redirect } from 'next/navigation'
import { /* UserHistory, */ Leaderboard } from '@/components/users'
import { RecentActivity } from '@/components/drinks'
// import { CommentaryDisplay } from '@/components/commentary'
// import { TimelineDisplay } from '@/components/timeline'
import { getUserRanking, sortUsersByScore, getAllUsersTriviaPointsMap } from '@/lib/utils/calculations'
import type { Metadata } from 'next'
import { getSiteBrandParts, getActiveEvent } from '@/lib/events'
import { Container } from '@/components/layout/container'

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


export default async function StatsPage() {
  await connection()

  const activeEvent = await getActiveEvent()
  const currentUser = await getCurrentUser(activeEvent?.id)
  
  if (!currentUser) {
    redirect('/')
  }

  if (!activeEvent) {
    redirect('/')
  }

  const [rankingSnapshot, activitySnapshot /*, feedSnapshot, currentUserWithDrinks*/] = await Promise.all([
    getEventRankingSnapshot(activeEvent.id),
    getEventActivitySnapshot(activeEvent.id),
    // getEventFeedSnapshot(activeEvent.id, false),
    // getUserWithTeamAndDrinksById(currentUser.id, activeEvent.id),
  ])
  const { users: allUsers, teams: allTeams, triviaResults } = rankingSnapshot
  const { recentDrinks /*, recentCommentaries*/ } = activitySnapshot

  // Trivia score integration
  const triviaAvailable = rankingSnapshot.triviaAvailable && activeEvent.isTriviaEnabled
  let triviaPointsMap = new Map<string, number>()
  if (triviaAvailable) {
    triviaPointsMap = getAllUsersTriviaPointsMap(triviaResults)
  }

  const userRank = getUserRanking(currentUser.id, allUsers, triviaPointsMap)
  const sortedUsers = sortUsersByScore(allUsers, triviaPointsMap)
  
  return (
    <Container size="mobile" className="px-0 text-foreground">
      <div className="text-center mb-6 border-b border-border pb-6">
        <h1 className="text-2xl font-bold leading-tight mb-2 text-foreground">Statistike in Lestvice</h1>
        <p className="text-sm text-muted-foreground">
          Poglejte svojo uvrstitev, dosežke in sledite aktivnosti turnirja.
        </p>
      </div>

      <div className="space-y-5">
        <Leaderboard
          users={sortedUsers}
          teams={allTeams}
          currentUserId={currentUser.id}
          currentUserTeamId={currentUser.teamId}
          triviaPointsMap={triviaPointsMap}
        />

        {/* <CommentaryDisplay commentaries={recentCommentaries} limit={8} showTitle={true} /> */}

        {/* <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Nedavne objave</h2>
          <TimelineDisplay posts={feedSnapshot.posts.slice(0, 10)} />
        </div> */}

        <RecentActivity recentDrinks={recentDrinks} limit={8} />

        {/* {currentUserWithDrinks && <UserHistory user={currentUserWithDrinks} limit={15} />} */}
      </div>
    </Container>
  )
}
