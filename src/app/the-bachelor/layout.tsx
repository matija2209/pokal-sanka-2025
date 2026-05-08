import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/utils/cookies'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Track the Groom — BWSK Friend Collection',
  description:
    'Found BWSK on his bachelor weekend in Malta? Help track the groom, submit photos, leave messages, and become part of his Friend Collection.',
  openGraph: {
    title: 'Track the Groom — BWSK',
    description: 'Scan the QR, log a sighting, and become part of the BWSK Friend Collection.',
  },
}

export const dynamic = 'force-dynamic'

export default async function BachelorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()

  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body
        className="min-h-screen bg-background text-foreground font-roboto antialiased"
        style={{ colorScheme: 'light' }}
      >
        {currentUser ? (
          <div className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
              <Button asChild variant="ghost" className="gap-2 px-0 text-sm font-medium">
                <Link href="/app">
                  <ArrowLeft className="h-4 w-4" />
                  Back to app
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
        {children}
        <Toaster />
      </body>
    </html>
  )
}
