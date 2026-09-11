'use client'

import { formatDistanceToNow } from 'date-fns'
import { isVideoUrl } from '@/lib/utils/media'

interface ImagePost {
  id: string
  message: string
  image_url: string | null
  assets: Array<{ url: string; mediaType: string }>
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
  isVideo: boolean
  userName: string
  userAvatar?: string | null
  timestamp: Date
  type: 'post' | 'profile' | 'logo'
  message?: string
  teamColor?: string
}

export default function LatestImagesDisplay({ posts, userImages, teamLogos }: LatestImagesDisplayProps) {
  // Combine all images into one unified array
  const allImages: UnifiedImage[] = [
    // Posts with images or videos
    ...posts.flatMap(post => {
      const url = post.assets[0]?.url ?? post.image_url
      if (!url) return []
      const mediaType = post.assets[0]?.mediaType
      return [{
        id: `post-${post.id}`,
        imageUrl: url,
        isVideo: mediaType === 'video' || isVideoUrl(url),
        userName: post.user.name,
        userAvatar: post.user.profile_image_url,
        timestamp: post.createdAt,
        type: 'post' as const,
        message: post.message,
        teamColor: post.user.team?.color
      }]
    }),
    
    // Profile images
    ...userImages
      .filter(user => user.imageUrl)
      .map(user => ({
        id: `profile-${user.userId}`,
        imageUrl: user.imageUrl!,
        isVideo: false,
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
        isVideo: false,
        userName: team.teamName,
        timestamp: team.updatedAt,
        type: 'logo' as const,
        teamColor: team.color
      }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Cap to a grid that comfortably fills one slide without scrolling
  const gridImages = allImages.slice(0, 9)

  if (gridImages.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto h-[60vh] rounded-lg bg-slate-900/60 flex items-center justify-center">
        <p className="text-lg">Še ni objavljenih slik ali videov...</p>
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
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        {gridImages.map((image) => (
          <div key={image.id} className="flex flex-col space-y-2 bg-slate-900/60 rounded-lg p-3">
            {/* User info */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {image.userAvatar && (
                <img
                  src={image.userAvatar}
                  alt={image.userName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm truncate">{image.userName}</h3>
                <p className="text-xs">
                  pred {formatDistanceToNow(new Date(image.timestamp)).replace('about ', '').replace('minutes', 'min')}
                </p>
              </div>
              {image.teamColor && (
                <div
                  className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0"
                  style={{ backgroundColor: image.teamColor }}
                />
              )}
            </div>

            {/* Main image or video */}
            <div className="relative aspect-square">
              {image.isVideo ? (
                <video
                  src={image.imageUrl}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={image.imageUrl}
                  alt={`${image.userName} ${image.type}`}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              )}
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-white text-xs font-medium ${getTypeColor(image.type)}`}>
                {getTypeLabel(image.type)}
              </div>
            </div>

            {/* Message for posts */}
            {image.message && (
              <div className="bg-slate-800/70 p-2 rounded text-xs line-clamp-2 flex-shrink-0">
                "{image.message}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
