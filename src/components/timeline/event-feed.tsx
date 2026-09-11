import { getEventFeedSnapshot } from '@/lib/cache/event-read-models'
import { getLikedPostIds } from '@/lib/prisma/fetchers/post-fetchers'
import type { getRecentCommentaries } from '@/lib/prisma/fetchers'
import { UserAvatar } from '@/components/users'
import { TeamLogo } from '@/components/teams'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  CheckCircle2,
  ChevronDown,
  Flame,
  ImageIcon,
  Lock,
  MapPin,
  Unlock,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { sl } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import CreatePostForm from './create-post-form'
import PostActions, { PostMenu } from './post-actions'
import PostMedia from './post-media'
import { ACTION_LABELS } from '@/lib/utils/bachelor-points'
import type { ActionType } from '@/lib/utils/bachelor-points'
import { ReelProvider, ReelStoryStrip } from './reel-experience'

import type { Event } from '@/lib/prisma/types'
import { getActiveEvent } from '@/lib/events'
import { isBachelorEvent } from '@/lib/events-shared'

interface EventFeedProps {
  currentUser: {
    id: string
    name: string
    profile_image_url?: string | null
  }
  currentEvent?: Event | null
}

type FeedHighlightGroup = {
  bucketKey: string
  bucketDate: Date
  items: Array<{
    id: string
    type: string
    message: string
    priority: number
    createdAt: Date
  }>
}

type FeedPost = Awaited<ReturnType<typeof getEventFeedSnapshot>>['posts'][number]
type FeedSighting = Awaited<ReturnType<typeof getEventFeedSnapshot>>['sightings'][number]
type FeedHypeEvent = Awaited<ReturnType<typeof getEventFeedSnapshot>>['hypeEvents'][number]

type FeedItem =
  | {
      type: 'highlight'
      key: string
      createdAt: Date
      group: FeedHighlightGroup
    }
  | {
      type: 'post'
      key: string
      createdAt: Date
      post: FeedPost
    }
  | {
      type: 'sighting'
      key: string
      createdAt: Date
      sighting: FeedSighting
    }
  | {
      type: 'hype'
      key: string
      createdAt: Date
      hypeEvent: FeedHypeEvent
    }

const HIGHLIGHT_PRIORITY_THRESHOLD = 3
const HIGHLIGHT_GROUP_MINUTES = 30

function getHighlightLabel(type: string) {
  switch (type) {
    case 'milestone':
      return 'Mejnik'
    case 'streak':
      return 'Niz'
    case 'achievement':
      return 'Dosezek'
    case 'team_event':
      return 'Ekipa'
    case 'leadership_change':
      return 'Vodstvo'
    case 'top_3_change':
      return 'TOP 3'
    case 'team_leadership':
      return 'Vodja'
    case 'team_overtake':
      return 'Prehitevanje'
    case 'rank_jump':
      return 'Skok'
    case 'consolidated_bulk':
      return 'Spektakel'
    default:
      return 'Dogodek'
  }
}

function getGroupedHighlights(
  commentaries: Awaited<ReturnType<typeof getRecentCommentaries>>
): FeedHighlightGroup[] {
  const grouped = new Map<string, FeedHighlightGroup>()

  for (const commentary of commentaries) {
    if (commentary.priority < HIGHLIGHT_PRIORITY_THRESHOLD) {
      continue
    }

    const createdAt = new Date(commentary.createdAt)
    const bucketDate = new Date(createdAt)
    bucketDate.setMinutes(
      Math.floor(bucketDate.getMinutes() / HIGHLIGHT_GROUP_MINUTES) * HIGHLIGHT_GROUP_MINUTES,
      0,
      0
    )

    const bucketKey = bucketDate.toISOString()
    const existing = grouped.get(bucketKey)

    if (existing) {
      existing.items.push({
        id: commentary.id,
        type: commentary.type,
        message: commentary.message,
        priority: commentary.priority,
        createdAt,
      })
      continue
    }

    grouped.set(bucketKey, {
      bucketKey,
      bucketDate,
      items: [
        {
          id: commentary.id,
          type: commentary.type,
          message: commentary.message,
          priority: commentary.priority,
          createdAt,
        },
      ],
    })
  }

  return [...grouped.values()]
    .map(group => ({
      ...group,
      items: group.items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }))
    .sort((a, b) => b.bucketDate.getTime() - a.bucketDate.getTime())
}

function getPostPoints(drinkLogs: Array<{ points: number }>) {
  return drinkLogs.reduce((sum, log) => sum + log.points, 0)
}

