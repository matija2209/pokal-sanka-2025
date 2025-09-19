import { createCommentary, getUserStatsForCommentary, getTeamStatsForCommentary } from '@/lib/prisma/fetchers'
import { generateCommentaryMessage, isSignificantMilestone, getAchievementDescription, type CommentaryContext } from '@/lib/openai'
import type { SignificantChange } from './state-comparator'
import { prioritizeChanges } from './state-comparator'

// Commentary types
export const COMMENTARY_TYPES = {
  MILESTONE: 'milestone',
  STREAK: 'streak', 
  ACHIEVEMENT: 'achievement',
  HYPE: 'hype',
  TEAM_EVENT: 'team_event'
} as const

// Enhanced commentary types
export const ENHANCED_COMMENTARY_TYPES = {
  LEADERSHIP_CHANGE: 'leadership_change',
  TOP_3_CHANGE: 'top_3_change', 
  TEAM_LEADERSHIP: 'team_leadership',
  TEAM_OVERTAKE: 'team_overtake',
  RANK_JUMP: 'rank_jump',
  LAST_PLACE_CHANGE: 'last_place_change',
  CONSOLIDATED_BULK: 'consolidated_bulk'
} as const

// Priority levels
export const PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4,
  CRITICAL: 5
} as const

// Helper function to build commentary context for LLM
function buildCommentaryContext(
  eventType: string,
  user: any,
  stats: any,
  team: any,
  drinkType: string,
  points: number,
  additionalData?: any
): CommentaryContext {
  const context: CommentaryContext = {
    eventType: eventType as CommentaryContext['eventType'],
    user: {
      name: user.name,
      totalPoints: stats.totalPoints,
      totalDrinks: stats.totalDrinks,
      recentDrinks: stats.recentDrinks,
      isOnStreak: stats.isOnStreak
    },
    drink: {
      type: drinkType,
      points
    }
  }

  if (team) {
    context.team = {
      name: team.team.name,
      color: team.team.color,
      totalPoints: team.stats.totalPoints,
      memberCount: team.stats.memberCount
    }
  }

  // Add specific context based on event type
  if (eventType === COMMENTARY_TYPES.MILESTONE) {
    context.milestone = {
      pointsReached: stats.totalPoints,
      isSignificant: isSignificantMilestone(stats.totalPoints)
    }
  }

  if (eventType === COMMENTARY_TYPES.STREAK) {
    context.streak = {
      count: stats.recentDrinks,
      timeWindow: "30 minut"
    }
  }

  if (eventType === COMMENTARY_TYPES.ACHIEVEMENT && additionalData) {
    context.achievement = {
      type: additionalData.achievement,
      details: getAchievementDescription(additionalData.achievement)
    }
  }

  return context
}

