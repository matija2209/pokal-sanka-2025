import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bachelor Weekend — Pokal Sanka',
  description: 'Hiter vstop v Bachelor Weekend dogodek. Ustvarite racun ali nadaljujte kot obstojeci igralec.',
  robots: 'noindex, nofollow',
}

export default function BwskLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
