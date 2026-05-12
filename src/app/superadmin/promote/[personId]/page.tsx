import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { promotePersonToAuthUser } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ADMIN_ROLES = ['superadmin', 'eventAdmin']

export default async function PromotePersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>
  searchParams?: Promise<{ error?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  const role = session.user.role
  if (!role || !ADMIN_ROLES.includes(role)) redirect('/login')

  const { personId } = await params
  const errorCode = (await searchParams)?.error

  const person = await prisma.person.findUnique({ where: { id: personId } })
  if (!person) redirect('/superadmin')

  const existingAuth = await prisma.authUser.findFirst({
    where: { personId },
    select: { email: true, role: true },
  })

  const errorMessages: Record<string, string> = {
    'missing-fields': 'All fields are required.',
    'person-not-found': 'Person not found.',
    'email-taken': 'That email is already linked to a different person.',
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link
            href="/superadmin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Superadmin
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Promote Person to Account</CardTitle>
            <CardDescription>
              Create an authenticated account for{" "}
              <span className="font-semibold text-foreground">{person.name}</span>.
              They will be able to sign in at /login.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {existingAuth && (
              <p className="mb-4 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3 text-sm">
                Already linked to <span className="font-semibold">{existingAuth.email}</span>{" "}
                (role: {existingAuth.role ?? "player"}).
              </p>
            )}

            {errorCode && errorMessages[errorCode] && (
              <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessages[errorCode]}
              </p>
            )}

            <form action={promotePersonToAuthUser} className="space-y-4">
              <input type="hidden" name="personId" value={personId} />

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="player@example.com"
                  defaultValue={existingAuth?.email ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {existingAuth ? "New password (optional)" : "Password"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={existingAuth ? "Leave blank to keep current" : "••••••••"}
                  minLength={8}
                  required={!existingAuth}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={existingAuth?.role ?? "player"}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                    <SelectItem value="eventAdmin">Event Admin</SelectItem>
                    <SelectItem value="player">Player</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                {existingAuth ? "Update Account" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
