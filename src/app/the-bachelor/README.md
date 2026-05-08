# Track the Groom — BWSK Friend Collection

Public-facing mobile page for the bachelor party. Strangers scan a QR code on the groom's back, land here, and participate in tracking him across Malta.

## Routes

| Route | Description |
|---|---|
| `/the-bachelor` | Public landing — hero, quick CTAs for photo/drink actions, stats, map, hype meter, friendship ladder, recent sightings, footer |
| `/the-bachelor/sighting/new` | Sighting form — action picker + photo + GPS + optional name/country/message |
| `/the-bachelor/sighting/[id]/success` | Success screen — points earned, friendship level, upgrade options |
| `/the-bachelor/timeline` | Full timeline of approved sightings |
| `/superadmin/bachelor` | Admin — approve/reject sightings, manage hype events, and delete bachelor event data |

## How it works

### Submission flow
1. User scans QR → lands on `/the-bachelor`
2. Clicks either the hero CTA or one of the landing quick CTAs
3. Quick CTA deep links can preselect `photo_together` or `drink_together` via `/the-bachelor/sighting/new?action=...`
4. Picks what happened: spot him, leave a message, say hi, drink together, photo together, or challenge him
5. Browser GPS acquired (`navigator.geolocation.getCurrentPosition`) with manual fallback
6. Photo taken via `<input capture="environment">`, compressed client-side (Canvas API), uploaded to Vercel Blob
7. Server creates `PublicSighting` record — auto-approved, appears immediately
8. Redirect to success page showing points + friendship level + upgrade options

### GPS
- Browser Geolocation API at submission time (not EXIF)
- `enableHighAccuracy: true`, 15s timeout
- Manual lat/lng input fallback on deny/timeout/unavailable
- Admin can correct coordinates via `correctedLatitude`/`correctedLongitude`

### Hype meter
- Public vote form lets visitors choose one of the locked predefined `HypeEvent` records
- Each vote adds 1 hype point to the selected event and also increases total public hype points
- An event unlocks when its own `voteCount` reaches its own `voteThreshold`
- Optional `voterName` and optional note are still accepted with each vote
- Admin creates, unlocks, and completes events
- Public UI highlights total hype points and the event closest to unlock

### Points & friendship
| Action | Points | Level |
|---|---|---|
| Spot him | 1 | Witness |
| Leave a message | 2 | Messenger |
| Say hi | 4 | Acquaintance |
| Drink together | 6 | Drinking Buddy |
| Photo together | 9 | Collected Friend |
| Challenge him | 17 | Legendary Friend |

### Admin approval
Submissions are auto-approved by default and appear on the public page immediately. The admin panel at `/superadmin/bachelor` is available for rejecting, editing, managing hype events, or wiping bachelor-event data when you need a clean reset.

## Data model

Three Prisma models scoped to the existing `Event` model (`bachelor-party` slug):

- **`PublicSighting`** — geotagged photo submissions, auto-approved on creation
- **`HypeVote`** — public vote records with optional voter name and note
- **`HypeEvent`** — groom action events with vote thresholds

No `User` records are created for strangers — submissions are standalone `PublicSighting` records.

## Key files

### Server
- `src/app/the-bachelor/actions.ts` — `submitSightingAction`, `submitHypeVoteAction`
- `src/app/superadmin/bachelor/actions.ts` — `approveSightingAction`, `rejectSightingAction`, `createHypeEventAction`, `triggerHypeEventAction`, `resetBachelorEventData`
- `src/lib/prisma/fetchers/sighting-fetchers.ts` — 10 fetcher functions
- `src/lib/prisma/fetchers/hype-fetchers.ts` — 7 fetcher functions
- `src/lib/utils/bachelor-points.ts` — action types, points, friendship level constants

### Client components
- `src/components/bachelor/hero-section.tsx` — hero with CTA
- `src/app/the-bachelor/page.tsx` — landing composition including quick CTAs for `photo_together` and `drink_together`
- `src/components/bachelor/stats-cards.tsx` — stat counters
- `src/components/bachelor/malta-map.tsx` + `map-content.tsx` — Leaflet map with dark tiles
- `src/components/bachelor/hype-meter.tsx` + `hype-vote-form.tsx` — event-based voting UI with total hype points and per-event progress
- `src/components/bachelor/sighting-form.tsx` — GPS + photo + optional fields
- `src/components/bachelor/sighting-success.tsx` — points + upgrade options
- `src/components/bachelor/sighting-timeline.tsx` — card-based timeline
- `src/components/bachelor/participation-ladder.tsx` — 5-level visual ladder
- `src/components/bachelor/footer.tsx` — safety/privacy rules
- `src/components/bachelor/admin/sighting-queue.tsx` — approve/reject UI
- `src/components/bachelor/admin/hype-manager.tsx` — hype event management

## Hype flow

- Locked hype events are the public voting targets
- The vote form submits a selected event id plus optional voter details
- The selected event’s `voteCount` is incremented on each vote
- When `voteCount >= voteThreshold`, that event is marked `unlocked`
- Completed events remain visible in hype history as social proof
