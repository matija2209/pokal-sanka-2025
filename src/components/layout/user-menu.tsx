'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, ChevronDown } from 'lucide-react'
import { logoutAction } from '@/app/actions'
import EventSwitcher from '@/components/events/event-switcher'
import type { Event, UserWithTeam } from '@/lib/prisma/types'

interface UserMenuProps {
  currentUser: UserWithTeam
  currentEvent: Event
  availableEvents: Event[]
}

export default function UserMenu({ currentUser, currentEvent, availableEvents }: UserMenuProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const result = await logoutAction()
      if (result.success) {
        router.push('/')
      } else {
        console.error('Logout failed:', result.message)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center space-x-1 md:space-x-2  hover:"
        >
          <div className="flex items-center space-x-1 md:space-x-2">
            {currentUser.team && (
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: currentUser.team.color }}
              />
            )}
            <span className="text-xs md:text-sm font-medium max-w-20 md:max-w-none truncate">
              {currentUser.name}
            </span>
            {currentUser.team && (
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                {currentUser.team.name}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem disabled className="flex-col items-start">
          <div className="font-medium">{currentUser.name}</div>
          {currentUser.team && (
            <div className="text-xs text-muted-foreground">{currentUser.team.name}</div>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <p className="mb-2 text-xs text-muted-foreground">Dogodek</p>
          <EventSwitcher
            events={availableEvents}
            currentEventId={currentEvent.id}
            className="h-8 w-full"
          />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoading}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {isLoading ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
