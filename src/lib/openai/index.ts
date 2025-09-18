import 'server-only'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CommentaryContext {
  eventType: 'milestone' | 'streak' | 'achievement' | 'hype' | 'team_event' | 'bulk_hype'
  user: {
    name: string
    totalPoints: number
    totalDrinks: number
    recentDrinks: number
    isOnStreak: boolean
    joinedAgo?: string // "pred 2 urama"
    lastDrinkAgo?: string // "pred 5 minutami"
  }
  team?: {
    name: string
    color: string
    totalPoints: number
    memberCount: number
    createdAgo?: string // "pred 1 uro"
  }
  drink: {
    type: string
    points: number
    timeOfDay?: string // "popoldan", "zvečer", "ponoči"
  }
  milestone?: {
    pointsReached: number
    isSignificant: boolean // 25+ points
    timeSinceLastMilestone?: string // "v 15 minutah"
  }
  streak?: {
    count: number
    timeWindow: string // "30 minut"
    streakDuration?: string // "v zadnjih 15 minutah"
  }
  achievement?: {
    type: 'first_drink' | 'team_leader' | 'team_overtake'
    details?: string
    timingContext?: string // "po 30 minutah"
  }
  bulk?: {
    userCount: number
    userNames: string[]
    teams: string[]
    totalPointsAdded: number
  }
}

// Helper functions for time calculations
function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 6) return "ponoči"
  if (hour < 12) return "zjutraj"
  if (hour < 18) return "popoldan"
  if (hour < 22) return "zvečer"
  return "ponoči"
}

function formatTimeDifference(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return "ravnokar"
  if (diffMinutes < 60) return `pred ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : diffMinutes < 5 ? 'minutami' : 'minutami'}`
  if (diffHours < 24) return `pred ${diffHours} ${diffHours === 1 ? 'uro' : diffHours < 5 ? 'urama' : 'urami'}`
  return `pred ${diffDays} ${diffDays === 1 ? 'dnem' : 'dnevi'}`
}

function calculateStreakDuration(recentDrinks: number): string {
  // Assuming recent drinks are within 30 minutes, calculate rough duration
  const estimatedMinutes = Math.min(recentDrinks * 5, 30) // rough estimate
  if (estimatedMinutes < 10) return `v zadnjih ${estimatedMinutes} minutah`
  if (estimatedMinutes < 30) return `v zadnjih ${estimatedMinutes} minutah`
  return "v zadnji pol uri"
}

const SYSTEM_PROMPTS = {
  milestone: `Si energičen športni komentator za tekmovanje v pitju "Pokal Šanka". 
Ustvari kratko, vznemirljivo komentarsko sporočilo (največ 2 stavka) za trenutek, ko igralec doseže mejnik v točkah. 
Uporabi emoji znake, bodi navdušen in omeni specifične številke. Piši v slovenščini.
Naj bo zabavno in slavnostno, vendar primerno za prijateljsko tekmovanje.`,

  streak: `Si energičen športni komentator za tekmovanje v pitju "Pokal Šanka".
Ustvari kratko, vznemirljivo komentarsko sporočilo (največ 2 stavka) za trenutek, ko je igralec v nizu pitja.
Uporabi ogenj/energijske emoji znake, bodi navdušen nad njihovim momentumom. Piši v slovenščini.
Osredotoči se na intenziteto in ritem njihove izvedbe.`,

  achievement: `Si energičen športni komentator za tekmovanje v pitju "Pokal Šanka".
Ustvari kratko, vznemirljivo komentarsko sporočilo (največ 2 stavka) za posebne dosežke kot so prve pijače ali spremembe vodstva.
Uporabi praznične emoji znake, bodi navdušen. Piši v slovenščini.
Naj se sliši kot pomemben trenutek v tekmovanju.`,

  hype: `Si energičen športni komentator za tekmovanje v pitju "Pokal Šanka".
Ustvari kratko, splošno vzpodbudno sporočilo (največ 2 stavka) za dvig vznemirjenja med tekmovanjem.
Uporabi energijske emoji znake, osredotoči se na vzdušje in energijo. Piši v slovenščini.
Naj se sliši kot trenutek iz žive športne oddaje.`,

  team_event: `Si energičen športni komentator za tekmovanje v pitju "Pokal Šanka".
Ustvari kratko, vznemirljivo komentarsko sporočilo (največ 2 stavka) za dogodke povezane z ekipo kot so doseženi mejniki ali dinamika tekmovanja med ekipami.
Uporabi ekipne/tekmovalne emoji znake, osredotoči se na ekipni duh in rivalstvo. Piši v slovenščini.
Naj se sliši kot pomemben ekipni trenutek.`,
  bulk_hype: `Si energičen športni komentator za tekmovanje v pitju "Pokal Šanka".
Ustvari MAKSIMALNO vznemirljivo komentarsko sporočilo (največ 3 stavka) za trenutek, ko več igralcev hkrati pije - to je PRAVI spektakel!
Uporabi ognjene emoji znake 🔥🍻, omeni vse igralce po imenih, bodi EKSTREMNO navdušen nad skupinskim momentom. Piši v slovenščini.
To je najbolj vznemirljiv trenutek tekmovanja - pokajži to! Uporabi fraze kot "vik in vihar nadaljujeta", "spektakel", "neverjeten prizor"!`
}

