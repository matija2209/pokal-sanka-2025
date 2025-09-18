'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface PostWithUser {
  id: string
  message: string
  image_url: string | null
  createdAt: Date
  user: {
    id: string
    name: string
    team: {
      id: string
      name: string
      color: string
    } | null
  }
}

interface BreakingNewsBannerProps {
  posts: PostWithUser[]
}

export default function BreakingNewsBanner({ posts }: BreakingNewsBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Show recent posts (limit to last 10)
  const breakingNews = posts.slice(0, 10)
  
  // Debug info
  if (posts.length > 0) {
    console.log('📺 Banner has posts:', posts.length, 'messages')
  }

  useEffect(() => {
    if (breakingNews.length === 0) {
      setIsVisible(false)
      return
    }

    setIsVisible(true)
  }, [breakingNews.length])

  if (!isVisible || breakingNews.length === 0) {
    return null
  }

  // Create team abbreviation helper
  const getTeamAbbr = (teamName: string) => teamName.substring(0, 3).toUpperCase()

  // Duplicate the messages to create seamless infinite scroll  
  const scrollingContent = breakingNews.concat(breakingNews)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 breaking-news-banner">
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white shadow-2xl border-t-4 border-yellow-400">
        <div className="flex items-center h-16 overflow-hidden">
          {/* Breaking News Label */}
          <div className="bg-yellow-500 text-black px-6 py-4 font-black text-lg whitespace-nowrap flex-shrink-0 breaking-news-label">
            🚨 EKSKLUZIVNO
          </div>
          
          
          {/* Continuous Scrolling Messages */}
          <div className="flex-1 overflow-hidden">
            <div className="breaking-news-continuous-scroll whitespace-nowrap">
              <div className="inline-flex items-center gap-8">
                {scrollingContent.map((post, index) => {
                  const timeAgo = formatDistanceToNow(new Date(post.createdAt))
                    .replace('about ', '')
                    .replace('minutes', 'min')
                    .replace('minute', 'min')
                    .replace('hours', 'h')
                    .replace('hour', 'h')
                  
                  const teamAbbr = post.user.team ? getTeamAbbr(post.user.team.name) : ''
                  const userDisplay = teamAbbr ? `${post.user.name} (${teamAbbr})` : post.user.name
                  
                  return (
                    <div key={`${post.id}-${index}`} className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-yellow-300 font-medium text-sm">{userDisplay}:</span>
                      <span className="text-white font-bold text-xl">{post.message}</span>
                      {post.image_url && <span className="text-lg">📸</span>}
                      <span className="text-yellow-200 text-xs font-light">pred {timeAgo}</span>
                      <span className="text-yellow-400 text-lg font-bold mx-2">•••</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Message Count Indicator */}
          <div className="flex-shrink-0 px-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-sm font-bold">
                {breakingNews.length} SPOROČIL
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar - always full for continuous scroll */}
        <div className="h-1 bg-red-800 overflow-hidden">
          <div className="h-full bg-yellow-400 w-full" />
        </div>
      </div>

      <style jsx>{`
        .breaking-news-banner {
          animation: slideUp 0.5s ease-out;
        }
        
        .breaking-news-label {
          animation: flash 2s infinite;
        }
        
        .breaking-news-continuous-scroll {
          animation: continuousScroll 60s linear infinite;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes flash {
          0%, 50% { opacity: 1; }
          25%, 75% { opacity: 0.7; }
        }
        
        @keyframes continuousScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @media (max-width: 768px) {
          .breaking-news-continuous-scroll {
            animation: continuousScroll 45s linear infinite;
          }
        }
      `}</style>
    </div>
  )
}