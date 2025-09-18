import { prisma } from '@/lib/prisma/client'

export async function getRecentPosts(limit: number = 10) {
  return await prisma.post.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: { team: true }
      }
    }
  })
}

export async function getPostsWithUsers(limit: number = 20) {
  return await prisma.post.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: { 
          team: true,
          drinkLogs: true
        }
      }
    }
  })
}

export async function getRecentPostsWithImages(limit: number = 5) {
  return await prisma.post.findMany({
    where: {
      image_url: {
        not: null
      }
    },
    include: {
      user: {
        include: {
          team: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

export async function getRecentUserProfileImages(limit: number = 5) {
  return await prisma.user.findMany({
    where: {
      profile_image_url: {
        not: null
      }
    },
    include: {
      team: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

export async function getRecentTeamLogos(limit: number = 5) {
  return await prisma.team.findMany({
    where: {
      logo_image_url: {
        not: null
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}