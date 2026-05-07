import { prisma } from '@/lib/prisma/client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

export interface Commentary {
  id: string
  eventId: string | null
  type: string
  message: string
  priority: number
  metadata: any
  isDisplayed: boolean
  createdAt: Date
  displayedAt: Date | null
}

export async function getRecentCommentaries(limit: number = 10): Promise<Commentary[]> {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.commentary.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    }) as Commentary[]
  }

  const eventId = await requireActiveEventId()

  return await prisma.commentary.findMany({
    where: { eventId },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  })
}

export async function getUnreadCommentaries(limit: number = 5): Promise<Commentary[]> {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.commentary.findMany({
      where: {
        isDisplayed: false,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    }) as Commentary[]
  }

  const eventId = await requireActiveEventId()

  return await prisma.commentary.findMany({
    where: {
      eventId,
      isDisplayed: false,
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  })
}

export async function markCommentariesAsDisplayed(commentaryIds: string[]): Promise<void> {
  if (!(await isMultiEventSchemaAvailable())) {
    await prisma.commentary.updateMany({
      where: {
        id: {
          in: commentaryIds,
        },
      },
      data: {
        isDisplayed: true,
        displayedAt: new Date(),
      },
    })
    return
  }

  const eventId = await requireActiveEventId()

  await prisma.commentary.updateMany({
    where: {
      eventId,
      id: {
        in: commentaryIds,
      },
    },
    data: {
      isDisplayed: true,
      displayedAt: new Date(),
    },
  })
}

export async function createCommentary(
  type: string,
  message: string,
  priority: number = 1,
  metadata?: any
): Promise<Commentary> {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.commentary.create({
      data: {
        type,
        message,
        priority,
        metadata: metadata || {},
      },
    }) as Commentary
  }

  const eventId = await requireActiveEventId()

  return await prisma.commentary.create({
    data: {
      eventId,
      type,
      message,
      priority,
      metadata: metadata || {},
    },
  })
}

export async function getUserStatsForCommentary(userId: string) {
  if (!(await isMultiEventSchemaAvailable())) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        drinkLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) return null

    const totalPoints = user.drinkLogs.reduce((sum, log) => sum + log.points, 0)
    const totalDrinks = user.drinkLogs.length
    const regularDrinks = user.drinkLogs.filter(log => log.drinkType === 'REGULAR').length
    const shots = user.drinkLogs.filter(log => log.drinkType === 'SHOT').length
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    const recentDrinks = user.drinkLogs.filter(log => log.createdAt > thirtyMinutesAgo)

    return {
      user: { ...user, event: null, person: null },
      stats: {
        totalPoints,
        totalDrinks,
        regularDrinks,
        shots,
        recentDrinks: recentDrinks.length,
        isOnStreak: recentDrinks.length >= 3,
      },
    }
  }

  const eventId = await requireActiveEventId()

  const user = await prisma.user.findFirst({
    where: { id: userId, eventId },
    include: {
      team: true,
      event: true,
      person: true,
      drinkLogs: {
        where: { eventId },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) return null

  const totalPoints = user.drinkLogs.reduce((sum, log) => sum + log.points, 0)
  const totalDrinks = user.drinkLogs.length
  const regularDrinks = user.drinkLogs.filter(log => log.drinkType === 'REGULAR').length
  const shots = user.drinkLogs.filter(log => log.drinkType === 'SHOT').length

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
      isOnStreak: recentDrinks.length >= 3,
    },
  }
}

export async function getTeamStatsForCommentary(teamId: string | null) {
  if (!teamId) return null

  if (!(await isMultiEventSchemaAvailable())) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: {
          include: {
            drinkLogs: true,
          },
        },
      },
    })

    if (!team) return null

    const totalTeamPoints = team.users.reduce((teamSum, user) =>
      teamSum + user.drinkLogs.reduce((userSum, log) => userSum + log.points, 0), 0
    )
    const totalTeamDrinks = team.users.reduce((teamSum, user) => teamSum + user.drinkLogs.length, 0)

    return {
      team: { ...team, event: null },
      stats: {
        totalPoints: totalTeamPoints,
        totalDrinks: totalTeamDrinks,
        memberCount: team.users.length,
      },
    }
  }

  const eventId = await requireActiveEventId()
  const team = await prisma.team.findFirst({
    where: { id: teamId, eventId },
    include: {
      event: true,
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
      memberCount: team.users.length,
    },
  }
}
