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
        <h1 className="text-3xl font-bold mb-2">Dobrodošli v Turnir Šanka!</h1>
        <p className="text-gray-600">Ustvarite svoj račun, da začnete slediti svoji porabi in tekmujete s svojo ekipo.</p>
      </div>
      
      <CreateUserForm />
    </div>
  )
}