function getFeedItems(
  posts: FeedPost[],
  highlightGroups: FeedHighlightGroup[],
  sightings: FeedSighting[],
  hypeEvents: FeedHypeEvent[]
): FeedItem[] {
  const postItems: FeedItem[] = posts.map(post => ({
    type: 'post',
    key: post.id,
    createdAt: new Date(post.createdAt),
    post,
  }))

  const highlightItems: FeedItem[] = highlightGroups.map(group => ({
    type: 'highlight',
    key: group.bucketKey,
    createdAt: group.items[0]?.createdAt ?? group.bucketDate,
    group,
  }))

  const sightingItems: FeedItem[] = sightings.map(sighting => ({
    type: 'sighting',
    key: sighting.id,
    createdAt: new Date(sighting.createdAt),
    sighting,
  }))

  const hypeItems: FeedItem[] = hypeEvents.map(hypeEvent => ({
    type: 'hype',
    key: hypeEvent.id,
    createdAt: new Date(hypeEvent.completedAt ?? hypeEvent.unlockedAt ?? hypeEvent.createdAt),
    hypeEvent,
  }))

  return [...postItems, ...highlightItems, ...sightingItems, ...hypeItems].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

export default async function EventFeed({ currentUser, currentEvent }: EventFeedProps) {
  const activeEvent = currentEvent ?? (await getActiveEvent())
  const eventId = activeEvent?.id
  const isBachelor = isBachelorEvent(activeEvent)

  if (!eventId) {
    return null
  }

  const {
    posts,
    commentaries: recentCommentaries,
    reels,
    sightings: recentSightings,
    hypeEvents,
    hypeVoteCount,
  } = await getEventFeedSnapshot(eventId, isBachelor)

  const highlightGroups = getGroupedHighlights(recentCommentaries)
  const feedItems = getFeedItems(posts, highlightGroups, recentSightings, hypeEvents)
  const likedPostIds = await getLikedPostIds(currentUser.id, posts.map(post => post.id))

  return (
    <ReelProvider reels={reels}>
    <div className="w-full">
      <div className="w-full space-y-0">
          <ReelStoryStrip reels={reels} currentUser={currentUser} />

          {/* Create Post Section */}
          <section
            id="create-post"
            className="bg-card border-b border-border/50"
          >
            <CreatePostForm currentUser={currentUser} />
          </section>

          {/* Feed Items */}
          <section className="space-y-4">
            {feedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                <div className="h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4">
                   <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h2 className="text-xl font-bold mb-1">Ni še objav</h2>
                <p className="text-sm text-muted-foreground max-w-[240px]">
                  Bodi prvi in objavi kaj zanimivega s turnirja!
                </p>
              </div>
            ) : (
              feedItems.map((item, index) => {
                if (item.type === 'highlight') {
                  const group = item.group

                  return (
                    <div key={item.key} className="px-4 py-2">
                      <Collapsible defaultOpen={index < 1}>
                        <Card className="overflow-hidden rounded-2xl border-orange-500/20 bg-orange-500/5 shadow-none">
                          <CollapsibleTrigger className="w-full text-left">
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="bg-orange-500 rounded-full p-1">
                                  <Flame className="h-3 w-3 text-white" />
                                </div>
                                <span className="font-bold text-sm text-orange-700">Poudarki dogajanja</span>
                              </div>
                              <ChevronDown className="h-4 w-4 text-orange-500/70 transition-transform data-[state=open]:rotate-180" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-3">
                              {group.items.map(entry => (
                                <div
                                  key={entry.id}
                                  className="rounded-xl border border-orange-500/10 bg-white/50 p-3"
                                >
                                  <div className="mb-1 flex items-center justify-between">
                                    <Badge variant="outline" className="text-[10px] h-4 bg-orange-500/10 text-orange-700 border-orange-500/20 uppercase tracking-wider">{getHighlightLabel(entry.type)}</Badge>
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                      {format(entry.createdAt, 'HH:mm', { locale: sl })}
                                    </span>
                                  </div>
                                  <p className="text-sm leading-relaxed text-orange-950/80">{entry.message}</p>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    </div>
                  )
                }

                if (item.type === 'sighting') {
                  const sighting = item.sighting
                  const actionLabel =
                    ACTION_LABELS[sighting.actionType as ActionType]?.en ?? sighting.actionType

                  return (
                    <article
                      key={item.key}
                      className="bg-card border-y border-border/40 md:border md:rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col -space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold">
                                {activeEvent?.name ? `${activeEvent.name} opazovanje` : 'Opazovanje'}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {actionLabel}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(sighting.createdAt), {
                                addSuffix: false,
                                locale: sl,
                              })} nazaj
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          +{sighting.points} pts
                        </Badge>
                      </div>

                      <div className="relative aspect-square w-full bg-muted overflow-hidden">
                        <Image
                          src={sighting.photoUrl}
                          alt={`${activeEvent?.name ?? 'Bachelor'} sighting by ${sighting.submitterName ?? 'anonymous'}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 760px"
                          className="object-cover"
                        />
                      </div>

                      <div className="px-3 py-3 space-y-2.5">
                        <div className="space-y-1">
                          <p className="text-sm leading-relaxed">
                            <span className="font-bold mr-2">
                              {sighting.submitterName ?? 'Anonymous'}
                            </span>
                            {sighting.message || 'New sighting added to the timeline.'}
                          </p>
                          <p className="text-[11px] uppercase tracking-tight text-muted-foreground">
                            Friendship level: {sighting.friendshipLevel}
                            {sighting.submitterCountry ? ` • ${sighting.submitterCountry}` : ''}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                }

                if (item.type === 'hype') {
                  const hypeEvent = item.hypeEvent
                  const statusIcon =
                    hypeEvent.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : hypeEvent.status === 'unlocked' ? (
                      <Unlock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )
                  const eventTime = new Date(
                    hypeEvent.completedAt ?? hypeEvent.unlockedAt ?? hypeEvent.createdAt
                  )

                  return (
                    <article
                      key={item.key}
                      className="bg-card border-y border-border/40 md:border md:rounded-xl overflow-hidden"
                    >
                      <div className="px-3 py-3 border-b border-border/40 bg-orange-500/5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
                              <Flame className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col -space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold">
                                  {activeEvent?.name ? `${activeEvent.name} hype dogodek` : 'Hype dogodek'}
                                </span>
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  {hypeEvent.status}
                                </Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(eventTime, {
                                  addSuffix: false,
                                  locale: sl,
                                })} nazaj
                              </span>
                            </div>
                          </div>
                          {statusIcon}
                        </div>
                      </div>

                      <div className="px-3 py-4 space-y-3">
                        <div className="space-y-1">
                          <p className="text-base font-bold leading-tight">{hypeEvent.title}</p>
                          {hypeEvent.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {hypeEvent.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-tight text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">
                            {hypeEvent.voteCount}/{hypeEvent.voteThreshold} votes
                          </Badge>
                          <span>Št. glasov: {hypeVoteCount}</span>
                        </div>
                      </div>
                    </article>
                  )
                }

                const post = item.post
                const totalPoints = getPostPoints(post.user.drinkLogs)
                const drinkCount = post.user.drinkLogs.length
                return (
                  <article
                    key={item.key}
                    className="bg-card border-y border-border/40 md:border md:rounded-xl overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/app/players/${post.user.id}`} className="hover:opacity-90 transition-opacity">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-400 p-[1.5px]">
                            <div className="h-full w-full rounded-full bg-card p-[1px]">
                              <UserAvatar user={post.user} size="sm" className="h-full w-full border-0" />
                            </div>
                          </div>
                        </Link>
                        <div className="flex flex-col -space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/app/players/${post.user.id}`} className="text-sm font-bold hover:text-muted-foreground transition-colors">
                              {post.user.name}
                            </Link>
                            {post.kind === 'reel' ? <Badge variant="secondary" className="text-[10px]">REEL</Badge> : null}
                            {post.user.team && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground/50">•</span>
                                <Link href={`/app/teams/${post.user.team.id}`} className="flex items-center gap-1 group">
                                  <TeamLogo team={post.user.team} size="sm" className="h-3 w-3" />
                                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                    {post.user.team.name}
                                  </span>
                                </Link>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                             {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: false,
                              locale: sl,
                            })} nazaj
                          </span>
                        </div>
                      </div>
                      {post.user.id === currentUser.id && <PostMenu postId={post.id} />}
                    </div>

                    {/* Post Image/Content */}
                    {post.assets.length > 0 || post.image_url ? (
                      <PostMedia
                        assets={post.assets}
                        legacyUrl={post.image_url}
                        alt={`Objava uporabnika ${post.user.name}`}
                        priority={index < 2}
                        postId={post.id}
                        postKind={post.kind}
                      />
                    ) : (
                      <div className="flex min-h-[300px] items-center justify-center bg-gradient-to-br from-secondary/30 via-card to-accent/10 p-10 border-y border-border/30">
                        <p className="text-center text-xl font-medium leading-relaxed italic text-foreground/80">
                          "{post.message}"
                        </p>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="px-3 py-3 space-y-2.5">
                      <PostActions
                        postId={post.id}
                        initialLiked={likedPostIds.has(post.id)}
                        initialLikeCount={post._count.likes}
                        initialComments={post.comments}
                      />

                      {/* Likes/Points */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 w-4 rounded-full border border-background bg-muted overflow-hidden">
                              <div className="w-full h-full bg-primary/20" />
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-bold">
                          {totalPoints} točk • {drinkCount} pijač
                        </span>
                      </div>

                      {/* Caption */}
                      <div className="space-y-1">
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold mr-2">{post.user.name}</span>
                          {post.message}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                        {format(new Date(post.createdAt), 'd. MMMM', {
                          locale: sl,
                        })}
                      </p>
                    </div>
                  </article>
                )
              })
            )}
          </section>
      </div>
    </div>
    </ReelProvider>
  )
}
