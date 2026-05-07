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
    <div className="w-full max-w-none px-0 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold leading-tight mb-2">Hitro beleženje pijače</h1>
        <p className="text-sm text-muted-foreground">Izberite igralca za hitro beleženje njegove pijače</p>
      </div>
      
      <PlayerGrid 
        users={sortedUsers}
        currentUserId={currentUser.id}
      />
    </div>
  )
}
