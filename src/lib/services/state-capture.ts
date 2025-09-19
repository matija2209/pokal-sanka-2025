import 'server-only'
import { prisma } from '@/lib/prisma/client'

export interface UserWithStats {
  id: string
  name: string
  teamId: string | null
  totalPoints: number
  totalDrinks: number
  team: {
    id: string
    name: string
    color: string
  } | null
}

export interface TeamWithStats {
  id: string
  name: string
  color: string
  totalPoints: number
  memberCount: number
  leadingMember: {
    id: string
    name: string
    points: number
  }
}

export interface UserWithRank extends UserWithStats {
  globalRank: number
  teamRank: number | null
}

export interface TeamWithRank extends TeamWithStats {
  globalRank: number
  pointGapToNext: number // points behind the team ahead (0 if first place)
  pointGapFromPrevious: number // points ahead of team behind (0 if last place)
}

export interface ComprehensiveState {
  timestamp: Date
  users: {
    [userId: string]: UserWithRank
  }
  teams: {
    [teamId: string]: TeamWithRank
  }
}

// Fetch all users with calculated total points and drinks
export async function fetchAllUsersWithStats(): Promise<UserWithStats[]> {
  const users = await prisma.user.findMany({
    include: {
      team: true,
      drinkLogs: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return users.map(user => ({
    id: user.id,
    name: user.name,
    teamId: user.teamId,
    totalPoints: user.drinkLogs.reduce((sum, log) => sum + log.points, 0),
    totalDrinks: user.drinkLogs.length,
    team: user.team ? {
      id: user.team.id,
      name: user.team.name,
      color: user.team.color
    } : null
  }))
}

// Fetch all teams with calculated stats and leading members
export async function fetchAllTeamsWithStats(): Promise<TeamWithStats[]> {
  const teams = await prisma.team.findMany({
    include: {
      users: {
        include: {
          drinkLogs: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return teams.map(team => {
    const usersWithStats = team.users.map(user => ({
      id: user.id,
      name: user.name,
      points: user.drinkLogs.reduce((sum, log) => sum + log.points, 0)
    }))

    const totalPoints = usersWithStats.reduce((sum, user) => sum + user.points, 0)
    const leadingMember = usersWithStats.reduce((leader, user) => 
      user.points > leader.points ? user : leader, 
      usersWithStats[0] || { id: '', name: '', points: 0 }
    )

    return {
      id: team.id,
      name: team.name,
      color: team.color,
      totalPoints,
      memberCount: team.users.length,
      leadingMember
    }
  })
}

// Main function to capture complete state snapshot
export async function captureCompleteState(): Promise<ComprehensiveState> {
  const [usersWithStats, teamsWithStats] = await Promise.all([
    fetchAllUsersWithStats(),
    fetchAllTeamsWithStats()
  ])

  // Import ranking functions (will create next)
  const { calculateGlobalUserRanks, calculateGlobalTeamRanks, calculateTeamMemberRanks } = 
    await import('./ranking-calculator')

  // Calculate all rankings
  const usersWithRanks = calculateGlobalUserRanks(usersWithStats)
  const teamsWithRanks = calculateGlobalTeamRanks(teamsWithStats)

  // Calculate team member ranks for users with teams
  const usersWithTeamRanks = calculateTeamMemberRanks(usersWithRanks)

  // Convert to indexed objects for fast lookup
  const users: { [userId: string]: UserWithRank } = {}
  usersWithTeamRanks.forEach(user => {
    users[user.id] = user
  })

  const teams: { [teamId: string]: TeamWithRank } = {}
  teamsWithRanks.forEach(team => {
    teams[team.id] = team
  })

  return {
    timestamp: new Date(),
    users,
    teams
  }
}