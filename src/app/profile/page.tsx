import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { UserProfile } from '@/components/users'

export default async function ProfilePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  const availableTeams = await getAllTeams()
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your account and team settings.</p>
      </div>
      
      <UserProfile 
        currentUser={currentUser}
        availableTeams={availableTeams}
      />
    </div>
  )
}