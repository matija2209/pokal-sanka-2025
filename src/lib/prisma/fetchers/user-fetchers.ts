import { prisma } from '../client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import type {
  User,
  UserWithTeam,
  UserWithTeamAndDrinks,
  QuickLogUser,
} from '../types'

function withLegacyRelations<T extends { team?: any }>(user: T) {
  return {
    ...user,
    event: null,
    person: null,
  }
}

export async function getUserById(id: string, eventIdOverride?: string): Promise<User | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findUnique({ where: { id } })
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findFirst({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

export async function createUser(name: string, personId?: string | null, eventIdOverride?: string): Promise<User | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.create({
        data: { name },
      })
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())

    const resolvedPersonId = personId ?? (
      await prisma.person.create({
        data: { name },
      })
    ).id

    return await prisma.user.create({
      data: {
        name,
        personId: resolvedPersonId,
        eventId,
      },
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function createUserForPerson(personId: string, name: string): Promise<User | null> {
  return createUser(name, personId)
}

export async function updateUserTeam(userId: string, teamId: string | null): Promise<User | null> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return null
    }

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      })

      if (!team) {
        return null
      }

      if (existingUser.eventId && team.eventId && existingUser.eventId !== team.eventId) {
        console.error('Event ID mismatch between user and team:', existingUser.eventId, team.eventId)
        return null
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { teamId },
    })
  } catch (error) {
    console.error('Error updating user team:', error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; teamId?: string | null; profile_image_url?: string },
  eventIdOverride?: string
): Promise<User | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.update({
        where: { id: userId },
        data,
      })
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    const existingUser = await prisma.user.findFirst({
      where: { id: userId, eventId },
    })

    if (!existingUser) {
      return null
    }

    if (data.teamId) {
      const team = await prisma.team.findFirst({
        where: { id: data.teamId, eventId },
      })

      if (!team) {
        return null
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data,
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

export async function deleteUser(id: string, eventIdOverride?: string): Promise<boolean> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      await prisma.user.delete({
        where: { id },
      })
      return true
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    const existingUser = await prisma.user.findFirst({
      where: { id, eventId },
    })

    if (!existingUser) {
      return false
    }

    await prisma.user.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

export async function getUserWithTeamById(id: string, eventId?: string): Promise<UserWithTeam | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          team: true,
        },
      })

      return user ? withLegacyRelations(user) as UserWithTeam : null
    }
    const resolvedEventId = eventId ?? await requireActiveEventId()
    return await prisma.user.findFirst({
      where: { id, eventId: resolvedEventId },
      include: {
        team: true,
        event: true,
        person: true,
      },
    })
  } catch (error) {
    console.error('Error fetching user with team:', error)
    return null
  }
}

export async function getUserWithTeamAndDrinksById(id: string, eventIdOverride?: string): Promise<UserWithTeamAndDrinks | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          team: true,
          drinkLogs: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      return user ? withLegacyRelations(user) as UserWithTeamAndDrinks : null
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findFirst({
      where: { id, eventId },
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
    })
  } catch (error) {
    console.error('Error fetching user with team and drinks:', error)
    return null
  }
}

export async function getAllUsers(eventIdOverride?: string): Promise<User[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findMany({
        orderBy: {
          name: 'asc',
        },
      })
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findMany({
      where: { eventId },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
}

export async function getAllUsersWithTeamAndDrinks(eventIdOverride?: string): Promise<UserWithTeamAndDrinks[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      const users = await prisma.user.findMany({
        include: {
          team: true,
          drinkLogs: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })

      return users.map(user => withLegacyRelations(user) as UserWithTeamAndDrinks)
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findMany({
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
    })
  } catch (error) {
    console.error('Error fetching all users with relations:', error)
    return []
  }
}

export async function getQuickLogUsers(eventIdOverride?: string): Promise<QuickLogUser[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          profile_image_url: true,
          team: {
            select: { name: true, color: true },
          },
        },
        orderBy: { name: 'asc' },
      })
    }

    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findMany({
      where: { eventId },
      select: {
        id: true,
        name: true,
        profile_image_url: true,
        team: {
          select: { name: true, color: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Error fetching users for quick log:', error)
    return []
  }
}

export async function getQuickLogUserById(id: string, eventIdOverride?: string): Promise<QuickLogUser | null> {
  try {
    const select = {
      id: true,
      name: true,
      profile_image_url: true,
      team: {
        select: { name: true, color: true },
      },
    } as const

    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findUnique({ where: { id }, select })
    }

    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findFirst({ where: { id, eventId }, select })
  } catch (error) {
    console.error('Error fetching quick-log user:', error)
    return null
  }
}

export async function getUsersByTeamId(teamId: string, eventIdOverride?: string): Promise<User[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findMany({
        where: { teamId },
        orderBy: {
          name: 'asc',
        },
      })
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findMany({
      where: { teamId, eventId },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching users by team:', error)
    return []
  }
}

export async function getUsersWithoutTeam(eventIdOverride?: string): Promise<User[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findMany({
        where: { teamId: null },
        orderBy: {
          name: 'asc',
        },
      })
    }
    const eventId = eventIdOverride ?? (await requireActiveEventId())
    return await prisma.user.findMany({
      where: { teamId: null, eventId },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching users without team:', error)
    return []
  }
}

export async function getUserByPersonAndEvent(personId: string, eventId: string): Promise<UserWithTeam | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return null
    }
    return await prisma.user.findFirst({
      where: { personId, eventId },
      include: {
        team: true,
        event: true,
        person: true,
      },
    })
  } catch (error) {
    console.error('Error fetching user by person and event:', error)
    return null
  }
}
