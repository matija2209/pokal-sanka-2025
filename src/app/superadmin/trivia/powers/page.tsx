import { isTriviaAvailable } from '@/lib/prisma/schema-capabilities'
import { getAllUsersWithTeamAndDrinks, getAllPowerUsage } from '@/lib/prisma/fetchers'
import { recordPowerUsageAction } from '../actions'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

const POWER_TYPES = ['Airstrike', 'Solo Rider', 'Cockblock', 'Zadnji v Vrsti'] as const

const POWER_COLORS: Record<string, string> = {
  Airstrike: 'bg-red-500',
  'Solo Rider': 'bg-blue-500',
  Cockblock: 'bg-purple-500',
  'Zadnji v Vrsti': 'bg-green-500',
}

export default async function PowersPage() {
  const triviaAvailable = await isTriviaAvailable()

  if (!triviaAvailable) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Migracija potrebna</h2>
          <p className="text-yellow-700">Trivia modul potrebuje migracijo baze.</p>
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
      <Link href="/superadmin/trivia" className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">
        ← Nazaj na Trivia
      </Link>
      <h1 className="text-3xl font-bold text-red-600 mb-8">Kuponi & Moči</h1>

      {/* Record power usage */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Zabeleži uporabo moči</h2>
        <form action={recordPowerUsageAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Igralec *</label>
              <select name="userId" required className="w-full border rounded-lg px-3 py-2">
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
              <select name="powerType" required className="w-full border rounded-lg px-3 py-2">
                <option value="">Izberi moč...</option>
                {POWER_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cena (kuponi)</label>
            <input name="cost" type="number" defaultValue={1} min={0} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tarča (za Cockblock)</label>
            <select name="targetUserId" className="w-full border rounded-lg px-3 py-2">
              <option value="">Brez tarče</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opomba (neobvezno)</label>
            <input name="note" className="w-full border rounded-lg px-3 py-2" placeholder="Opomba..." />
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Zabeleži
          </button>
        </form>
      </div>

      {/* Balances */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Stanje kuponov</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allUsers.map((u) => {
            const balance = balances.get(u.id) || 0
            return (
              <div key={u.id} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-semibold text-sm truncate">{u.name}</div>
                <div className={`text-2xl font-bold ${balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance}
                </div>
                <div className="text-xs text-gray-500">kuponov</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Power usage history */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Zgodovina uporabe</h2>
        {powerUsages.length === 0 ? (
          <p className="text-gray-500 text-sm">Ni še uporab moči.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
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
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-500">
                        {new Date(p.createdAt).toLocaleString('sl-SI', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-2 pr-4 font-medium">{user?.name || p.userId}</td>
                      <td className="py-2 pr-4">
                        <Badge className={POWER_COLORS[p.powerType] || 'bg-gray-500'}>{p.powerType}</Badge>
                        {target && <span className="ml-2 text-xs text-gray-500">→ {target.name}</span>}
                      </td>
                      <td className="py-2 pr-4">{p.cost}</td>
                      <td className="py-2 text-gray-500">{p.note || '-'}</td>
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
