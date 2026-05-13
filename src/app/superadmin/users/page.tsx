import { prisma } from '@/lib/prisma/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRoleSelect } from './role-select'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ updated?: string; error?: string }>
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  superadmin: 'default',
  eventAdmin: 'secondary',
  player: 'outline',
}

export default async function SuperadminUsersPage({ searchParams }: Props) {
  const users = await prisma.authUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      personId: true,
      createdAt: true,
    },
  })

  const params = await searchParams

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage admin roles for authenticated users. Superadmin only.</p>
      </div>

      {params.updated && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          Role for <strong>{params.updated}</strong> updated successfully.
        </div>
      )}

      {params.error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {params.error === 'missing-fields' && 'User and role are required.'}
          {params.error === 'invalid-role' && 'Invalid role specified.'}
          {params.error === 'user-not-found' && 'User not found.'}
          {params.error === 'cannot-self-demote' && 'You cannot demote yourself from superadmin.'}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{users.length} authenticated user{users.length !== 1 ? 's' : ''} in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Linked Person</th>
                  <th className="py-3 pr-4 font-medium">Created</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{user.email}</td>
                    <td className="py-3 pr-4">{user.name}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={roleBadgeVariant[user.role ?? 'player'] ?? 'outline'}>
                        {user.role ?? 'player'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {user.personId ?? '—'}
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <UserRoleSelect userId={user.id} currentRole={user.role ?? 'player'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
