'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'

type TriviaUser = {
  id: string
  name: string
  team?: { name: string } | null
}

type TriviaQuestion = {
  id: string
  questionNumber: number
  questionText: string
  questionType: string
  correctAnswer: string | null
  numericAnswer: number | null
  notes: string | null
}

type TriviaCategory = {
  id: string
  title: string
  description: string | null
  status: string
  questions: TriviaQuestion[]
}

interface ConductTriviaBoardProps {
  categories: TriviaCategory[]
  users: TriviaUser[]
  saveResultAction: (formData: FormData) => void | Promise<void>
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Osnutek', variant: 'secondary' },
  active: { label: 'Aktivno', variant: 'default' },
  completed: { label: 'Zaključeno', variant: 'outline' },
}

export function ConductTriviaBoard({
  categories,
  users,
  saveResultAction,
}: ConductTriviaBoardProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? '')
  const [revealedQuestions, setRevealedQuestions] = useState<number[]>([])
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([])
  const [winners, setWinners] = useState<Record<number, string>>({})
  const [hasNumericBonus, setHasNumericBonus] = useState(false)

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  )

  const sortedQuestions = useMemo(
    () => [...(selectedCategory?.questions ?? [])].sort((a, b) => a.questionNumber - b.questionNumber),
    [selectedCategory]
  )

  function selectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId)
    setRevealedQuestions([])
    setRevealedAnswers([])
    setWinners({})
    setHasNumericBonus(false)
  }

  function revealQuestion(questionNumber: number) {
    setRevealedQuestions((current) =>
      current.includes(questionNumber) ? current : [...current, questionNumber]
    )
  }

  function revealAnswer(questionNumber: number) {
    setRevealedAnswers((current) =>
      current.includes(questionNumber) ? current : [...current, questionNumber]
    )
  }

  if (categories.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Ni trivia kategorij</h2>
        <p className="text-muted-foreground">
          Najprej dodaj kategorije v Superadmin trivia modulu.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <aside className="space-y-3">
        <h2 className="text-lg font-semibold">Kategorije</h2>
        {categories.map((category) => {
          const status = STATUS_LABELS[category.status] ?? STATUS_LABELS.draft
          const selected = category.id === selectedCategoryId
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.id)}
              className={`w-full text-left border rounded-xl p-4 transition-colors ${
                selected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-accent/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold leading-snug">{category.title}</p>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {category.questions.length} vprašanj
              </p>
            </button>
          )
        })}
      </aside>

      <section className="space-y-5">
        {selectedCategory ? (
          <>
            <div className="bg-card border border-border rounded-xl p-5">
              <h1 className="text-2xl font-bold mb-1">{selectedCategory.title}</h1>
              {selectedCategory.description && (
                <p className="text-muted-foreground">{selectedCategory.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-3">
                Potek: pokaži vprašanje → razkrij odgovor → izberi zmagovalca vprašanja.
              </p>
            </div>

            <form action={saveResultAction} className="space-y-4">
              <input type="hidden" name="categoryId" value={selectedCategory.id} />

              {sortedQuestions.map((question) => {
                const isQuestionRevealed = revealedQuestions.includes(question.questionNumber)
                const isAnswerRevealed = revealedAnswers.includes(question.questionNumber)

                return (
                  <div key={question.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        Vprašanje {question.questionNumber}
                      </h3>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {question.questionType === 'numeric' ? 'Numerično' : 'Tekstovno'}
                      </span>
                    </div>

                    {!isQuestionRevealed ? (
                      <button
                        type="button"
                        onClick={() => revealQuestion(question.questionNumber)}
                        className="w-full sm:w-auto bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90"
                      >
                        Pokaži vprašanje
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-lg font-medium leading-snug">{question.questionText}</p>

                        {!isAnswerRevealed ? (
                          <button
                            type="button"
                            onClick={() => revealAnswer(question.questionNumber)}
                            className="w-full sm:w-auto bg-secondary text-secondary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-secondary/80"
                          >
                            Razkrij odgovor
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-accent/30 border border-border rounded-lg p-4">
                              <p className="font-semibold">
                                Odgovor:{' '}
                                {question.correctAnswer ??
                                  (question.numericAnswer !== null
                                    ? String(question.numericAnswer)
                                    : 'Ni nastavljen')}
                              </p>
                              {question.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Opomba: {question.notes}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor={`q${question.questionNumber}-winner`}
                                className="block text-sm font-medium mb-2"
                              >
                                Zmagovalec vprašanja
                              </label>
                              <select
                                id={`q${question.questionNumber}-winner`}
                                name={`q${question.questionNumber}Winner`}
                                value={winners[question.questionNumber] ?? ''}
                                onChange={(event) =>
                                  setWinners((current) => ({
                                    ...current,
                                    [question.questionNumber]: event.target.value,
                                  }))
                                }
                                className="w-full border border-input bg-background rounded-lg px-3 py-3"
                              >
                                <option value="">Brez zmagovalca</option>
                                {users.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name}
                                    {user.team ? ` (${user.team.name})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              <label className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-4">
                <input
                  type="checkbox"
                  name="hasNumericBonus"
                  checked={hasNumericBonus}
                  onChange={(event) => setHasNumericBonus(event.target.checked)}
                  className="h-5 w-5 accent-primary"
                />
                <span className="font-medium">
                  Točen numerični odgovor (+1 bonus točka)
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90"
              >
                Shrani rezultat kategorije
              </button>
            </form>
          </>
        ) : null}
      </section>
    </div>
  )
}
