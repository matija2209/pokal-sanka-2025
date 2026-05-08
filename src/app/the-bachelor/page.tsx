import { getApprovedSightings, getSightingStats } from '@/lib/prisma/fetchers/sighting-fetchers'
import { getHypeVoteCount, getHypeEvents, getHypeVotes } from '@/lib/prisma/fetchers/hype-fetchers'
import { getPublicPosts } from '@/lib/prisma/fetchers/post-fetchers'
import { HeroSection } from '@/components/bachelor/hero-section'
import { StatsCards } from '@/components/bachelor/stats-cards'
import { MaltaMap } from '@/components/bachelor/malta-map'
import { HypeMeter } from '@/components/bachelor/hype-meter'
import { ParticipationLadder } from '@/components/bachelor/participation-ladder'
import { SightingTimeline } from '@/components/bachelor/sighting-timeline'
import { Footer } from '@/components/bachelor/footer'
import { BachelorMobileNav } from '@/components/bachelor/mobile-nav'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Beer } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import bachelorImage1 from './bostjan-pecar.jpg'
import bachelorImage2 from './bostjan-pecar-2.jpg'
import bachelorImage3 from './bostjan-pecar-3.jpg'
import bachelorImage4 from './bostjan-pecar-4.jpg'
import bachelorImage5 from './bostjan-pecar-5.jpg'

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
  const bachelorGallery = [
    { src: bachelorImage1, alt: 'Bostjan Pecar bachelor weekend portrait 1' },
    { src: bachelorImage2, alt: 'Bostjan Pecar bachelor weekend portrait 2' },
    { src: bachelorImage3, alt: 'Bostjan Pecar bachelor weekend portrait 3' },
    { src: bachelorImage4, alt: 'Bostjan Pecar bachelor weekend portrait 4' },
    { src: bachelorImage5, alt: 'Bostjan Pecar bachelor weekend portrait 5' },
  ]

  const [sightings, stats, hypeVoteCount, hypeEvents, hypeVotes, publicPosts] = await Promise.all([
    getApprovedSightings(10, 0),
    getSightingStats(),
    getHypeVoteCount(),
    getHypeEvents(),
    getHypeVotes(),
    getPublicPosts(8),
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

      <section className="relative overflow-hidden py-3 sm:py-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-stone-50 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-stone-50 to-transparent sm:w-24" />

        <div className="flex w-max gap-3 pl-4 sm:gap-6 sm:pl-0 [animation:the-bachelor-gallery-scroll_34s_linear_infinite] motion-reduce:animate-none">
          {[...bachelorGallery, ...bachelorGallery].map((image, index) => (
            <div
              key={`${image.alt}-${index}`}
              className="relative h-40 w-28 shrink-0 overflow-hidden rounded-[1.25rem] border border-amber-200/70 bg-white shadow-lg shadow-amber-950/10 sm:h-64 sm:w-48 sm:rounded-[1.75rem] sm:shadow-xl md:h-80 md:w-60"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 112px, (max-width: 768px) 192px, 240px"
                className="object-cover"
                priority={index < bachelorGallery.length}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-50/40 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <style>{`
          @keyframes the-bachelor-gallery-scroll {
            from {
              transform: translate3d(0, 0, 0);
            }
            to {
              transform: translate3d(calc(-50% - 0.5rem), 0, 0);
            }
          }

          @media (min-width: 640px) {
            @keyframes the-bachelor-gallery-scroll {
              from {
                transform: translate3d(0, 0, 0);
              }
              to {
                transform: translate3d(calc(-50% - 0.75rem), 0, 0);
              }
            }
          }
        `}</style>
      </section>

      <div className="space-y-6 sm:space-y-0">
        <section className="relative z-10 mx-auto -mt-1 max-w-5xl px-4 sm:-mt-6">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <Card className="border-amber-200/80 bg-white/95 shadow-lg shadow-amber-950/10">
              <CardContent className="p-4 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300/70 bg-amber-100/80 sm:h-12 sm:w-12">
                    <Camera className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                        Collector Move
                      </p>
                      <h2 className="text-xl font-lucky leading-tight sm:text-2xl">Take a photo with him</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Meet BWSK, snap a proper photo together, and lock in top-tier friendship points.
                    </p>
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href="/the-bachelor/sighting/new?action=photo_together">
                        Log photo together
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200/80 bg-white/95 shadow-lg shadow-amber-950/10">
              <CardContent className="p-4 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300/70 bg-amber-100/80 sm:h-12 sm:w-12">
                    <Beer className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                        Friendship Upgrade
                      </p>
                      <h2 className="text-xl font-lucky leading-tight sm:text-2xl">Take a drink with him</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Share a drink with the groom, capture the moment, and submit it straight into the tracker.
                    </p>
                    <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
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

        <section id="stats" className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
          <StatsCards stats={stats} hypeVotes={hypeVoteCount} />
        </section>

        <section id="map" className="mx-auto max-w-6xl px-4 py-6 sm:py-12">
          <h2 className="mb-4 text-center font-lucky text-xl sm:mb-6 sm:text-3xl">Malta Sighting Map</h2>
          <MaltaMap sightings={mapSightings} />
        </section>

        <section id="hype" className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
          <h2 className="mb-4 text-center font-lucky text-xl sm:mb-6 sm:text-3xl">Hype the Groom</h2>
          <HypeMeter voteCount={hypeVoteCount} events={hypeEvents} votes={hypeVotes} />
        </section>

        <section id="public-posts" className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
          <h2 className="mb-4 text-center font-lucky text-xl sm:mb-6 sm:text-3xl">Public Posts</h2>
          {publicPosts.length === 0 ? (
            <Card className="border-amber-200/80 bg-white/95 shadow-lg shadow-amber-950/10">
              <CardContent className="p-6 text-center text-muted-foreground">
                No public posts yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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
                  <CardContent className="p-4 sm:p-5">
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <p className="text-sm font-semibold">{post.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section id="ladder" className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
          <h2 className="mb-4 text-center font-lucky text-xl sm:mb-6 sm:text-3xl">Friendship Levels</h2>
          <ParticipationLadder />
        </section>

        <section id="timeline" className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
          <h2 className="mb-4 text-center font-lucky text-xl sm:mb-6 sm:text-3xl">Recent Sightings</h2>
          <SightingTimeline sightings={sightings} />
        </section>
      </div>

      <Footer />
      <BachelorMobileNav />
    </div>
  )
}
