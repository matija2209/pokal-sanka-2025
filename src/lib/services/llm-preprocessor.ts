import 'server-only'
import type { 
  StateComparison, 
  SignificantChange, 
  LeadershipChange, 
  RankingShift, 
  TeamPositionChange,
  PositionChange
} from './state-comparator'

// Enhanced LLM context for GPT-4
export interface EnhancedLLMContext {
  eventType: 'enhanced_individual' | 'enhanced_bulk'
  triggeringAction: {
    userCount: number
    users: string[]
    drinkType: string
    totalPointsAdded: number
  }
  competitiveChanges: {
    leadershipChanges: Array<{
      type: 'global' | 'team'
      newLeader: { name: string; points: number }
      previousLeader: { name: string; points: number }
      margin: number
      teamName?: string
    }>
    rankingShifts: Array<{
      user: string
      type: 'global' | 'team'  
      from: number
      to: number
      pointsGained: number
      usersJumped: string[]
    }>
    teamOvertakes: Array<{
      overtakingTeam: { name: string; color: string }
      overtakenTeam: { name: string; color: string }
      newRanks: { overtaking: number; overtaken: number }
      pointDifference: number
    }>
    positionChanges: Array<{
      user: string
      type: 'entered_top_3' | 'left_top_3' | 'escaped_last' | 'became_last'
      newPosition: number
      previousPosition: number
    }>
  }
  prioritizedChanges: Array<{
    type: string
    priority: number
    description: string
    details: string
  }>
  competitiveContext: {
    closeCalls: Array<{ user1: string; user2: string; pointGap: number }>
    totalParticipants: number
  }
}

// Consolidated context for bulk operations
export interface ConsolidatedLLMContext {
  eventType: 'consolidated_bulk'
  triggeringAction: {
    userCount: number
    users: string[]
    teams: string[]
    drinkType: string
    totalPointsAdded: number
  }
  multipleChanges: {
    summary: string
    leadershipChanges: number
    rankingShifts: number
    teamOvertakes: number
    positionChanges: number
  }
  keyHighlights: Array<{
    type: string
    description: string
    participants: string[]
  }>
  overallImpact: {
    teamsAffected: string[]
    biggestWinners: string[]
    dramaticMoments: string[]
  }
}

// Create enhanced context for individual drink
export function createEnhancedLLMContext(
  changes: SignificantChange[], 
  triggeringAction: {
    userId: string
    userName: string
    drinkType: string
    points: number
  }
): EnhancedLLMContext {
  
  // Process significant changes into structured format
  const competitiveChanges = {
    leadershipChanges: changes
      .filter(c => c.type === 'LEADERSHIP_TAKEN' || c.type === 'TEAM_LEADERSHIP')
      .map(c => ({
        type: c.data.leadership?.type || 'global',
        newLeader: c.data.leadership?.newLeader || { name: '', points: 0 },
        previousLeader: c.data.leadership?.previousLeader || { name: '', points: 0 },
        margin: c.data.leadership?.margin || 0,
        teamName: c.data.leadership?.teamName
      })),
    
    rankingShifts: changes
      .filter(c => c.type === 'RANK_JUMP')
      .map(c => ({
        user: c.data.user?.name || '',
        type: c.data.details?.includes('globalno') ? 'global' as const : 'team' as const,
        from: c.data.rankChange?.from || 0,
        to: c.data.rankChange?.to || 0,
        pointsGained: triggeringAction.points,
        usersJumped: [] // This would need to be populated from the original data
      })),
    
    teamOvertakes: changes
      .filter(c => c.type === 'TEAM_OVERTAKE')
      .map(c => ({
        overtakingTeam: { 
          name: c.data.teamChange?.overtakingTeam.name || '', 
          color: c.data.teamChange?.overtakingTeam.color || '' 
        },
        overtakenTeam: { 
          name: c.data.teamChange?.overtakenTeam.name || '', 
          color: c.data.teamChange?.overtakenTeam.color || '' 
        },
        newRanks: c.data.teamChange?.newRanks || { overtaking: 0, overtaken: 0 },
        pointDifference: c.data.teamChange?.pointDifference || 0
      })),
    
    positionChanges: changes
      .filter(c => ['TOP_3_ENTRY', 'TOP_3_EXIT', 'LAST_PLACE_ESCAPE', 'LAST_PLACE_ENTRY'].includes(c.type))
      .map(c => ({
        user: c.data.user?.name || '',
        type: c.type === 'TOP_3_ENTRY' ? 'entered_top_3' as const :
              c.type === 'TOP_3_EXIT' ? 'left_top_3' as const :
              c.type === 'LAST_PLACE_ESCAPE' ? 'escaped_last' as const : 'became_last' as const,
        newPosition: c.data.rankChange?.to || 0,
        previousPosition: c.data.rankChange?.from || 0
      }))
  }

  // Create prioritized changes with Slovenian descriptions
  const prioritizedChanges = changes.map(change => ({
    type: change.type,
    priority: change.priority,
    description: generateSlovenianDescription(change),
    details: change.data.details || ''
  })).sort((a, b) => b.priority - a.priority)

  return {
    eventType: 'enhanced_individual',
    triggeringAction: {
      userCount: 1,
      users: [triggeringAction.userName],
      drinkType: triggeringAction.drinkType,
      totalPointsAdded: triggeringAction.points
    },
    competitiveChanges,
    prioritizedChanges,
    competitiveContext: {
      closeCalls: [], // Would need additional data to populate
      totalParticipants: 0 // Would need to be passed in
    }
  }
}

