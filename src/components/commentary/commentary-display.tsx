'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { sl } from 'date-fns/locale'
import type { Commentary } from '@/lib/prisma/fetchers/commentary-fetchers'

interface CommentaryDisplayProps {
  commentaries: Commentary[]
  limit?: number
  showTitle?: boolean
}

export default function CommentaryDisplay({ 
  commentaries, 
  limit = 10, 
  showTitle = true 
}: CommentaryDisplayProps) {
  
  const displayedCommentaries = commentaries.slice(0, limit)

  const getCommentaryEmoji = (type: string) => {
    switch (type) {
      case 'milestone': return '🏆'
      case 'streak': return '🔥'
      case 'achievement': return '🎊'
      case 'team_event': return '🚀'
      case 'leadership_change': return '👑'
      case 'top_3_change': return '🥇'
      case 'team_leadership': return '👑'
      case 'team_overtake': return '🏁'
      case 'rank_jump': return '🚀'
      case 'last_place_change': return '💪'
      case 'consolidated_bulk': return '🔥'
      default: return '🎉'
    }
  }

  const getCommentaryLabel = (type: string) => {
    switch (type) {
      case 'milestone': return 'Mejnik'
      case 'streak': return 'Niz'
      case 'achievement': return 'Dosežek'
      case 'team_event': return 'Ekipa'
      case 'leadership_change': return 'Vodstvo'
      case 'top_3_change': return 'TOP 3'
      case 'team_leadership': return 'Vodja Ekipe'
      case 'team_overtake': return 'Prehit'
      case 'rank_jump': return 'Skok'
      case 'last_place_change': return 'Preboj'
      case 'consolidated_bulk': return 'Spektakel'
      default: return 'Vzpodbuda'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'bg-red-600 hover:bg-red-600 text-white'
    if (priority >= 4) return 'bg-orange-600 hover:bg-orange-600 text-white'
    if (priority >= 3) return 'bg-yellow-600 hover:bg-yellow-600 text-white'
    if (priority >= 2) return 'bg-blue-600 hover:bg-blue-600 text-white'
    return 'bg-gray-600 hover:bg-gray-600 text-white'
  }

  const getPriorityStars = (priority: number) => {
    return '★'.repeat(Math.min(priority, 5))
  }

  if (displayedCommentaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          {showTitle && <CardTitle>🎤 Novinarski Kotiček</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">Pripravljena scena!</h3>
            <p className="text-muted-foreground">
              Komentarji se bodo prikazali, ko začnete piti in dosegati mejnike...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        {showTitle && <CardTitle>🎤 Novinarski Kotiček</CardTitle>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedCommentaries.map((commentary) => (
            <div 
              key={commentary.id} 
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {/* Commentary emoji */}
              <div className="text-2xl mt-1">
                {getCommentaryEmoji(commentary.type)}
              </div>
              
              {/* Main content */}
              <div className="flex-1 space-y-2">
                {/* Header with badge and timestamp */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={getPriorityColor(commentary.priority)}>
                    {getCommentaryLabel(commentary.type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    pred {formatDistanceToNow(new Date(commentary.createdAt), { 
                      locale: sl,
                      addSuffix: false 
                    }).replace('približno ', '')}
                  </span>
                </div>
                
                {/* Commentary message */}
                <p className="text-lg font-medium leading-relaxed">
                  {commentary.message}
                </p>
              </div>
              
              {/* Priority indicator */}
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  commentary.priority >= 5 ? 'text-red-500' :
                  commentary.priority >= 4 ? 'text-orange-500' :
                  commentary.priority >= 3 ? 'text-yellow-500' :
                  commentary.priority >= 2 ? 'text-blue-500' :
                  'text-gray-500'
                }`}>
                  {getPriorityStars(commentary.priority)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  prioriteta
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}