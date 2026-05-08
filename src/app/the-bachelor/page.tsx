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
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <HeroSection />

      <section className="relative overflow-hidden py-4 sm:py-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max gap-4 sm:gap-6 [animation:the-bachelor-gallery-scroll_34s_linear_infinite] motion-reduce:animate-none">
          {[...bachelorGallery, ...bachelorGallery].map((image, index) => (
            <div
              key={`${image.alt}-${index}`}
              className="relative h-48 w-36 sm:h-64 sm:w-48 md:h-80 md:w-60 shrink-0 overflow-hidden rounded-[1.75rem] border border-primary/15 bg-muted/30 shadow-xl shadow-primary/10"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 240px"
                className="object-cover"
                priority={index < bachelorGallery.length}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
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

      <div className="space-y-4 sm:space-y-0">
        <section className="px-4 max-w-5xl mx-auto -mt-2 sm:-mt-6 relative z-10">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/20 border-primary/20 shadow-lg shadow-primary/5">
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                        Collector Move
                      </p>
                      <h2 className="text-2xl font-lucky leading-tight">Take a photo with him</h2>
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

            <Card className="bg-muted/20 border-primary/20 shadow-lg shadow-primary/5">
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Beer className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                        Friendship Upgrade
                      </p>
                      <h2 className="text-2xl font-lucky leading-tight">Take a drink with him</h2>
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

        <section id="stats" className="py-8 sm:py-12 px-4 max-w-4xl mx-auto">
          <StatsCards stats={stats} hypeVotes={hypeVoteCount} />
        </section>

        <section id="map" className="py-8 sm:py-12 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-lucky text-center mb-6">Malta Sighting Map</h2>
          <MaltaMap sightings={mapSightings} />
        </section>

        <section id="hype" className="py-8 sm:py-12 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-lucky text-center mb-6">Hype the Groom</h2>
          <HypeMeter voteCount={hypeVoteCount} events={hypeEvents} votes={hypeVotes} />
        </section>

        <section id="public-posts" className="py-8 sm:py-12 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-lucky text-center mb-6">Public Posts</h2>
          {publicPosts.length === 0 ? (
            <Card className="bg-muted/20 border-primary/20 shadow-lg shadow-primary/5">
              <CardContent className="p-6 text-center text-muted-foreground">
                No public posts yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {publicPosts.map((post: PublicPost) => (
                <Card key={post.id} className="bg-muted/20 border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
                  {post.image_url && (
                    <div className="relative h-72 sm:h-80">
                      <Image
                        src={post.image_url}
                        alt={`Public post by ${post.user.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
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

        <section id="ladder" className="py-8 sm:py-12 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-lucky text-center mb-6">Friendship Levels</h2>
          <ParticipationLadder />
        </section>

        <section id="timeline" className="py-8 sm:py-12 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-lucky text-center mb-6">Recent Sightings</h2>
          <SightingTimeline sightings={sightings} />
        </section>
      </div>

      <Footer />
      <BachelorMobileNav />
    </div>
  )
}