// Create consolidated context for bulk operations
export function consolidateBulkChanges(
  allChanges: SignificantChange[][],
  users: Array<{ id: string; name: string; teamName?: string }>
): ConsolidatedLLMContext {
  
  // Flatten all changes
  const flatChanges = allChanges.flat()
  
  // Count changes by type
  const leadershipChanges = flatChanges.filter(c => c.type === 'LEADERSHIP_TAKEN' || c.type === 'TEAM_LEADERSHIP').length
  const rankingShifts = flatChanges.filter(c => c.type === 'RANK_JUMP').length
  const teamOvertakes = flatChanges.filter(c => c.type === 'TEAM_OVERTAKE').length
  const positionChanges = flatChanges.filter(c => ['TOP_3_ENTRY', 'TOP_3_EXIT', 'LAST_PLACE_ESCAPE', 'LAST_PLACE_ENTRY'].includes(c.type)).length

  // Generate summary
  const summary = generateBulkSummary({
    leadershipChanges,
    rankingShifts, 
    teamOvertakes,
    positionChanges
  })

  // Extract key highlights
  const keyHighlights = extractKeyHighlights(flatChanges, users)

  // Get teams affected
  const teamsAffected = [...new Set(users.map(u => u.teamName).filter(Boolean))] as string[]
  
  // Find biggest winners (users involved in most changes)
  const userChangeCount = new Map<string, number>()
  flatChanges.forEach(change => {
    if (change.data.user) {
      userChangeCount.set(change.data.user.name, (userChangeCount.get(change.data.user.name) || 0) + 1)
    }
  })
  const biggestWinners = Array.from(userChangeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)

  // Identify dramatic moments
  const dramaticMoments = identifyDramaticMoments(flatChanges)

  return {
    eventType: 'consolidated_bulk',
    triggeringAction: {
      userCount: users.length,
      users: users.map(u => u.name),
      teams: teamsAffected,
      drinkType: 'MIXED', // Bulk operations might have mixed drinks
      totalPointsAdded: 0 // Would need to be calculated
    },
    multipleChanges: {
      summary,
      leadershipChanges,
      rankingShifts,
      teamOvertakes,
      positionChanges
    },
    keyHighlights,
    overallImpact: {
      teamsAffected,
      biggestWinners,
      dramaticMoments
    }
  }
}

// Generate Slovenian descriptions for changes
function generateSlovenianDescription(change: SignificantChange): string {
  switch (change.type) {
    case 'LEADERSHIP_TAKEN':
      return `${change.data.user?.name} je prevzel globalno vodstvo!`
    case 'TEAM_LEADERSHIP':
      return `${change.data.user?.name} je postal novi vodja ekipe!`
    case 'TOP_3_ENTRY':
      return `${change.data.user?.name} je vstopil v TOP 3!`
    case 'TOP_3_EXIT':
      return `${change.data.user?.name} je padel iz TOP 3!`
    case 'TEAM_OVERTAKE':
      return `Ekipa ${change.data.teamChange?.overtakingTeam.name} je prehitela!`
    case 'RANK_JUMP':
      return `${change.data.user?.name} je naredil velik skok!`
    case 'LAST_PLACE_ESCAPE':
      return `${change.data.user?.name} ni več zadnji!`
    case 'LAST_PLACE_ENTRY':
      return `${change.data.user?.name} je padel na zadnje mesto!`
    default:
      return 'Pomembna sprememba na lestvici!'
  }
}

