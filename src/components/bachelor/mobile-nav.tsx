'use client'

import { MapPin, Flame, Trophy, History, Map as MapIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function BachelorMobileNav() {
  const navItems = [
    { label: 'Stats', icon: Trophy, href: '#stats' },
    { label: 'Map', icon: MapIcon, href: '#map' },
    { label: 'Hype', icon: Flame, href: '#hype' },
    { label: 'Feed', icon: History, href: '#timeline' },
  ]

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50 sm:hidden">
        <Button asChild size="lg" className="rounded-full shadow-lg h-14 w-14 p-0 bg-primary hover:bg-primary/90">
          <Link href="/the-bachelor/sighting/new">
            <MapPin className="h-6 w-6" />
            <span className="sr-only">Log Sighting</span>
          </Link>
        </Button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t sm:hidden">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