// Main function to generate commentary after drink log
export async function generateCommentaryForDrink(
  userId: string, 
  drinkType: string, 
  points: number
): Promise<void> {
  try {
    console.log('🎤 Starting commentary generation for:', { userId, drinkType, points })
    
    // Get user and team stats
    const userStats = await getUserStatsForCommentary(userId)
    if (!userStats) {
      console.log('❌ No user stats found for:', userId)
      return
    }

    const { user, stats } = userStats
    const teamStats = user.teamId ? await getTeamStatsForCommentary(user.teamId) : null
    
    console.log('📊 User stats:', { user: user.name, stats, teamStats: teamStats?.team?.name })

    // Check for milestone (every 5, 10, 25, 50 points)
    if (stats.totalPoints % 5 === 0 && stats.totalPoints >= 5) {
      console.log('🏆 Milestone detected:', stats.totalPoints, 'points')
      const priority = stats.totalPoints >= 25 ? PRIORITY.HIGH : 
                      stats.totalPoints >= 10 ? PRIORITY.NORMAL : PRIORITY.LOW
      
      const context = buildCommentaryContext(
        COMMENTARY_TYPES.MILESTONE, user, stats, teamStats, drinkType, points
      )
      
      console.log('🤖 Generating LLM message for milestone...')
      const message = await generateCommentaryMessage(context)
      console.log('✅ Generated milestone message:', message)

      await createCommentary(COMMENTARY_TYPES.MILESTONE, message, priority, {
        userId: user.id,
        teamId: user.teamId,
        points: stats.totalPoints,
        drinkType
      })
      console.log('💾 Saved milestone commentary to database')
    }

    // Check for streak (3+ drinks in 30 minutes)
    if (stats.isOnStreak && stats.recentDrinks >= 3) {
      const context = buildCommentaryContext(
        COMMENTARY_TYPES.STREAK, user, stats, teamStats, drinkType, points
      )
      
      const message = await generateCommentaryMessage(context)

      await createCommentary(COMMENTARY_TYPES.STREAK, message, PRIORITY.HIGH, {
        userId: user.id,
        teamId: user.teamId,
        streakCount: stats.recentDrinks,
        drinkType
      })
    }

    // Check for first drink achievement
    if (stats.totalDrinks === 1) {
      console.log('🎊 First drink detected for:', user.name)
      const context = buildCommentaryContext(
        COMMENTARY_TYPES.ACHIEVEMENT, user, stats, teamStats, drinkType, points,
        { achievement: 'first_drink' }
      )
      
      console.log('🤖 Generating LLM message for first drink...')
      const message = await generateCommentaryMessage(context)
      console.log('✅ Generated first drink message:', message)

      await createCommentary(COMMENTARY_TYPES.ACHIEVEMENT, message, PRIORITY.NORMAL, {
        userId: user.id,
        teamId: user.teamId,
        achievement: 'first_drink'
      })
      console.log('💾 Saved first drink commentary to database')
    }

    // ALWAYS generate a simple hype message for testing
    console.log('🎉 Generating test hype message...')
    const context = buildCommentaryContext(
      COMMENTARY_TYPES.HYPE, user, stats, teamStats, drinkType, points
    )
    
    const message = await generateCommentaryMessage(context)
    console.log('✅ Generated hype message:', message)

    await createCommentary(COMMENTARY_TYPES.HYPE, message, PRIORITY.NORMAL, {
      userId: user.id,
      teamId: user.teamId,
      trigger: 'test_always'
    })
    console.log('💾 Saved test hype commentary to database')

    // Random hype message (20% chance)
    if (Math.random() < 0.2) {
      const context = buildCommentaryContext(
        COMMENTARY_TYPES.HYPE, user, stats, teamStats, drinkType, points
      )
      
      const message = await generateCommentaryMessage(context)
      
      await createCommentary(COMMENTARY_TYPES.HYPE, message, PRIORITY.LOW, {
        userId: user.id,
        teamId: user.teamId,
        trigger: 'random_hype'
      })
    }

    // Team event check (placeholder for now)
    if (teamStats && stats.totalPoints % 10 === 0) {
      const context = buildCommentaryContext(
        COMMENTARY_TYPES.TEAM_EVENT, user, stats, teamStats, drinkType, points
      )
      
      const message = await generateCommentaryMessage(context)

      await createCommentary(COMMENTARY_TYPES.TEAM_EVENT, message, PRIORITY.NORMAL, {
        userId: user.id,
        teamId: user.teamId,
        teamPoints: teamStats.stats.totalPoints
      })
    }

  } catch (error) {
    console.error('Error generating commentary:', error)
    // Don't throw - commentary generation should not break drink logging
  }
}

// Helper function to check if user just became team leader
export async function checkForLeadershipChange(userId: string): Promise<boolean> {
  // This would require comparing current user points with all team members
  // Placeholder implementation - will implement proper logic later
  return false
}

// Helper function to check if team just overtook another team  
export async function checkForTeamOvertake(teamId: string): Promise<string | null> {
  // This would require comparing team totals
  // Placeholder implementation - will implement proper logic later
  return null
}

