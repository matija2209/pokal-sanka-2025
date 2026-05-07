import { SuperAdminNav } from '@/components/layout'

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminNav />
      <main>
        {children}
      </main>
    </div>
  )
}
