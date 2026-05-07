import Link from 'next/link'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getAllCategories } from '@/lib/prisma/fetchers'
import { Plus, Eye, Play, Edit, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DeleteCategoryButton } from '@/components/superadmin/delete-category-button'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Osnutek', variant: 'secondary' },
  active: { label: 'Aktivno', variant: 'default' },
  completed: { label: 'Zaključeno', variant: 'outline' },
}

export default async function SuperadminTriviaHubPage() {
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="container mx-auto px-4 py-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Trivia Manager</h1>
        <div className="bg-muted border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Migracija potrebna</h2>
          <p className="text-muted-foreground">
            Trivia modul potrebuje migracijo baze. Zaženi <code className="bg-secondary px-1 rounded text-foreground">prisma migrate deploy</code> za aktivacijo.
          </p>
        </div>
      </div>
    )
  }

  const categories = await getAllCategories()

  return (
    <div className="container mx-auto px-4 py-6 md:p-8">
      <Link href="/superadmin" className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-primary mb-3 py-2">
        <ArrowLeft className="h-5 w-5" />
        Nazaj na Superadmin
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trivia Manager</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/superadmin/trivia/powers"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 font-bold py-4 px-6 rounded-xl transition-colors text-center text-base min-h-[52px] flex items-center justify-center border border-border"
          >
            Kuponi & Moči
          </Link>
          <Link
            href="/superadmin/trivia/categories/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 font-bold py-4 px-6 rounded-xl transition-colors text-center text-base min-h-[52px] flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nova kategorija
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-muted/50 border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-base mb-4">Ni še nobene trivia kategorije.</p>
          <Link
            href="/superadmin/trivia/categories/new"
            className="inline-flex text-primary hover:text-primary/90 font-bold text-base py-3 px-6"
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
                className="block bg-card text-card-foreground border-2 border-border rounded-xl p-5 active:bg-accent/15 active:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-snug break-words">{category.title}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                  <Badge variant={status.variant} className="ml-2 flex-shrink-0">
                    {status.label}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  {category.questions?.length || 0} vprašanj
                  {(category.results?.length ?? 0) > 0 && ` • ${category.results?.length} rezultatov`}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-sm flex items-center gap-1">
                    {category.status === 'completed' ? (
                      <><Eye className="h-4 w-4" /> Poglej</>
                    ) : category.status === 'active' ? (
                      <><Play className="h-4 w-4" /> Upravljaj</>
                    ) : (
                      <><Edit className="h-4 w-4" /> Uredi</>
                    )}
                  </span>

                  <DeleteCategoryButton categoryId={category.id} categoryTitle={category.title} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
