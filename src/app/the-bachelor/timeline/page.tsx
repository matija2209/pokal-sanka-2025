import { getApprovedSightings } from '@/lib/prisma/fetchers/sighting-fetchers'
import { SightingTimeline } from '@/components/bachelor/sighting-timeline'
import { getCurrentPersonId } from '@/lib/utils/cookies'
import { deleteSightingFromTimelineAction } from '@/app/the-bachelor/timeline/actions'

export const dynamic = 'force-dynamic'

const SUPERADMIN_PERSON_ID = 'person_cmfr8yyqg000ll104sxm0hkut'

export default async function TimelinePage() {
  const [sightings, personId] = await Promise.all([
    getApprovedSightings(50, 0),
    getCurrentPersonId(),
  ])
  const isSuperadmin = personId === SUPERADMIN_PERSON_ID
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
