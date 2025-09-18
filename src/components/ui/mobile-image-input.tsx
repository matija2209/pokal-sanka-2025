'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface MobileImageInputProps {
  name: string
  currentImageUrl?: string | null
  label: string
  className?: string
  required?: boolean
  key?: string
}

export default function MobileImageInput({ 
  name,
  currentImageUrl, 
  label, 
  className = '',
  required = false
}: MobileImageInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset preview when currentImageUrl changes (successful upload)
  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(null)
      setFileName('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [currentImageUrl])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
  }

  const clearSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setPreviewUrl(null)
    setFileName('')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const displayImage = previewUrl || currentImageUrl

  return (
    <div className={`space-y-4 ${className}`}>
      
      <div className="flex flex-col items-center space-y-4">
        {/* Image Preview */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
          {displayImage ? (
            <>
              <Image
                src={displayImage}
                alt="Preview"
                fill
                className="object-cover"
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Camera size={24} />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          className="flex items-center gap-2"
        >
          <Camera size={16} />
          {currentImageUrl || previewUrl ? 'Zamenjaj sliko' : 'Dodaj sliko'}
        </Button>

        {fileName && (
          <p className="text-sm text-gray-600 text-center">
            Selected: {fileName}
          </p>
        )}

        {/* Hidden File Input with Mobile Camera Support */}
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          required={required && !currentImageUrl}
        />
      </div>
    </div>
  )
}