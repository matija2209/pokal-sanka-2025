import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { sl } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import { getPostsForSuperadmin } from '@/lib/prisma/fetchers/post-fetchers'
import { deletePostAction } from '../actions'

type SuperadminPostsPageProps = {
  searchParams?: Promise<{
    post?: string
    postError?: string
  }>
}

const postStatusLabels: Record<string, string> = {
  deleted: 'Post deleted successfully.',
}

const postErrorLabels: Record<string, string> = {
  'missing-post': 'Post was not found for the active event.',
  'delete-post-failed': 'Failed to delete post.',
}

export const dynamic = 'force-dynamic'

export default async function SuperadminPostsPage({ searchParams }: SuperadminPostsPageProps) {
  const params = searchParams ? await searchParams : undefined
  const postStatus = params?.post
  const postError = params?.postError
  const posts = await getPostsForSuperadmin(150)

  return (
    <div className="container mx-auto px-4 py-6 md:p-8">
      <Link href="/superadmin" className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-primary mb-3 py-2">
        <ArrowLeft className="h-5 w-5" />
        Back to Superadmin
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manage Posts</h1>
        <p className="text-muted-foreground mt-2">Delete feed posts for the currently active event.</p>
      </div>

      {postStatus && postStatusLabels[postStatus] && (
        <p className="text-foreground font-bold bg-accent/20 border-2 border-accent/50 rounded-xl px-4 py-3 mb-6">
          {postStatusLabels[postStatus]}
        </p>
      )}

      {postError && postErrorLabels[postError] && (
        <p className="text-destructive font-bold bg-destructive/10 border-2 border-destructive/40 rounded-xl px-4 py-3 mb-6">
          {postErrorLabels[postError]}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No posts found.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <article key={post.id} className="p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-foreground">{post.user.name}</span>
                      {post.user.team?.name && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          Team: {post.user.team.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: sl })}
                      </span>
                    </div>

                    <p className="text-foreground break-words">{post.message}</p>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">Post ID: {post.id}</span>
                      {post.image_url && <span>Has image</span>}
                    </div>
                  </div>

                  <form action={deletePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/15 transition-colors"
                    >
                      Delete Post
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
