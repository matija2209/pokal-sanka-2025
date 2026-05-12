import { getApprovedSightings } from '@/lib/prisma/fetchers/sighting-fetchers'
import { SightingTimeline } from '@/components/bachelor/sighting-timeline'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { deleteSightingFromTimelineAction } from '@/app/the-bachelor/timeline/actions'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const [sightings, session] = await Promise.all([
    getApprovedSightings(50, 0),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])
  const isSuperadmin = session !== null
  const onDeleteSighting = async (sightingId: string) => {
    'use server'
    await deleteSightingFromTimelineAction(sightingId)
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-lucky text-center mb-2">Sighting Timeline</h1>
        <p className="text-center text-muted-foreground mb-8">
          Every approved sighting of BWSK across Malta.
        </p>
        <SightingTimeline
          sightings={sightings}
          canDelete={isSuperadmin}
          onDeleteSighting={onDeleteSighting}
        />
      </div>
    </div>
  )
}
