'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Images,
  Trophy,
  User,
  RefreshCw,
  TrendingUp,
  ClipboardList,
  HelpCircle,
  ArrowLeft
} from 'lucide-react'

const NAV_ITEMS: Array<{
  href: string
  icon: typeof Images
  label: string
  matchPrefix?: string
}> = [
  { href: '/app/feed', icon: Images, label: 'Feed' },
  { href: '/the-bachelor', icon: HelpCircle, label: 'The Bachelor' },
  { href: '/app/quick-log', icon: ClipboardList, label: 'Hitri vpis' },
  { href: '/app/teams', icon: Trophy, label: 'Ekipe' },
  { href: '/app/stats', icon: TrendingUp, label: 'Statistike' },
  { href: '/app/trivia/rules', icon: HelpCircle, label: 'Trivia', matchPrefix: '/app/trivia' },
  { href: '/app/profile', icon: User, label: 'Profil' },
]

export default function NavShell() {
  const pathname = usePathname()

  return (
    <nav className="border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {pathname !== '/app/feed' && (
            <Link
              href="/app/feed"
              className="flex items-center justify-center w-12 h-12 -ml-2 rounded-xl hover:bg-accent transition-colors"
              aria-label="Nazaj na feed"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}

          <Link href="/app/players" className="flex items-center space-x-2">
            <Image
              src="/logo-small.png"
              alt="Pokal Šanka"
              width={48}
              height={48}
              className="w-12 h-12 md:w-6 md:h-6 object-contain"
              priority
            />
            <span className="text-lg md:text-xl font-bold hidden sm:block">
              Bwšk Bachelor 2026
            </span>
            <span className="text-lg font-bold sm:hidden">
              Šanka
            </span>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* User menu skeleton — pulsing placeholder */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-muted animate-pulse" />
              <div className="w-16 h-4 rounded bg-muted animate-pulse hidden sm:block" />
              <div className="w-12 h-5 rounded bg-muted animate-pulse hidden sm:block" />
              <div className="w-4 h-4 rounded bg-muted animate-pulse" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled
              className="p-1 md:p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-1 pb-3 md:pb-4 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-shrink-0">
                <Button
                  variant={active ? 'default' : 'ghost'}
                  size="lg"
                  className="flex items-center gap-1.5 text-sm md:text-base px-4 py-3 min-h-[48px] min-w-fit"
                >
                  <Icon className="h-5 w-5 md:h-5 md:w-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
