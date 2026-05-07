import { prisma } from '../client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import type {
  DrinkLog,
  DrinkLogWithUser,
  DrinkLogWithUserAndTeam,
} from '../types'

export async function createDrinkLog(userId: string, drinkType: string, points: number): Promise<DrinkLog | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.create({
        data: { userId, drinkType, points },
      })
    }
    const eventId = await requireActiveEventId()
    const user = await prisma.user.findFirst({
      where: { id: userId, eventId },
    })

    if (!user) {
      return null
    }

    return await prisma.drinkLog.create({
      data: {
        eventId,
        userId,
        drinkType,
        points,
      },
    })
  } catch (error) {
    console.error('Error creating drink log:', error)
    return null
  }
}

export async function getDrinkLogById(id: string): Promise<DrinkLog | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.findUnique({ where: { id } })
    }
    const eventId = await requireActiveEventId()
    return await prisma.drinkLog.findFirst({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error fetching drink log by ID:', error)
    return null
  }
}

export async function deleteDrinkLog(id: string): Promise<boolean> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      await prisma.drinkLog.delete({ where: { id } })
      return true
    }
    const eventId = await requireActiveEventId()
    const existing = await prisma.drinkLog.findFirst({
      where: { id, eventId },
    })

    if (!existing) {
      return false
    }

    await prisma.drinkLog.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Error deleting drink log:', error)
    return false
  }
}

export async function getAllDrinkLogs(): Promise<DrinkLog[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.findMany({
        orderBy: { createdAt: 'desc' },
      })
    }
    const eventId = await requireActiveEventId()
    return await prisma.drinkLog.findMany({
      where: { eventId },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching all drink logs:', error)
    return []
  }
}

export async function getDrinkLogsByUserId(userId: string): Promise<DrinkLog[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
    }
    const eventId = await requireActiveEventId()
    return await prisma.drinkLog.findMany({
      where: { userId, eventId },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching drink logs by user ID:', error)
    return []
  }
}

export async function getUserDrinkCount(userId: string, drinkType?: string): Promise<number> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.count({
        where: {
          userId,
          ...(drinkType && { drinkType }),
        },
      })
    }
    const eventId = await requireActiveEventId()
    return await prisma.drinkLog.count({
      where: {
        userId,
        eventId,
        ...(drinkType && { drinkType }),
      },
    })
  } catch (error) {
    console.error('Error counting user drinks:', error)
    return 0
  }
}

export async function getUserTotalPoints(userId: string): Promise<number> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const result = await prisma.drinkLog.aggregate({
        where: { userId },
        _sum: { points: true },
      })
      return result._sum.points || 0
    }
    const eventId = await requireActiveEventId()
    const result = await prisma.drinkLog.aggregate({
      where: { userId, eventId },
      _sum: {
        points: true,
      },
    })
    return result._sum.points || 0
  } catch (error) {
    console.error('Error calculating user total points:', error)
    return 0
  }
}

export async function getRecentDrinkLogs(limit: number): Promise<DrinkLogWithUser[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.findMany({
        include: {
          user: {
            include: {
              team: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as DrinkLogWithUser[]
    }
    const eventId = await requireActiveEventId()
    return await prisma.drinkLog.findMany({
      where: { eventId },
      include: {
        event: true,
        user: {
          include: {
            team: true,
            event: true,
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  } catch (error) {
    console.error('Error fetching recent drink logs:', error)
    return []
  }
}

export async function getRecentDrinkLogsWithTeam(limit: number): Promise<DrinkLogWithUserAndTeam[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.findMany({
        include: {
          user: {
            include: {
              team: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as DrinkLogWithUserAndTeam[]
    }
    const eventId = await requireActiveEventId()
    return await prisma.drinkLog.findMany({
      where: { eventId },
      include: {
        event: true,
        user: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  } catch (error) {
    console.error('Error fetching recent drink logs with team:', error)
    return []
  }
}

export async function getDrinkLogsToday(): Promise<DrinkLogWithUser[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      return await prisma.drinkLog.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          user: {
            include: {
              team: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }) as DrinkLogWithUser[]
    }
    const eventId = await requireActiveEventId()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return await prisma.drinkLog.findMany({
      where: {
        eventId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        event: true,
        user: {
          include: {
            team: true,
            event: true,
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching today\'s drink logs:', error)
    return []
  }
}

export async function getDrinkLogsSince(date: Date): Promise<DrinkLogWithUser[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.drinkLog.findMany({
        where: {
          createdAt: {
            gte: date,
          },
        },
        include: {
          user: {
            include: {
              team: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }) as DrinkLogWithUser[]
    }
    const eventId = await requireActiveEventId()
    return await prisma.drinkLog.findMany({
      where: {
        eventId,
        createdAt: {
          gte: date,
        },
      },
      include: {
        event: true,
        user: {
          include: {
            team: true,
            event: true,
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching drink logs since date:', error)
    return []
  }
}

export async function getTeamTotalPoints(teamId: string): Promise<number> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const result = await prisma.drinkLog.aggregate({
        where: {
          user: {
            teamId,
          },
        },
        _sum: { points: true },
      })
      return result._sum.points || 0
    }
    const eventId = await requireActiveEventId()
    const result = await prisma.drinkLog.aggregate({
      where: {
        eventId,
        user: {
          teamId,
          eventId,
        },
      },
      _sum: {
        points: true,
      },
    })
    return result._sum.points || 0
  } catch (error) {
    console.error('Error calculating team total points:', error)
    return 0
  }
}

export async function getTopUsersByPoints(limit: number): Promise<{ userId: string; name: string; totalPoints: number }[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const results = await prisma.drinkLog.groupBy({
        by: ['userId'],
        _sum: {
          points: true,
        },
        orderBy: {
          _sum: {
            points: 'desc',
          },
        },
        take: limit,
      })

      return await Promise.all(
        results.map(async (result) => {
          const user = await prisma.user.findUnique({
            where: { id: result.userId },
          })
          return {
            userId: result.userId,
            name: user?.name || 'Unknown',
            totalPoints: result._sum.points || 0,
          }
        })
      )
    }
    const eventId = await requireActiveEventId()
    const results = await prisma.drinkLog.groupBy({
      by: ['userId'],
      where: { eventId },
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: limit,
    })

    const usersWithPoints = await Promise.all(
      results.map(async (result) => {
        const user = await prisma.user.findFirst({
          where: { id: result.userId, eventId },
        })
        return {
          userId: result.userId,
          name: user?.name || 'Unknown',
          totalPoints: result._sum.points || 0,
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
    if (!(await isMultiEventSchemaAvailable())) {
      const teams = await prisma.team.findMany({
        include: {
          users: {
            include: {
              drinkLogs: true,
            },
          },
        },
      })

      return teams
        .map(team => ({
          teamId: team.id,
          teamName: team.name,
          totalPoints: team.users.reduce(
            (teamTotal, user) => teamTotal + user.drinkLogs.reduce((sum, log) => sum + log.points, 0),
            0
          ),
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit)
    }
    const eventId = await requireActiveEventId()
    const teams = await prisma.team.findMany({
      where: { eventId },
      include: {
        users: {
          where: { eventId },
          include: {
            drinkLogs: {
              where: { eventId },
            },
          },
        },
      },
    })

    return teams
      .map(team => ({
        teamId: team.id,
        teamName: team.name,
        totalPoints: team.users.reduce(
          (teamTotal, user) => teamTotal + user.drinkLogs.reduce((sum, log) => sum + log.points, 0),
          0
        ),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching top teams by points:', error)
    return []
  }
}
