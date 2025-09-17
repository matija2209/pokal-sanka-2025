import { prisma } from '@/lib/prisma/client'

export interface Commentary {
  id: string
  type: string
  message: string
  priority: number
  metadata: any
  isDisplayed: boolean
  createdAt: Date
  displayedAt: Date | null
}

// Get recent commentaries for dashboard display
export async function getRecentCommentaries(limit: number = 10): Promise<Commentary[]> {
  return await prisma.commentary.findMany({
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  })
}

// Get unread commentaries
export async function getUnreadCommentaries(limit: number = 5): Promise<Commentary[]> {
  return await prisma.commentary.findMany({
    where: {
      isDisplayed: false
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  })
}

// Mark commentaries as displayed
export async function markCommentariesAsDisplayed(commentaryIds: string[]): Promise<void> {
  await prisma.commentary.updateMany({
    where: {
      id: {
        in: commentaryIds
      }
    },
    data: {
      isDisplayed: true,
      displayedAt: new Date()
    }
  })
}

// Create a new commentary
export async function createCommentary(
  type: string,
  message: string,
  priority: number = 1,
  metadata?: any
): Promise<Commentary> {
  return await prisma.commentary.create({
    data: {
      type,
      message,
      priority,
      metadata: metadata || {}
    }
  })
}

// Get user statistics for commentary generation
export async function getUserStatsForCommentary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      team: true,
      drinkLogs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) return null

  const totalPoints = user.drinkLogs.reduce((sum, log) => sum + log.points, 0)
  const totalDrinks = user.drinkLogs.length
  const regularDrinks = user.drinkLogs.filter(log => log.drinkType === 'REGULAR').length
  const shots = user.drinkLogs.filter(log => log.drinkType === 'SHOT').length
  
  // Recent activity (last 30 minutes)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
  const recentDrinks = user.drinkLogs.filter(log => log.createdAt > thirtyMinutesAgo)

  return {
    user,
    stats: {
      totalPoints,
      totalDrinks,
      regularDrinks,
      shots,
      recentDrinks: recentDrinks.length,
      isOnStreak: recentDrinks.length >= 3
    }
  }
}

// Get team statistics for commentary generation
export async function getTeamStatsForCommentary(teamId: string | null) {
  if (!teamId) return null

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      users: {
        include: {
          drinkLogs: true
        }
      }
    }
  })

  if (!team) return null

  const totalTeamPoints = team.users.reduce((teamSum, user) => 
    teamSum + user.drinkLogs.reduce((userSum, log) => userSum + log.points, 0), 0
  )
  
  const totalTeamDrinks = team.users.reduce((teamSum, user) => 
    teamSum + user.drinkLogs.length, 0
  )

  return {
    team,
    stats: {
      totalPoints: totalTeamPoints,
      totalDrinks: totalTeamDrinks,
      memberCount: team.users.length
    }
  }
}