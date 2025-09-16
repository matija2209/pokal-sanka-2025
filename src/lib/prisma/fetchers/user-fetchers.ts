import { prisma } from '../client'
import type {
  User,
  UserWithTeam,
  UserWithTeamAndDrinks,
  CreateUserInput
} from '../types'

// Basic CRUD
export async function getUserById(id: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

export async function createUser(name: string): Promise<User | null> {
  try {
    return await prisma.user.create({
      data: { name }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function updateUserTeam(userId: string, teamId: string | null): Promise<User | null> {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { teamId }
    })
  } catch (error) {
    console.error('Error updating user team:', error)
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

// Relations queries
export async function getUserWithTeamById(id: string): Promise<UserWithTeam | null> {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        team: true
      }
    })
  } catch (error) {
    console.error('Error fetching user with team:', error)
    return null
  }
}

export async function getUserWithTeamAndDrinksById(id: string): Promise<UserWithTeamAndDrinks | null> {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        team: true,
        drinkLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user with team and drinks:', error)
    return null
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    return await prisma.user.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching all users:', error)
    return []
  }
}

export async function getAllUsersWithTeamAndDrinks(): Promise<UserWithTeamAndDrinks[]> {
  try {
    return await prisma.user.findMany({
      include: {
        team: true,
        drinkLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching all users with relations:', error)
    return []
  }
}

// Specific queries
export async function getUsersByTeamId(teamId: string): Promise<User[]> {
  try {
    return await prisma.user.findMany({
      where: { teamId },
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching users by team:', error)
    return []
  }
}

export async function getUsersWithoutTeam(): Promise<User[]> {
  try {
    return await prisma.user.findMany({
      where: { teamId: null },
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching users without team:', error)
    return []
  }
}