import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ADMIN_ROLES } from '@/lib/auth-utils'
import LogoutButton from '@/app/superadmin/logout-button'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const role = session.user.role
  if (!role || !ADMIN_ROLES.includes(role)) redirect('/login')

  const navLinkClass =
    'rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card text-card-foreground shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Event Admin
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin" className={navLinkClass}>
              Events
            </Link>
            <Link href="/superadmin" className={navLinkClass}>
              Superadmin
            </Link>
            <Link
              href="/app"
              className="rounded-md border border-primary/30 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to App
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{session.user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
