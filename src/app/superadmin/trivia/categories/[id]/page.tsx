import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getCategoryById, getQuestionsByCategoryId, getCategoryResultsByCategoryId, getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { calculateAndSaveResultAction, startCategoryAction, publishResultAction, unpublishResultAction, overrideResultAction } from '../../actions'
import { Badge } from '@/components/ui/badge'
import { Play, Send, Undo2, Calculator, Trophy, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Osnutek', color: 'bg-gray-500' },
  active: { label: 'Aktivno', color: 'bg-green-500' },
  completed: { label: 'Zaključeno', color: 'bg-blue-500' },
}

const SCENARIO_LABELS: Record<string, string> = {
  Godlike: 'Godlike (6 točk)',
  'Two Wins': 'Two Wins (2 točki)',
  'Steal Yo GF': 'Steal Yo GF (1 točka)',
  'Single Win': 'Single Win (1 točka)',
  'No Score': 'Brez točk',
}

export default async function CategoryManagePage({ params }: PageProps) {
  const resolvedParams = await params
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Migracija potrebna</h2>
          <p className="text-yellow-700">Trivia modul potrebuje migracijo baze.</p>
        </div>
      </div>
    )
  }

  const category = await getCategoryById(resolvedParams.id)
  if (!category) notFound()

  const [questions, results, allUsers] = await Promise.all([
    getQuestionsByCategoryId(category.id),
    getCategoryResultsByCategoryId(category.id),
    getAllUsersWithTeamAndDrinks(),
  ])

  const latestResult = results[0] || null
  const status = STATUS_LABELS[category.status] || STATUS_LABELS.draft

  const userMap = new Map(allUsers.map((u) => [u.id, u]))

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      {/* Back link — big tap target */}
      <Link href="/superadmin/trivia" className="inline-flex items-center gap-1.5 text-base text-gray-500 hover:text-blue-600 mb-4 py-2">
        <ArrowLeft className="h-5 w-5" />
        Nazaj na Trivia
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-red-600 break-words">{category.title}</h1>
          {category.description && <p className="text-base text-gray-500 mt-2">{category.description}</p>}
        </div>
        <Badge className={`${status.color} self-start text-sm px-3 py-1.5`}>{status.label}</Badge>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Vprašanja</h2>
          {questions.map((q) => (
            <div key={q.id} className="bg-white border-2 border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-sm px-2.5 py-1">
                  #{q.questionNumber}
                </Badge>
                <span className="text-sm text-gray-500">{q.questionType === 'numeric' ? 'Numerično' : 'Tekstovno'}</span>
              </div>
              <p className="font-bold text-lg leading-snug">{q.questionText}</p>
              {q.correctAnswer && (
                <p className="text-base text-green-600 mt-2">Odgovor: {q.correctAnswer}</p>
              )}
              {q.notes && <p className="text-sm text-gray-400 mt-2 italic">{q.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Draft mode — Start button */}
      {category.status === 'draft' && (
        <form action={startCategoryAction.bind(null, category.id)}>
          <button
            type="submit"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-lg font-bold py-5 px-8 rounded-xl transition-colors flex items-center justify-center gap-3 min-h-[56px]"
          >
            <Play className="h-6 w-6" />
            Začni kategorijo
          </button>
        </form>
      )}

      {/* Active mode — Select winners and calculate */}
      {category.status === 'active' && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">Izberite zmagovalce</h2>

          <form action={calculateAndSaveResultAction} className="space-y-6">
            <input type="hidden" name="categoryId" value={category.id} />

            {questions.map((q) => (
              <div key={q.id} className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <p className="font-bold text-lg mb-4 leading-snug">
                  <Badge variant="outline" className="mr-2 px-2.5 py-1 text-sm">#{q.questionNumber}</Badge>
                  {q.questionText}
                </p>
                <select
                  name={`q${q.questionNumber}Winner`}
                  className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-base min-h-[56px] bg-white"
                  defaultValue=""
                >
                  <option value="">Brez zmagovalca</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.team ? `(${u.team.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Numeric bonus checkbox — big tap area */}
            <label className="flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl p-5 cursor-pointer active:bg-gray-50">
              <input type="checkbox" name="hasNumericBonus" id="numericBonus" className="w-6 h-6 rounded accent-blue-600" />
              <span className="text-base font-medium">
                Točen numerični odgovor (+1 točka bonus)
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg font-bold py-5 px-8 rounded-xl transition-colors flex items-center justify-center gap-3 min-h-[56px]"
            >
              <Calculator className="h-6 w-6" />
              Izračunaj rezultat
            </button>
          </form>
        </div>
      )}

      {/* Calculated result */}
      {latestResult && (category.status === 'active' || category.status === 'completed') && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold">Rezultat</h2>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 md:p-6">
            {/* Question winners — stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[latestResult.question1Winner, latestResult.question2Winner, latestResult.question3Winner].map((winnerId, i) => {
                const user = winnerId ? userMap.get(winnerId) : null
                return (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Vprašanje {i + 1}</div>
                    <div className={`font-bold text-base ${user ? '' : 'text-gray-400 italic'}`}>
                      {user ? user.name : 'Brez zmagovalca'}
                    </div>
                    {user?.team && <div className="text-sm text-gray-500">{user.team.name}</div>}
                  </div>
                )
              })}
            </div>

            {/* Scenario & points */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="font-bold text-xl">{SCENARIO_LABELS[latestResult.scenario] || latestResult.scenario}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-base">
                <div>
                  <span className="text-gray-500">Osnovne točke:</span>
                  <span className="font-bold ml-2">{latestResult.basePoints}</span>
                </div>
                <div>
                  <span className="text-gray-500">Numerični bonus:</span>
                  <span className="font-bold ml-2">{latestResult.numericBonus}</span>
                </div>
                <div>
                  <span className="text-gray-500">Skupaj:</span>
                  <span className="font-bold ml-2 text-blue-600 text-lg">{latestResult.finalPoints}</span>
                </div>
              </div>
              {latestResult.categoryWinner && (
                <div className="mt-4 pt-4 border-t-2 border-blue-200">
                  <span className="text-gray-500 text-base">Zmagovalec kategorije: </span>
                  <span className="font-bold text-blue-700 text-lg">
                    {userMap.get(latestResult.categoryWinner)?.name || latestResult.categoryWinner}
                  </span>
                </div>
              )}
              {latestResult.manualOverride && (
                <div className="mt-3 text-base text-orange-600 font-medium">
                  Ročno prepisano{latestResult.overrideReason ? `: ${latestResult.overrideReason}` : ''}
                </div>
              )}
            </div>

            {/* Override form */}
            <details className="mb-5">
              <summary className="text-base text-blue-600 cursor-pointer hover:text-blue-800 font-bold py-3">
                Ročni prepis (override)
              </summary>
              <form action={overrideResultAction} className="mt-3 p-5 border-2 border-dashed border-orange-300 rounded-xl space-y-4">
                <input type="hidden" name="resultId" value={latestResult.id} />
                <div>
                  <label className="block text-base font-medium mb-2">Zmagovalec (userId)</label>
                  <input
                    name="categoryWinner"
                    defaultValue={latestResult.categoryWinner || ''}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-base"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-base font-medium mb-2">Base Points</label>
                    <input
                      name="basePoints"
                      type="number"
                      defaultValue={latestResult.basePoints}
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Numeric Bonus</label>
                    <input
                      name="numericBonus"
                      type="number"
                      defaultValue={latestResult.numericBonus}
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Final Points</label>
                    <input
                      name="finalPoints"
                      type="number"
                      defaultValue={latestResult.finalPoints}
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2">Razlog</label>
                  <input
                    name="overrideReason"
                    placeholder="Zakaj prepisujete?"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold py-4 px-6 rounded-xl transition-colors text-base min-h-[52px]"
                >
                  Shrani prepis
                </button>
              </form>
            </details>

            {/* Publish / Unpublish — full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!latestResult.publishedToScoreboard ? (
                <form action={publishResultAction.bind(null, latestResult.id)} className="flex-1">
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-lg font-bold py-5 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 min-h-[56px]"
                  >
                    <Send className="h-6 w-6" />
                    Objavi na lestvico
                  </button>
                </form>
              ) : (
                <form action={unpublishResultAction.bind(null, latestResult.id)} className="flex-1">
                  <button
                    type="submit"
                    className="w-full bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 text-lg font-bold py-5 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 min-h-[56px]"
                  >
                    <Undo2 className="h-6 w-6" />
                    Prekliči objavo
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
