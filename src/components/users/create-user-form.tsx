'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createUserAction } from '@/app/actions'
import { initialUserActionState } from '@/lib/types/action-states'
import { toast } from 'sonner'

interface CreateUserFormProps {
  onBack?: () => void
}

export default function CreateUserForm({ onBack }: CreateUserFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createUserAction, initialUserActionState)
  const [name, setName] = useState('')

  useEffect(() => {
    if (state.success && state.data?.redirectUrl) {
      toast.success(state.message || 'Račun uspešno ustvarjen!')
      setName('')
      router.push(state.data.redirectUrl)
    } else if (state.message && !state.success) {
      toast.error(state.message)
    }
  }, [state.success, state.message, state.data?.redirectUrl, router])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Dobrodošli v Pokal Šanka — Matija 2025 Edition!</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Vaše ime</Label>
            <Input 
              id="name" 
              name="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Vnesite vaše ime"
              disabled={isPending}
            />
            {state.errors?.name && (
              <p className="text-red-500 text-sm mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Ustvarjam račun..." : "Ustvari račun"}
          </Button>
        </form>

        {onBack && (
          <div className="pt-4 border-t mt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onBack}
              className="w-full"
            >
              ← Nazaj na izbiro možnosti
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}