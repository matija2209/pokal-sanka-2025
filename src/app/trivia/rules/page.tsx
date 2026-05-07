import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Trivia Pravila | Pokal Šanka',
  description: 'Pravila trivia kviza Pokal Šanka — kako delujejo kategorije, točkovanje in moči.',
}

export default function TriviaRulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back link */}
        <Link
          href="/players"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          ← Nazaj na Šank
        </Link>

        <h1 className="text-4xl font-bold mb-2">Trivia Pravila</h1>
        <p className="text-muted-foreground mb-10">
          Kako deluje trivia kviz v Pokal Šanka — kategorije, vprašanja, točkovanje in posebne moči.
        </p>

        {/* Kategorije */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Kategorije</h2>
          <p className="text-muted-foreground mb-3">
            Trivia je razdeljena na <strong>kategorije</strong>. Vsaka kategorija ima <strong>3 vprašanja</strong>.
            Po vsaki kategoriji se izračuna, kdo je zmagovalec kategorije in koliko točk prejme.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Trivia Master ustvari kategorijo in določi 3 vprašanja.</li>
            <li>Ko je kategorija aktivna, Trivia Master izbere zmagovalca za vsako vprašanje.</li>
            <li>Rezultat se samodejno izračuna glede na spodnja pravila točkovanja.</li>
          </ul>
        </section>

        {/* Točkovanje */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Točkovanje</h2>
          <p className="text-muted-foreground mb-3">
            Točke se dodelijo na koncu vsake kategorije glede na to, kdo je zmagal posamezna vprašanja:
          </p>
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg text-yellow-400">Godlike (6 točk)</h3>
              <p className="text-muted-foreground text-sm">
                En igralec zmaga VSA tri vprašanja v kategoriji. Dominantna predstava!
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg text-blue-400">Two Wins (2 točki)</h3>
              <p className="text-muted-foreground text-sm">
                En igralec zmaga dve od treh vprašanj. Solidna zmaga.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg text-green-400">Steal Yo GF (1 točka)</h3>
              <p className="text-muted-foreground text-sm">
                Trije različni zmagovalci — zmagovalec tretjega vprašanja ukrade kategorijo!
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg text-orange-400">Single Win (1 točka)</h3>
              <p className="text-muted-foreground text-sm">
                Samo eno vprašanje ima zmagovalca. Ta igralec dobi edino točko.
              </p>
            </div>
          </div>
        </section>

        {/* Bonus */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Numerični Bonus (+1 točka)</h2>
          <p className="text-muted-foreground">
            Če ima kategorija numerično vprašanje in je zmagovalec podal <strong>točen odgovor</strong>,
            prejme dodatno +1 točko. Ta bonus se prišteje osnovnim točkam iz scenarija.
          </p>
        </section>

        {/* Moči */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Posebne Moči (Kuponi)</h2>
          <p className="text-muted-foreground mb-3">
            Igralci lahko uporabljajo posebne moči, ki jih kupijo s kuponi. Vsak igralec ima omejeno število kuponov.
          </p>
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg">Airstrike</h3>
              <p className="text-muted-foreground text-sm">
                Odgovoriš, preden kdorkoli drug dobi priložnost. Če je pravilno, zmagaš vprašanje.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg">Solo Rider</h3>
              <p className="text-muted-foreground text-sm">
                Odgovarjaš sam, brez konkurence. Drugi ne morejo odgovoriti na to vprašanje.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg">Cockblock</h3>
              <p className="text-muted-foreground text-sm">
                Blokiraš drugega igralca — ne more odgovoriti na trenutno vprašanje.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-bold text-lg">Zadnji v Vrsti</h3>
              <p className="text-muted-foreground text-sm">
                Odgovarjaš zadnji. Slišiš vse druge odgovore in lahko podaš najboljši odgovor.
              </p>
            </div>
          </div>
        </section>

        {/* Povzetek */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Povzetek</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
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
