# Trivia Module — Implemented Functionalities

The Trivia module adds a quiz game system to Pokal Šanka. It shares users/events with the drinking game and feeds trivia points into the same scoreboard.

---

## Architecture

### Safety-first: backwards-compatible rollout

The entire trivia module is **guarded by a runtime database check** (`isTriviaAvailable()`). App code can be deployed **before** the database migration is applied. When trivia tables don't exist:
- Trivia pages show a "migration needed" message
- Score calculations ignore trivia points (existing behavior preserved)
- All existing functionality works identically

### File inventory

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | 4 new models + Event relations |
| `prisma/migrations/20260507200000_add_trivia_models/migration.sql` | DB migration (CREATE-only) |
| `src/lib/prisma/schema-capabilities.ts` | `isTriviaAvailable()` runtime check |
| `src/lib/trivia-scoring.ts` | Pure scoring functions (no DB) |
| `src/lib/prisma/fetchers/trivia-fetchers.ts` | All trivia data access (guarded) |
| `src/lib/prisma/fetchers/index.ts` | Barrel export includes trivia |
| `src/lib/utils/calculations.ts` | Added trivia score helpers |
| `src/app/trivia/rules/page.tsx` | Public rules page |
| `src/app/trivia/scoreboard/page.tsx` | Public trivia scoreboard |
| `src/app/superadmin/trivia/page.tsx` | Trivia hub (list categories) |
| `src/app/superadmin/trivia/actions.ts` | All trivia server actions |
| `src/app/superadmin/trivia/categories/new/page.tsx` | Create category + 3 questions |
| `src/app/superadmin/trivia/categories/[id]/page.tsx` | Manage live category |
| `src/app/superadmin/trivia/powers/page.tsx` | Power/coupon management |
| `src/app/superadmin/actions.ts` | resetDatabase includes trivia tables |
| `src/components/layout/navigation.tsx` | Added Trivia nav link |
| `src/app/dashboard/page.tsx` | Dashboard includes trivia scores |
| `src/app/stats/page.tsx` | Stats includes trivia scores |
| `src/app/players/[id]/page.tsx` | Player detail includes trivia ranking |

---

## Database Models

### TriviaCategory
- `id`, `eventId` (FK → Event), `title`, `description`, `status` (draft/active/completed), `createdBy`, `createdAt`
- Has many `questions` and `results` (cascade delete)

### TriviaQuestion
- `id`, `categoryId` (FK → TriviaCategory, cascade), `questionNumber` (1-3), `questionText`, `questionType` (text/numeric), `correctAnswer`, `numericAnswer`, `allowClosest`, `media`, `notes`

### TriviaCategoryResult
- `id`, `categoryId` (FK → TriviaCategory, cascade), `question1Winner`, `question2Winner`, `question3Winner` (userId or null), `scenario`, `categoryWinner`, `basePoints`, `numericBonus`, `finalPoints`, `manualOverride`, `overrideReason`, `publishedToScoreboard`

### TriviaPowerUsage
- `id`, `eventId` (FK → Event), `userId`, `powerType`, `cost`, `categoryId`, `targetUserId`, `note`

---

## Scoring Algorithm

```
Godlike (6 pts):    One player wins all 3 questions
Two Wins (2 pts):   One player wins 2 of 3 questions
Steal Yo GF (1 pt): Three different winners → Q3 winner takes the category
Single Win (1 pt):  Only one question had a winner
No Score (0 pts):   No winners in any question
```

Numeric bonus: +1 point when a numeric question has an exact correct answer.

The algorithm is implemented as a pure function in `src/lib/trivia-scoring.ts`:
```typescript
calculateTriviaCategoryResult({ q1Winner, q2Winner, q3Winner, hasNumericBonus })
// Returns { scenario, categoryWinner, basePoints, numericBonus, finalPoints }
```

---

## Fetchers (all guarded with `isTriviaAvailable()`)

### Categories
- `createCategory(title, description?, status?)` — throws if unavailable
- `getCategoryById(id)` — returns null if unavailable
- `getAllCategories()` — returns `[]` if unavailable, event-scoped
- `updateCategoryStatus(id, status)` — throws if unavailable
- `deleteCategory(id)` — throws if unavailable

### Questions
- `createQuestion(data)` — throws if unavailable
- `getQuestionsByCategoryId(categoryId)` — returns `[]` if unavailable
- `updateQuestion(id, data)` — throws if unavailable

### Category Results
- `createCategoryResult(data)` — throws if unavailable
- `getCategoryResult(id)` — returns null if unavailable
- `getCategoryResultsByCategoryId(categoryId)` — returns `[]` if unavailable
- `getAllPublishedResults()` — returns `[]` if unavailable, event-scoped
- `getAllTriviaResults()` — returns `[]` if unavailable, event-scoped (for score integration)
- `updateCategoryResult(id, data)` — throws if unavailable
- `publishResult(id)` — throws if unavailable

### Power Usage
- `createPowerUsage({ userId, powerType, cost, categoryId?, targetUserId?, note? })` — throws if unavailable
- `getPowerUsageByUserId(userId)` — returns `[]` if unavailable
- `getAllPowerUsage()` — returns `[]` if unavailable, event-scoped

