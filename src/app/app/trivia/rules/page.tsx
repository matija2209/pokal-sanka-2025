import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteBrandParts } from '@/lib/events'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Trivia Pravila',
    description: `Pravila trivia kviza — kako delujejo kategorije, točkovanje in moči. ${brand}.`,
    openGraph: {
      title: `Trivia Pravila | ${brand}`,
      description: 'Pravila trivia kviza Pokal Šanka — kategorije, točkovanje in moči.',
      locale: 'sl_SI',
    },
  }
}

export default function TriviaRulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-none px-0 py-6">
        <Link
          href="/app/players"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← Nazaj na Šank
        </Link>

        <h1 className="text-3xl font-bold leading-tight mb-2">Trivia Pravila</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Kako deluje trivia kviz v Pokal Šanka — kategorije, vprašanja, točkovanje in posebne moči.
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/app/trivia/conduct"
            className="inline-flex items-center rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90"
          >
            Začni vodenje trivia
          </Link>
          <Link
            href="/app/trivia/scoreboard"
            className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent/50"
          >
            Poglej lestvico
          </Link>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Kategorije</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Trivia je razdeljena na <strong>kategorije</strong>. Vsaka kategorija ima <strong>3 vprašanja</strong>.
            Po vsaki kategoriji se izračuna, kdo je zmagovalec kategorije in koliko točk prejme.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Trivia Master ustvari kategorijo in določi 3 vprašanja.</li>
            <li>Ko je kategorija aktivna, Trivia Master izbere zmagovalca za vsako vprašanje.</li>
            <li>Rezultat se samodejno izračuna glede na spodnja pravila točkovanja.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Točkovanje</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Točke se dodelijo na koncu vsake kategorije glede na to, kdo je zmagal posamezna vprašanja:
          </p>
          <div className="space-y-3">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base text-yellow-400">Godlike (6 točk)</h3>
              <p className="text-sm text-muted-foreground">
                En igralec zmaga VSA tri vprašanja v kategoriji. Dominantna predstava!
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base text-blue-400">Two Wins (2 točki)</h3>
              <p className="text-sm text-muted-foreground">
                En igralec zmaga dve od treh vprašanj. Solidna zmaga.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base text-green-400">Steal Yo GF (1 točka)</h3>
              <p className="text-sm text-muted-foreground">
                Trije različni zmagovalci — zmagovalec tretjega vprašanja ukrade kategorijo!
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base text-orange-400">Single Win (1 točka)</h3>
              <p className="text-sm text-muted-foreground">
                Samo eno vprašanje ima zmagovalca. Ta igralec dobi edino točko.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Numerični Bonus (+1 točka)</h2>
          <p className="text-sm text-muted-foreground">
            Če ima kategorija numerično vprašanje in je zmagovalec podal <strong>točen odgovor</strong>,
            prejme dodatno +1 točko. Ta bonus se prišteje osnovnim točkam iz scenarija.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Posebne Moči (Kuponi)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Igralci lahko uporabljajo posebne moči, ki jih kupijo s kuponi. Vsak igralec ima omejeno število kuponov.
          </p>
          <div className="space-y-3">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base">Airstrike</h3>
              <p className="text-sm text-muted-foreground">
                Odgovoriš, preden kdorkoli drug dobi priložnost. Če je pravilno, zmagaš vprašanje.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base">Solo Rider</h3>
              <p className="text-sm text-muted-foreground">
                Odgovarjaš sam, brez konkurence. Drugi ne morejo odgovoriti na to vprašanje.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base">Cockblock</h3>
              <p className="text-sm text-muted-foreground">
                Blokiraš drugega igralca — ne more odgovoriti na trenutno vprašanje.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-base">Zadnji v Vrsti</h3>
              <p className="text-sm text-muted-foreground">
                Odgovarjaš zadnji. Slišiš vse druge odgovore in lahko podaš najboljši odgovor.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Povzetek</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Vsaka kategorija ima 3 vprašanja.</li>
            <li>Zmagovalec vsakega vprašanja je izbran ročno (Trivia Master).</li>
            <li>Točke se izračunajo samodejno po zgornjih pravilih.</li>
            <li>Trivia točke se prištejejo k skupnemu seštevku na lestvici.</li>
            <li>Moči lahko spremenijo potek, vendar imajo omejitve.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
