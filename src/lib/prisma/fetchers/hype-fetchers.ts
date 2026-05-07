import { prisma } from '@/lib/prisma/client'
import { requireBachelorEventId } from '@/lib/events'

export async function createHypeVote(data: {
  suggestion?: string
  voterName?: string
}) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.hypeVote.create({
      data: { ...data, eventId },
    })
  } catch (error) {
    console.error('Error creating hype vote:', error)
    return null
  }
}

export async function getHypeVoteCount() {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.hypeVote.count({ where: { eventId } })
  } catch (error) {
    console.error('Error getting hype vote count:', error)
    return 0
  }
}

export async function getHypeVoteCountSince(since: Date) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.hypeVote.count({
      where: { eventId, createdAt: { gte: since } },
    })
  } catch (error) {
    console.error('Error getting hype vote count since:', error)
    return 0
  }
}

export async function getHypeEvents() {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.hypeEvent.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    })
  } catch (error) {
    console.error('Error getting hype events:', error)
    return []
  }
}

export async function createHypeEvent(data: {
  title: string
  description?: string
  voteThreshold?: number
}) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.hypeEvent.create({
      data: { ...data, eventId },
    })
  } catch (error) {
    console.error('Error creating hype event:', error)
    return null
  }
}

export async function updateHypeEventStatus(
  id: string,
  status: string,
) {
  try {
    const eventId = await requireBachelorEventId()
    const updateData: Record<string, unknown> = { status }
    if (status === 'unlocked') updateData.unlockedAt = new Date()
    if (status === 'completed') updateData.completedAt = new Date()

    return await prisma.hypeEvent.updateMany({
      where: { id, eventId },
      data: updateData,
    })
  } catch (error) {
    console.error('Error updating hype event:', error)
    return null
  }
}

export async function getNextLockedHypeEvent() {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.hypeEvent.findFirst({
      where: { eventId, status: 'locked' },
      orderBy: { createdAt: 'asc' },
    })
  } catch (error) {
    console.error('Error getting next hype event:', error)
    return null
  }
}

export async function incrementHypeEventVoteCount(eventId: string) {
  try {
    return await prisma.hypeEvent.update({
      where: { id: eventId },
      data: { voteCount: { increment: 1 } },
    })
  } catch (error) {
    console.error('Error incrementing hype event vote count:', error)
    return null
  }
}
