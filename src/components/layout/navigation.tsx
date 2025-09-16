'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Trophy, 
  User, 
  Home,
  RefreshCw
} from 'lucide-react'
import type { UserWithTeam } from '@/lib/prisma/types'

interface NavigationProps {
  currentUser: UserWithTeam
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function Navigation({ currentUser, onRefresh, isRefreshing }: NavigationProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/players', icon: Users, label: 'Players', active: pathname === '/players' },
    { href: '/teams', icon: Trophy, label: 'Teams', active: pathname === '/teams' },
    { href: '/profile', icon: User, label: 'Profile', active: pathname === '/profile' },
  ]

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/players" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Turnir Šanka</span>
          </Link>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {currentUser.team && (
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: currentUser.team.color }}
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {currentUser.name}
              </span>
              {currentUser.team && (
                <Badge variant="secondary" className="text-xs">
                  {currentUser.team.name}
                </Badge>
              )}
            </div>
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-1 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}