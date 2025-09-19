import 'server-only'
import type { ComprehensiveState, UserWithRank, TeamWithRank } from './state-capture'

// Significance thresholds
export const SIGNIFICANCE_THRESHOLDS = {
  LEADERSHIP_TAKEN: true, // Always significant
  TOP_3_ENTRY: true, // Getting into top 3
  LAST_PLACE_ESCAPE: true, // No longer last
  LAST_PLACE_ENTRY: true, // Became last  
  RANK_JUMP: 3, // Jumped 3+ positions
  TEAM_LEADERSHIP: true, // Became team leader
  TEAM_OVERTAKE: true // Team passed another team
} as const

// Change types
export interface LeadershipChange {
  type: 'global' | 'team'
  newLeader: { id: string; name: string; points: number }
  previousLeader: { id: string; name: string; points: number }
  margin: number
  teamId?: string
  teamName?: string
}

export interface RankingShift {
  userId: string
  userName: string
  type: 'global' | 'team'
  from: number
  to: number
  pointsGained: number
  usersJumped: Array<{ id: string; name: string }> // Users they passed
}

export interface TeamPositionChange {
  overtakingTeam: { id: string; name: string; color: string }
  overtakenTeam: { id: string; name: string; color: string }
  newRanks: { overtaking: number; overtaken: number }
  pointDifference: number
}

export interface PositionChange {
  userId: string
  userName: string
  type: 'entered_top_3' | 'left_top_3' | 'escaped_last' | 'became_last'
  newPosition: number
  previousPosition: number
}

export interface SignificantChange {
  type: 'LEADERSHIP_TAKEN' | 'TOP_3_ENTRY' | 'TOP_3_EXIT' | 'TEAM_LEADERSHIP' | 
        'TEAM_OVERTAKE' | 'RANK_JUMP' | 'LAST_PLACE_ESCAPE' | 'LAST_PLACE_ENTRY'
  priority: number
  data: {
    user?: { id: string; name: string; points: number }
    team?: { id: string; name: string; color: string }
    rankChange?: { from: number; to: number }
    leadership?: LeadershipChange
    teamChange?: TeamPositionChange
    details?: string
  }
}

export interface StateComparison {
  leadershipChanges: LeadershipChange[]
  rankingShifts: RankingShift[]
  teamPositionChanges: TeamPositionChange[]
  positionChanges: PositionChange[]
  significantChanges: SignificantChange[]
}

// Main comparison function
export function compareStates(before: ComprehensiveState, after: ComprehensiveState): StateComparison {
  const leadershipChanges = detectLeadershipChanges(before, after)
  const rankingShifts = detectRankingShifts(before, after)
  const teamPositionChanges = detectTeamPositionChanges(before, after)
  const positionChanges = detectPositionChanges(before, after)

  const comparison: StateComparison = {
    leadershipChanges,
    rankingShifts,
    teamPositionChanges,
    positionChanges,
    significantChanges: []
  }

  // Generate significant changes based on detected changes
  comparison.significantChanges = detectSignificantChanges(comparison)

  return comparison
}

// Detect global and team leadership changes
function detectLeadershipChanges(before: ComprehensiveState, after: ComprehensiveState): LeadershipChange[] {
  const changes: LeadershipChange[] = []

  // Global leadership change
  const beforeGlobalLeader = Object.values(before.users).find(user => user.globalRank === 1)
  const afterGlobalLeader = Object.values(after.users).find(user => user.globalRank === 1)

  if (beforeGlobalLeader && afterGlobalLeader && beforeGlobalLeader.id !== afterGlobalLeader.id) {
    changes.push({
      type: 'global',
      newLeader: { id: afterGlobalLeader.id, name: afterGlobalLeader.name, points: afterGlobalLeader.totalPoints },
      previousLeader: { id: beforeGlobalLeader.id, name: beforeGlobalLeader.name, points: beforeGlobalLeader.totalPoints },
      margin: afterGlobalLeader.totalPoints - beforeGlobalLeader.totalPoints
    })
  }

  // Team leadership changes
  const teamsToCheck = new Set([
    ...Object.keys(before.teams),
    ...Object.keys(after.teams)
  ])

  teamsToCheck.forEach(teamId => {
    const beforeTeamLeader = Object.values(before.users).find(user => 
      user.teamId === teamId && user.teamRank === 1
    )
    const afterTeamLeader = Object.values(after.users).find(user => 
      user.teamId === teamId && user.teamRank === 1
    )

    if (beforeTeamLeader && afterTeamLeader && beforeTeamLeader.id !== afterTeamLeader.id) {
      const teamName = after.teams[teamId]?.name || before.teams[teamId]?.name || 'Unknown Team'
      
      changes.push({
        type: 'team',
        newLeader: { id: afterTeamLeader.id, name: afterTeamLeader.name, points: afterTeamLeader.totalPoints },
        previousLeader: { id: beforeTeamLeader.id, name: beforeTeamLeader.name, points: beforeTeamLeader.totalPoints },
        margin: afterTeamLeader.totalPoints - beforeTeamLeader.totalPoints,
        teamId,
        teamName
      })
    }
  })

  return changes
}

