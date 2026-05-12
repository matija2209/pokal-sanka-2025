'use server'

import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateTriviaCategoryResult } from '@/lib/trivia-scoring'
import { requireActiveEventId } from '@/lib/events'
import { requireAdmin } from '@/lib/auth-utils'

// ===========================================================================
// Categories
// ===========================================================================

export async function createCategoryAction(formData: FormData) {
  await requireAdmin()
  const eventId = await requireActiveEventId()
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null

  if (!title?.trim()) throw new Error('Category title is required')

  const q1 = formData.get('q1') as string
  const q2 = formData.get('q2') as string
  const q3 = formData.get('q3') as string

  if (!q1?.trim() || !q2?.trim() || !q3?.trim()) {
    throw new Error('All 3 questions are required')
  }

  const category = await prisma.triviaCategory.create({
    data: { eventId, title: title.trim(), description: description?.trim() || null },
  })

  const questions: Array<{
    categoryId: string
    questionNumber: number
    questionText: string
    questionType: string
    correctAnswer?: string
    numericAnswer?: number
    allowClosest: boolean
    notes?: string
  }> = []

  for (let i = 1; i <= 3; i++) {
    const text = formData.get(`q${i}`) as string
    const type = (formData.get(`q${i}_type`) as string) || 'text'
    const correct = (formData.get(`q${i}_answer`) as string) || undefined
    const numeric = formData.get(`q${i}_numeric`) ? parseFloat(formData.get(`q${i}_numeric`) as string) : undefined
    const allowClosest = formData.get(`q${i}_allow_closest`) === 'on'
    const notes = (formData.get(`q${i}_notes`) as string) || undefined

    questions.push({
      categoryId: category.id,
      questionNumber: i,
      questionText: text.trim(),
      questionType: type,
      correctAnswer: correct?.trim() || undefined,
      numericAnswer: isNaN(numeric as number) ? undefined : numeric,
      allowClosest,
      notes: notes?.trim() || undefined,
    })
  }

  await prisma.triviaQuestion.createMany({ data: questions })

  revalidatePath('/superadmin/trivia')
  redirect(`/superadmin/trivia/categories/${category.id}`)
}

export async function deleteCategoryAction(categoryId: string) {
  await prisma.triviaCategory.delete({ where: { id: categoryId } })
  revalidatePath('/superadmin/trivia')
}

export async function startCategoryAction(categoryId: string) {
  await prisma.triviaCategory.update({
    where: { id: categoryId },
    data: { status: 'active' },
  })
  revalidatePath(`/superadmin/trivia/categories/${categoryId}`)
}

// ===========================================================================
// Category Result Calculation
// ===========================================================================

export async function calculateAndSaveResultAction(formData: FormData) {
  const categoryId = formData.get('categoryId') as string
  if (!categoryId) throw new Error('Missing categoryId')

  const q1Winner = (formData.get('q1Winner') as string) || null
  const q2Winner = (formData.get('q2Winner') as string) || null
  const q3Winner = (formData.get('q3Winner') as string) || null
  const hasNumericBonus = formData.get('hasNumericBonus') === 'on'

  const result = calculateTriviaCategoryResult({
    q1Winner,
    q2Winner,
    q3Winner,
    hasNumericBonus,
  })

  const existingResults = await prisma.triviaCategoryResult.findMany({
    where: { categoryId },
  })

  // Delete previous results for this category if they exist
  if (existingResults.length > 0) {
    await prisma.triviaCategoryResult.deleteMany({ where: { categoryId } })
  }

  await prisma.triviaCategoryResult.create({
    data: {
      categoryId,
      question1Winner: q1Winner,
      question2Winner: q2Winner,
      question3Winner: q3Winner,
      scenario: result.scenario,
      categoryWinner: result.categoryWinner,
      basePoints: result.basePoints,
      numericBonus: result.numericBonus,
      finalPoints: result.finalPoints,
    },
  })

  revalidatePath(`/superadmin/trivia/categories/${categoryId}`)
}

// ===========================================================================
// Result Override
// ===========================================================================

export async function overrideResultAction(formData: FormData) {
  const resultId = formData.get('resultId') as string
  if (!resultId) throw new Error('Missing resultId')

  const categoryWinner = (formData.get('categoryWinner') as string) || null
  const basePoints = parseInt(formData.get('basePoints') as string) || 0
  const numericBonus = parseInt(formData.get('numericBonus') as string) || 0
  const finalPoints = parseInt(formData.get('finalPoints') as string) || 0
  const overrideReason = (formData.get('overrideReason') as string) || null

  const result = await prisma.triviaCategoryResult.findUnique({ where: { id: resultId } })
  if (!result) throw new Error('Result not found')

  await prisma.triviaCategoryResult.update({
    where: { id: resultId },
    data: {
      categoryWinner,
      basePoints,
      numericBonus,
      finalPoints,
      manualOverride: true,
      overrideReason,
    },
  })

  revalidatePath(`/superadmin/trivia/categories/${result.categoryId}`)
}

// ===========================================================================
// Publish / Unpublish
// ===========================================================================

export async function publishResultAction(resultId: string) {
  const result = await prisma.triviaCategoryResult.findUnique({ where: { id: resultId } })
  if (!result) throw new Error('Result not found')

  await prisma.triviaCategoryResult.update({
    where: { id: resultId },
    data: { publishedToScoreboard: true },
  })

  // Mark category as completed
  await prisma.triviaCategory.update({
    where: { id: result.categoryId },
    data: { status: 'completed' },
  })

  revalidatePath(`/superadmin/trivia/categories/${result.categoryId}`)
  revalidatePath('/trivia/scoreboard')
}

export async function unpublishResultAction(resultId: string) {
  const result = await prisma.triviaCategoryResult.findUnique({ where: { id: resultId } })
  if (!result) throw new Error('Result not found')

  await prisma.triviaCategoryResult.update({
    where: { id: resultId },
    data: { publishedToScoreboard: false },
  })

  await prisma.triviaCategory.update({
    where: { id: result.categoryId },
    data: { status: 'active' },
  })

  revalidatePath(`/superadmin/trivia/categories/${result.categoryId}`)
  revalidatePath('/trivia/scoreboard')
}

// ===========================================================================
// Power Usage
// ===========================================================================

export async function recordPowerUsageAction(formData: FormData) {
  const eventId = await requireActiveEventId()
  const userId = formData.get('userId') as string
  const powerType = formData.get('powerType') as string
  const cost = parseInt(formData.get('cost') as string) || 0
  const categoryId = (formData.get('categoryId') as string) || undefined
  const targetUserId = (formData.get('targetUserId') as string) || undefined
  const note = (formData.get('note') as string) || undefined

  if (!userId || !powerType) throw new Error('User and power type are required')

  await prisma.triviaPowerUsage.create({
    data: { eventId, userId, powerType, cost, categoryId, targetUserId, note },
  })

  revalidatePath('/superadmin/trivia/powers')
}
