# Bwšk Bachelor 2026

A drink tracking competition system built with Next.js 15. Features real-time leaderboards, team management, AI-powered commentary in Slovenian, a TV dashboard for tournament events, and multi-event storage so separate parties do not share scores or teams.

## Features

### Core Competition
- **User profiles** with avatars, team affiliation, and drink history
- **Team competition** with custom colors, logos, aggregate scoring, and rankings
- **19 drink types** across 3 tiers: beer/radler (+1pt), spirits & cocktails (+2pt), premium cocktails (+3pt)
- **Single & multi-user drink logging** — log drinks for yourself or a group
- **Quick-log grid** — tap any player on the grid to log a drink for them
- **Real-time leaderboards** — sorted by score with team filter
- **Player detail pages** with stats, drink history, and achievements
- **Team detail pages** — view team stats, members, and rankings
- **Timeline posts** — users can post messages with images, displayed as a scrolling breaking news ticker on the TV dashboard
- **Image upload** — profile avatars, team logos, and post images via Vercel Blob with client-side canvas compression

### TV Dashboard
- **Auto-rotating views** every 15 seconds: Teams > Players > Activity > Commentary
- **Breaking news ticker** — BBC-style scrolling banner showing user posts
- **Latest images carousel** — post images, profile pictures, team logos
- **Live countdown** showing time until next view change
- **Neon/glow visual effects** optimized for large screens

### AI Commentary
OpenAI GPT-4o-mini generates Slovenian sports commentary for:
- Milestones, streaks, achievements, team events
- Leadership changes, top 3 entries/exits, rank jumps
- Team overtakes, last-place escapes, group drinking events
- Fallback messages when the API is unavailable

### Pages
| Route | Description |
|---|---|
| `/` | Entry screen — create account or select existing |
| `/select-team` | Join or create a team |
| `/players` | Main app — log drinks, create posts |
| `/quick-log` | Fast drink logging via player grid |
| `/teams` | Team leaderboard |
| `/teams/[id]` | Team detail with stats |
| `/players/[id]` | Player detail with history |
| `/stats` | Leaderboard, commentary, timeline, activity |
| `/profile` | Edit name, switch team, upload avatar/team logo |
| `/dashboard` | TV-optimized auto-rotating display |
| `/superadmin` | Superadmin overview, person/player management, and event reset controls |

### Auth

The system uses a **dual authentication model**:

**Admin authentication (Better Auth):**
- Email + password sign-in for superadmins and event admins
- Backed by PostgreSQL via Prisma adapter
- Role-based access control with two admin roles:
  - **superadmin** — full control: all CRUD, manage other admins, user management
  - **eventAdmin** — manage events: players, teams, trivia, sightings
- All `/superadmin/*` routes require an authenticated admin session with a valid role
- Sign-in page at `/login`; logout button in the superadmin nav bar

Setup:
```env
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
```

Tables: `user` (auth identity with role/ban fields), `session`, `account`, `verification` — separate from the game data models.

**Player authentication (cookie-based):**
No passwords. Users create an account by entering their name on the entry screen (`/`), or pick an existing user from the list for the currently selected event. The server stores:
- `turnir-sanka-user-id` — active participant/user record for the selected event
- `turnir-sanka-person-id` — shared identity across events
- `turnir-sanka-event-id` — currently active event

**Role summary:**

| Role | Auth method | Access |
|------|-------------|--------|
| superadmin | Email + password | Full control: `/superadmin/*`, all CRUD, user management |
| eventAdmin | Email + password | Manage events: players, teams, trivia, sightings |
| player | Cookie-based (name) | Game participation: feed, stats, drink logging, team selection |
| guest | None | Public pages: landing, bachelor game, invite links |

### Promoting a Person to an Admin Account

The `AuthUser` table has a `personId` bridge field that links an authenticated identity to a real Person record. This lets the same person be recognized both as a game player (cookie-based, across events) and as an authenticated identity (Better Auth, with a role).

To promote a Person:
1. Sign in as superadmin at `/login`
2. Go to `/superadmin` → find the Person in the Players or Add-to-Event tab
3. Click the **"Promote"** link next to their name
4. Enter their email, password, and select a role (superadmin / eventAdmin / player)
5. Submit — the system creates an `AuthUser` record linked via `personId`

If a Person is already linked, the promote page shows the existing email and lets you update their password or change their role.

To make the very first superadmin after a fresh database:
1. Sign up at `/login` with an email and password
2. Run the seed script: `npx tsx scripts/promote-superadmin.ts <your-email>`
3. Restart or reload — that account is now superadmin

