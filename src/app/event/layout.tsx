import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Event — Pokal Sanka',
  description: 'Join the event and compete with your friends.',
  robots: 'noindex, nofollow',
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children
}
