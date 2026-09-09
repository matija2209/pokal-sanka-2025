'use client'

import { useActionState, useOptimistic, useState, useTransition, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { UserAvatar } from '@/components/users'
import { toggleLikeAction, addCommentAction } from '@/app/actions'
import { initialPostInteractionActionState } from '@/lib/types/action-states'
import { formatDistanceToNow } from 'date-fns'
import { sl } from 'date-fns/locale'

interface PostComment {
  id: string
  message: string
  createdAt: Date
  user: { id: string; name: string; profile_image_url: string | null }
}

interface PostActionsProps {
  postId: string
  initialLiked: boolean
  initialLikeCount: number
  initialComments: PostComment[]
}

export default function PostActions({
  postId,
  initialLiked,
  initialLikeCount,
  initialComments,
}: PostActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [comments, setComments] = useState<PostComment[]>(initialComments)
  const [optimisticLike, setOptimisticLike] = useOptimistic(
    { liked: initialLiked, count: initialLikeCount },
    (_state, next: { liked: boolean; count: number }) => next
  )

  const [commentState, commentFormAction] = useActionState(
    addCommentAction,
    initialPostInteractionActionState
  )
  const [isCommentPending, startCommentTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (commentState.type === 'idle') return
    if (commentState.success && commentState.data?.comment) {
      setComments(prev => [...prev, commentState.data!.comment!])
      formRef.current?.reset()
    } else if (!commentState.success && commentState.message) {
      toast.error(commentState.message)
    }
  }, [commentState])

  const handleLikeClick = () => {
    const next = { liked: !optimisticLike.liked, count: optimisticLike.count + (optimisticLike.liked ? -1 : 1) }
    startTransition(async () => {
      setOptimisticLike(next)
      const result = await toggleLikeAction(postId)
      if (!result.success) {
        toast.error(result.message || 'Nekaj je šlo narobe.')
      }
    })
  }

  return (
    <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeClick}
            disabled={isPending}
            className="hover:opacity-60 transition-opacity disabled:opacity-40"
          >
            <Heart
              className={optimisticLike.liked ? 'h-6 w-6 fill-red-500 text-red-500' : 'h-6 w-6'}
            />
          </button>
          <CollapsibleTrigger asChild>
            <button className="hover:opacity-60 transition-opacity">
              <MessageCircle className="h-6 w-6" />
            </button>
          </CollapsibleTrigger>
          <button className="hover:opacity-60 transition-opacity">
            <Send className="h-6 w-6" />
          </button>
        </div>
        <button className="hover:opacity-60 transition-opacity">
          <Bookmark className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-2 space-y-1">
        <span className="text-xs font-bold block">
          {optimisticLike.count} {optimisticLike.count === 1 ? 'všeč' : 'všečkov'}
        </span>
        {comments.length > 0 && (
          <CollapsibleTrigger asChild>
            <button className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-tight">
              {isCommentsOpen
                ? 'Skrij komentarje'
                : `Poglej vseh ${comments.length} ${comments.length === 1 ? 'komentar' : 'komentarjev'}`}
            </button>
          </CollapsibleTrigger>
        )}
      </div>

      <CollapsibleContent>
        <div className="mt-3 space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-2">
              <UserAvatar
                user={{ name: comment.user.name, profile_image_url: comment.user.profile_image_url }}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">
                  <span className="font-bold mr-2">{comment.user.name}</span>
                  {comment.message}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false, locale: sl })} nazaj
                </span>
              </div>
            </div>
          ))}

          <form
            ref={formRef}
            action={formData => startCommentTransition(() => commentFormAction(formData))}
            className="flex items-center gap-2 pt-1"
          >
            <input type="hidden" name="postId" value={postId} />
            <input
              type="text"
              name="message"
              placeholder="Dodaj komentar..."
              maxLength={500}
              required
              className="flex-1 min-w-0 rounded-full border border-border/60 bg-transparent px-3 py-1.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isCommentPending}
              className="text-xs font-bold text-primary disabled:opacity-40"
            >
              Objavi
            </button>
          </form>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
