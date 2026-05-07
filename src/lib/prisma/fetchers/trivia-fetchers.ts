import 'server-only'

import { prisma } from '../client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable, isTriviaAvailable } from '@/lib/prisma/schema-capabilities'

// ---------------------------------------------------------------------------
// Safety gate — every fetcher must return a safe default when trivia tables
// don't exist (pre-migration state).  The app code can be deployed BEFORE
// the migration is applied.
// ---------------------------------------------------------------------------
async function guardTriviaAvailable(): Promise<boolean> {
  if (!(await isMultiEventSchemaAvailable())) return false
  return await isTriviaAvailable()
}

// ===========================================================================
// Categories
// ===========================================================================

export async function createCategory(
  title: string,
  description?: string,
  status: string = 'draft'
) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  const eventId = await requireActiveEventId()
  return prisma.triviaCategory.create({
    data: { eventId, title, description, status },
  })
}

export async function getCategoryById(id: string) {
  if (!(await guardTriviaAvailable())) return null
  return prisma.triviaCategory.findUnique({ where: { id } })
}

export async function getAllCategories() {
  if (!(await guardTriviaAvailable())) return []
  const eventId = await requireActiveEventId()
  return prisma.triviaCategory.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    include: { questions: true, results: true },
  })
}

export async function updateCategoryStatus(id: string, status: string) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  return prisma.triviaCategory.update({
    where: { id },
    data: { status },
  })
}

export async function deleteCategory(id: string) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  return prisma.triviaCategory.delete({ where: { id } })
}

// ===========================================================================
// Questions
// ===========================================================================

export async function createQuestion(data: {
  categoryId: string
  questionNumber: number
  questionText: string
  questionType?: string
  correctAnswer?: string
  numericAnswer?: number
  allowClosest?: boolean
  media?: string
  notes?: string
}) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  return prisma.triviaQuestion.create({ data })
}

export async function getQuestionsByCategoryId(categoryId: string) {
  if (!(await guardTriviaAvailable())) return []
  return prisma.triviaQuestion.findMany({
    where: { categoryId },
    orderBy: { questionNumber: 'asc' },
  })
}

export async function updateQuestion(
  id: string,
  data: Partial<{
    questionText: string
    questionType: string
    correctAnswer: string
    numericAnswer: number
    allowClosest: boolean
    media: string
    notes: string
  }>
) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  return prisma.triviaQuestion.update({ where: { id }, data })
}

// ===========================================================================
// Category Results
// ===========================================================================

export async function createCategoryResult(data: {
  categoryId: string
  question1Winner?: string
  question2Winner?: string
  question3Winner?: string
  scenario: string
  categoryWinner?: string
  basePoints: number
  numericBonus?: number
  finalPoints: number
  manualOverride?: boolean
  overrideReason?: string
  publishedToScoreboard?: boolean
}) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  return prisma.triviaCategoryResult.create({ data })
}

export async function getCategoryResult(id: string) {
  if (!(await guardTriviaAvailable())) return null
  return prisma.triviaCategoryResult.findUnique({ where: { id } })
}

export async function getCategoryResultsByCategoryId(categoryId: string) {
  if (!(await guardTriviaAvailable())) return []
  return prisma.triviaCategoryResult.findMany({
    where: { categoryId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllPublishedResults() {
  if (!(await guardTriviaAvailable())) return []
  const eventId = await requireActiveEventId()
  return prisma.triviaCategoryResult.findMany({
    where: { category: { eventId }, publishedToScoreboard: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllTriviaResults() {
  if (!(await guardTriviaAvailable())) return []
  const eventId = await requireActiveEventId()
  return prisma.triviaCategoryResult.findMany({
    where: { category: { eventId } },
  })
}

export async function updateCategoryResult(
  id: string,
  data: Partial<{
    question1Winner: string
    question2Winner: string
    question3Winner: string
    scenario: string
    categoryWinner: string
    basePoints: number
    numericBonus: number
    finalPoints: number
    manualOverride: boolean
    overrideReason: string
    publishedToScoreboard: boolean
  }>
) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  return prisma.triviaCategoryResult.update({ where: { id }, data })
}

export async function publishResult(id: string) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  return prisma.triviaCategoryResult.update({
    where: { id },
    data: { publishedToScoreboard: true },
  })
}

// ===========================================================================
// Power Usage
// ===========================================================================

export async function createPowerUsage(data: {
  userId: string
  powerType: string
  cost: number
  categoryId?: string
  targetUserId?: string
  note?: string
}) {
  if (!(await guardTriviaAvailable())) {
    throw new Error('Trivia module is not available. Run database migration first.')
  }
  const eventId = await requireActiveEventId()
  return prisma.triviaPowerUsage.create({
    data: { eventId, ...data },
  })
}

export async function getPowerUsageByUserId(userId: string) {
  if (!(await guardTriviaAvailable())) return []
  return prisma.triviaPowerUsage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllPowerUsage() {
  if (!(await guardTriviaAvailable())) return []
  const eventId = await requireActiveEventId()
  return prisma.triviaPowerUsage.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  })
}

// ===========================================================================
// Score helpers
// ===========================================================================

export async function getUserTriviaPoints(userId: string): Promise<number> {
  if (!(await guardTriviaAvailable())) return 0
  const eventId = await requireActiveEventId()
  const results = await prisma.triviaCategoryResult.findMany({
    where: {
      category: { eventId },
      categoryWinner: userId,
    },
  })
  return results.reduce((sum, r) => sum + r.finalPoints, 0)
}

export async function getAllUsersTriviaPoints(): Promise<Map<string, number>> {
  if (!(await guardTriviaAvailable())) return new Map()
  const eventId = await requireActiveEventId()
  const results = await prisma.triviaCategoryResult.findMany({
    where: { category: { eventId } },
  })
  const map = new Map<string, number>()
  for (const r of results) {
    if (!r.categoryWinner) continue
    map.set(r.categoryWinner, (map.get(r.categoryWinner) || 0) + r.finalPoints)
  }
  return map
}
