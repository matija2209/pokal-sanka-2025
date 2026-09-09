export const instant = false
import { connection } from 'next/server'
import { getEventDashboardSnapshot } from '@/lib/cache/event-read-models'
import { sortUsersByScore, getTeamsWithStats, getAllUsersTriviaPointsMap } from '@/lib/utils/calculations'
import { DashboardDisplay } from '@/components/dashboard'
import BreakingNewsBanner from '@/components/dashboard/breaking-news-banner'
import LatestImagesDisplay from '@/components/dashboard/latest-images-display'
import type { Metadata } from 'next'
import { getActiveEvent, getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'TV Nadzorna Plošča',
    description:
      'Velika nadzorna plošča za televizijske zaslone. Spremljajte lestvice ekip, najboljše igralce in zadnjo aktivnost v realnem času.',
    keywords: ['dashboard', 'lestvica', 'statistike', 'turnir', 'tv', 'nadzorna plošča', 'pokal šanka'],
    robots: 'noindex, nofollow',
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#0f172a',
    colorScheme: 'dark',
    openGraph: {
      title: `TV Nadzorna Plošča | ${brand}`,
      description: 'Spremljajte turnir v realnem času z našo TV nadzorno ploščo.',
      type: 'website',
      locale: 'sl_SI',
      siteName: 'Pokal Šanka',
    },
    icons: {
      icon: '/logo.jpg',
    },
  }
}


export default async function DashboardPage() {
  await connection()

  const activeEvent = await getActiveEvent()
  if (!activeEvent) {
    return null
  }

  const {
    users: allUsers,
    teams: allTeams,
    recentDrinks,
    unreadCommentaries,
    recentImages,
    userProfiles,
    teamLogos,
    recentPosts: allRecentPosts,
    triviaResults,
  } = await getEventDashboardSnapshot(activeEvent.id)

  // Trivia score integration
  const triviaAvailable = triviaResults.length > 0 && activeEvent.isTriviaEnabled
  let triviaPointsMap = new Map<string, number>()
  if (triviaAvailable) {
    triviaPointsMap = getAllUsersTriviaPointsMap(triviaResults)
  }

  const sortedUsers = sortUsersByScore(allUsers, triviaPointsMap)
  const teamsWithStats = getTeamsWithStats(allUsers, allTeams, triviaPointsMap)
  
  // Prepare image data for LatestImagesDisplay
  const imageData = {
    posts: recentImages as any[],
    userImages: userProfiles.map(user => ({
      userId: user.id,
      userName: user.name,
      imageUrl: user.profile_image_url,
      updatedAt: user.createdAt,
      team: user.team ? {
        name: user.team.name,
        color: user.team.color,
        logo_image_url: user.team.logo_image_url
      } : undefined
    })),
    teamLogos: teamLogos.map(team => ({
      teamId: team.id,
      teamName: team.name,
      logoUrl: team.logo_image_url,
      updatedAt: team.createdAt,
      color: team.color
    }))
  }
  
  return (
    <div className="min-h-screen">
      <DashboardDisplay 
        teams={teamsWithStats}
        topPlayers={sortedUsers}
        recentActivity={recentDrinks}
        commentaries={unreadCommentaries}
      />
      
      {/* Breaking News Banner */}
      <BreakingNewsBanner posts={allRecentPosts as any} />
      
      {/* Latest Images Display */}
      <LatestImagesDisplay {...imageData} />
    </div>
  )
}
