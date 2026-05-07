# Pokal Šanka — Matija 2025 Edition

A drink tracking competition system built with Next.js 15. Features real-time leaderboards, team management, AI-powered commentary in Slovenian, and a TV dashboard for tournament events.

## Features

### Core Competition
- **User profiles** with avatars, team affiliation, and drink history
- **Team competition** with custom colors, logos, aggregate scoring, and rankings
- **19 drink types** across 3 tiers: beer/radler (+1pt), spirits & cocktails (+2pt), premium cocktails (+3pt)
- **Single & multi-user drink logging** — log drinks for yourself or a group
- **Real-time leaderboards** — sorted by score with team filter
- **Player detail pages** with stats, drink history, and achievements

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

```
src/
├── app/                   # Next.js App Router pages
│   ├── actions.ts         # Server actions (log drinks, create user, etc.)
│   ├── page.tsx           # Entry/onboarding
│   ├── dashboard/         # TV dashboard
│   ├── players/           # Main app + detail pages
│   ├── teams/             # Team leaderboard + detail pages
│   ├── profile/           # User profile management
│   ├── quick-log/         # Fast drink logging
│   ├── select-team/       # Team selection
│   ├── stats/             # Stats, leaderboard, activity
│   ├── superadmin/        # Database reset
│   └── api/upload/        # Vercel Blob upload endpoint
├── components/
│   ├── commentary/        # Commentary display
│   ├── dashboard/         # TV dashboard components
│   ├── drinks/            # Drink logging forms & dialogs
│   ├── entry/             # Entry screen components
│   ├── layout/            # Navigation, dashboard layout
│   ├── teams/             # Team cards, forms, logos
│   ├── timeline/          # Post/timeline components
│   ├── ui/                # shadcn/ui primitives
│   └── users/             # User forms, avatars, leaderboard, stats
├── lib/
│   ├── openai/            # OpenAI client + commentary generation
│   ├── prisma/
│   │   ├── client.ts      # Prisma singleton
│   │   ├── types.ts       # Generated + custom types
│   │   └── fetchers/      # Database query functions
│   ├── services/
│   │   ├── commentary-generator.ts  # Orchestrates commentary logic
│   │   ├── state-capture.ts         # Snapshot competition state
│   │   ├── state-comparator.ts      # Diff two states for events
│   │   ├── ranking-calculator.ts    # Rank calculations with tie handling
│   │   └── llm-preprocessor.ts      # Context builder for AI
│   ├── types/
│   │   └── action-states.ts         # Server action state types
│   └── utils/
│       ├── calculations.ts  # Score/ranking/dashboard utilities
│       ├── cookies.ts       # User session cookie management
│       ├── colors.ts        # Team color palette
│       ├── drinks.ts        # Drink config and helpers
│       ├── image-upload.ts  # Server-side image upload
│       └── client-image-compression.ts  # Client-side compression
└── prisma/
    └── schema.prisma
```

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
