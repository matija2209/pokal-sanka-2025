'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Camera, Users } from 'lucide-react'
import UserAvatar from '@/components/users/user-avatar'
import TeamLogo from '@/components/teams/team-logo'

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

export default function LatestImagesDisplay({ posts, userImages, teamLogos }: LatestImagesDisplayProps) {
  const [currentView, setCurrentView] = useState<'posts' | 'profiles' | 'teams'>('posts')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter posts with images
  const postsWithImages = posts.filter(post => post.image_url)
  const profilesWithImages = userImages.filter(user => user.imageUrl)
  const teamsWithLogos = teamLogos.filter(team => team.logoUrl)

  // Combine all image sources for rotation
  const allImageSources = [
    ...(postsWithImages.length > 0 ? ['posts'] : []),
    ...(profilesWithImages.length > 0 ? ['profiles'] : []),
    ...(teamsWithLogos.length > 0 ? ['teams'] : [])
  ] as const

  // Auto-rotate between different image types every 10 seconds
  useEffect(() => {
    if (allImageSources.length === 0) return

    const interval = setInterval(() => {
      const currentTypeIndex = allImageSources.indexOf(currentView)
      const nextTypeIndex = (currentTypeIndex + 1) % allImageSources.length
      const nextView = allImageSources[nextTypeIndex] as 'posts' | 'profiles' | 'teams'
      setCurrentView(nextView)
      setCurrentIndex(0) // Reset index when switching types
    }, 10000)

    return () => clearInterval(interval)
  }, [currentView, allImageSources.length])

  // Auto-rotate within current image type every 5 seconds
  useEffect(() => {
    let currentItems: any[] = []
    
    if (currentView === 'posts') currentItems = postsWithImages
    else if (currentView === 'profiles') currentItems = profilesWithImages
    else if (currentView === 'teams') currentItems = teamsWithLogos

    if (currentItems.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentView, postsWithImages.length, profilesWithImages.length, teamsWithLogos.length])

  if (allImageSources.length === 0) {
    return (
      <Card className="fixed top-4 right-4 w-80 p-4 bg-slate-800/90 border-slate-600 backdrop-blur-sm">
        <div className="text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Najnovejše slike</h3>
          <p className="text-gray-300 text-sm">Še ni objavljenih slik...</p>
        </div>
      </Card>
    )
  }

  const renderPostImage = () => {
    if (postsWithImages.length === 0) return null
    const post = postsWithImages[currentIndex % postsWithImages.length]
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={post.user} size="sm" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">{post.user.name}</span>
              {post.user.team && (
                <TeamLogo team={post.user.team} size="sm" />
              )}
            </div>
            <p className="text-gray-300 text-xs">
              pred {formatDistanceToNow(new Date(post.createdAt)).replace('about ', '').replace('minutes', 'min')}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <img 
            src={post.image_url!} 
            alt="Objava" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-600">
            Objava
          </Badge>
        </div>
        
        {post.message && (
          <p className="text-white text-sm bg-slate-700/50 p-2 rounded">
            "{post.message}"
          </p>
        )}
      </div>
    )
  }

  const renderProfileImage = () => {
    if (profilesWithImages.length === 0) return null
    const profile = profilesWithImages[currentIndex % profilesWithImages.length]
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">{profile.userName}</span>
              {profile.team && (
                <TeamLogo team={profile.team} size="sm" />
              )}
            </div>
            <p className="text-gray-300 text-xs">
              Posodobil profil pred {formatDistanceToNow(new Date(profile.updatedAt)).replace('about ', '').replace('minutes', 'min')}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <img 
            src={profile.imageUrl!} 
            alt={`${profile.userName} profil`}
            className="w-full h-48 object-cover rounded-lg"
          />
          <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-600">
            Nov profil
          </Badge>
        </div>
      </div>
    )
  }

  const renderTeamLogo = () => {
    if (teamsWithLogos.length === 0) return null
    const team = teamsWithLogos[currentIndex % teamsWithLogos.length]
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full border-2 border-white"
            style={{ backgroundColor: team.color }}
          />
          <div className="flex-1">
            <span className="font-semibold text-white text-sm">{team.teamName}</span>
            <p className="text-gray-300 text-xs">
              Posodobil logo pred {formatDistanceToNow(new Date(team.updatedAt)).replace('about ', '').replace('minutes', 'min')}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <img 
            src={team.logoUrl!} 
            alt={`${team.teamName} logo`}
            className="w-full h-48 object-cover rounded-lg"
          />
          <Badge 
            className="absolute top-2 left-2 hover:bg-opacity-90"
            style={{ backgroundColor: team.color }}
          >
            Nov logo
          </Badge>
        </div>
      </div>
    )
  }

  const getTotalCount = () => {
    if (currentView === 'posts') return postsWithImages.length
    if (currentView === 'profiles') return profilesWithImages.length
    if (currentView === 'teams') return teamsWithLogos.length
    return 0
  }

  return (
    <Card className="fixed top-4 right-4 w-80 p-4 bg-slate-800/90 border-slate-600 backdrop-blur-sm latest-images-display">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Najnovejše slike</h3>
          </div>
          
          {getTotalCount() > 1 && (
            <div className="text-xs text-gray-400">
              {(currentIndex % getTotalCount()) + 1}/{getTotalCount()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          {currentView === 'posts' && renderPostImage()}
          {currentView === 'profiles' && renderProfileImage()}
          {currentView === 'teams' && renderTeamLogo()}
        </div>

        {/* Type indicator */}
        {allImageSources.length > 1 && (
          <div className="flex justify-center gap-2">
            {allImageSources.map((type) => (
              <div
                key={type}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  type === currentView ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .latest-images-display {
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  )
}