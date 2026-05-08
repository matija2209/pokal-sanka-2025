'use client'

import { useMemo } from 'react'
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
import UserMenu from './user-menu'
import type { Event, UserWithTeam } from '@/lib/prisma/types'

type NavItem = {
  href: string
  icon: typeof Images
  label: string
  matchPrefix?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/app/feed', icon: Images, label: 'Feed' },
  { href: '/the-bachelor', icon: HelpCircle, label: 'The Bachelor' },
  { href: '/app/quick-log', icon: ClipboardList, label: 'Hitri vpis' },
  { href: '/app/teams', icon: Trophy, label: 'Ekipe' },
  { href: '/app/stats', icon: TrendingUp, label: 'Statistike' },
  { href: '/app/trivia/rules', icon: HelpCircle, label: 'Trivia', matchPrefix: '/app/trivia' },
  { href: '/app/profile', icon: User, label: 'Profil' },
]

interface NavigationProps {
  currentUser: UserWithTeam
  currentEvent: Event
  availableEvents: Event[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function Navigation({ currentUser, currentEvent, availableEvents, onRefresh, isRefreshing }: NavigationProps) {
  const pathname = usePathname()

  const navItems = useMemo(
    () => NAV_ITEMS.map(item => ({
      ...item,
      active: item.matchPrefix ? pathname.startsWith(item.matchPrefix) : pathname === item.href,
    })),
    [pathname],
  )

  return (
    <nav className=" border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Back to feed — mobile-first, hidden when already on feed */}
          {pathname !== '/app/feed' && (
            <Link
              href="/app/feed"
              className="flex items-center justify-center w-12 h-12 -ml-2 rounded-xl hover:bg-accent transition-colors"
              aria-label="Nazaj na feed"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}

          {/* Logo/Brand - Compact on mobile */}
          <Link href="/app/players" className="flex items-center space-x-2">
            <Image
              src="/logo-small.png"
              alt="Pokal Šanka"
              width={48}
              height={48}
              className="w-12 h-12 md:w-6 md:h-6 object-contain"
              priority
            />
            <span className="text-lg md:text-xl font-bold  hidden sm:block">
              Bwšk Bachelor 2026
            </span>
            <span className="text-lg font-bold  sm:hidden">
              Šanka
            </span>
          </Link>

          {/* User Info - Responsive */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <UserMenu currentUser={currentUser} currentEvent={currentEvent} availableEvents={availableEvents} />
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className=" hover: p-1 md:p-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Links - Big tap targets for mobile */}
        <div className="flex gap-1 pb-3 md:pb-4 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="flex-shrink-0">
                <Button
                  variant={item.active ? "default" : "ghost"}
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
