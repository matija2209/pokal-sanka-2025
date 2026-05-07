import Link from 'next/link'
import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { createCategoryAction } from '../../actions'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage() {
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Nova kategorija</h1>
        <div className="bg-muted border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Migracija potrebna</h2>
          <p className="text-muted-foreground">Trivia modul potrebuje migracijo baze.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <Link
        href="/superadmin/trivia"
        className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-primary mb-4 py-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Nazaj na Trivia
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Nova kategorija</h1>

      <form action={createCategoryAction} className="space-y-8">
        {/* Category info */}
        <div className="bg-card text-card-foreground border-2 border-border rounded-xl p-5 md:p-6 space-y-5">
          <h2 className="text-xl font-semibold">Osnovne informacije</h2>
          <div>
            <label className="block text-base font-medium mb-2">Naslov kategorije *</label>
            <input
              name="title"
              required
              className="w-full border-2 border-input rounded-xl px-4 py-4 text-base bg-background text-foreground"
              placeholder="Npr. Zgodovina Slovenije"
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Opis (neobvezno)</label>
            <textarea
              name="description"
              className="w-full border-2 border-input rounded-xl px-4 py-4 text-base bg-background text-foreground"
              rows={3}
              placeholder="Kratek opis kategorije..."
            />
          </div>
        </div>

        {/* 3 questions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">3 Vprašanja</h2>
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card text-card-foreground border-2 border-border rounded-xl p-5 md:p-6 space-y-5">
              <h3 className="font-bold text-lg text-primary">Vprašanje {n}</h3>

              <div>
                <label className="block text-base font-medium mb-2">Vprašanje *</label>
                <input
                  name={`q${n}`}
                  required
                  className="w-full border-2 border-input rounded-xl px-4 py-4 text-base bg-background text-foreground"
                  placeholder={`Vprašanje ${n}...`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2">Tip</label>
                  <select
                    name={`q${n}_type`}
                    className="w-full border-2 border-input rounded-xl px-4 py-4 text-base bg-background text-foreground min-h-[52px]"
                  >
                    <option value="text">Tekstovni</option>
                    <option value="numeric">Numerični</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2">Pravilen odgovor (neobvezno)</label>
                  <input
                    name={`q${n}_answer`}
                    className="w-full border-2 border-input rounded-xl px-4 py-4 text-base bg-background text-foreground"
                    placeholder="Odgovor..."
                  />
                </div>
              </div>

              <label className="flex items-center gap-4 cursor-pointer py-2">
                <input
                  type="checkbox"
                  name={`q${n}_allow_closest`}
                  id={`q${n}_closest`}
                  className="w-6 h-6 rounded accent-primary"
                />
                <span className="text-base">Dovoli najbližji odgovor</span>
              </label>

              <div>
                <label className="block text-base font-medium mb-2">Zasebne opombe (neobvezno)</label>
                <textarea
                  name={`q${n}_notes`}
                  className="w-full border-2 border-input rounded-xl px-4 py-4 text-base bg-background text-foreground"
                  rows={2}
                  placeholder="Opombe vidne samo Trivia Masterju..."
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 text-lg font-bold py-5 px-8 rounded-xl transition-colors min-h-[56px]"
        >
          Ustvari kategorijo
        </button>
      </form>
    </div>
  )
}
