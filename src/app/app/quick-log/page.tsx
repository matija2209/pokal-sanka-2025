import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { PlayerGrid } from '@/components/users'
import { sortUsersByScore } from '@/lib/utils/calculations'

export const dynamic = 'force-dynamic'

export default async function QuickLogPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  const allUsers = await getAllUsersWithTeamAndDrinks()
  const sortedUsers = sortUsersByScore(allUsers)
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-3xl font-black tracking-tight lg:text-4xl text-foreground">
          Hitro beleženje
        </h1>
        <p className="text-base text-muted-foreground font-medium max-w-md mx-auto">
          Izberite igralca s seznama, da mu hitro zabeležite pijačo in dodate točke njegovi ekipi.
        </p>
      </div>
      
      <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50 shadow-sm">
        <PlayerGrid 
          users={sortedUsers}
          currentUserId={currentUser.id}
        />
      </div>
    </div>
  )
}
