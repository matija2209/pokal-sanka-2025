import Link from 'next/link'

export default function SuperAdminNav() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/superadmin" className="text-xl font-bold text-red-600">
              SuperAdmin
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/superadmin" className="text-sm font-medium text-gray-700 hover:text-red-600">
                Dashboard
              </Link>
              <Link href="/superadmin/trivia" className="text-sm font-medium text-gray-700 hover:text-red-600">
                Trivia
              </Link>
              <Link href="/superadmin/bachelor" className="text-sm font-medium text-gray-700 hover:text-red-600">
                Bachelor
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Back to App
            </Link>
          </div>
        </div>
        {/* Mobile nav links */}
        <div className="flex md:hidden items-center gap-4 pb-3 overflow-x-auto no-scrollbar">
          <Link href="/superadmin" className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="/superadmin/trivia" className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Trivia
          </Link>
          <Link href="/superadmin/bachelor" className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Bachelor
          </Link>
        </div>
      </div>
    </nav>
  )
}
