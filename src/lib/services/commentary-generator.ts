import { createCommentary, getUserStatsForCommentary, getTeamStatsForCommentary } from '@/lib/prisma/fetchers'
import { generateCommentaryMessage, isSignificantMilestone, getAchievementDescription, type CommentaryContext } from '@/lib/openai'

// Commentary types
export const COMMENTARY_TYPES = {
  MILESTONE: 'milestone',
  STREAK: 'streak', 
  ACHIEVEMENT: 'achievement',
  HYPE: 'hype',
  TEAM_EVENT: 'team_event'
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
      type: drinkType as 'REGULAR' | 'SHOT',
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
        type: drinkType as 'REGULAR' | 'SHOT',
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