import { getCurrentUser } from '@/lib/utils/cookies'
import { redirect } from 'next/navigation'
import { CreateUserForm } from '@/components/users'

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  
  if (currentUser?.teamId) {
    redirect('/players')
  }
  
  if (currentUser && !currentUser.teamId) {
    redirect('/select-team')
  }
  
  return (
    <div className="container mx-auto p-8 max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Turnir Šanka!</h1>
        <p className="text-gray-600">Create your account to start tracking your drinks and compete with your team.</p>
      </div>
      
      <CreateUserForm />
    </div>
  )
}