// Generate bulk summary in Slovenian
function generateBulkSummary(counts: {
  leadershipChanges: number
  rankingShifts: number
  teamOvertakes: number
  positionChanges: number
}): string {
  const parts: string[] = []
  
  if (counts.leadershipChanges > 0) {
    parts.push(`${counts.leadershipChanges} sprememb vodstva`)
  }
  if (counts.rankingShifts > 0) {
    parts.push(`${counts.rankingShifts} velikih skokov`)
  }
  if (counts.teamOvertakes > 0) {
    parts.push(`${counts.teamOvertakes} ekipnih prehitevanj`)
  }
  if (counts.positionChanges > 0) {
    parts.push(`${counts.positionChanges} pomembnih premikov`)
  }

  if (parts.length === 0) return 'Mirna situacija na lestvici'
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return parts.join(' in ')
  
  return parts.slice(0, -1).join(', ') + ' in ' + parts[parts.length - 1]
}

// Extract key highlights from changes
function extractKeyHighlights(
  changes: SignificantChange[], 
  users: Array<{ id: string; name: string; teamName?: string }>
): Array<{ type: string; description: string; participants: string[] }> {
  
  const highlights: Array<{ type: string; description: string; participants: string[] }> = []

  // Group by type and create highlights
  const leadershipChanges = changes.filter(c => c.type === 'LEADERSHIP_TAKEN')
  if (leadershipChanges.length > 0) {
    highlights.push({
      type: 'leadership',
      description: 'Sprememba globalnega vodstva',
      participants: leadershipChanges.map(c => c.data.user?.name || '').filter(Boolean)
    })
  }

  const teamLeadershipChanges = changes.filter(c => c.type === 'TEAM_LEADERSHIP')
  if (teamLeadershipChanges.length > 0) {
    highlights.push({
      type: 'team_leadership',
      description: 'Spremembe vodstva v ekipah',
      participants: teamLeadershipChanges.map(c => c.data.user?.name || '').filter(Boolean)
    })
  }

  const top3Changes = changes.filter(c => c.type === 'TOP_3_ENTRY' || c.type === 'TOP_3_EXIT')
  if (top3Changes.length > 0) {
    highlights.push({
      type: 'top3_changes',
      description: 'Premiki v TOP 3',
      participants: top3Changes.map(c => c.data.user?.name || '').filter(Boolean)
    })
  }

  const teamOvertakes = changes.filter(c => c.type === 'TEAM_OVERTAKE')
  if (teamOvertakes.length > 0) {
    highlights.push({
      type: 'team_overtakes',
      description: 'Ekipna prehitevanja',
      participants: teamOvertakes.map(c => c.data.teamChange?.overtakingTeam.name || '').filter(Boolean)
    })
  }

  return highlights
}

// Identify most dramatic moments
function identifyDramaticMoments(changes: SignificantChange[]): string[] {
  const dramatic: string[] = []

  // Global leadership changes are always dramatic
  const leadershipChanges = changes.filter(c => c.type === 'LEADERSHIP_TAKEN')
  leadershipChanges.forEach(change => {
    dramatic.push(`${change.data.user?.name} je prevzel prestol!`)
  })

  // Multiple team overtakes are dramatic
  const teamOvertakes = changes.filter(c => c.type === 'TEAM_OVERTAKE')
  if (teamOvertakes.length > 1) {
    dramatic.push('Večkratna ekipna prehitevanja!')
  }

  // Someone escaping last place is uplifting
  const lastPlaceEscapes = changes.filter(c => c.type === 'LAST_PLACE_ESCAPE')
  lastPlaceEscapes.forEach(change => {
    dramatic.push(`${change.data.user?.name} se je prebil z dna!`)
  })

  return dramatic
}