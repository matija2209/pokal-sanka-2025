import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils/cookies'
import DrinkSelectionModal from '@/components/drinks/drink-selection-modal'

export const dynamic = 'force-dynamic'

export default async function DrinkSelectionPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/')
  }

  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  return <DrinkSelectionModal />
}