### Seed & Admin Scripts
```bash
# Promote a Better Auth user to superadmin by email
npx tsx scripts/promote-superadmin.ts admin@example.com
```

### Invite URLs
You can deep-link a person into a specific event with:

```text
/invite/[eventSlug]/[personId]
```

Example:

```text
/invite/bachelor-party/cmabc123person456
```

When someone opens that URL, the server:
- sets `turnir-sanka-event-id` to the event from `eventSlug`
- sets `turnir-sanka-person-id` to the invited person
- sets `turnir-sanka-user-id` too if that person already has a participant record in that event

Redirect behavior:
- existing participant with team: `/app/feed`
- existing participant without team: `/app/select-team`
- person exists but has no participant in that event yet: `/`

That last case is intentional: the entry screen opens with the person already preselected, so creating their participant for the invited event stays a one-tap flow.

## Tech Stack

- **Next.js 15** (App Router, Server Components, Server Actions, Turbopack)
- **TypeScript**
- **Tailwind CSS 4** + shadcn/ui
- **PostgreSQL** (Neon) + **Prisma 6**
- **OpenAI** GPT-4o-mini (commentary)
- **Vercel Blob** (image uploads for avatars, team logos, post images)
- **SWR** (client-side data fetching)
- **date-fns** with Slovenian locale

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon)
- OpenAI API key (optional — commentary falls back to templates)
- Vercel Blob read/write token (optional — image upload)

### 1. Clone & install
```bash
git clone <repo-url>
cd pokal-sanka-2025
npm install
```

