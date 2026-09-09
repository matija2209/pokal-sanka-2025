import { prisma } from '@/lib/prisma/client'
import { requireBachelorEventId } from '@/lib/events'
import type { HypeVote } from '@/generated/prisma/client'

export async function createHypeVote(data: {
  suggestion?: string
  voterName?: string
}, eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    return await prisma.hypeVote.create({
      data: { ...data, eventId },
    })
  } catch (error) {
    console.error('Error creating hype vote:', error)
    return null
  }
}

export async function getHypeVoteCount(eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    const aggregate = await prisma.hypeEvent.aggregate({
      where: { eventId },
      _sum: { voteCount: true },
    })
    return aggregate._sum.voteCount ?? 0
  } catch (error) {
    console.error('Error getting hype vote count:', error)
    return 0
  }
}

export async function getHypeVoteCountSince(since: Date, eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    return await prisma.hypeVote.count({
      where: { eventId, createdAt: { gte: since } },
    })
  } catch (error) {
    console.error('Error getting hype vote count since:', error)
    return 0
  }
}

export async function getHypeEvents(eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    return await prisma.hypeEvent.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    })
  } catch (error) {
    console.error('Error getting hype events:', error)
    return []
  }
}

export async function getHypeEventById(id: string, eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    return await prisma.hypeEvent.findFirst({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error getting hype event by id:', error)
    return null
  }
}

export async function getHypeVotes(eventIdOverride?: string): Promise<HypeVote[]> {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    return await prisma.hypeVote.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error getting hype votes:', error)
    return []
  }
}

export async function createHypeEvent(data: {
  title: string
  description?: string
  voteThreshold?: number
}, eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
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
  eventIdOverride?: string
) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
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

export async function getNextLockedHypeEvent(eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
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

export async function deleteHypeEvent(id: string, eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    return await prisma.hypeEvent.deleteMany({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error deleting hype event:', error)
    return null
  }
}

export async function deleteHypeVote(id: string, eventIdOverride?: string) {
  try {
    const eventId = eventIdOverride ?? (await requireBachelorEventId())
    return await prisma.hypeVote.deleteMany({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error deleting hype vote:', error)
    return null
  }
}
