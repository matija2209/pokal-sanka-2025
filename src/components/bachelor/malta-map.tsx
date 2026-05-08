'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

interface MapSighting {
  id: string
  photoUrl: string
  latitude: number
  longitude: number
  submitterName: string | null
  actionType: string
  points: number
  message: string | null
  createdAt: Date
}

const MapContent = dynamic(
  () => import('@/components/bachelor/map-content').then((mod) => mod.MapContent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-xl border border-amber-200/80 bg-white/95 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    ),
  },
)

interface MaltaMapProps {
  sightings: MapSighting[]
}

export function MaltaMap({ sightings }: MaltaMapProps) {
  return <MapContent sightings={sightings} />
}
