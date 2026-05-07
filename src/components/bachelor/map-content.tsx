'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Map as MapIcon } from 'lucide-react'
import { ACTION_LABELS } from '@/lib/utils/bachelor-points'
import type { ActionType } from '@/lib/utils/bachelor-points'

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

function defaultIcon() {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

function FitBounds({ sightings }: { sightings: MapSighting[] }) {
  const map = useMap()

  useEffect(() => {
    if (sightings.length > 0) {
      const bounds = L.latLngBounds(
        sightings.map((s) => [s.latitude, s.longitude] as [number, number]),
      )
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    }
  }, [map, sightings])

  return null
}

function NoSightingsOverlay() {
  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
      <div className="bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full border text-sm text-muted-foreground">
        No sightings yet. Be the first!
      </div>
    </div>
  )
}

interface MapContentProps {
  sightings: MapSighting[]
}

export function MapContent({ sightings }: MapContentProps) {
  const MALTA_CENTER: [number, number] = [35.9375, 14.3754]

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden border shadow-inner bg-muted/10 group">
      {sightings.length === 0 && <NoSightingsOverlay />}
      
      <div className="absolute top-3 left-3 z-[1000] sm:hidden">
        <div className="bg-background/80 backdrop-blur-md px-2 py-1 rounded-md border text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <MapIcon className="w-3 h-3" />
          Interactive Map
        </div>
      </div>

      <MapContainer
        center={MALTA_CENTER}
        zoom={sightings.length > 0 ? 12 : 11}
        className="w-full h-full z-0"
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {sightings.map((s) => {
          const actionLabel = ACTION_LABELS[s.actionType as ActionType]?.en ?? s.actionType

          return (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={defaultIcon()}
          >
            <Popup className="bachelor-popup">
              <div className="min-w-[180px] text-sm font-sans">
                {s.photoUrl && (
                  <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
                    <img
                      src={s.photoUrl}
                      alt="Sighting"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="font-bold text-foreground">
                  {s.submitterName || 'Anonymous'}
                </p>
                {s.message && (
                  <p className="text-muted-foreground text-[11px] mt-1 leading-snug italic">
                    &ldquo;{s.message}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted">
                  <span className="text-[10px] font-bold text-primary uppercase">{actionLabel}</span>
                  <span className="text-[10px] font-black">+{s.points} PTS</span>
                </div>
              </div>
            </Popup>
          </Marker>
          )
        })}
        <FitBounds sightings={sightings} />
      </MapContainer>
    </div>
  )
}
