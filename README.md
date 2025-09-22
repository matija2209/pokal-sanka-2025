# Pokal Šanka — Matija 2025 Edition 🍻🏆

A comprehensive drink tracking competition system built with Next.js 15, featuring real-time leaderboards, team management, AI-powered commentary, and a professional TV dashboard for tournament events.

## 🚀 Features

### Core Competition System
- **User Management**: Create profiles, join teams, switch teams dynamically
- **Team Competition**: Team creation with custom colors, aggregate scoring, team leaderboards
- **Drink Logging**: Regular drinks (+1 point) and shots (+2 points) with single and multi-user logging
- **Real-time Scoring**: Live leaderboard updates and score calculations
- **Achievement System**: Milestone tracking with gamification badges

### Advanced UI Features
- **Professional Dashboard**: Tournament-ready interface with responsive design
- **TV Dashboard**: Large-screen optimized display with auto-rotating views (15-second intervals)
- **AI Commentary**: OpenAI-powered Slovenian commentary for drink events and milestones
- **Breaking News Ticker**: BBC-style scrolling news banner for user posts
- **Image Display**: Latest images carousel showing posts, profiles, and team logos
- **Mobile Responsive**: Optimized for all screen sizes

### Real-time Features
- **Live Activity Feed**: Recent drink logs with timestamps
- **Auto-refresh**: Data updates across all components
- **Commentary Generation**: AI-powered event commentary in Slovenian
- **Multi-user Logging**: Bulk drink logging for group events

## 🏗️ Technical Stack

### Frontend
- **Next.js 15**: App Router with Server Components and Server Actions
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Professional styling with custom tournament theme
- **shadcn/ui**: Modern component library integration
- **Turbopack**: Fast development builds

### Backend & Database
- **PostgreSQL**: Production database hosted on Neon
- **Prisma ORM**: Type-safe database operations with schema management
- **Server Actions**: Modern form handling with useActionState
- **Cookie Sessions**: Secure user session management

### AI & Services
- **OpenAI GPT-4o-mini**: AI commentary generation
- **Prisma Studio**: Visual database management interface

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon cloud database)
- OpenAI API key (optional, for AI commentary)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd pokal-sanka-2025
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
OPENAI_API_KEY="your-openai-api-key-here"  # Optional
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Open Prisma Studio for database management
npx prisma studio --port 5555
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Application
- **Main App**: http://localhost:3000
- **TV Dashboard**: http://localhost:3000/dashboard
- **Database Admin**: http://localhost:5555

## 🎯 Usage Guide

### Getting Started
1. **Create User**: Enter your name on the homepage
2. **Select Team**: Choose existing team or create new team with custom color
3. **Start Competing**: Log drinks and track your progress on the leaderboard

### Team Management
- **Create Teams**: Custom names with auto-generated colors
- **Join Teams**: Select from available teams with member counts
- **Team Switching**: Change teams anytime through profile page

### Drink Logging
- **Single User**: Select user and drink type (Regular +1, Shot +2)
- **Multi-User**: Enable multi-select mode for group drinking events
- **Instant Updates**: Real-time leaderboard and activity feed updates

### TV Dashboard
- **Auto-Rotation**: 15-second intervals between views (Teams → Players → Activity → Commentary)
- **Full-Screen**: Press F11 for optimal TV display
- **Live Commentary**: AI-generated Slovenian commentary for events
- **Breaking News**: Continuous ticker with user posts
- **Latest Images**: Multi-source image carousel

## 📊 Database Schema

### Core Models
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  teamId    String?
  createdAt DateTime @default(now())
  
  team      Team?       @relation(fields: [teamId], references: [id])
  drinkLogs DrinkLog[]
}

model Team {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String
  createdAt DateTime @default(now())
  
  users User[]
}

