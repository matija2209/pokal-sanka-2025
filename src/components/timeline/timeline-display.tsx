import { getRecentPosts } from '@/lib/prisma/fetchers'
import { UserAvatar } from '@/components/users'
import { TeamLogo } from '@/components/teams'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface TimelineDisplayProps {
  limit?: number
}

export default async function TimelineDisplay({ limit = 10 }: TimelineDisplayProps) {
  const posts = await getRecentPosts(limit)
  
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Še ni objav. Bodite prvi, ki bo delil kaj zanimivega!
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <UserAvatar user={post.user} size="sm" />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{post.user.name}</span>
                  {post.user.team && (
                    <>
                      <TeamLogo team={post.user.team} size="sm" />
                      <span className="text-sm text-gray-500">
                        {post.user.team.name}
                      </span>
                    </>
                  )}
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.message}</p>
                
                {post.image_url && (
                  <div className="rounded-lg overflow-hidden max-w-sm">
                    <Image
                      src={post.image_url}
                      alt="Slika objave"
                      width={400}
                      height={300}
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}