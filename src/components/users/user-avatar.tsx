import Image from 'next/image'

interface UserAvatarProps {
  user: {
    name: string
    profile_image_url?: string | null
    team?: { color: string } | null
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-lg'
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const teamColor = user.team?.color || '#6B7280'

  if (user.profile_image_url) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 ${className}`} 
           style={{ borderColor: teamColor }}>
        <Image
          src={user.profile_image_url}
          alt={`${user.name}'s profile`}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${className}`}
      style={{ backgroundColor: teamColor }}
    >
      {initials}
    </div>
  )
}