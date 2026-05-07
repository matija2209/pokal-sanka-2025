import { prisma } from '@/lib/prisma/client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

export async function getRecentPosts(limit: number = 10) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            team: true,
          },
        },
      },
    })
  }

  const eventId = await requireActiveEventId()

  return await prisma.post.findMany({
    where: { eventId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      event: true,
      user: {
        include: {
          team: true,
          event: true,
          person: true,
        },
      },
    },
  })
}

export async function getPostsWithUsers(limit: number = 20) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            team: true,
            drinkLogs: true,
          },
        },
      },
    })
  }

  const eventId = await requireActiveEventId()

  return await prisma.post.findMany({
    where: { eventId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      event: true,
      user: {
        include: {
          team: true,
          event: true,
          person: true,
          drinkLogs: {
            where: { eventId },
          },
        },
      },
    },
  })
}

export async function getRecentPostsWithImages(limit: number = 5) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.findMany({
      where: {
        image_url: {
          not: null,
        },
      },
      include: {
        user: {
          include: {
            team: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  const eventId = await requireActiveEventId()

  return await prisma.post.findMany({
    where: {
      eventId,
      image_url: {
        not: null,
      },
    },
    include: {
      event: true,
      user: {
        include: {
          team: true,
          event: true,
          person: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

export async function getRecentUserProfileImages(limit: number = 5) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.user.findMany({
      where: {
        profile_image_url: {
          not: null,
        },
      },
      include: {
        team: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  const eventId = await requireActiveEventId()

  return await prisma.user.findMany({
    where: {
      eventId,
      profile_image_url: {
        not: null,
      },
    },
    include: {
      team: true,
      event: true,
      person: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

export async function getRecentTeamLogos(limit: number = 5) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.team.findMany({
      where: {
        logo_image_url: {
          not: null,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  const eventId = await requireActiveEventId()

  return await prisma.team.findMany({
    where: {
      eventId,
      logo_image_url: {
        not: null,
      },
    },
    include: {
      event: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}
