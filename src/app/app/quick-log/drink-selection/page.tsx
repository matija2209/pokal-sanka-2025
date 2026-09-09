export const instant = false
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils/cookies'
import DrinkSelectionModal from '@/components/drinks/drink-selection-modal'


export default async function DrinkSelectionPage() {
  await connection()

  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/')
  }

  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  return <DrinkSelectionModal />
}
