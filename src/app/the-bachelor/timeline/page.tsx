import { getApprovedSightings } from '@/lib/prisma/fetchers/sighting-fetchers'
import { SightingTimeline } from '@/components/bachelor/sighting-timeline'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const sightings = await getApprovedSightings(50, 0)

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-lucky text-center mb-2">Sighting Timeline</h1>
        <p className="text-center text-muted-foreground mb-8">
          Every approved sighting of BWSK across Malta.
        </p>
        <SightingTimeline sightings={sightings} />
      </div>
    </div>
  )
}