### 2. Environment
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
OPENAI_API_KEY="sk-..."           # Optional
BLOB_READ_WRITE_TOKEN="vercel..." # Optional, for image uploads
BETTER_AUTH_SECRET="<generated>"  # Required for admin auth (openssl rand -base64 32)
BETTER_AUTH_URL="http://localhost:3000"  # Required for admin auth
```

### 3. Database
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Start
```bash
npm run dev
```

Open http://localhost:3000. Dashboard at http://localhost:3000/dashboard.

## Storage

Three storage layers:

| Layer | What | Details |
|---|---|---|
| **PostgreSQL** (Neon) | All app data — events, people, event participants, teams, drink logs, commentary, posts | Managed via Prisma ORM. All competition data is scoped by `eventId`. |
| **Vercel Blob** | User-uploaded images — profile avatars, team logos, post images | Images compressed client-side (canvas API) before upload. Max 10MB per file. |
| **httpOnly cookies** | Active session and event context | `turnir-sanka-user-id`, `turnir-sanka-person-id`, `turnir-sanka-event-id` |

## Database Schema

```prisma
model Event {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Person {
  id                String   @id @default(cuid())
  name              String
  profile_image_url String?
  createdAt         DateTime @default(now())
}

model User {
  id               String   @id @default(cuid())
  personId         String?
  eventId          String?
  name             String
  teamId           String?
  profile_image_url String?
  createdAt        DateTime @default(now())

  person    Person?     @relation(fields: [personId], references: [id])
  event     Event?      @relation(fields: [eventId], references: [id])
  team      Team?       @relation(fields: [teamId], references: [id])
  drinkLogs DrinkLog[]
  posts     Post[]

  @@unique([eventId, personId])
}

model Team {
  id             String   @id @default(cuid())
  eventId        String?
  name           String
  color          String
  logo_image_url String?
  createdAt      DateTime @default(now())

  event Event? @relation(fields: [eventId], references: [id])
  users User[]

  @@unique([eventId, name])
}

model DrinkLog {
  id        String   @id @default(cuid())
  eventId   String?
  userId    String
  drinkType String
  points    Int
  createdAt DateTime @default(now())

  event Event? @relation(fields: [eventId], references: [id])
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Commentary {
  id          String   @id @default(cuid())
  eventId     String?
  type        String
  message     String
  priority    Int
  metadata    Json     @default("{}")
  isDisplayed Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  eventId   String?
  userId    String
  message   String
  image_url String?
  createdAt DateTime @default(now())

  event Event? @relation(fields: [eventId], references: [id])
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Legacy Data Migration

Existing single-event data is preserved by assigning it to a seeded legacy event:
- `Birthday Party` (`birthday-party-legacy`)

The repository also ensures a second event exists for new data:
- `Bachelor Party` (`bachelor-party`)

Run the Prisma migration after pulling the updated repo:

```bash
npx prisma migrate deploy
```

The generated Prisma migration:
- creates `events` and `persons`
- adds nullable `eventId` / `personId` columns first
- backfills all existing rows into the legacy birthday event inside the SQL migration
- adds the new indexes and foreign keys only after the backfill

## Drink Types

| Tier | Points | Drinks |
|---|---|---|
| Pivo & Radler | 1 | Beer, Radler |
| Zgane pijace & Koktajli | 2 | Vodka, Gin, Amaro, Pelinkovac, Jägermeister, Austrian schnaps, Sparkling wine, Jager shot, Tequila shot, Borovnicka shot, Jager-Cola, Whisky-Cola, Aperol Spritz, Mojito |
| Premium koktajli | 3 | Tequila Boom, Espresso Martini, Moscow Mule |

## Project Structure

### Pages (routing & data loading)

Each page is a Next.js Server Component that fetches its own data and passes it to client components:

| Page | File | What it does |
|---|---|---|
| `/` | `src/app/page.tsx` | Entry screen — shows existing users or create-account form |
| `/select-team` | `src/app/select-team/page.tsx` | Join or create a team (redirects to `/players` if already in a team) |
| `/players` | `src/app/players/page.tsx` | Main app — drink log form + create post form |
| `/quick-log` | `src/app/quick-log/page.tsx` | Player grid — tap any player to log a drink for them |
| `/teams` | `src/app/teams/page.tsx` | Team leaderboard |
| `/teams/[id]` | `src/app/teams/[id]/page.tsx` | Team detail — stats, members, rank |
| `/players/[id]` | `src/app/players/[id]/page.tsx` | Player detail — stats, drink history, achievements |
| `/stats` | `src/app/stats/page.tsx` | Combined leaderboard + commentary + timeline + activity |
| `/profile` | `src/app/profile/page.tsx` | Edit name, switch team, upload avatar/team logo |
| `/dashboard` | `src/app/dashboard/page.tsx` | TV-optimized auto-rotating display |
| `/superadmin` | `src/app/superadmin/page.tsx` | **(protected)** Superadmin overview, active event controls, person/player CRUD, promote-to-account, event reset |
| `/superadmin/bachelor` | `src/app/superadmin/bachelor/page.tsx` | **(protected)** Bachelor moderation, hype management, bachelor-event reset |
| `/login` | `src/app/login/page.tsx` | Admin sign-in (email + password) |

### Server Actions (form handling & mutations)

| File | Actions | What they do |
|---|---|---|
| `src/app/actions.ts` | `createUserAction` | Create a new user, set session cookie |
| | `loginUserAction` | Log in as existing user, set session cookie |
| | `createTeamAction` | Create a new team with auto-assigned color |
| | `joinTeamAction` | Join an existing team |
| | `updateUserProfileAction` | Change name, switch team, upload avatar |
| | `logDrinkAction` | Log a drink for a single user + trigger commentary |
| | `logMultipleDrinksAction` | Log the same drink for multiple users + trigger commentary |
| | `createPostAction` | Create a timeline post with optional image |
| | `refreshDashboardAction` | Trigger dashboard data refresh |
| `src/app/superadmin/actions.ts` | `resetActiveEventData`, `updateActiveEventName`, `createPersonAction`, `updatePersonAction`, `deletePersonAction`, `createPlayerForPersonAction`, `updatePlayerAction`, `deletePlayerAction`, `promotePersonToAuthUser` | Reset the active event, rename it, manage people/players, promote a Person to an AuthUser account |
| `src/app/superadmin/bachelor/actions.ts` | `approveSightingAction`, `rejectSightingAction`, `createHypeEventAction`, `triggerHypeEventAction`, `resetBachelorEventData` | Bachelor moderation, hype management, bachelor-event reset |

### Database (Prisma)

| File | What it manages |
|---|---|
| `prisma/schema.prisma` | Schema — 5 models: User, Team, DrinkLog, Commentary, Post |
| `src/lib/prisma/client.ts` | Prisma singleton with connection logging |
| `src/lib/prisma/types.ts` | TypeScript types: `UserWithTeam`, `TeamWithStats`, `DrinkLogWithUserAndTeam`, etc. |
| `src/lib/prisma/fetchers/user-fetchers.ts` | `getUserWithTeamById`, `getAllUsersWithTeamAndDrinks`, `getUserWithTeamAndDrinksById`, `getRecentUserProfileImages` |
| `src/lib/prisma/fetchers/team-fetchers.ts` | `getAllTeams`, `getTeamWithUsersById`, `getAllTeamsWithUsersAndDrinks`, `getRecentTeamLogos` |
| `src/lib/prisma/fetchers/drink-log-fetchers.ts` | `getRecentDrinkLogs`, `getRecentDrinkLogsWithTeam`, `getUserDrinkLogs` |
| `src/lib/prisma/fetchers/commentary-fetchers.ts` | `getRecentCommentaries`, `getUnreadCommentaries`, `createCommentary` |
| `src/lib/prisma/fetchers/post-fetchers.ts` | `getRecentPosts`, `getRecentPostsWithImages` |

### Business Logic (services)

| File | What it does |
|---|---|
| `src/lib/services/commentary-generator.ts` | Orchestrates commentary on drink events — checks for first drink, milestones, team events, generates AI messages, saves to DB |
| `src/lib/services/state-capture.ts` | Takes a full snapshot of all users, teams, and drink logs at a moment in time |
| `src/lib/services/state-comparator.ts` | Compares two snapshots — detects leadership changes, rank jumps, team overtakes, position changes |
| `src/lib/services/ranking-calculator.ts` | Computes global user ranks, team ranks, team-member ranks with tie handling and point-gap statistics |
| `src/lib/services/llm-preprocessor.ts` | Builds structured context strings for the OpenAI commentary prompt |

### AI Layer

| File | What it does |
|---|---|
| `src/lib/openai/index.ts` | OpenAI client (GPT-4o-mini), Slovenian system prompts for each commentary event type, message generation with fallback templates, time formatting helpers |

### Utilities

| File | What it does |
|---|---|
| `src/lib/utils/cookies.ts` | Reads/writes/deletes the `turnir-sanka-user-id` session cookie |
| `src/lib/utils/drinks.ts` | Drink config — 19 types mapped to labels, points, and categories; helper functions `getDrinkPoints()`, `getDrinkLabel()`, `getDrinksByCategory()` |
| `src/lib/utils/calculations.ts` | Score calculation, team aggregation, leaderboard sorting, ranking, team stats for dashboard |
| `src/lib/utils/colors.ts` | 15-team color palette, random assignment, next-available-color logic |
| `src/lib/utils/image-upload.ts` | Server-side upload to Vercel Blob with size validation (10MB) |
| `src/lib/utils/client-image-compression.ts` | Client-side image resize via Canvas API before upload (1920x1080, 85% quality) |
| `src/lib/types/action-states.ts` | TypeScript types for server action return states (success/error/data) |

### Components (client-side UI)

| Directory | What it contains |
|---|---|
| `src/components/entry/` | `EntryScreen` — choose create-account or existing user |
| `src/components/users/` | `CreateUserForm`, `SelectExistingUserForm`, `UserProfile`, `UserAvatar`, `Leaderboard`, `UserStats`, `UserHistory`, `UserAchievements`, `PlayerGrid` |
| `src/components/teams/` | `TeamSelectionForm`, `TeamLogoForm`, `TeamLeaderboard`, `TeamStats`, `TeamLogo` |
| `src/components/drinks/` | `DrinkLogForm`, `DrinkSelectionDialog`, `DrinkSelectionModal`, `RecentActivity` |
| `src/components/dashboard/` | `DashboardDisplay` (auto-rotating TV view), `BreakingNewsBanner`, `LatestImagesDisplay` |
| `src/components/commentary/` | `CommentaryDisplay` — filters by type, shows priority stars |
| `src/components/timeline/` | `CreatePostForm`, `TimelineDisplay` |
| `src/components/layout/` | `Navigation` (top nav bar), `DashboardLayout` (nav wrapper with refresh), `UserMenu` |
| `src/components/ui/` | ~45 shadcn/ui primitives (dialog, card, badge, button, select, etc.) |

## Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npx prisma studio    # Database admin UI
npx prisma migrate deploy   # Apply committed migrations
```

## Commentary Event Types

| Type | Trigger |
|---|---|
| `milestone` | Every 5 points |
| `streak` | Multiple drinks in short window |
| `achievement` | First drink, team leadership changes |
| `hype` | Random 20% chance on each drink |
| `bulk_hype` | Group drink log (2+ users) |
| `team_event` | Team point milestones |
| `leadership_change` | New global leader |
| `top_3_change` | Entry/exit from top 3 |
| `team_leadership` | New team-internal leader |
| `team_overtake` | One team surpasses another |
| `rank_jump` | Player jumps 3+ positions |
| `last_place_change` | Entry/exit from last place |
| `consolidated_bulk` | Multiple competitive changes at once |
