import { DrinkLog, UserWithTeamAndDrinks, TeamWithUsersAndDrinks } from '../prisma/types'

// Score calculations
export function calculateUserScore(drinkLogs: DrinkLog[]): number {
  return drinkLogs.reduce((total, log) => total + log.points, 0)
}

export function calculateTeamScore(users: Array<{ drinkLogs: DrinkLog[] }>): number {
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
export function sortUsersByScore(users: UserWithTeamAndDrinks[]): UserWithTeamAndDrinks[] {
  return [...users].sort((a, b) => {
    const scoreA = calculateUserScore(a.drinkLogs)
    const scoreB = calculateUserScore(b.drinkLogs)
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

export function getUserRanking(userId: string, allUsers: UserWithTeamAndDrinks[]): number {
  const sortedUsers = sortUsersByScore(allUsers)
  const userIndex = sortedUsers.findIndex(user => user.id === userId)
  return userIndex + 1 // Convert to 1-based ranking
}