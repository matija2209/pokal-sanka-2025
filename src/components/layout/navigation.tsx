'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Images,
  Users,
  Trophy,
  User,
  RefreshCw,
  TrendingUp,
  ClipboardList,
  HelpCircle
} from 'lucide-react'
import UserMenu from './user-menu'
import type { Event, UserWithTeam } from '@/lib/prisma/types'

interface NavigationProps {
  currentUser: UserWithTeam
  currentEvent: Event
  availableEvents: Event[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function Navigation({ currentUser, currentEvent, availableEvents, onRefresh, isRefreshing }: NavigationProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/app/feed', icon: Images, label: 'Feed', active: pathname === '/app/feed' },
    { href: '/app/players', icon: Users, label: 'Štart', active: pathname === '/app/players' },
    { href: '/app/quick-log', icon: ClipboardList, label: 'Hitri vpis', active: pathname === '/app/quick-log' },
    { href: '/app/teams', icon: Trophy, label: 'Ekipe', active: pathname === '/app/teams' },
    { href: '/app/stats', icon: TrendingUp, label: 'Statistike', active: pathname === '/app/stats' },
    { href: '/app/trivia/rules', icon: HelpCircle, label: 'Trivia', active: pathname.startsWith('/app/trivia') },
    { href: '/app/profile', icon: User, label: 'Profil', active: pathname === '/app/profile' },
  ]

  return (
    <nav className=" border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo/Brand - Compact on mobile */}
          <Link href="/app/players" className="flex items-center space-x-2">
            <Image 
              src="/logo-small.png" 
              alt="Pokal Šanka" 
              width={24} 
              height={24}
              className="w-12 h-12 md:w-6 md:h-6 object-contain"
            />
            <span className="text-lg md:text-xl font-bold  hidden sm:block">
              Pokal Šanka — Matija 2025 Edition
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