export async function generateCommentaryMessage(
  context: CommentaryContext
): Promise<string> {
  try {
    const systemPrompt = SYSTEM_PROMPTS[context.eventType]
    
    // Build context string for the LLM with enhanced time context
    let contextString = ''
    
    if (context.bulk) {
      // Special handling for bulk events
      contextString = `SKUPINSKI DOGODEK! ${context.bulk.userCount} igralcev pije hkrati!\n`
      contextString += `Igralci: ${context.bulk.userNames.join(', ')}\n`
      if (context.bulk.teams.length > 0) {
        contextString += `Ekipe: ${context.bulk.teams.join(', ')}\n`
      }
      contextString += `Skupaj dodanih točk: ${context.bulk.totalPointsAdded}\n`
    } else {
      contextString = `Igralec: ${context.user.name}\n`
      contextString += `Skupaj točk: ${context.user.totalPoints}\n`
      contextString += `Skupaj pijač: ${context.user.totalDrinks}\n`
    }
    
    if (!context.bulk) {
      // Single-user specific context
      if (context.user.joinedAgo) {
        contextString += `Pridružen: ${context.user.joinedAgo}\n`
      }
      
      if (context.user.lastDrinkAgo) {
        contextString += `Zadnja pijača: ${context.user.lastDrinkAgo}\n`
      }
      
      if (context.team) {
        contextString += `Ekipa: ${context.team.name} (${context.team.totalPoints} točk, ${context.team.memberCount} članov)\n`
        if (context.team.createdAgo) {
          contextString += `Ekipa ustanovljena: ${context.team.createdAgo}\n`
        }
      }
    }
    
    if (context.bulk) {
      contextString += `Vrsta pijače: ${context.drink.type === 'REGULAR' ? 'Pivo' : 'Žganje'} za vse (skupaj +${context.drink.points} točk)\n`
    } else {
      contextString += `Trenutna pijača: ${context.drink.type === 'REGULAR' ? 'Pivo' : 'Žganje'} (+${context.drink.points} točk)\n`
    }
    
    if (context.drink.timeOfDay) {
      contextString += `Čas dneva: ${context.drink.timeOfDay}\n`
    }
    
    if (context.milestone) {
      contextString += `Mejnik: ${context.milestone.pointsReached} točk${context.milestone.isSignificant ? ' (pomemben mejnik!)' : ''}\n`
      if (context.milestone.timeSinceLastMilestone) {
        contextString += `Čas od zadnjega mejnika: ${context.milestone.timeSinceLastMilestone}\n`
      }
    }
    
    if (context.streak) {
      contextString += `Niz: ${context.streak.count} pijač v ${context.streak.timeWindow}\n`
      if (context.streak.streakDuration) {
        contextString += `Trajanje niza: ${context.streak.streakDuration}\n`
      }
    }
    
    if (context.achievement) {
      contextString += `Dosežek: ${context.achievement.type}${context.achievement.details ? ` - ${context.achievement.details}` : ''}\n`
      if (context.achievement.timingContext) {
        contextString += `Časovni kontekst: ${context.achievement.timingContext}\n`
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective for short messages
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: `Ustvari komentar za naslednji kontekst:\n\n${contextString}`
        }
      ],
      max_tokens: 100,
      temperature: 0.8, // More creative/varied responses
    })

    const message = response.choices[0]?.message?.content?.trim()
    
    if (!message) {
      throw new Error('No message generated from OpenAI')
    }

    return message

  } catch (error) {
    console.error('OpenAI commentary generation failed:', error)
    
    // Fallback to simple templates if OpenAI fails
    const fallbackMessages = {
      milestone: `🏆 ${context.user.name} je dosegel ${context.user.totalPoints} točk!`,
      streak: `🔥 ${context.user.name} je v nizu! ${context.user.recentDrinks} pijač zapored!`,
      achievement: `🎊 ${context.user.name} je dosegel pomemben mejnik!`,
      hype: `🎉 Tekmovanje se stopnjuje!`,
      team_event: `🚀 Ekipa ${context.team?.name || 'neznana'} napreduje!`,
      bulk_hype: `🔥🍻 SPEKTAKEL! ${context.bulk?.userNames.join(', ') || 'Več igralcev'} pije hkrati! Vik in vihar nadaljujeta! 🎉`
    }
    
    return fallbackMessages[context.eventType] || '🍻 Odličen trenutek v tekmovanju!'
  }
}

// Helper function to determine if a milestone is significant
export function isSignificantMilestone(points: number): boolean {
  return points >= 25 || points % 50 === 0
}

// Helper function to get achievement description
export function getAchievementDescription(type: string): string {
  switch (type) {
    case 'first_drink': return 'prva pijača danes'
    case 'team_leader': return 'nov vodja ekipe'
    case 'team_overtake': return 'ekipa je prehitela drugo'
    default: return 'poseben dosežek'
  }
}

// Export time helper functions for use in commentary generator
export { getTimeOfDay, formatTimeDifference, calculateStreakDuration }