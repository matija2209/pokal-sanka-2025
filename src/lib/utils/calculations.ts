import { DrinkLog, UserWithTeamAndDrinks, TeamWithUsersAndDrinks, TeamWithStats, Team } from '../prisma/types'

// ---------------------------------------------------------------------------
// Trivia score helpers (additive, backward-compatible)
// ---------------------------------------------------------------------------

export function getUserTriviaPoints(
  userId: string,
  triviaPointsMap?: Map<string, number>
): number {
  if (!triviaPointsMap) return 0
  return triviaPointsMap.get(userId) || 0
}

export function getAllUsersTriviaPointsMap(
  categoryResults: Array<{ categoryWinner: string | null; finalPoints: number }>
): Map<string, number> {
  const map = new Map<string, number>()
  for (const r of categoryResults) {
    if (!r.categoryWinner) continue
    map.set(r.categoryWinner, (map.get(r.categoryWinner) || 0) + r.finalPoints)
  }
  return map
}

// Score calculations
export function calculateUserScore(
  drinkLogs: DrinkLog[],
  triviaPoints?: number
): number {
  const drinkScore = drinkLogs.reduce((total, log) => total + log.points, 0)
  return drinkScore + (triviaPoints || 0)
}

export function calculateTeamScore(
  users: Array<{ drinkLogs: DrinkLog[] }>,
  triviaPointsMap?: Map<string, number>
): number {
  return users.reduce((teamTotal: number, user: { drinkLogs: DrinkLog[] }) => {
    const userScore = calculateUserScore(user.drinkLogs)
    return teamTotal + userScore
  }, 0)
}

export function calculateUserStreaks(drinkLogs: DrinkLog[]): number {
  if (drinkLogs.length === 0) return 0

  // Sort by date descending to get most recent first
  const sortedLogs = [...drinkLogs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const log of sortedLogs) {
    const logDate = new Date(log.createdAt)
    logDate.setHours(0, 0, 0, 0)

    // If log is from today or yesterday, continue streak
    if (logDate.getTime() === currentDate.getTime()) {
      streak = 1
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (logDate.getTime() === currentDate.getTime()) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // Break in streak
      break
    }
  }

  return streak
}

// Leaderboard functions
export function sortUsersByScore(
  users: UserWithTeamAndDrinks[],
  triviaPointsMap?: Map<string, number>
): UserWithTeamAndDrinks[] {
  return [...users].sort((a, b) => {
    const scoreA = calculateUserScore(a.drinkLogs, getUserTriviaPoints(a.id, triviaPointsMap))
    const scoreB = calculateUserScore(b.drinkLogs, getUserTriviaPoints(b.id, triviaPointsMap))
    return scoreB - scoreA // Descending order
  })
}

export function sortTeamsByScore(teams: TeamWithUsersAndDrinks[]): TeamWithUsersAndDrinks[] {
  return [...teams].sort((a, b) => {
    const scoreA = calculateTeamScore(a.users)
    const scoreB = calculateTeamScore(b.users)
    return scoreB - scoreA // Descending order
  })
}

export function getUserRanking(
  userId: string,
  allUsers: UserWithTeamAndDrinks[],
  triviaPointsMap?: Map<string, number>
): number {
  const sortedUsers = sortUsersByScore(allUsers, triviaPointsMap)
  const userIndex = sortedUsers.findIndex(user => user.id === userId)
  return userIndex + 1 // Convert to 1-based ranking
}

// Dashboard-specific functions
export function getTeamsWithStats(
  allUsers: UserWithTeamAndDrinks[],
  allTeams: Team[],
  triviaPointsMap?: Map<string, number>
): TeamWithStats[] {
  const teamsWithStats: TeamWithStats[] = allTeams.map(team => {
    const teamMembers = allUsers.filter(user => user.teamId === team.id)
    const totalScore = teamMembers.reduce((total, member) => {
      return total + calculateUserScore(member.drinkLogs, getUserTriviaPoints(member.id, triviaPointsMap))
    }, 0)
    const totalDrinks = teamMembers.reduce((total, member) => total + member.drinkLogs.length, 0)
    const averageScore = teamMembers.length > 0 ? totalScore / teamMembers.length : 0

    return {
      ...team,
      memberCount: teamMembers.length,
      totalScore,
      totalDrinks,
      averageScore
    }
  })

  return teamsWithStats.sort((a, b) => b.totalScore - a.totalScore)
}