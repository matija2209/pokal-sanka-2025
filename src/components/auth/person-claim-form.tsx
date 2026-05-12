'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { finalizePersonClaimAction } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PersonClaimFormProps {
  defaultEmail?: string | null
  eventSlug: string
  personId: string
  personName: string
}

export default function PersonClaimForm({
  defaultEmail,
  eventSlug,
  personId,
  personName,
}: PersonClaimFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'sign-up' | 'sign-in'>(defaultEmail ? 'sign-in' : 'sign-up')
  const [email, setEmail] = useState(defaultEmail ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function finishClaim() {
    const result = await finalizePersonClaimAction(eventSlug, personId)

    if (!result.success) {
      setError(result.message || 'Failed to finish account claim')
      setIsPending(false)
      return
    }

    router.push(result.data?.redirectUrl ?? '/')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const trimmedEmail = email.trim().toLowerCase()

    const response = mode === 'sign-up'
      ? await authClient.signUp.email({
          name: personName,
          email: trimmedEmail,
          password,
        })
      : await authClient.signIn.email({
          email: trimmedEmail,
          password,
        })

    if (response.error) {
      setError(response.error.message || 'Authentication failed')
      setIsPending(false)
      return
    }

    await finishClaim()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim with email and password</CardTitle>
        <CardDescription>
          Connect <span className="font-semibold text-foreground">{personName}</span> to a Better Auth account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'sign-up' | 'sign-in')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-up">Create account</TabsTrigger>
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-up" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claim-email-sign-up">Email</Label>
                <Input
                  id="claim-email-sign-up"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-password-sign-up">Password</Label>
                <Input
                  id="claim-password-sign-up"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  disabled={isPending}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Claiming account...' : 'Create and claim account'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sign-in" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claim-email-sign-in">Email</Label>
                <Input
                  id="claim-email-sign-in"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-password-sign-in">Password</Label>
                <Input
                  id="claim-password-sign-in"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  minLength={8}
                  required
                  disabled={isPending}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Signing in...' : 'Sign in and claim account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
