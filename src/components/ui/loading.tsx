'use client'

import { Card, CardContent } from './card'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ text = 'Loading...', className = '', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex items-center gap-2">
        <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    </div>
  )
}

export function LoadingCard({ text = 'Loading...', className = '' }: LoadingProps) {
  return (
    <Card className={className}>
      <CardContent>
        <Loading text={text} />
      </CardContent>
    </Card>
  )
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton h-4 w-full ${className}`} />
  )
}

export function LoadingGrid({ 
  rows = 3, 
  className = '' 
}: { 
  rows?: number
  className?: string 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <LoadingSkeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}