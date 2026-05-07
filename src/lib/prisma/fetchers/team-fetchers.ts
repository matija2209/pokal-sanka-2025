import { prisma } from '../client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import type {
  Team,
  TeamWithUsers,
  TeamWithUsersAndDrinks,
} from '../types'

export async function getTeamById(id: string): Promise<Team | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.findUnique({ where: { id } })
    }
    const eventId = await requireActiveEventId()
    return await prisma.team.findFirst({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error fetching team by ID:', error)
    return null
  }
}

export async function getAllTeams(): Promise<Team[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.findMany({
        orderBy: { name: 'asc' },
      })
    }
    const eventId = await requireActiveEventId()
    return await prisma.team.findMany({
      where: { eventId },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching all teams:', error)
    return []
  }
}

export async function createTeam(name: string, color: string): Promise<Team | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.create({
        data: { name, color },
      })
    }
    const eventId = await requireActiveEventId()
    return await prisma.team.create({
      data: { name, color, eventId },
    })
  } catch (error) {
    console.error('Error creating team:', error)
    return null
  }
}

export async function updateTeam(
  id: string,
  data: { name?: string; color?: string; logo_image_url?: string }
): Promise<Team | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.update({
        where: { id },
        data,
      })
    }
    const eventId = await requireActiveEventId()
    const existingTeam = await prisma.team.findFirst({
      where: { id, eventId },
    })

    if (!existingTeam) {
      return null
    }

    return await prisma.team.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('Error updating team:', error)
    return null
  }
}

export async function deleteTeam(id: string): Promise<boolean> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      await prisma.user.updateMany({
        where: { teamId: id },
        data: { teamId: null },
      })
      await prisma.team.delete({
        where: { id },
      })
      return true
    }
    const eventId = await requireActiveEventId()
    const existingTeam = await prisma.team.findFirst({
      where: { id, eventId },
    })

    if (!existingTeam) {
      return false
    }

    await prisma.user.updateMany({
      where: { teamId: id, eventId },
      data: { teamId: null },
    })

    await prisma.team.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Error deleting team:', error)
    return false
  }
}

export async function getTeamWithUsersById(id: string): Promise<TeamWithUsers | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.findUnique({
        where: { id },
        include: {
          users: {
            orderBy: { name: 'asc' },
          },
        },
      }) as TeamWithUsers | null
    }
    const eventId = await requireActiveEventId()
    return await prisma.team.findFirst({
      where: { id, eventId },
      include: {
        event: true,
        users: {
          where: { eventId },
          orderBy: {
            name: 'asc',
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching team with users:', error)
    return null
  }
}

export async function getAllTeamsWithUsers(): Promise<TeamWithUsers[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.findMany({
        include: {
          users: {
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      }) as TeamWithUsers[]
    }
    const eventId = await requireActiveEventId()
    return await prisma.team.findMany({
      where: { eventId },
      include: {
        event: true,
        users: {
          where: { eventId },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching all teams with users:', error)
    return []
  }
}

export async function getAllTeamsWithUsersAndDrinks(): Promise<TeamWithUsersAndDrinks[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.findMany({
        include: {
          users: {
            include: {
              team: true,
              drinkLogs: {
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      }) as TeamWithUsersAndDrinks[]
    }
    const eventId = await requireActiveEventId()
    return await prisma.team.findMany({
      where: { eventId },
      include: {
        event: true,
        users: {
          where: { eventId },
          include: {
            team: true,
            event: true,
            person: true,
            drinkLogs: {
              where: { eventId },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching all teams with users and drinks:', error)
    return []
  }
}

export async function getTeamByName(name: string): Promise<Team | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.team.findFirst({
        where: { name },
      })
    }
    const eventId = await requireActiveEventId()
    return await prisma.team.findFirst({
      where: { name, eventId },
    })
  } catch (error) {
    console.error('Error fetching team by name:', error)
    return null
  }
}

export async function getTeamsWithUserCount(): Promise<(Team & { userCount: number })[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const teams = await prisma.team.findMany({
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      })

      return teams.map(team => ({
        ...team,
        userCount: team._count.users,
        _count: undefined,
      })) as (Team & { userCount: number })[]
    }
    const eventId = await requireActiveEventId()
    const teams = await prisma.team.findMany({
      where: { eventId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return teams.map(team => ({
      ...team,
      userCount: team._count.users,
      _count: undefined,
    })) as (Team & { userCount: number })[]
  } catch (error) {
    console.error('Error fetching teams with user count:', error)
    return []
  }
}
