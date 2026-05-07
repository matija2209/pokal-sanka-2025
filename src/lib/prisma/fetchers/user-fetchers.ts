import { prisma } from '../client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import type {
  User,
  UserWithTeam,
  UserWithTeamAndDrinks,
} from '../types'

function withLegacyRelations<T extends { team?: any }>(user: T) {
  return {
    ...user,
    event: null,
    person: null,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findUnique({ where: { id } })
    }
    const eventId = await requireActiveEventId()
    return await prisma.user.findFirst({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

export async function createUser(name: string, personId?: string | null): Promise<User | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.create({
        data: { name },
      })
    }
    const eventId = await requireActiveEventId()

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
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.update({
        where: { id: userId },
        data: { teamId },
      })
    }
    const eventId = await requireActiveEventId()
    const existingUser = await prisma.user.findFirst({
      where: { id: userId, eventId },
    })

    if (!existingUser) {
      return null
    }

    if (teamId) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, eventId },
      })

      if (!team) {
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
  data: { name?: string; teamId?: string | null; profile_image_url?: string }
): Promise<User | null> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.update({
        where: { id: userId },
        data,
      })
    }
    const eventId = await requireActiveEventId()
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

export async function deleteUser(id: string): Promise<boolean> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      await prisma.user.delete({
        where: { id },
      })
      return true
    }
    const eventId = await requireActiveEventId()
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

export async function getUserWithTeamById(id: string): Promise<UserWithTeam | null> {
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
    const eventId = await requireActiveEventId()
    return await prisma.user.findFirst({
      where: { id, eventId },
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

export async function getUserWithTeamAndDrinksById(id: string): Promise<UserWithTeamAndDrinks | null> {
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
    const eventId = await requireActiveEventId()
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

export async function getAllUsers(): Promise<User[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findMany({
        orderBy: {
          name: 'asc',
        },
      })
    }
    const eventId = await requireActiveEventId()
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

export async function getAllUsersWithTeamAndDrinks(): Promise<UserWithTeamAndDrinks[]> {
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
    const eventId = await requireActiveEventId()
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

export async function getUsersByTeamId(teamId: string): Promise<User[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findMany({
        where: { teamId },
        orderBy: {
          name: 'asc',
        },
      })
    }
    const eventId = await requireActiveEventId()
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

export async function getUsersWithoutTeam(): Promise<User[]> {
  try {
    if (!(await isMultiEventSchemaAvailable())) {
      return await prisma.user.findMany({
        where: { teamId: null },
        orderBy: {
          name: 'asc',
        },
      })
    }
    const eventId = await requireActiveEventId()
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
