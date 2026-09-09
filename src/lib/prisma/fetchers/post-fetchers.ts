import { prisma } from '@/lib/prisma/client'
import { requireActiveEventId } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

export async function getRecentPosts(limit: number = 10, eventIdOverride?: string) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assets: { orderBy: { sortOrder: 'asc' } },
        user: {
          include: {
            team: true,
          },
        },
      },
    })
  }

  const eventId = eventIdOverride ?? (await requireActiveEventId())

  return await prisma.post.findMany({
    where: { eventId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      assets: { orderBy: { sortOrder: 'asc' } },
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

export async function getPublicPosts(limit: number = 10, eventIdOverride?: string) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.findMany({
      where: {
        isPrivate: false,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assets: { orderBy: { sortOrder: 'asc' } },
        user: {
          include: {
            team: true,
          },
        },
      },
    })
  }

  const eventId = eventIdOverride ?? await requireActiveEventId()

  return await prisma.post.findMany({
    where: {
      eventId,
      isPrivate: false,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      assets: { orderBy: { sortOrder: 'asc' } },
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

export async function getPostsForSuperadmin(limit: number = 100) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assets: { orderBy: { sortOrder: 'asc' } },
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
      assets: { orderBy: { sortOrder: 'asc' } },
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

export async function deletePostForSuperadmin(postId: string) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.delete({
      where: { id: postId },
    })
  }

  const eventId = await requireActiveEventId()

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      eventId,
    },
    select: {
      id: true,
    },
  })

  if (!post) {
    return null
  }

  return await prisma.post.delete({
    where: { id: postId },
  })
}

export async function getPostsWithUsers(limit: number = 20, eventIdOverride?: string) {
  const withInteractions = {
    assets: { orderBy: { sortOrder: 'asc' as const } },
    _count: { select: { likes: true, comments: true } },
    comments: {
      orderBy: { createdAt: 'asc' as const },
      take: 100,
      include: { user: { select: { id: true, name: true, profile_image_url: true } } },
    },
  }

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
        ...withInteractions,
      },
    })
  }

  const eventId = eventIdOverride ?? (await requireActiveEventId())

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
      ...withInteractions,
    },
  })
}

export async function getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set()
  const rows = await prisma.like.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  })
  return new Set(rows.map(r => r.postId))
}

export async function getRecentPostsWithImages(limit: number = 5, eventIdOverride?: string) {
  if (!(await isMultiEventSchemaAvailable())) {
    return await prisma.post.findMany({
      where: {
        OR: [
          { image_url: { not: null } },
          { assets: { some: {} } },
        ],
      },
      include: {
        assets: { orderBy: { sortOrder: 'asc' } },
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

  const eventId = eventIdOverride ?? (await requireActiveEventId())

  return await prisma.post.findMany({
    where: {
      eventId,
      OR: [
        { image_url: { not: null } },
        { assets: { some: {} } },
      ],
    },
    include: {
      assets: { orderBy: { sortOrder: 'asc' } },
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

export async function getRecentUserProfileImages(limit: number = 5, eventIdOverride?: string) {
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

  const eventId = eventIdOverride ?? (await requireActiveEventId())

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

export async function getRecentTeamLogos(limit: number = 5, eventIdOverride?: string) {
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

  const eventId = eventIdOverride ?? (await requireActiveEventId())

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
