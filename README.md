# Pokal Šanka — Matija 2025 Edition

A drink tracking competition system built with Next.js 15. Features real-time leaderboards, team management, AI-powered commentary in Slovenian, and a TV dashboard for tournament events.

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
| `/superadmin` | Reset all database data |

### Auth
No passwords. Users create an account by entering their name on the entry screen (`/`), or pick an existing user from the list. The server sets an `httpOnly` cookie (`turnir-sanka-user-id`) containing the user's database ID. All pages check this cookie via `getCurrentUser()` — if absent or invalid, the user is redirected to `/`.

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
```

### 3. Database
```bash
npx prisma generate
npx prisma db push
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
| **PostgreSQL** (Neon) | All app data — users, teams, drink logs, commentary, posts | Managed via Prisma ORM. Schema below. |
| **Vercel Blob** | User-uploaded images — profile avatars, team logos, post images | Images compressed client-side (canvas API) before upload. Max 10MB per file. |
| **httpOnly cookies** | User session — `turnir-sanka-user-id` holding the user's database ID | No passwords. Set on login, checked server-side on every page. |

## Database Schema

```prisma
model User {
  id               String   @id @default(cuid())
  name             String
  teamId           String?
  createdAt        DateTime @default(now())
  profile_image_url String?

  team      Team?       @relation(fields: [teamId], references: [id])
  drinkLogs DrinkLog[]
  posts     Post[]
}

model Team {
  id             String   @id @default(cuid())
  name           String   @unique
  color          String
  logo_image_url String?
  createdAt      DateTime @default(now())

  users User[]
}

model DrinkLog {
  id        String   @id @default(cuid())
  userId    String
  drinkType String
  points    Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Commentary {
  id          String   @id @default(cuid())
  type        String
  message     String
  priority    Int
  metadata    Json     @default("{}")
  isDisplayed Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  userId    String
  message   String
  image_url String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

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
| `/superadmin` | `src/app/superadmin/page.tsx` | Database reset button |

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
| `src/app/superadmin/actions.ts` | `resetDatabase` | Delete all data (no auth guard) |

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
npx prisma db push   # Push schema to database
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
