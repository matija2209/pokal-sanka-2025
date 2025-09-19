'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface ImagePost {
  id: string
  message: string
  image_url: string | null
  createdAt: Date
  user: {
    id: string
    name: string
    profile_image_url: string | null
    team: {
      id: string
      name: string
      color: string
      logo_image_url: string | null
    } | null
  }
}

interface LatestImagesDisplayProps {
  posts: ImagePost[]
  userImages: Array<{
    userId: string
    userName: string
    imageUrl: string | null
    updatedAt: Date
    team?: {
      name: string
      color: string
      logo_image_url: string | null
    }
  }>
  teamLogos: Array<{
    teamId: string
    teamName: string
    logoUrl: string | null
    updatedAt: Date
    color: string
  }>
}

interface UnifiedImage {
  id: string
  imageUrl: string
  userName: string
  userAvatar?: string | null
  timestamp: Date
  type: 'post' | 'profile' | 'logo'
  message?: string
  teamColor?: string
}

export default function LatestImagesDisplay({ posts, userImages, teamLogos }: LatestImagesDisplayProps) {
  const [scrollPosition, setScrollPosition] = useState(0)

  // Combine all images into one unified array
  const allImages: UnifiedImage[] = [
    // Posts with images
    ...posts
      .filter(post => post.image_url)
      .map(post => ({
        id: `post-${post.id}`,
        imageUrl: post.image_url!,
        userName: post.user.name,
        userAvatar: post.user.profile_image_url,
        timestamp: post.createdAt,
        type: 'post' as const,
        message: post.message,
        teamColor: post.user.team?.color
      })),
    
    // Profile images
    ...userImages
      .filter(user => user.imageUrl)
      .map(user => ({
        id: `profile-${user.userId}`,
        imageUrl: user.imageUrl!,
        userName: user.userName,
        userAvatar: user.imageUrl,
        timestamp: user.updatedAt,
        type: 'profile' as const,
        teamColor: user.team?.color
      })),
    
    // Team logos
    ...teamLogos
      .filter(team => team.logoUrl)
      .map(team => ({
        id: `logo-${team.teamId}`,
        imageUrl: team.logoUrl!,
        userName: team.teamName,
        timestamp: team.updatedAt,
        type: 'logo' as const,
        teamColor: team.color
      }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Duplicate the array multiple times for seamless infinite scroll
  const duplicatedImages = [...allImages, ...allImages, ...allImages, ...allImages, ...allImages]

  // Auto-scroll effect
  useEffect(() => {
    if (allImages.length === 0) return

    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const itemHeight = 520
        const totalHeight = allImages.length * itemHeight
        const newPosition = prev + 1
        
        // Reset to 0 when we've scrolled through one complete cycle
        // This ensures we never get stuck
        if (newPosition >= totalHeight) {
          return 0
        }
        return newPosition
      })
    }, 25) // Slightly faster for smoother motion

    return () => clearInterval(interval)
  }, [allImages.length])

  if (allImages.length === 0) {
    return (
      <div className="fixed top-0 right-0 w-96 h-screen p-6 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center">
        <p className=" text-lg">Še ni objavljenih slik...</p>
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Objava'
      case 'profile': return 'Profil'
      case 'logo': return 'Logo'
      default: return ''
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-600'
      case 'profile': return 'bg-green-600'
      case 'logo': return 'bg-purple-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="fixed top-0 right-0 w-96 h-screen bg-slate-900/95 backdrop-blur-sm overflow-hidden">
      <div 
        className="flex flex-col transition-transform duration-75 ease-linear"
        style={{ 
          transform: `translateY(-${scrollPosition}px)`
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div 
            key={`${image.id}-${Math.floor(index / allImages.length)}`} 
            className="flex-shrink-0 p-4 border-b border-slate-700/50"
            style={{ minHeight: '520px' }}
          >
            <div className="flex flex-col space-y-3 h-full">
              {/* User info */}
              <div className="flex items-center gap-3 flex-shrink-0" style={{ height: '50px' }}>
                {image.userAvatar && (
                  <img 
                    src={image.userAvatar} 
                    alt={image.userName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{image.userName}</h3>
                  <p className=" text-xs">
                    pred {formatDistanceToNow(new Date(image.timestamp)).replace('about ', '').replace('minutes', 'min')}
                  </p>
                </div>
                {image.teamColor && (
                  <div 
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: image.teamColor }}
                  />
                )}
              </div>

              {/* Main image */}
              <div className="relative" style={{ height: '420px' }}>
                <img 
                  src={image.imageUrl} 
                  alt={`${image.userName} ${image.type}`}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-white text-xs font-medium ${getTypeColor(image.type)}`}>
                  {getTypeLabel(image.type)}
                </div>
              </div>

              {/* Message for posts */}
              {image.message && (
                <div className="bg-slate-800/70 p-2 rounded text-xs  line-clamp-2 flex-shrink-0" style={{ maxHeight: '40px' }}>
                  "{image.message}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}