// Special function for bulk drink logging - creates HYPE message
export async function generateBulkDrinkCommentary(
  userIds: string[],
  drinkType: string,
  totalPoints: number
): Promise<void> {
  try {
    console.log('🔥 Generating BULK DRINK HYPE for:', { userCount: userIds.length, drinkType, totalPoints })
    
    // Get all users involved
    const userStats = await Promise.all(
      userIds.map(userId => getUserStatsForCommentary(userId))
    )
    
    const validUsers = userStats.filter(stat => stat !== null)
    if (validUsers.length === 0) {
      console.log('❌ No valid users found for bulk commentary')
      return
    }

    // Extract user names and teams
    const userNames = validUsers.map(stat => stat!.user.name)
    const teams = [...new Set(validUsers.map(stat => stat!.user.team?.name).filter(Boolean))] as string[]
    
    // Build special bulk context
    const bulkContext: CommentaryContext = {
      eventType: 'bulk_hype',
      user: {
        name: userNames.join(', '),
        totalPoints: validUsers.reduce((sum, stat) => sum + stat!.stats.totalPoints, 0),
        totalDrinks: validUsers.reduce((sum, stat) => sum + stat!.stats.totalDrinks, 0),
        recentDrinks: 0,
        isOnStreak: false
      },
      drink: {
        type: drinkType,
        points: totalPoints
      },
      bulk: {
        userCount: userIds.length,
        userNames,
        teams,
        totalPointsAdded: totalPoints
      }
    }

    console.log('🤖 Generating BULK HYPE message...')
    const message = await generateCommentaryMessage(bulkContext)
    console.log('✅ Generated bulk hype message:', message)

    // Create high-priority hype commentary
    await createCommentary(COMMENTARY_TYPES.HYPE, message, PRIORITY.HIGH, {
      userIds,
      drinkType,
      totalPoints,
      userCount: userIds.length,
      teams,
      trigger: 'bulk_drink'
    })
    console.log('💾 Saved BULK HYPE commentary to database')

  } catch (error) {
    console.error('Error generating bulk commentary:', error)
    // Don't throw - commentary generation should not break drink logging
  }
}

// ✨ NEW: Enhanced commentary for individual drink with competitive changes
export async function generateEnhancedCommentaryForDrink(
  significantChanges: SignificantChange[],
  triggeringAction: {
    userId: string
    userName: string
    drinkType: string
    points: number
  }
): Promise<void> {
  try {
    console.log('🎯 Generating ENHANCED commentary for:', { 
      userName: triggeringAction.userName, 
      changes: significantChanges.length 
    })

    // Prioritize changes by importance
    const prioritizedChanges = prioritizeChanges(significantChanges)
    const mostImportantChange = prioritizedChanges[0]

    if (!mostImportantChange) {
      console.log('❌ No significant changes to comment on')
      return
    }

    // Build enhanced context with competitive changes
    const enhancedContext: CommentaryContext = {
      eventType: getCommentaryEventType(mostImportantChange.type),
      user: {
        name: triggeringAction.userName,
        totalPoints: mostImportantChange.data.user?.points || 0,
        totalDrinks: 0, // Not critical for enhanced commentary
        recentDrinks: 0,
        isOnStreak: false
      },
      drink: {
        type: triggeringAction.drinkType,
        points: triggeringAction.points
      },
      competitiveChanges: {
        leadershipChanges: significantChanges
          .filter(c => c.type === 'LEADERSHIP_TAKEN' || c.type === 'TEAM_LEADERSHIP')
          .map(c => mapToLeadershipChange(c)),
        rankingShifts: significantChanges
          .filter(c => c.type === 'RANK_JUMP')
          .map(c => mapToRankingShift(c)),
        teamOvertakes: significantChanges
          .filter(c => c.type === 'TEAM_OVERTAKE')
          .map(c => mapToTeamOvertake(c)),
        positionChanges: significantChanges
          .filter(c => ['TOP_3_ENTRY', 'TOP_3_EXIT', 'LAST_PLACE_ESCAPE', 'LAST_PLACE_ENTRY'].includes(c.type))
          .map(c => mapToPositionChange(c))
      }
    }

    console.log('🤖 Generating ENHANCED commentary message...')
    const message = await generateCommentaryMessage(enhancedContext)
    console.log('✅ Generated enhanced message:', message)

    // Create commentary with appropriate priority
    await createCommentary(
      getCommentaryTypeString(mostImportantChange.type),
      message, 
      mostImportantChange.priority, 
      {
        userId: triggeringAction.userId,
        trigger: 'enhanced_individual',
        changes: significantChanges.length,
        changeTypes: significantChanges.map(c => c.type)
      }
    )
    console.log('💾 Saved ENHANCED commentary to database')

  } catch (error) {
    console.error('Error generating enhanced commentary:', error)
    // Don't throw - commentary generation should not break drink logging
  }
}

