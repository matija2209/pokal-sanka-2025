export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getEventActivitySnapshot, /* getEventFeedSnapshot, */ getEventLeaderboardSnapshot } from '@/lib/cache/event-read-models'
import { redirect } from 'next/navigation'
import { /* UserHistory, */ Leaderboard } from '@/components/users'
import type { LeaderboardUser, LeaderboardTeam } from '@/components/users/leaderboard'
import { RecentActivity } from '@/components/drinks'
// import { CommentaryDisplay } from '@/components/commentary'
// import { TimelineDisplay } from '@/components/timeline'
import { getAllUsersTriviaPointsMap } from '@/lib/utils/calculations'
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

  const [activeEvent, currentUser] = await Promise.all([
    getActiveEvent(),
    getCurrentUser(),
  ])

  if (!currentUser) {
    redirect('/')
  }

  if (!activeEvent) {
    redirect('/')
  }

  const [leaderboardSnapshot, activitySnapshot /*, feedSnapshot, currentUserWithDrinks*/] = await Promise.all([
    getEventLeaderboardSnapshot(activeEvent.id),
    getEventActivitySnapshot(activeEvent.id),
    // getEventFeedSnapshot(activeEvent.id, false),
    // getUserWithTeamAndDrinksById(currentUser.id, activeEvent.id),
  ])
  const { users, teams, drinkStats, triviaResults } = leaderboardSnapshot
  const { recentDrinks /*, recentCommentaries*/ } = activitySnapshot

  // Trivia score integration
  const triviaAvailable = leaderboardSnapshot.triviaAvailable && activeEvent.isTriviaEnabled
  const triviaPointsMap = triviaAvailable ? getAllUsersTriviaPointsMap(triviaResults) : new Map<string, number>()

  const scoreForUser = (userId: string) =>
    (drinkStats.get(userId)?.totalPoints || 0) + (triviaPointsMap.get(userId) || 0)

  const sortedUsers: LeaderboardUser[] = users
    .map(user => {
      const stats = drinkStats.get(user.id)
      return {
        id: user.id,
        name: user.name,
        profile_image_url: user.profile_image_url,
        team: user.team,
        score: scoreForUser(user.id),
        regularDrinks: stats?.regularCount || 0,
        shotDrinks: stats?.shotCount || 0,
      }
    })
    .sort((a, b) => b.score - a.score)

  const sortedTeams: LeaderboardTeam[] = teams
    .map(team => {
      const members = users.filter(user => user.teamId === team.id)
      return {
        id: team.id,
        name: team.name,
        color: team.color,
        score: members.reduce((total, member) => total + scoreForUser(member.id), 0),
        memberCount: members.length,
      }
    })
    .sort((a, b) => b.score - a.score)

  return (
    <Container size="mobile" className="px-0 text-foreground">
      {/* <div className="text-center mb-6 border-b border-border pb-6">
        <h1 className="text-2xl font-bold leading-tight mb-2 text-foreground">Statistike in Lestvice</h1>
        <p className="text-sm text-muted-foreground">
          Poglejte svojo uvrstitev, dosežke in sledite aktivnosti turnirja.
        </p>
      </div> */}

      <div className="space-y-5">
        <Leaderboard
          users={sortedUsers}
          teams={sortedTeams}
          currentUserId={currentUser.id}
          currentUserTeamId={currentUser.teamId}
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
