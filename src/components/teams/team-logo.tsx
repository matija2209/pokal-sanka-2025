import Image from 'next/image'

interface TeamLogoProps {
  team: {
    name: string
    color: string
    logo_image_url?: string | null
  }
  size?: 'sm' | 'md' | 'lg'
  showFallback?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
}

export default function TeamLogo({ team, size = 'md', showFallback = true, className = '' }: TeamLogoProps) {
  if (team.logo_image_url) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 ${className}`} 
           style={{ borderColor: team.color }}>
        <Image
          src={team.logo_image_url}
          alt={`${team.name} logo`}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  if (showFallback) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full ${className}`}
        style={{ backgroundColor: team.color }}
      />
    )
  }

  return null
}