// Detect individual ranking shifts (3+ positions)
function detectRankingShifts(before: ComprehensiveState, after: ComprehensiveState): RankingShift[] {
  const shifts: RankingShift[] = []

  Object.keys(after.users).forEach(userId => {
    const beforeUser = before.users[userId]
    const afterUser = after.users[userId]

    if (!beforeUser || !afterUser) return

    // Global ranking shifts
    const globalShift = beforeUser.globalRank - afterUser.globalRank
    if (globalShift >= SIGNIFICANCE_THRESHOLDS.RANK_JUMP) {
      const usersJumped = Object.values(before.users).filter(user =>
        user.globalRank < beforeUser.globalRank && 
        user.globalRank >= afterUser.globalRank &&
        user.id !== userId
      ).map(user => ({ id: user.id, name: user.name }))

      shifts.push({
        userId,
        userName: afterUser.name,
        type: 'global',
        from: beforeUser.globalRank,
        to: afterUser.globalRank,
        pointsGained: afterUser.totalPoints - beforeUser.totalPoints,
        usersJumped
      })
    }

    // Team ranking shifts (if both have team ranks)
    if (beforeUser.teamRank && afterUser.teamRank && beforeUser.teamId === afterUser.teamId) {
      const teamShift = beforeUser.teamRank - afterUser.teamRank
      if (teamShift >= SIGNIFICANCE_THRESHOLDS.RANK_JUMP) {
        const teamUsersJumped = Object.values(before.users).filter(user =>
          user.teamId === beforeUser.teamId &&
          user.teamRank && user.teamRank < beforeUser.teamRank! &&
          user.teamRank >= afterUser.teamRank! &&
          user.id !== userId
        ).map(user => ({ id: user.id, name: user.name }))

        shifts.push({
          userId,
          userName: afterUser.name,
          type: 'team',
          from: beforeUser.teamRank,
          to: afterUser.teamRank,
          pointsGained: afterUser.totalPoints - beforeUser.totalPoints,
          usersJumped: teamUsersJumped
        })
      }
    }
  })

  return shifts
}

// Detect team position changes (overtakes)
function detectTeamPositionChanges(before: ComprehensiveState, after: ComprehensiveState): TeamPositionChange[] {
  const changes: TeamPositionChange[] = []

  Object.keys(after.teams).forEach(teamId => {
    const beforeTeam = before.teams[teamId]
    const afterTeam = after.teams[teamId]

    if (!beforeTeam || !afterTeam) return

    // If team moved up in ranking
    if (beforeTeam.globalRank > afterTeam.globalRank) {
      // Find which team(s) they overtook
      Object.values(before.teams).forEach(otherBeforeTeam => {
        const otherAfterTeam = after.teams[otherBeforeTeam.id]
        
        if (otherAfterTeam && 
            otherBeforeTeam.id !== teamId &&
            otherBeforeTeam.globalRank < beforeTeam.globalRank &&
            otherAfterTeam.globalRank > afterTeam.globalRank) {
          
          changes.push({
            overtakingTeam: { 
              id: afterTeam.id, 
              name: afterTeam.name, 
              color: afterTeam.color 
            },
            overtakenTeam: { 
              id: otherAfterTeam.id, 
              name: otherAfterTeam.name, 
              color: otherAfterTeam.color 
            },
            newRanks: { 
              overtaking: afterTeam.globalRank, 
              overtaken: otherAfterTeam.globalRank 
            },
            pointDifference: afterTeam.totalPoints - otherAfterTeam.totalPoints
          })
        }
      })
    }
  })

  return changes
}

