'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createUserAction } from '@/app/actions'
import { initialUserActionState } from '@/lib/types/action-states'

interface CreateUserFormProps {
  // No props needed - this is for initial user creation
}

export default function CreateUserForm({}: CreateUserFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createUserAction, initialUserActionState)

  useEffect(() => {
    if (state.success && state.data?.redirectUrl) {
      router.push(state.data.redirectUrl)
    }
  }, [state.success, state.data?.redirectUrl, router])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome to Turnir Šanka!</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              placeholder="Enter your name"
              disabled={isPending}
            />
            {state.errors?.name && (
              <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          {state.message && !state.success && (
            <p className="text-red-500 text-sm">{state.message}</p>
          )}

          {state.message && state.success && (
            <p className="text-green-500 text-sm">{state.message}</p>
          )}
          
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}