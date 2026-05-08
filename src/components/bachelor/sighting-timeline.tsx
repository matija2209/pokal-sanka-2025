import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { PublicSighting } from '@prisma/client'
import { ACTION_LABELS } from '@/lib/utils/bachelor-points'
import type { ActionType } from '@/lib/utils/bachelor-points'
import Image from 'next/image'

interface SightingTimelineProps {
  sightings: PublicSighting[]
  canDelete?: boolean
  onDeleteSighting?: (sightingId: string) => Promise<void>
}

export function SightingTimeline({
  sightings,
  canDelete = false,
  onDeleteSighting,
}: SightingTimelineProps) {
  if (sightings.length === 0) {
    return (
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No sightings yet. Be the first to spot BWSK!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sightings.map((sighting) => {
        const actionLabel =
          ACTION_LABELS[sighting.actionType as ActionType]?.en ?? sighting.actionType
        return (
          <Card key={sighting.id} className="bg-muted/20 border-muted overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {sighting.photoUrl && (
                  <div className="relative w-full sm:w-40 h-56 sm:h-auto flex-shrink-0">
                    <Image
                      src={sighting.photoUrl}
                      alt="Sighting photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 160px"
                    />
                    <div className="absolute top-2 right-2 sm:hidden">
                       <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] px-1.5 py-0">
                        {actionLabel}
                      </Badge>
                    </div>
                  </div>
                )}
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                        {actionLabel}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        +{sighting.points} pts
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(sighting.createdAt, { addSuffix: true })}
                    </span>
                  </div>

                  {canDelete && onDeleteSighting && (
                    <form action={onDeleteSighting.bind(null, sighting.id)} className="mb-2">
                      <button
                        type="submit"
                        className="text-[10px] font-semibold text-destructive hover:opacity-80 transition-opacity"
                      >
                        Delete post
                      </button>
                    </form>
                  )}

                  {sighting.submitterName && (
                    <p className="font-bold text-sm">
                      {sighting.submitterName}
                      {sighting.submitterCountry && (
                        <span className="text-muted-foreground font-normal ml-1">
                          from {sighting.submitterCountry}
                        </span>
                      )}
                    </p>
                  )}

                  {sighting.message && (
                    <div className="mt-2 p-2 rounded-lg bg-background/50 border border-muted italic text-sm text-muted-foreground leading-relaxed">
                      &ldquo;{sighting.message}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                      Friendship Level:{' '}
                      <span className="text-primary font-bold">
                        {sighting.friendshipLevel}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
