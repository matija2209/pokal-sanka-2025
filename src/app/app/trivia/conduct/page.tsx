import Link from 'next/link'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getAllCategories, getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { calculateAndSaveResultAction } from '@/app/superadmin/trivia/actions'
import { ConductTriviaBoard } from '@/components/trivia/conduct-trivia-board'

export const dynamic = 'force-dynamic'

export default async function TriviaConductPage() {
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/app/trivia/rules" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
            ← Nazaj na Trivia
          </Link>
          <h1 className="text-3xl font-bold mb-3">Vodenje Trivia</h1>
          <p className="text-muted-foreground">
            Trivia modul trenutno ni na voljo. Najprej zaženi migracije baze.
          </p>
        </div>
      </div>
    )
  }

  const [categories, users] = await Promise.all([
    getAllCategories(),
    getAllUsersWithTeamAndDrinks(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Link href="/app/trivia/rules" className="text-sm text-muted-foreground hover:text-foreground">
            ← Nazaj na Trivia
          </Link>
          <Link href="/app/trivia/scoreboard" className="text-sm text-primary hover:text-primary/80">
            Poglej lestvico
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Vodenje Trivia</h1>
        <p className="text-muted-foreground mb-8">
          Izberi kategorijo, razkrij vprašanja in odgovore v pravem trenutku ter sproti označi zmagovalca vprašanja.
        </p>

        <ConductTriviaBoard
          categories={categories}
          users={users}
          saveResultAction={calculateAndSaveResultAction}
        />
      </div>
    </div>
  )
}
