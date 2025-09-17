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