/**
 * Trivia scoring logic — pure functions with no DB dependencies.
 * These can be used both server-side (in actions) and in the fetchers layer.
 */

export interface TriviaCategoryResultInput {
  q1Winner: string | null
  q2Winner: string | null
  q3Winner: string | null
  hasNumericBonus: boolean
}

export interface TriviaCategoryResultOutput {
  scenario: string
  categoryWinner: string | null
  basePoints: number
  numericBonus: number
  finalPoints: number
}

const SCENARIOS = {
  GODLIKE: 'Godlike',
  TWO_WINS: 'Two Wins',
  STEAL_YO_GF: 'Steal Yo GF',
  SINGLE_WIN: 'Single Win',
  NO_SCORE: 'No Score',
} as const

export function calculateTriviaCategoryResult(
  input: TriviaCategoryResultInput
): TriviaCategoryResultOutput {
  const { q1Winner, q2Winner, q3Winner, hasNumericBonus } = input
  const winners = [q1Winner, q2Winner, q3Winner].filter(Boolean) as string[]

  let scenario: string
  let categoryWinner: string | null
  let basePoints: number

  if (winners.length === 0) {
    scenario = SCENARIOS.NO_SCORE
    categoryWinner = null
    basePoints = 0
  } else {
    // Count wins per player
    const winCounts = new Map<string, number>()
    winners.forEach((w) => winCounts.set(w, (winCounts.get(w) || 0) + 1))

    const maxWins = Math.max(...winCounts.values(), 0)

    if (maxWins === 3) {
      // Same player won all 3 questions
      categoryWinner = [...winCounts.entries()].find(([, c]) => c === 3)![0]
      scenario = SCENARIOS.GODLIKE
      basePoints = 6
    } else if (maxWins === 2) {
      // Same player won 2 questions
      categoryWinner = [...winCounts.entries()].find(([, c]) => c === 2)![0]
      scenario = SCENARIOS.TWO_WINS
      basePoints = 2
    } else if (winners.length === 3) {
      // Three different winners — "Steal Yo GF" scenario
      categoryWinner = q3Winner // Third question winner takes the category
      scenario = SCENARIOS.STEAL_YO_GF
      basePoints = 1
    } else {
      // Only one or two winners with one win each (unlikely with 3 questions, but handled)
      categoryWinner = winners[0]
      scenario = SCENARIOS.SINGLE_WIN
      basePoints = 1
    }
  }

  const numericBonus = hasNumericBonus ? 1 : 0
  const finalPoints = basePoints + numericBonus

  return { scenario, categoryWinner, basePoints, numericBonus, finalPoints }
}
