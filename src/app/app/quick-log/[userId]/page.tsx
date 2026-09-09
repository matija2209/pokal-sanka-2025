export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getQuickLogUserById } from '@/lib/prisma/fetchers'
import { redirect, notFound } from 'next/navigation'
import DrinkSelectionForm from '@/components/drinks/drink-selection-form'
import { getActiveEvent } from '@/lib/events'


interface DrinkSelectionPageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function DrinkSelectionPage({ params }: DrinkSelectionPageProps) {
  await connection()

  const { userId } = await params
  const currentEvent = await getActiveEvent()

  if (!currentEvent) {
    redirect('/')
  }

  const [currentUser, selectedUser] = await Promise.all([
    getCurrentUser(currentEvent.id),
    getQuickLogUserById(userId, currentEvent.id),
  ])
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/app/select-team')
  }

  if (!selectedUser) {
    notFound()
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <DrinkSelectionForm selectedUser={selectedUser} />
    </div>
  )
}
