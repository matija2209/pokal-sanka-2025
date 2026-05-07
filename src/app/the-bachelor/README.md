# Track the Groom — BWSK Friend Collection

Public-facing mobile page for the bachelor party. Strangers scan a QR code on the groom's back, land here, and participate in tracking him across Malta.

## Routes

| Route | Description |
|---|---|
| `/the-bachelor` | Public landing — hero, stats, map, hype meter, friendship ladder, recent sightings, footer |
| `/the-bachelor/sighting/new` | Sighting form — photo + GPS + optional name/country/message |
| `/the-bachelor/sighting/[id]/success` | Success screen — points earned, friendship level, upgrade options |
| `/the-bachelor/timeline` | Full timeline of approved sightings |
| `/superadmin/bachelor` | Admin — approve/reject sightings, manage hype events |

## How it works

### Submission flow
1. User scans QR → lands on `/the-bachelor`
2. Clicks "Log a sighting" → `/the-bachelor/sighting/new`
3. Browser GPS acquired (`navigator.geolocation.getCurrentPosition`) with manual fallback
4. Photo taken via `<input capture="environment">`, compressed client-side (Canvas API), uploaded to Vercel Blob
5. Server creates `PublicSighting` record — auto-approved, appears immediately
6. Redirect to success page showing points + friendship level + upgrade options

### GPS
- Browser Geolocation API at submission time (not EXIF)
- `enableHighAccuracy: true`, 15s timeout
- Manual lat/lng input fallback on deny/timeout/unavailable
- Admin can correct coordinates via `correctedLatitude`/`correctedLongitude`

### Hype meter
- Public votes on what BWSK should do next
- Every 5 votes unlocks a HypeEvent
- Admin creates, unlocks, and completes events

### Points & friendship
| Action | Points | Level |
|---|---|---|
| Spot him | 1 | Witness |
| Leave a message | 2 | Messenger |
| Say hi | 4 | Acquaintance |
| Photo together | 7 | Collected Friend |
| Challenge him | 17 | Legendary Friend |

### Admin approval
Submissions are auto-approved by default and appear on the public page immediately. The admin panel at `/superadmin/bachelor` is available for rejecting, editing, or managing hype events if needed.

## Data model

Three Prisma models scoped to the existing `Event` model (`bachelor-party` slug):

- **`PublicSighting`** — geotagged photo submissions, auto-approved on creation
- **`HypeVote`** — public votes with optional suggestion and voter name
- **`HypeEvent`** — groom action events with vote thresholds

No `User` records are created for strangers — submissions are standalone `PublicSighting` records.

## Key files

### Server
- `src/app/the-bachelor/actions.ts` — `submitSightingAction`, `submitHypeVoteAction`
- `src/app/superadmin/bachelor/actions.ts` — `approveSightingAction`, `rejectSightingAction`, `createHypeEventAction`, `triggerHypeEventAction`
- `src/lib/prisma/fetchers/sighting-fetchers.ts` — 10 fetcher functions
- `src/lib/prisma/fetchers/hype-fetchers.ts` — 7 fetcher functions
- `src/lib/utils/bachelor-points.ts` — action types, points, friendship level constants

### Client components
- `src/components/bachelor/hero-section.tsx` — hero with CTA
- `src/components/bachelor/stats-cards.tsx` — stat counters
- `src/components/bachelor/malta-map.tsx` + `map-content.tsx` — Leaflet map with dark tiles
- `src/components/bachelor/hype-meter.tsx` + `hype-vote-form.tsx` — voting UI
- `src/components/bachelor/sighting-form.tsx` — GPS + photo + optional fields
- `src/components/bachelor/sighting-success.tsx` — points + upgrade options
- `src/components/bachelor/sighting-timeline.tsx` — card-based timeline
- `src/components/bachelor/participation-ladder.tsx` — 5-level visual ladder
- `src/components/bachelor/footer.tsx` — safety/privacy rules
- `src/components/bachelor/admin/sighting-queue.tsx` — approve/reject UI
- `src/components/bachelor/admin/hype-manager.tsx` — hype event management