// ✨ NEW: Enhanced commentary for bulk operations with multiple changes
export async function generateEnhancedBulkDrinkCommentary(
  significantChanges: SignificantChange[],
  users: Array<{ id: string; name: string; teamName?: string }>,
  drinkType: string,
  totalPoints: number
): Promise<void> {
  try {
    console.log('🔥 Generating ENHANCED BULK commentary for:', { 
      userCount: users.length, 
      changes: significantChanges.length 
    })

    if (significantChanges.length === 0) {
      console.log('❌ No significant changes for bulk commentary')
      return
    }

    // Build consolidated bulk context
    const bulkContext: CommentaryContext = {
      eventType: 'consolidated_bulk',
      user: {
        name: users.map(u => u.name).join(', '),
        totalPoints: totalPoints,
        totalDrinks: users.length,
        recentDrinks: users.length,
        isOnStreak: false
      },
      drink: {
        type: drinkType,
        points: totalPoints
      },
      bulk: {
        userCount: users.length,
        userNames: users.map(u => u.name),
        teams: [...new Set(users.map(u => u.teamName).filter(Boolean))] as string[],
        totalPointsAdded: totalPoints
      },
      competitiveChanges: {
        leadershipChanges: significantChanges
          .filter(c => c.type === 'LEADERSHIP_TAKEN' || c.type === 'TEAM_LEADERSHIP')
          .map(c => mapToLeadershipChange(c)),
        rankingShifts: significantChanges
          .filter(c => c.type === 'RANK_JUMP')
          .map(c => mapToRankingShift(c)),
        teamOvertakes: significantChanges
          .filter(c => c.type === 'TEAM_OVERTAKE')
          .map(c => mapToTeamOvertake(c)),
        positionChanges: significantChanges
          .filter(c => ['TOP_3_ENTRY', 'TOP_3_EXIT', 'LAST_PLACE_ESCAPE', 'LAST_PLACE_ENTRY'].includes(c.type))
          .map(c => mapToPositionChange(c))
      }
    }

    console.log('🤖 Generating ENHANCED BULK commentary message...')
    const message = await generateCommentaryMessage(bulkContext)
    console.log('✅ Generated enhanced bulk message:', message)

    // Find highest priority among changes
    const highestPriority = Math.max(...significantChanges.map(c => c.priority))

    // Create high-priority consolidated commentary
    await createCommentary(
      ENHANCED_COMMENTARY_TYPES.CONSOLIDATED_BULK,
      message, 
      highestPriority,
      {
        userIds: users.map(u => u.id),
        drinkType,
        totalPoints,
        userCount: users.length,
        teams: [...new Set(users.map(u => u.teamName).filter(Boolean))],
        trigger: 'enhanced_bulk',
        changes: significantChanges.length,
        changeTypes: significantChanges.map(c => c.type)
      }
    )
    console.log('💾 Saved ENHANCED BULK commentary to database')

  } catch (error) {
    console.error('Error generating enhanced bulk commentary:', error)
    // Don't throw - commentary generation should not break drink logging
  }
}

