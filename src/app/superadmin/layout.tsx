import Link from 'next/link'

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navLinkClass =
    'rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card text-card-foreground shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Superadmin Navigation
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/superadmin" className={navLinkClass}>
              Overview
            </Link>
            <Link href="/superadmin/trivia" className={navLinkClass}>
              Trivia
            </Link>
            <Link href="/superadmin/trivia/categories/new" className={navLinkClass}>
              New Category
            </Link>
            <Link href="/superadmin/trivia/powers" className={navLinkClass}>
              Powers
            </Link>
            <Link
              href="/app"
              className="rounded-md border border-primary/30 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
