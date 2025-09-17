import { getAllUsersWithTeamAndDrinks, getAllTeams, getRecentDrinkLogsWithTeam, getUnreadCommentaries } from '@/lib/prisma/fetchers'
import { sortUsersByScore, getTeamsWithStats } from '@/lib/utils/calculations'
import { DashboardDisplay } from '@/components/dashboard'
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
  const [allUsers, allTeams, recentDrinks, unreadCommentaries] = await Promise.all([
    getAllUsersWithTeamAndDrinks(),
    getAllTeams(),
    getRecentDrinkLogsWithTeam(20),
    getUnreadCommentaries(10)
  ])

  const sortedUsers = sortUsersByScore(allUsers)
  const teamsWithStats = getTeamsWithStats(allUsers, allTeams)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <DashboardDisplay 
        teams={teamsWithStats}
        topPlayers={sortedUsers.slice(0, 5)}
        recentActivity={recentDrinks}
        commentaries={unreadCommentaries}
      />
    </div>
  )
}