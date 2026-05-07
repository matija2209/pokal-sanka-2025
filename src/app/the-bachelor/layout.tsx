import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
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

export default function BachelorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground font-roboto antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
