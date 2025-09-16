import { getAllUsersWithTeamAndDrinks, getAllTeams, getRecentDrinkLogsWithTeam } from '@/lib/prisma/fetchers'
import { sortUsersByScore, getTeamsWithStats } from '@/lib/utils/calculations'
import { DashboardDisplay } from '@/components/dashboard'

export default async function DashboardPage() {
  const [allUsers, allTeams, recentDrinks] = await Promise.all([
    getAllUsersWithTeamAndDrinks(),
    getAllTeams(),
    getRecentDrinkLogsWithTeam(20)
  ])

  const sortedUsers = sortUsersByScore(allUsers)
  const teamsWithStats = getTeamsWithStats(allUsers, allTeams)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <DashboardDisplay 
        teams={teamsWithStats}
        topPlayers={sortedUsers.slice(0, 5)}
        recentActivity={recentDrinks}
      />
    </div>
  )
}