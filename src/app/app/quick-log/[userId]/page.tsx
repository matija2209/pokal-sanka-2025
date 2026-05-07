import { getCurrentUser } from '@/lib/utils/cookies'
import { getUserWithTeamAndDrinksById } from '@/lib/prisma/fetchers'
import { redirect, notFound } from 'next/navigation'
import DrinkSelectionForm from '@/components/drinks/drink-selection-form'

export const dynamic = 'force-dynamic'

interface DrinkSelectionPageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function DrinkSelectionPage({ params }: DrinkSelectionPageProps) {
  const currentUser = await getCurrentUser()
  const { userId } = await params
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  const selectedUser = await getUserWithTeamAndDrinksById(userId)
  
  if (!selectedUser) {
    notFound()
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <DrinkSelectionForm selectedUser={selectedUser} />
    </div>
  )
}
