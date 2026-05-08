import { prisma } from '@/lib/prisma/client'
import { requireBachelorEventId } from '@/lib/events'

export async function createSighting(data: {
  photoUrl: string
  latitude: number
  longitude: number
  submitterName?: string
  submitterCountry?: string
  message?: string
  actionType: string
  points: number
  friendshipLevel: string
}) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.create({
      data: { ...data, eventId, status: 'approved', approvedAt: new Date() },
    })
  } catch (error) {
    console.error('Error creating sighting:', error)
    return null
  }
}

export async function getSightingById(id: string) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.findFirst({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error getting sighting:', error)
    return null
  }
}

export async function getApprovedSightings(limit = 20, offset = 0) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.findMany({
      where: { eventId, status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
  } catch (error) {
    console.error('Error getting approved sightings:', error)
    return []
  }
}

export async function getApprovedSightingsForMap() {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.findMany({
      where: { eventId, status: 'approved' },
      select: {
        id: true,
        photoUrl: true,
        latitude: true,
        longitude: true,
        correctedLatitude: true,
        correctedLongitude: true,
        submitterName: true,
        actionType: true,
        points: true,
        message: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error getting map sightings:', error)
    return []
  }
}

export async function getAllSightings(status?: string) {
  try {
    const eventId = await requireBachelorEventId()
    const where: Record<string, unknown> = { eventId }
    if (status) where.status = status
    return await prisma.publicSighting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error getting all sightings:', error)
    return []
  }
}

export async function approveSighting(id: string, approvedByUserId: string) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.updateMany({
      where: { id, eventId, status: 'pending' },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedByUserId,
      },
    })
  } catch (error) {
    console.error('Error approving sighting:', error)
    return null
  }
}

export async function rejectSighting(id: string, adminNotes?: string) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.updateMany({
      where: { id, eventId, status: 'pending' },
      data: {
        status: 'rejected',
        adminNotes: adminNotes || null,
      },
    })
  } catch (error) {
    console.error('Error rejecting sighting:', error)
    return null
  }
}

export async function updateSightingLocation(
  id: string,
  correctedLatitude: number,
  correctedLongitude: number,
) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.updateMany({
      where: { id, eventId },
      data: { correctedLatitude, correctedLongitude },
    })
  } catch (error) {
    console.error('Error updating sighting location:', error)
    return null
  }
}

export async function updateSightingPoints(id: string, points: number) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.updateMany({
      where: { id, eventId },
      data: { points },
    })
  } catch (error) {
    console.error('Error updating sighting points:', error)
    return null
  }
}

export async function deleteSighting(id: string) {
  try {
    const eventId = await requireBachelorEventId()
    return await prisma.publicSighting.deleteMany({
      where: { id, eventId },
    })
  } catch (error) {
    console.error('Error deleting sighting:', error)
    return null
  }
}

export async function getSightingStats() {
  try {
    const eventId = await requireBachelorEventId()
    const [totalSightings, totalMessages, totalChallenges, totalPoints, uniqueCountries] =
      await Promise.all([
        prisma.publicSighting.count({
          where: { eventId, status: 'approved' },
        }),
        prisma.publicSighting.count({
          where: {
            eventId,
            status: 'approved',
            message: { not: null },
          },
        }),
        prisma.publicSighting.count({
          where: {
            eventId,
            status: 'approved',
            actionType: 'challenge',
          },
        }),
        prisma.publicSighting.aggregate({
          where: { eventId, status: 'approved' },
          _sum: { points: true },
        }),
        prisma.publicSighting.groupBy({
          by: ['submitterCountry'],
          where: {
            eventId,
            status: 'approved',
            submitterCountry: { not: null },
          },
        }),
      ])

    return {
      totalSightings,
      totalMessages,
      totalChallenges,
      totalPoints: totalPoints._sum.points || 0,
      countriesCount: uniqueCountries.length,
    }
  } catch (error) {
    console.error('Error getting sighting stats:', error)
    return {
      totalSightings: 0,
      totalMessages: 0,
      totalChallenges: 0,
      totalPoints: 0,
      countriesCount: 0,
    }
  }
}
