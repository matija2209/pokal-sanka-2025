import 'server-only'
import type { 
  UserWithStats, 
  TeamWithStats, 
  UserWithRank, 
  TeamWithRank 
} from './state-capture'

// Calculate global user rankings based on total points
export function calculateGlobalUserRanks(users: UserWithStats[]): UserWithRank[] {
  // Sort by total points descending, then by name for tie-breaking
  const sortedUsers = [...users].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints
    }
    return a.name.localeCompare(b.name, 'sl') // Slovenian locale for proper sorting
  })

  // Assign ranks - same points get same rank, next rank skips appropriately
  let currentRank = 1
  const rankedUsers: UserWithRank[] = []

  for (let i = 0; i < sortedUsers.length; i++) {
    const user = sortedUsers[i]
    const prevUser = i > 0 ? sortedUsers[i - 1] : null

    // If points differ from previous user, update rank
    if (prevUser && user.totalPoints < prevUser.totalPoints) {
      currentRank = i + 1
    }

    rankedUsers.push({
      ...user,
      globalRank: currentRank,
      teamRank: null // Will be calculated later
    })
  }

  return rankedUsers
}

// Calculate global team rankings based on total points
export function calculateGlobalTeamRanks(teams: TeamWithStats[]): TeamWithRank[] {
  // Sort by total points descending, then by name for tie-breaking
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints
    }
    return a.name.localeCompare(b.name, 'sl')
  })

  // Assign ranks and calculate point gaps
  let currentRank = 1
  const rankedTeams: TeamWithRank[] = []

  for (let i = 0; i < sortedTeams.length; i++) {
    const team = sortedTeams[i]
    const prevTeam = i > 0 ? sortedTeams[i - 1] : null
    const nextTeam = i < sortedTeams.length - 1 ? sortedTeams[i + 1] : null

    // If points differ from previous team, update rank
    if (prevTeam && team.totalPoints < prevTeam.totalPoints) {
      currentRank = i + 1
    }

    // Calculate point gaps
    const pointGapToNext = prevTeam ? prevTeam.totalPoints - team.totalPoints : 0
    const pointGapFromPrevious = nextTeam ? team.totalPoints - nextTeam.totalPoints : 0

    rankedTeams.push({
      ...team,
      globalRank: currentRank,
      pointGapToNext,
      pointGapFromPrevious
    })
  }

  return rankedTeams
}

// Calculate rankings within each team
export function calculateTeamMemberRanks(users: UserWithRank[]): UserWithRank[] {
  // Group users by team
  const usersByTeam = new Map<string, UserWithRank[]>()
  const usersWithoutTeam: UserWithRank[] = []

  users.forEach(user => {
    if (user.teamId) {
      if (!usersByTeam.has(user.teamId)) {
        usersByTeam.set(user.teamId, [])
      }
      usersByTeam.get(user.teamId)!.push(user)
    } else {
      usersWithoutTeam.push(user)
    }
  })

  // Calculate team rankings for each team
  const rankedUsers: UserWithRank[] = []

  usersByTeam.forEach((teamUsers, teamId) => {
    // Sort by total points descending, then by name
    const sortedTeamUsers = [...teamUsers].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      return a.name.localeCompare(b.name, 'sl')
    })

    // Assign team ranks
    let currentTeamRank = 1
    for (let i = 0; i < sortedTeamUsers.length; i++) {
      const user = sortedTeamUsers[i]
      const prevUser = i > 0 ? sortedTeamUsers[i - 1] : null

      if (prevUser && user.totalPoints < prevUser.totalPoints) {
        currentTeamRank = i + 1
      }

      rankedUsers.push({
        ...user,
        teamRank: currentTeamRank
      })
    }
  })

  // Add users without teams (they don't have team ranks)
  rankedUsers.push(...usersWithoutTeam)

  // Sort back to original order (by global rank, then name)
  return rankedUsers.sort((a, b) => {
    if (a.globalRank !== b.globalRank) {
      return a.globalRank - b.globalRank
    }
    return a.name.localeCompare(b.name, 'sl')
  })
}

// Helper function to get user's position within a specific ranking
export function getUserPosition(users: UserWithRank[], userId: string): {
  globalPosition: number
  teamPosition: number | null
  totalUsers: number
  teamUsers: number | null
} {
  const user = users.find(u => u.id === userId)
  if (!user) {
    return { globalPosition: -1, teamPosition: null, totalUsers: users.length, teamUsers: null }
  }

  const teamUsers = user.teamId 
    ? users.filter(u => u.teamId === user.teamId)
    : null

  return {
    globalPosition: user.globalRank,
    teamPosition: user.teamRank,
    totalUsers: users.length,
    teamUsers: teamUsers ? teamUsers.length : null
  }
}

// Helper function to get team's position
export function getTeamPosition(teams: TeamWithRank[], teamId: string): {
  globalPosition: number
  totalTeams: number
  pointsToNext: number
  pointsFromPrevious: number
} {
  const team = teams.find(t => t.id === teamId)
  if (!team) {
    return { globalPosition: -1, totalTeams: teams.length, pointsToNext: 0, pointsFromPrevious: 0 }
  }

  return {
    globalPosition: team.globalRank,
    totalTeams: teams.length,
    pointsToNext: team.pointGapToNext,
    pointsFromPrevious: team.pointGapFromPrevious
  }
}