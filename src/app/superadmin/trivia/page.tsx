import Link from 'next/link'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getAllCategories } from '@/lib/prisma/fetchers'
import { deleteCategoryAction } from './actions'
import { Plus, Trash2, Eye, Play, Edit, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Osnutek', color: 'bg-gray-500' },
  active: { label: 'Aktivno', color: 'bg-green-500' },
  completed: { label: 'Zaključeno', color: 'bg-blue-500' },
}

export default async function SuperadminTriviaHubPage() {
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="container mx-auto px-4 py-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-6">Trivia Manager</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Migracija potrebna</h2>
          <p className="text-yellow-700">
            Trivia modul potrebuje migracijo baze. Zaženi <code className="bg-yellow-100 px-1 rounded">prisma migrate deploy</code> za aktivacijo.
          </p>
        </div>
      </div>
    )
  }

  const categories = await getAllCategories()

  return (
    <div className="container mx-auto px-4 py-6 md:p-8">
      <Link href="/superadmin" className="inline-flex items-center gap-1 text-base text-gray-500 hover:text-blue-600 mb-3 py-2">
        <ArrowLeft className="h-5 w-5" />
        Nazaj na Superadmin
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-red-600">Trivia Manager</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/superadmin/trivia/powers"
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-4 px-6 rounded-xl transition-colors text-center text-base min-h-[52px] flex items-center justify-center"
          >
            Kuponi & Moči
          </Link>
          <Link
            href="/superadmin/trivia/categories/new"
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-6 rounded-xl transition-colors text-center text-base min-h-[52px] flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nova kategorija
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-600 text-base mb-4">Ni še nobene trivia kategorije.</p>
          <Link
            href="/superadmin/trivia/categories/new"
            className="inline-flex text-blue-600 hover:text-blue-800 font-bold text-base py-3 px-6"
          >
            Ustvari prvo kategorijo →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const status = STATUS_LABELS[category.status] || STATUS_LABELS.draft
            return (
              <Link
                key={category.id}
                href={`/superadmin/trivia/categories/${category.id}`}
                className="block bg-white border-2 border-gray-200 rounded-xl p-5 active:bg-gray-50 active:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-snug break-words">{category.title}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                  <Badge className={`${status.color} ml-2 flex-shrink-0`}>{status.label}</Badge>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  {category.questions?.length || 0} vprašanj
                  {(category.results?.length ?? 0) > 0 && ` • ${category.results?.length} rezultatov`}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold text-sm flex items-center gap-1">
                    {category.status === 'completed' ? (
                      <><Eye className="h-4 w-4" /> Poglej</>
                    ) : category.status === 'active' ? (
                      <><Play className="h-4 w-4" /> Upravljaj</>
                    ) : (
                      <><Edit className="h-4 w-4" /> Uredi</>
                    )}
                  </span>

                  <form action={deleteCategoryAction.bind(null, category.id)} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="submit"
                      className="bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center gap-1 min-h-[48px]"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!confirm(`Izbrisati kategorijo "${category.title}"?`)) e.preventDefault()
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
