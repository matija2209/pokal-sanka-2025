import { prisma } from '../client'
import type {
  Team,
  TeamWithUsers,
  TeamWithUsersAndDrinks,
  CreateTeamInput
} from '../types'

// Basic CRUD
export async function getTeamById(id: string): Promise<Team | null> {
  try {
    return await prisma.team.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error('Error fetching team by ID:', error)
    return null
  }
}

export async function getAllTeams(): Promise<Team[]> {
  try {
    return await prisma.team.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching all teams:', error)
    return []
  }
}

export async function createTeam(name: string, color: string): Promise<Team | null> {
  try {
    return await prisma.team.create({
      data: { name, color }
    })
  } catch (error) {
    console.error('Error creating team:', error)
    return null
  }
}

export async function updateTeam(
  id: string, 
  data: { name?: string; color?: string }
): Promise<Team | null> {
  try {
    return await prisma.team.update({
      where: { id },
      data
    })
  } catch (error) {
    console.error('Error updating team:', error)
    return null
  }
}

export async function deleteTeam(id: string): Promise<boolean> {
  try {
    // First set all users' teamId to null, then delete the team
    await prisma.user.updateMany({
      where: { teamId: id },
      data: { teamId: null }
    })
    
    await prisma.team.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error('Error deleting team:', error)
    return false
  }
}

// Relations queries
export async function getTeamWithUsersById(id: string): Promise<TeamWithUsers | null> {
  try {
    return await prisma.team.findUnique({
      where: { id },
      include: {
        users: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching team with users:', error)
    return null
  }
}

export async function getAllTeamsWithUsers(): Promise<TeamWithUsers[]> {
  try {
    return await prisma.team.findMany({
      include: {
        users: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching all teams with users:', error)
    return []
  }
}

export async function getAllTeamsWithUsersAndDrinks(): Promise<TeamWithUsersAndDrinks[]> {
  try {
    return await prisma.team.findMany({
      include: {
        users: {
          include: {
            drinkLogs: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching all teams with users and drinks:', error)
    return []
  }
}

// Specific queries
export async function getTeamByName(name: string): Promise<Team | null> {
  try {
    return await prisma.team.findUnique({
      where: { name }
    })
  } catch (error) {
    console.error('Error fetching team by name:', error)
    return null
  }
}

export async function getTeamsWithUserCount(): Promise<(Team & { userCount: number })[]> {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return teams.map(team => ({
      ...team,
      userCount: team._count.users,
      _count: undefined
    })) as (Team & { userCount: number })[]
  } catch (error) {
    console.error('Error fetching teams with user count:', error)
    return []
  }
}