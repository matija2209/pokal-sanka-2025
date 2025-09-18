'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Trophy, 
  User, 
  RefreshCw
} from 'lucide-react'
import UserMenu from './user-menu'
import type { UserWithTeam } from '@/lib/prisma/types'

interface NavigationProps {
  currentUser: UserWithTeam
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function Navigation({ currentUser, onRefresh, isRefreshing }: NavigationProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/players', icon: Users, label: 'Štart', active: pathname === '/players' },
    { href: '/teams', icon: Trophy, label: 'Ekipe', active: pathname === '/teams' },
    { href: '/profile', icon: User, label: 'Profil', active: pathname === '/profile' },
  ]

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo/Brand - Compact on mobile */}
          <Link href="/players" className="flex items-center space-x-2">
            <Image 
              src="/logo-small.png" 
              alt="Pokal Šanka" 
              width={24} 
              height={24}
              className="w-5 h-5 md:w-6 md:h-6 object-contain"
            />
            <span className="text-lg md:text-xl font-bold text-gray-900 hidden sm:block">
              Pokal Šanka — Matija 2025 Edition
            </span>
            <span className="text-lg font-bold text-gray-900 sm:hidden">
              Šanka
            </span>
          </Link>

          {/* User Info - Responsive */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <UserMenu currentUser={currentUser} />
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-gray-600 hover:text-gray-900 p-1 md:p-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Links - Mobile optimized with labels */}
        <div className="flex space-x-0.5 md:space-x-1 pb-3 md:pb-4 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="flex-shrink-0">
                <Button
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-3 min-w-fit"
                >
                  <Icon className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}