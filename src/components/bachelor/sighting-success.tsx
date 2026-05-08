'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ACTION_DESCRIPTIONS, ACTION_LABELS, ACTION_ORDER, ACTION_POINTS } from '@/lib/utils/bachelor-points'
import type { ActionType } from '@/lib/utils/bachelor-points'
import type { PublicSighting } from '@prisma/client'
import { CheckCircle2, ArrowRight, Star } from 'lucide-react'

interface SightingSuccessProps {
  sighting: PublicSighting
}

export function SightingSuccess({ sighting }: SightingSuccessProps) {
  const router = useRouter()
  const currentAction = sighting.actionType as ActionType
  const currentPoints = sighting.points
  const currentLevel = sighting.friendshipLevel
  const currentActionLabel = ACTION_LABELS[currentAction]?.en ?? 'Log'

  const availableUpgrades = ACTION_ORDER
    .filter((action) => ACTION_ORDER.indexOf(action) > ACTION_ORDER.indexOf(currentAction))
    .map((action) => ({
      type: action,
      label: ACTION_LABELS[action].en,
      points: ACTION_POINTS[action],
      description: ACTION_DESCRIPTIONS[action],
    }))

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      router.refresh()
      router.replace('/the-bachelor')
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [router])

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-lucky mb-2">Moment logged!</h1>
        <p className="text-muted-foreground">
          <strong className="text-foreground">{currentActionLabel}</strong> earned you{' '}
          <strong className="text-foreground">{currentPoints} point{currentPoints !== 1 ? 's' : ''}</strong>.
          You are now part of the BWSK Friend Collection.
        </p>
      </div>

      <Card className="bg-muted/20 border-muted">
        <CardContent className="p-4 flex items-center gap-3">
          <Star className="w-6 h-6 text-primary flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Friendship Level</p>
            <p className="text-lg font-bold font-lucky">{currentLevel}</p>
          </div>
          <Badge className="ml-auto">+{currentPoints} pts</Badge>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Returning to the tracker...
      </p>

      {availableUpgrades.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Want to upgrade your friendship level?
          </p>
          {availableUpgrades.map((upgrade) => (
            <Button
              key={upgrade.type}
              asChild
              variant="outline"
              className="w-full justify-between h-auto py-3"
            >
              <Link
                href={`/the-bachelor/sighting/new?action=${upgrade.type}`}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">{upgrade.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {upgrade.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary">+{upgrade.points} pts</Badge>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </Button>
          ))}
        </div>
      )}

      <Button asChild variant="ghost" className="mt-4">
        <Link href="/the-bachelor">Back to tracker</Link>
      </Button>
    </div>
  )
}
