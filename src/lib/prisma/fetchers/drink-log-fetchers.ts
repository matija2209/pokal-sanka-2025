import { prisma } from '../client'
import type {
  DrinkLog,
  DrinkLogWithUser,
  DrinkLogWithUserAndTeam,
  DrinkType,
  CreateDrinkLogInput
} from '../types'

// Basic CRUD
export async function createDrinkLog(userId: string, drinkType: string, points: number): Promise<DrinkLog | null> {
  try {
    return await prisma.drinkLog.create({
      data: {
        userId,
        drinkType,
        points
      }
    })
  } catch (error) {
    console.error('Error creating drink log:', error)
    return null
  }
}

export async function getDrinkLogById(id: string): Promise<DrinkLog | null> {
  try {
    return await prisma.drinkLog.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error('Error fetching drink log by ID:', error)
    return null
  }
}

export async function deleteDrinkLog(id: string): Promise<boolean> {
  try {
    await prisma.drinkLog.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error('Error deleting drink log:', error)
    return false
  }
}

export async function getAllDrinkLogs(): Promise<DrinkLog[]> {
  try {
    return await prisma.drinkLog.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching all drink logs:', error)
    return []
  }
}

// User-specific queries
export async function getDrinkLogsByUserId(userId: string): Promise<DrinkLog[]> {
  try {
    return await prisma.drinkLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching drink logs by user ID:', error)
    return []
  }
}

export async function getUserDrinkCount(userId: string, drinkType?: string): Promise<number> {
  try {
    return await prisma.drinkLog.count({
      where: {
        userId,
        ...(drinkType && { drinkType })
      }
    })
  } catch (error) {
    console.error('Error counting user drinks:', error)
    return 0
  }
}

export async function getUserTotalPoints(userId: string): Promise<number> {
  try {
    const result = await prisma.drinkLog.aggregate({
      where: { userId },
      _sum: {
        points: true
      }
    })
    return result._sum.points || 0
  } catch (error) {
    console.error('Error calculating user total points:', error)
    return 0
  }
}

// Time-based queries
export async function getRecentDrinkLogs(limit: number): Promise<DrinkLogWithUser[]> {
  try {
    return await prisma.drinkLog.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
  } catch (error) {
    console.error('Error fetching recent drink logs:', error)
    return []
  }
}

export async function getRecentDrinkLogsWithTeam(limit: number): Promise<DrinkLogWithUserAndTeam[]> {
  try {
    return await prisma.drinkLog.findMany({
      include: {
        user: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
  } catch (error) {
    console.error('Error fetching recent drink logs with team:', error)
    return []
  }
}

export async function getDrinkLogsToday(): Promise<DrinkLogWithUser[]> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return await prisma.drinkLog.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching today\'s drink logs:', error)
    return []
  }
}

export async function getDrinkLogsSince(date: Date): Promise<DrinkLogWithUser[]> {
  try {
    return await prisma.drinkLog.findMany({
      where: {
        createdAt: {
          gte: date
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching drink logs since date:', error)
    return []
  }
}

// Statistics queries
export async function getTeamTotalPoints(teamId: string): Promise<number> {
  try {
    const result = await prisma.drinkLog.aggregate({
      where: {
        user: {
          teamId
        }
      },
      _sum: {
        points: true
      }
    })
    return result._sum.points || 0
  } catch (error) {
    console.error('Error calculating team total points:', error)
    return 0
  }
}

export async function getTopUsersByPoints(limit: number): Promise<{ userId: string; name: string; totalPoints: number }[]> {
  try {
    const results = await prisma.drinkLog.groupBy({
      by: ['userId'],
      _sum: {
        points: true
      },
      orderBy: {
        _sum: {
          points: 'desc'
        }
      },
      take: limit
    })

    const usersWithPoints = await Promise.all(
      results.map(async (result) => {
        const user = await prisma.user.findUnique({
          where: { id: result.userId }
        })
        return {
          userId: result.userId,
          name: user?.name || 'Unknown',
          totalPoints: result._sum.points || 0
        }
      })
    )

    return usersWithPoints
  } catch (error) {
    console.error('Error fetching top users by points:', error)
    return []
  }
}

export async function getTopTeamsByPoints(limit: number): Promise<{ teamId: string; teamName: string; totalPoints: number }[]> {
  try {
    const results = await prisma.drinkLog.groupBy({
      by: ['userId'],
      _sum: {
        points: true
      }
    })

    const teamPoints = new Map<string, number>()
    const teamNames = new Map<string, string>()

    for (const result of results) {
      const user = await prisma.user.findUnique({
        where: { id: result.userId },
        include: { team: true }
      })
      
      if (user?.team) {
        const currentPoints = teamPoints.get(user.team.id) || 0
        teamPoints.set(user.team.id, currentPoints + (result._sum.points || 0))
        teamNames.set(user.team.id, user.team.name)
      }
    }

    const sortedTeams = Array.from(teamPoints.entries())
      .map(([teamId, totalPoints]) => ({
        teamId,
        teamName: teamNames.get(teamId) || 'Unknown',
        totalPoints
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)

    return sortedTeams
  } catch (error) {
    console.error('Error fetching top teams by points:', error)
    return []
  }
}