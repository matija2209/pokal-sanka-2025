import Link from 'next/link'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getAllPublishedResults, getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TriviaScoreboardPage() {
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <Link href="/players" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
            ← Nazaj na Šank
          </Link>
          <h1 className="text-4xl font-bold mb-4">Trivia Lestvica</h1>
          <p className="text-muted-foreground">Trivia modul še ni na voljo. Kmalu!</p>
        </div>
      </div>
    )
  }

  const [results, allUsers] = await Promise.all([
    getAllPublishedResults(),
    getAllUsersWithTeamAndDrinks(),
  ])

  const userMap = new Map(allUsers.map((u) => [u.id, u]))

  // Aggregate trivia points per user
  const userTriviaScores = new Map<string, { points: number; wins: number }>()
  for (const r of results) {
    if (!r.categoryWinner) continue
    const entry = userTriviaScores.get(r.categoryWinner) || { points: 0, wins: 0 }
    entry.points += r.finalPoints
    entry.wins += 1
    userTriviaScores.set(r.categoryWinner, entry)
  }

  const sortedUsers = [...userTriviaScores.entries()]
    .sort(([, a], [, b]) => b.points - a.points)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/players" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
          ← Nazaj na Šank
        </Link>

        <h1 className="text-4xl font-bold mb-2">Trivia Lestvica</h1>
        <p className="text-muted-foreground mb-10">
          Točke, prislužene v trivia kategorijah. Prištejejo se k skupnemu seštevku.
        </p>

        {results.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ni še objavljenih rezultatov.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Category results */}
            {results.map((r) => (
              <div key={r.id} className="bg-card border rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">
                  {r.category?.title || 'Neznana kategorija'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scenarij: {r.scenario} • {r.finalPoints} točk
                </p>

                {/* Winners per question */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[r.question1Winner, r.question2Winner, r.question3Winner].map((wId, i) => {
                    const user = wId ? userMap.get(wId) : null
                    return (
                      <div key={i} className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Vpr. {i + 1}</div>
                        <div className={`font-medium text-sm ${user ? '' : 'text-muted-foreground italic'}`}>
                          {user ? user.name : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Category winner */}
                {r.categoryWinner && (
                  <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">
                      {userMap.get(r.categoryWinner)?.name || r.categoryWinner}
                    </span>
                    <span className="text-sm text-muted-foreground">+{r.finalPoints} točk</span>
                  </div>
                )}
              </div>
            ))}

            {/* Aggregate ranking */}
            {sortedUsers.length > 0 && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Skupna razvrstitev</h2>
                <div className="space-y-2">
                  {sortedUsers.map(([userId, stats], index) => {
                    const user = userMap.get(userId)
                    if (!user) return null
                    return (
                      <div
                        key={userId}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{stats.wins} kategorij</div>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-blue-600">{stats.points}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
