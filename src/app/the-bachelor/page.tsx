import { getApprovedSightings, getSightingStats } from '@/lib/prisma/fetchers/sighting-fetchers'
import { getHypeVoteCount, getHypeEvents } from '@/lib/prisma/fetchers/hype-fetchers'
import { HeroSection } from '@/components/bachelor/hero-section'
import { StatsCards } from '@/components/bachelor/stats-cards'
import { MaltaMap } from '@/components/bachelor/malta-map'
import { HypeMeter } from '@/components/bachelor/hype-meter'
import { ParticipationLadder } from '@/components/bachelor/participation-ladder'
import { SightingTimeline } from '@/components/bachelor/sighting-timeline'
import { Footer } from '@/components/bachelor/footer'

export const dynamic = 'force-dynamic'

export default async function BachelorPage() {
  const [sightings, stats, hypeVoteCount, hypeEvents] = await Promise.all([
    getApprovedSightings(10, 0),
    getSightingStats(),
    getHypeVoteCount(),
    getHypeEvents(),
  ])

  const mapSightings = sightings.map((s) => ({
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
    <div className="min-h-screen bg-background">
      <HeroSection />

      <section id="stats" className="py-12 px-4 max-w-4xl mx-auto">
        <StatsCards stats={stats} hypeVotes={hypeVoteCount} />
      </section>

      <section id="map" className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-lucky text-center mb-6">Malta Sighting Map</h2>
        <MaltaMap sightings={mapSightings} />
      </section>

      <section id="hype" className="py-12 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-lucky text-center mb-6">Hype the Groom</h2>
        <HypeMeter voteCount={hypeVoteCount} events={hypeEvents} />
      </section>

      <section id="ladder" className="py-12 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-lucky text-center mb-6">Friendship Levels</h2>
        <ParticipationLadder />
      </section>

      <section id="timeline" className="py-12 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-lucky text-center mb-6">Recent Sightings</h2>
        <SightingTimeline sightings={sightings} />
      </section>

      <Footer />
    </div>
  )
}
