'use server'

import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'

export async function resetDatabase() {
  try {
    // Delete in proper order to respect foreign key constraints
    await prisma.commentary.deleteMany({})
    await prisma.post.deleteMany({})
    await prisma.drinkLog.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.team.deleteMany({})
    
    console.log('Database reset successfully - all tables cleared')
  } catch (error) {
    console.error('Error resetting database:', error)
    throw new Error('Failed to reset database')
  }
  
  redirect('/superadmin?reset=success')
}