### Score Helpers
- `getUserTriviaPoints(userId)` — returns 0 if unavailable
- `getAllUsersTriviaPoints()` — returns empty Map if unavailable

---

## Server Actions (`src/app/superadmin/trivia/actions.ts`)

| Action | Input | Description |
|--------|-------|-------------|
| `createCategoryAction` | FormData | Creates category + 3 questions, redirects to manage page |
| `deleteCategoryAction` | categoryId (string) | Deletes category (cascade deletes questions/results) |
| `startCategoryAction` | categoryId (string) | Sets category status to "active" |
| `calculateAndSaveResultAction` | FormData | Calculates result from selected winners, saves to DB |
| `overrideResultAction` | FormData | Manual override of calculated result values |
| `publishResultAction` | resultId (string) | Publishes result to scoreboard, marks category completed |
| `unpublishResultAction` | resultId (string) | Unpublishes result, reverts category to active |
| `recordPowerUsageAction` | FormData | Records power/coupon usage with optional target |

---

## Score Integration

### Modified functions in `src/lib/utils/calculations.ts`

All modifications are **additive and backward-compatible**:

- `calculateUserScore(drinkLogs, triviaPoints?)` — Optional trivia points parameter
- `sortUsersByScore(users, triviaPointsMap?)` — Optional Map<string, number> for trivia scores
- `getTeamsWithStats(allUsers, allTeams, triviaPointsMap?)` — Includes trivia in team totals
- `getUserRanking(userId, allUsers, triviaPointsMap?)` — Includes trivia in ranking
- `getUserTriviaPoints(userId, triviaPointsMap?)` — Lookup helper (new)
- `getAllUsersTriviaPointsMap(categoryResults)` — Builds map from results (new)

### Page integration pattern

Dashboard, Stats, and Player Detail pages all use this pattern:
```typescript
const triviaAvailable = await isTriviaAvailable()
let triviaPointsMap = new Map<string, number>()
if (triviaAvailable) {
  const triviaResults = await getAllTriviaResults()
  triviaPointsMap = getAllUsersTriviaPointsMap(triviaResults)
}
// Then pass triviaPointsMap to scoring functions
```

---

## UI Pages

### `/trivia/rules` — Public rules page (static)
- Explains categories, scoring scenarios, numeric bonus, and special powers
- No auth required, no DashboardLayout, standalone page

### `/trivia/scoreboard` — Public trivia scoreboard
- Fetches published results, displays per-category details with winners
- Aggregate user ranking sorted by total trivia points
- Empty state when no results are published

### `/superadmin/trivia` — Trivia Manager hub
- Migration-needed banner when tables don't exist
- Lists all categories with status badges (draft/active/completed)
- Cards show title, description, question count, and result count
- Action buttons: Edit/Manage/View, Delete, Link to powers

### `/superadmin/trivia/categories/new` — Create category
- Form: title (required), description (optional)
- 3 question sub-forms: text (required), type (text/numeric), correct answer, allow closest checkbox, private notes
- Submit creates category + 3 questions, redirects to manage page

### `/superadmin/trivia/categories/[id]` — Category management
- **Draft mode**: Displays all 3 questions with answers/notes, "Start" button
- **Active mode**: Dropdown selectors for each question winner, numeric bonus checkbox, "Calculate" button that evaluates the scenario and saves the result
- **Completed mode**: Result display with scenario badge, question winners grid, points breakdown, override form (expander), publish/unpublish buttons

### `/superadmin/trivia/powers` — Powers & coupons
- Power recording form: player, power type (Airstrike/Solo Rider/Cockblock/Zadnji v Vrsti), cost, optional target (for Cockblock), optional note
- Coupon balance grid per player (starting balance: 5, subtracts recorded costs)
- Power usage history table: timestamp, player, power type (color-coded badges), cost, note, target

---

## Navigation

- Added "Trivia" nav item (`HelpCircle` icon from lucide-react)
- Link points to `/trivia/rules`
- Active detection uses `pathname.startsWith('/trivia')` covering both `/trivia/rules` and `/trivia/scoreboard`
- Superadmin pages use breadcrumb navigation back to `/superadmin/trivia` and `/superadmin`

---

## Database Reset

`resetDatabase` in `src/app/superadmin/actions.ts` includes guarded trivia table cleanup in FK-safe order:

```
triviaPowerUsage → triviaCategoryResult → triviaQuestion → triviaCategory
```

Only runs when `isTriviaAvailable()` returns true.

---

## Graceful Degradation Summary

| Component | Before Migration | After Migration |
|-----------|-----------------|-----------------|
| `/trivia/rules` | Shows rules (static, no DB) | Shows rules (static, no DB) |
| `/trivia/scoreboard` | "Coming soon" message | Live scoreboard |
| `/superadmin/trivia/*` | "Migration needed" banner | Full functionality |
| Dashboard scores | Drink points only | Drink + trivia points |
| Stats leaderboard | Drink points only | Drink + trivia points |
| Player detail | Drink points only | Drink + trivia points |
| Navigation | Trivia link visible | Trivia link visible |
| `resetDatabase` | Skips trivia tables | Cleans trivia tables |
