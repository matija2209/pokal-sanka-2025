import { getApprovedSightings, getSightingStats } from '@/lib/prisma/fetchers/sighting-fetchers'
import { getHypeVoteCount } from '@/lib/prisma/fetchers/hype-fetchers'
import { getPublicPosts } from '@/lib/prisma/fetchers/post-fetchers'
import { HeroSection } from '@/components/bachelor/hero-section'
import { QuickPhotoCapture } from '@/components/bachelor/quick-photo-capture'
import { StatsCards } from '@/components/bachelor/stats-cards'
import { MaltaMap } from '@/components/bachelor/malta-map'
import { SightingTimeline } from '@/components/bachelor/sighting-timeline'
import { Footer } from '@/components/bachelor/footer'
import { BachelorMobileNav } from '@/components/bachelor/mobile-nav'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Beer } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { requireBachelorEventId } from '@/lib/events'

export const dynamic = 'force-dynamic'

type BachelorMapSighting = {
  id: string
  photoUrl: string
  latitude: number
  longitude: number
  correctedLatitude: number | null
  correctedLongitude: number | null
  submitterName: string | null
  actionType: string
  points: number
  message: string | null
  createdAt: Date
}

type PublicPost = Awaited<ReturnType<typeof getPublicPosts>>[number]

export default async function BachelorPage() {
  const bachelorEventId = await requireBachelorEventId()

  const [sightings, stats, hypeVoteCount, publicPosts] = await Promise.all([
    getApprovedSightings(10, 0),
    getSightingStats(),
    getHypeVoteCount(),
    getPublicPosts(8, bachelorEventId),
  ])

  const mapSightings = sightings.map((s: BachelorMapSighting) => ({
    id: s.id,
    photoUrl: s.photoUrl,
    latitude: s.correctedLatitude ?? s.latitude,
    longitude: s.correctedLongitude ?? s.longitude,
    submitterName: s.submitterName,
    actionType: s.actionType,
    points: s.points,
    message: s.message,
    createdAt: s.createdAt,
  }))

  return (
    <div className="min-h-screen bg-stone-50 pb-20 text-slate-950 [color-scheme:light] sm:pb-0">
      <HeroSection />

      <section id="timeline" className="mx-auto max-w-4xl px-4 py-4 sm:py-8">
        <h2 className="mb-3 text-center font-lucky text-2xl sm:mb-6 sm:text-3xl">Recent Sightings</h2>
        <SightingTimeline sightings={sightings} />
      </section>

      <div className="space-y-4 sm:space-y-0">
        <section className="relative z-10 mx-auto -mt-1 max-w-5xl px-4 sm:-mt-6">
          <div className="grid gap-2.5 sm:gap-4 md:grid-cols-2">
            <Card className="border-amber-200/80 bg-white/95 shadow-lg shadow-amber-950/10">
              <CardContent className="p-3.5 sm:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300/70 bg-amber-100/80 sm:h-12 sm:w-12">
                    <Camera className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                        Collector Move
                      </p>
                      <h2 className="text-2xl font-lucky leading-tight sm:text-2xl">Take a photo with him</h2>
                    </div>
                    <p className="text-base leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
                      Meet BWSK, snap a proper photo together, and lock in top-tier friendship points.
                    </p>
                    <QuickPhotoCapture
                      actionType="photo_together"
                      className="inline-flex items-center justify-center h-auto w-full px-5 py-3 text-lg font-medium sm:w-auto sm:text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      Log photo together
                    </QuickPhotoCapture>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200/80 bg-white/95 shadow-lg shadow-amber-950/10">
              <CardContent className="p-3.5 sm:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300/70 bg-amber-100/80 sm:h-12 sm:w-12">
                    <Beer className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                        Friendship Upgrade
                      </p>
                      <h2 className="text-2xl font-lucky leading-tight sm:text-2xl">Take a drink with him</h2>
                    </div>
                    <p className="text-base leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
                      Share a drink with the groom, capture the moment, and submit it straight into the tracker.
                    </p>
                    <Button asChild size="lg" variant="outline" className="h-auto w-full px-5 py-3 text-lg sm:w-auto sm:text-base">
                      <Link href="/the-bachelor/sighting/new?action=drink_together">
                        Log drink together
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="stats" className="mx-auto max-w-4xl px-4 py-4 sm:py-12">
          <StatsCards stats={stats} hypeVotes={hypeVoteCount} />
        </section>

        <section id="map" className="mx-auto max-w-6xl px-4 py-4 sm:py-12">
          <h2 className="mb-3 text-center font-lucky text-2xl sm:mb-6 sm:text-3xl">Malta Sighting Map</h2>
          <MaltaMap sightings={mapSightings} />
        </section>

        <section id="public-posts" className="mx-auto max-w-4xl px-4 py-4 sm:py-12">
          <h2 className="mb-3 text-center font-lucky text-2xl sm:mb-6 sm:text-3xl">Public Posts</h2>
          {publicPosts.length === 0 ? (
            <Card className="border-amber-200/80 bg-white/95 shadow-lg shadow-amber-950/10">
              <CardContent className="p-5 text-center text-base text-muted-foreground">
                No public posts yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {publicPosts.map((post: PublicPost) => (
                <Card key={post.id} className="overflow-hidden border-amber-200/80 bg-white/95 shadow-lg shadow-amber-950/10">
                  {post.image_url && (
                    <div className="relative h-56 sm:h-80">
                      <Image
                        src={post.image_url}
                        alt={`Public post by ${post.user.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  )}
                  <CardContent className="p-3.5 sm:p-5">
                    <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <p className="text-base font-semibold sm:text-sm">{post.user.name}</p>
                      <p className="text-sm text-muted-foreground sm:text-xs">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap text-base leading-snug sm:text-sm sm:leading-relaxed">{post.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
      <BachelorMobileNav />
    </div>
  )
}