// Detect special position changes (top 3, last place)
function detectPositionChanges(before: ComprehensiveState, after: ComprehensiveState): PositionChange[] {
  const changes: PositionChange[] = []

  Object.keys(after.users).forEach(userId => {
    const beforeUser = before.users[userId]
    const afterUser = after.users[userId]

    if (!beforeUser || !afterUser) return

    const totalUsers = Object.keys(after.users).length

    // Top 3 entry
    if (beforeUser.globalRank > 3 && afterUser.globalRank <= 3) {
      changes.push({
        userId,
        userName: afterUser.name,
        type: 'entered_top_3',
        newPosition: afterUser.globalRank,
        previousPosition: beforeUser.globalRank
      })
    }

    // Top 3 exit
    if (beforeUser.globalRank <= 3 && afterUser.globalRank > 3) {
      changes.push({
        userId,
        userName: afterUser.name,
        type: 'left_top_3',
        newPosition: afterUser.globalRank,
        previousPosition: beforeUser.globalRank
      })
    }

    // Last place escape
    if (beforeUser.globalRank === totalUsers && afterUser.globalRank < totalUsers) {
      changes.push({
        userId,
        userName: afterUser.name,
        type: 'escaped_last',
        newPosition: afterUser.globalRank,
        previousPosition: beforeUser.globalRank
      })
    }

    // Became last place
    if (beforeUser.globalRank < totalUsers && afterUser.globalRank === totalUsers) {
      changes.push({
        userId,
        userName: afterUser.name,
        type: 'became_last',
        newPosition: afterUser.globalRank,
        previousPosition: beforeUser.globalRank
      })
    }
  })

  return changes
}

// Convert detected changes to significant changes with priorities
function detectSignificantChanges(comparison: StateComparison): SignificantChange[] {
  const significantChanges: SignificantChange[] = []

  // Leadership changes (highest priority)
  comparison.leadershipChanges.forEach(change => {
    if (change.type === 'global') {
      significantChanges.push({
        type: 'LEADERSHIP_TAKEN',
        priority: 5,
        data: {
          user: change.newLeader,
          leadership: change,
          details: `Prevzel globalno vodstvo od ${change.previousLeader.name}`
        }
      })
    } else {
      significantChanges.push({
        type: 'TEAM_LEADERSHIP',
        priority: 4,
        data: {
          user: change.newLeader,
          leadership: change,
          details: `Prevzel vodstvo v ekipi ${change.teamName}`
        }
      })
    }
  })

  // Position changes (high priority)
  comparison.positionChanges.forEach(change => {
    const priority = change.type === 'entered_top_3' || change.type === 'left_top_3' ? 4 : 2
    const changeType = change.type === 'entered_top_3' ? 'TOP_3_ENTRY' : 
                      change.type === 'left_top_3' ? 'TOP_3_EXIT' :
                      change.type === 'escaped_last' ? 'LAST_PLACE_ESCAPE' : 'LAST_PLACE_ENTRY'

    significantChanges.push({
      type: changeType,
      priority,
      data: {
        user: { id: change.userId, name: change.userName, points: 0 },
        rankChange: { from: change.previousPosition, to: change.newPosition },
        details: `Premik s ${change.previousPosition}. na ${change.newPosition}. mesto`
      }
    })
  })

  // Team overtakes
  comparison.teamPositionChanges.forEach(change => {
    significantChanges.push({
      type: 'TEAM_OVERTAKE',
      priority: 3,
      data: {
        team: change.overtakingTeam,
        teamChange: change,
        details: `Ekipa ${change.overtakingTeam.name} je prehitela ${change.overtakenTeam.name}`
      }
    })
  })

  // Large ranking jumps
  comparison.rankingShifts.forEach(shift => {
    significantChanges.push({
      type: 'RANK_JUMP',
      priority: 2,
      data: {
        user: { id: shift.userId, name: shift.userName, points: 0 },
        rankChange: { from: shift.from, to: shift.to },
        details: `Skok s ${shift.from}. na ${shift.to}. mesto (${shift.type === 'global' ? 'globalno' : 'v ekipi'})`
      }
    })
  })

  return significantChanges
}

// Prioritize changes by importance (higher number = more important)
export function prioritizeChanges(changes: SignificantChange[]): SignificantChange[] {
  return [...changes].sort((a, b) => b.priority - a.priority)
}