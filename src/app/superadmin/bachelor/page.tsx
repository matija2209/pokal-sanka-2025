import { getAllSightings } from '@/lib/prisma/fetchers/sighting-fetchers'
import { getHypeEvents } from '@/lib/prisma/fetchers/hype-fetchers'
import { SightingQueue } from '@/components/bachelor/admin/sighting-queue'
import { HypeManager } from '@/components/bachelor/admin/hype-manager'
import { LayoutDashboard, Flame, ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BachelorAdminPage() {
  const [pendingSightings, approvedSightings, rejectedSightings, hypeEvents] =
    await Promise.all([
      getAllSightings('pending'),
      getAllSightings('approved'),
      getAllSightings('rejected'),
      getHypeEvents(),
    ])

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wider mb-1">
              <LayoutDashboard className="w-4 h-4" />
              Superadmin Portal
            </div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tight">
              Bachelor Admin
            </h1>
          </div>
        </header>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg">
                <ClipboardList className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Sighting Moderation
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</span>
              <span className="bg-rose-600 text-white px-3 py-1 rounded-md text-sm font-black shadow-md shadow-rose-200">
                {pendingSightings.length}
              </span>
            </div>
          </div>
          <SightingQueue
            pendingSightings={pendingSightings}
            approvedSightings={approvedSightings}
            rejectedSightings={rejectedSightings}
          />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-200 pb-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Flame className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hype Event Manager</h2>
          </div>
          <HypeManager events={hypeEvents} />
        </section>
      </div>
    </div>
  )
}
