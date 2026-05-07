'use server'

import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'

export async function resetDatabase() {
  try {
    // Delete trivia tables first if available (FK order: power_usage → results → questions → categories)
    if (await isTriviaAvailable()) {
      await prisma.triviaPowerUsage.deleteMany({})
      await prisma.triviaCategoryResult.deleteMany({})
      await prisma.triviaQuestion.deleteMany({})
      await prisma.triviaCategory.deleteMany({})
    }

    // Delete in proper order to respect foreign key constraints
    await prisma.commentary.deleteMany({})
    await prisma.post.deleteMany({})
    await prisma.drinkLog.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.team.deleteMany({})
    await prisma.person.deleteMany({})
    await prisma.event.deleteMany({})

    console.log('Database reset successfully - all tables cleared')
  } catch (error) {
    console.error('Error resetting database:', error)
    throw new Error('Failed to reset database')
  }

  redirect('/superadmin?reset=success')
}
