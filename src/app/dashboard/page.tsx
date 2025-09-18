import { getAllUsersWithTeamAndDrinks, getAllTeams, getRecentDrinkLogsWithTeam, getUnreadCommentaries, getRecentPostsWithImages, getRecentUserProfileImages, getRecentTeamLogos, getRecentPosts } from '@/lib/prisma/fetchers'
import { sortUsersByScore, getTeamsWithStats } from '@/lib/utils/calculations'
import { DashboardDisplay } from '@/components/dashboard'
import BreakingNewsBanner from '@/components/dashboard/breaking-news-banner'
import LatestImagesDisplay from '@/components/dashboard/latest-images-display'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pokal Šanka - TV Nadzorna Plošča | Lestvice in Statistike',
  description: 'Velika nadzorna plošča za televizijske zaslone. Spremljajte lestvice ekip, najboljše igralce in zadnjo aktivnost v realnem času.',
  keywords: ['dashboard', 'lestvica', 'statistike', 'turnir', 'tv', 'nadzorna plošča', 'pokal šanka'],
  robots: 'noindex, nofollow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0f172a',
  colorScheme: 'dark',
  openGraph: {
    title: 'Pokal Šanka - TV Dashboard',
    description: 'Spremljajte turnir v realnem času z našo TV nadzorno ploščo.',
    type: 'website',
    locale: 'sl_SI',
    siteName: 'Pokal Šanka'
  },
  icons: {
    icon: '/logo.jpg'
  }
}

export default async function DashboardPage() {
  const [allUsers, allTeams, recentDrinks, unreadCommentaries, recentImages, userProfiles, teamLogos, allRecentPosts] = await Promise.all([
    getAllUsersWithTeamAndDrinks(),
    getAllTeams(),
    getRecentDrinkLogsWithTeam(100),
    getUnreadCommentaries(50),
    getRecentPostsWithImages(5),
    getRecentUserProfileImages(5),
    getRecentTeamLogos(5),
    getRecentPosts(50)
  ])

  const sortedUsers = sortUsersByScore(allUsers)
  const teamsWithStats = getTeamsWithStats(allUsers, allTeams)
  
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
    <div className="min-h-scree">
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