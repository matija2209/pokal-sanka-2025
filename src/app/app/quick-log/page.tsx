export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getQuickLogUsers } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { PlayerGrid } from '@/components/users'
import { getActiveEvent } from '@/lib/events'
import { Container } from '@/components/layout/container'


export default async function QuickLogPage() {
  await connection()

  const currentEvent = await getActiveEvent()

  if (!currentEvent) {
    redirect('/')
  }

  const [currentUser, users] = await Promise.all([
    getCurrentUser(currentEvent.id),
    getQuickLogUsers(currentEvent.id),
  ])
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  return (
    <Container size="mobile" className="py-8">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-3xl font-black tracking-tight lg:text-4xl text-foreground">
          Hitro beleženje
        </h1>
        <p className="text-base text-muted-foreground font-medium">
          Izberite igralca s seznama, da mu hitro zabeležite pijačo in dodate točke njegovi ekipi.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50 shadow-sm">
        <PlayerGrid users={users} currentUserId={currentUser.id} />
      </div>
    </Container>
  )
}
