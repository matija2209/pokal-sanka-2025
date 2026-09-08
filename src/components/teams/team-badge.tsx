import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getContrastTextColor } from '@/lib/utils/colors'

type TeamBadgeProps = {
  team: { name: string; color?: string | null } | null | undefined
  emptyLabel?: string
  className?: string
}

export function TeamBadge({ team, emptyLabel = 'Brez ekipe', className }: TeamBadgeProps) {
  if (!team) {
    return (
      <Badge variant="outline" className={cn('text-muted-foreground', className)}>
        {emptyLabel}
      </Badge>
    )
  }

  const backgroundColor = team.color || '#6B7280'

  return (
    <Badge
      className={cn('border-transparent', className)}
      style={{ backgroundColor, color: getContrastTextColor(backgroundColor) }}
    >
      {team.name}
    </Badge>
  )
}
