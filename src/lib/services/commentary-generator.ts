import { createCommentary, getUserStatsForCommentary, getTeamStatsForCommentary } from '@/lib/prisma/fetchers'

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

// Dummy message templates (will be replaced by LLM later)
const DUMMY_MESSAGES = {
  [COMMENTARY_TYPES.MILESTONE]: [
    "🎉 {userName} just hit {points} points!",
    "🏆 Milestone alert! {userName} reached {points} points!",
    "⭐ {userName} is crushing it with {points} points!"
  ],
  [COMMENTARY_TYPES.STREAK]: [
    "🔥 {userName} is on fire! {streakCount} drinks in 30 minutes!",
    "⚡ {userName} is unstoppable! {streakCount} drink streak!",
    "🚀 {userName} is in the zone with {streakCount} consecutive drinks!"
  ],
  [COMMENTARY_TYPES.ACHIEVEMENT]: [
    "🎊 First drink of the day goes to {userName}!",
    "👑 {userName} just became the new team leader!",
    "🥇 {userName} takes the lead with {points} points!"
  ],
  [COMMENTARY_TYPES.HYPE]: [
    "🍻 The party is heating up!",
    "🎉 Another round, another point!",
    "⚡ The energy is electric tonight!",
    "🔥 This is what competition looks like!"
  ],
  [COMMENTARY_TYPES.TEAM_EVENT]: [
    "🚀 Team {teamName} just passed {rivalTeam}!",
    "👑 Team {teamName} takes the lead with {points} points!",
    "🏆 Team {teamName} is dominating the leaderboard!"
  ]
}

// Get random message template
function getRandomMessage(type: string): string {
  const messages = DUMMY_MESSAGES[type as keyof typeof DUMMY_MESSAGES] || DUMMY_MESSAGES[COMMENTARY_TYPES.HYPE]
  return messages[Math.floor(Math.random() * messages.length)]
}

// Replace placeholders in message template
function formatMessage(template: string, data: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] || match
  })
}

// Main function to generate commentary after drink log
export async function generateCommentaryForDrink(
  userId: string, 
  drinkType: string, 
  points: number
): Promise<void> {
  try {
    // Get user and team stats
    const userStats = await getUserStatsForCommentary(userId)
    if (!userStats) return

    const { user, stats } = userStats
    const teamStats = user.teamId ? await getTeamStatsForCommentary(user.teamId) : null

    // Check for milestone (every 5, 10, 25, 50 points)
    if (stats.totalPoints % 5 === 0 && stats.totalPoints >= 5) {
      const priority = stats.totalPoints >= 25 ? PRIORITY.HIGH : 
                      stats.totalPoints >= 10 ? PRIORITY.NORMAL : PRIORITY.LOW
      
      const message = formatMessage(getRandomMessage(COMMENTARY_TYPES.MILESTONE), {
        userName: user.name,
        points: stats.totalPoints
      })

      await createCommentary(COMMENTARY_TYPES.MILESTONE, message, priority, {
        userId: user.id,
        teamId: user.teamId,
        points: stats.totalPoints,
        drinkType
      })
    }

    // Check for streak (3+ drinks in 30 minutes)
    if (stats.isOnStreak && stats.recentDrinks >= 3) {
      const message = formatMessage(getRandomMessage(COMMENTARY_TYPES.STREAK), {
        userName: user.name,
        streakCount: stats.recentDrinks
      })

      await createCommentary(COMMENTARY_TYPES.STREAK, message, PRIORITY.HIGH, {
        userId: user.id,
        teamId: user.teamId,
        streakCount: stats.recentDrinks,
        drinkType
      })
    }

    // Check for first drink achievement
    if (stats.totalDrinks === 1) {
      const message = formatMessage(getRandomMessage(COMMENTARY_TYPES.ACHIEVEMENT), {
        userName: user.name
      })

      await createCommentary(COMMENTARY_TYPES.ACHIEVEMENT, message, PRIORITY.NORMAL, {
        userId: user.id,
        teamId: user.teamId,
        achievement: 'first_drink'
      })
    }

    // Random hype message (20% chance)
    if (Math.random() < 0.2) {
      const message = getRandomMessage(COMMENTARY_TYPES.HYPE)
      
      await createCommentary(COMMENTARY_TYPES.HYPE, message, PRIORITY.LOW, {
        userId: user.id,
        teamId: user.teamId,
        trigger: 'random_hype'
      })
    }

    // Team event check (placeholder for now)
    if (teamStats && stats.totalPoints % 10 === 0) {
      const message = formatMessage(getRandomMessage(COMMENTARY_TYPES.TEAM_EVENT), {
        teamName: teamStats.team.name,
        points: teamStats.stats.totalPoints
      })

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