model DrinkLog {
  id        String   @id @default(cuid())
  userId    String
  drinkType String   # 'REGULAR' | 'SHOT'
  points    Int
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Commentary {
  id          String   @id @default(cuid())
  type        String   # 'milestone' | 'streak' | 'achievement' | 'hype' | 'team_event'
  message     String
  priority    Int      # 1-5 priority level
  metadata    Json     # Context data
  isDisplayed Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

## 🤖 AI Commentary System

### Commentary Types
- **Milestone** 🏆: Points milestones (5, 10, 25, 50+)
- **Streak** 🔥: Multiple drinks in short timeframe
- **Achievement** 🎊: First drinks, leadership changes
- **Hype** 🎉: Random encouraging messages
- **Team Event** 🚀: Team milestones and competitions
- **Bulk Hype** 🍻: Special commentary for group drinking events

### OpenAI Integration
```typescript
// Context provided to AI
CommentaryContext {
  eventType: string
  user: { name, totalPoints, totalDrinks, recentDrinks, isOnStreak }
  team?: { name, color, totalPoints, memberCount }
  drink: { type: 'REGULAR' | 'SHOT', points }
  milestone?: { pointsReached, isSignificant }
  streak?: { count, timeWindow }
  achievement?: { type, details }
  bulk?: { userCount, userNames, teams, totalPointsAdded }
}
```

## 📺 TV Dashboard Features

### Display Modes
1. **Team Rankings**: Top 5 teams with scores and member counts
2. **Top Players**: Individual leaderboard with team affiliations  
3. **Recent Activity**: Latest drink logs with timestamps
4. **Commentary**: AI-generated event commentary

### Visual Features
- **Slovenian Localization**: Complete UI translation
- **Live Countdown**: Shows seconds until next view change
- **Trophy Effects**: Gold/silver/bronze styling for rankings
- **Team Colors**: Visual team identification throughout
- **High Contrast**: Optimized for large screen viewing

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking

# Database
npx prisma studio    # Open database management interface
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma migrate   # Create database migrations
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Root onboarding page
│   ├── actions.ts         # Server Actions
│   ├── dashboard/         # TV Dashboard
│   ├── players/           # Player management
│   ├── teams/             # Team management
│   ├── profile/           # User profile
│   └── select-team/       # Team selection
├── components/             # React Components
│   ├── dashboard/         # Dashboard components
│   ├── drinks/            # Drink logging
│   ├── layout/            # Navigation & layout
│   ├── teams/             # Team components
│   ├── ui/                # shadcn/ui components
│   └── users/             # User components
├── lib/                   # Utilities & Services
│   ├── openai/            # AI commentary service
│   ├── prisma/            # Database layer
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
└── prisma/
    └── schema.prisma      # Database schema
```

## 🎨 Customization

### Team Colors
Predefined colors in `src/lib/utils/colors.ts`:
- 15 vibrant colors for team identification
- Automatic color assignment for new teams
- Color availability checking

### Commentary Prompts
Modify AI prompts in `src/lib/openai/index.ts`:
- Slovenian sports commentator style
- Customizable excitement levels
- Context-aware message generation

### UI Theming
Tournament styling in `src/app/globals.css`:
- Competition gradients (gold, silver, bronze)
- Achievement badge system
- Mobile-responsive utilities

## 🔧 Production Deployment

### Environment Variables
```env
DATABASE_URL="your-production-database-url"
OPENAI_API_KEY="your-openai-api-key"
NODE_ENV="production"
```

### Build Steps
```bash
npm run build
npm run start
```

### Database Migration
```bash
npx prisma migrate deploy
npx prisma generate
```

## 📈 Performance Features

- **Server-Side Rendering**: Fast initial page loads
- **Parallel Data Fetching**: Concurrent database queries
- **Optimized Images**: Next.js image optimization
- **CSS Animations**: Hardware-accelerated transitions
- **Efficient Caching**: Smart data revalidation

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes with TypeScript compliance
3. Test all functionality
4. Run `npm run lint` and `npm run typecheck`
5. Submit pull request

### Code Standards
- TypeScript strict mode
- Prisma for all database operations
- Server Actions for form handling
- Responsive design requirements
- Slovenian localization for user-facing content

## 📝 Development Logs

Detailed development documentation available in:
- `DEV_LOG.md` - Complete development phases (1-4)
- `PHASE_4_DEV_LOG.md` - Advanced UI features and verification
- `TV_DASHBOARD_DEV_LOG.md` - TV dashboard implementation
- `DATABASE_SETUP_DEV_LOG.md` - Database setup and verification
- `DEVLOG.md` - AI commentary and TV enhancements

## 🏆 Tournament Ready

This application is production-ready for tournament environments with:
- Professional large-screen TV dashboard
- Real-time competition tracking
- AI-powered event commentary
- Multi-user drink logging capabilities
- Complete Slovenian localization
- Mobile-responsive design

Perfect for **Slovenian drinking tournaments** and competitive events! 🇸🇮🍻

---

Built with ❤️ using Next.js 15, TypeScript, Prisma, and OpenAI