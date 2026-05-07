import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getAllUsersWithTeamAndDrinks, getAllPowerUsage } from '@/lib/prisma/fetchers'
import { recordPowerUsageAction } from '../actions'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

const POWER_TYPES = ['Airstrike', 'Solo Rider', 'Cockblock', 'Zadnji v Vrsti'] as const

const POWER_BADGES: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Airstrike: 'destructive',
  'Solo Rider': 'default',
  Cockblock: 'secondary',
  'Zadnji v Vrsti': 'outline',
}

export default async function PowersPage() {
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-muted border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Migracija potrebna</h2>
          <p className="text-muted-foreground">Trivia modul potrebuje migracijo baze.</p>
        </div>
      </div>
    )
  }

  const [allUsers, powerUsages] = await Promise.all([
    getAllUsersWithTeamAndDrinks(),
    getAllPowerUsage(),
  ])

  // Calculate coupon balances: each player starts with 5, subtract used cost
  const balances = new Map<string, number>()
  allUsers.forEach((u) => balances.set(u.id, 5))
  for (const p of powerUsages) {
    balances.set(p.userId, (balances.get(p.userId) || 5) - p.cost)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Link href="/superadmin/trivia" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block py-2">
        ← Nazaj na Trivia
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-8">Kuponi & Moči</h1>

      {/* Record power usage */}
      <div className="bg-card text-card-foreground rounded-lg border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Zabeleži uporabo moči</h2>
        <form action={recordPowerUsageAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Igralec *</label>
              <select name="userId" required className="w-full border-2 border-input bg-background rounded-lg px-3 py-2 text-foreground">
                <option value="">Izberi igralca...</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({balances.get(u.id)} kuponov)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Moč *</label>
              <select name="powerType" required className="w-full border-2 border-input bg-background rounded-lg px-3 py-2 text-foreground">
                <option value="">Izberi moč...</option>
                {POWER_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cena (kuponi)</label>
            <input name="cost" type="number" defaultValue={1} min={0} className="w-full border-2 border-input bg-background rounded-lg px-3 py-2 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tarča (za Cockblock)</label>
            <select name="targetUserId" className="w-full border-2 border-input bg-background rounded-lg px-3 py-2 text-foreground">
              <option value="">Brez tarče</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opomba (neobvezno)</label>
            <input name="note" className="w-full border-2 border-input bg-background rounded-lg px-3 py-2 text-foreground" placeholder="Opomba..." />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Zabeleži
          </button>
        </form>
      </div>

      {/* Balances */}
      <div className="bg-card text-card-foreground rounded-lg border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Stanje kuponov</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allUsers.map((u) => {
            const balance = balances.get(u.id) || 0
            return (
              <div key={u.id} className="bg-muted rounded-lg p-3 text-center">
                <div className="font-semibold text-sm truncate text-foreground">{u.name}</div>
                <div className={`text-2xl font-bold ${balance > 0 ? 'text-primary' : 'text-destructive'}`}>
                  {balance}
                </div>
                <div className="text-xs text-muted-foreground">kuponov</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Power usage history */}
      <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Zgodovina uporabe</h2>
        {powerUsages.length === 0 ? (
          <p className="text-muted-foreground text-sm">Ni še uporab moči.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4">Čas</th>
                  <th className="py-2 pr-4">Igralec</th>
                  <th className="py-2 pr-4">Moč</th>
                  <th className="py-2 pr-4">Cena</th>
                  <th className="py-2">Opomba</th>
                </tr>
              </thead>
              <tbody>
                {powerUsages.map((p) => {
                  const user = allUsers.find((u) => u.id === p.userId)
                  const target = p.targetUserId ? allUsers.find((u) => u.id === p.targetUserId) : null
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">
                        {new Date(p.createdAt).toLocaleString('sl-SI', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-2 pr-4 font-medium text-foreground">{user?.name || p.userId}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={POWER_BADGES[p.powerType] ?? 'secondary'}>{p.powerType}</Badge>
                        {target && <span className="ml-2 text-xs text-muted-foreground">→ {target.name}</span>}
                      </td>
                      <td className="py-2 pr-4">{p.cost}</td>
                      <td className="py-2 text-muted-foreground">{p.note || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