// Helper functions to convert between types

function getCommentaryEventType(changeType: string): CommentaryContext['eventType'] {
  switch (changeType) {
    case 'LEADERSHIP_TAKEN':
      return 'leadership_change'
    case 'TOP_3_ENTRY':
    case 'TOP_3_EXIT':
      return 'top_3_change'
    case 'TEAM_LEADERSHIP':
      return 'team_leadership'
    case 'TEAM_OVERTAKE':
      return 'team_overtake'
    case 'RANK_JUMP':
      return 'rank_jump'
    case 'LAST_PLACE_ESCAPE':
    case 'LAST_PLACE_ENTRY':
      return 'last_place_change'
    default:
      return 'hype'
  }
}

function getCommentaryTypeString(changeType: string): string {
  switch (changeType) {
    case 'LEADERSHIP_TAKEN':
      return ENHANCED_COMMENTARY_TYPES.LEADERSHIP_CHANGE
    case 'TOP_3_ENTRY':
    case 'TOP_3_EXIT':
      return ENHANCED_COMMENTARY_TYPES.TOP_3_CHANGE
    case 'TEAM_LEADERSHIP':
      return ENHANCED_COMMENTARY_TYPES.TEAM_LEADERSHIP
    case 'TEAM_OVERTAKE':
      return ENHANCED_COMMENTARY_TYPES.TEAM_OVERTAKE
    case 'RANK_JUMP':
      return ENHANCED_COMMENTARY_TYPES.RANK_JUMP
    case 'LAST_PLACE_ESCAPE':
    case 'LAST_PLACE_ENTRY':
      return ENHANCED_COMMENTARY_TYPES.LAST_PLACE_CHANGE
    default:
      return COMMENTARY_TYPES.HYPE
  }
}

function mapToLeadershipChange(change: SignificantChange) {
  return {
    type: change.data.leadership?.type || 'global',
    newLeader: change.data.leadership?.newLeader || { name: '', points: 0 },
    previousLeader: change.data.leadership?.previousLeader || { name: '', points: 0 },
    margin: change.data.leadership?.margin || 0,
    teamName: change.data.leadership?.teamName
  }
}

function mapToRankingShift(change: SignificantChange) {
  return {
    user: change.data.user?.name || '',
    type: 'global' as const, // Default to global for now
    from: change.data.rankChange?.from || 0,
    to: change.data.rankChange?.to || 0,
    pointsGained: 0, // Would need additional data
    usersJumped: [] // Would need additional data
  }
}

function mapToTeamOvertake(change: SignificantChange) {
  return {
    overtakingTeam: { 
      name: change.data.teamChange?.overtakingTeam.name || '', 
      color: change.data.teamChange?.overtakingTeam.color || '' 
    },
    overtakenTeam: { 
      name: change.data.teamChange?.overtakenTeam.name || '', 
      color: change.data.teamChange?.overtakenTeam.color || '' 
    },
    newRanks: change.data.teamChange?.newRanks || { overtaking: 0, overtaken: 0 },
    pointDifference: change.data.teamChange?.pointDifference || 0
  }
}

function mapToPositionChange(change: SignificantChange) {
  const getPositionChangeType = (type: string) => {
    switch (type) {
      case 'TOP_3_ENTRY': return 'entered_top_3' as const
      case 'TOP_3_EXIT': return 'left_top_3' as const
      case 'LAST_PLACE_ESCAPE': return 'escaped_last' as const
      case 'LAST_PLACE_ENTRY': return 'became_last' as const
      default: return 'entered_top_3' as const
    }
  }

  return {
    user: change.data.user?.name || '',
    type: getPositionChangeType(change.type),
    newPosition: change.data.rankChange?.to || 0,
    previousPosition: change.data.rankChange?.from || 0
  }
}