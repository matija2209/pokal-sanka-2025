'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Upload, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { compressImage, shouldCompress } from '@/lib/utils/client-image-compression'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatFileSize, isImageMimeType, isVideoMimeType } from '@/lib/utils/media'

interface MobileImageInputProps {
  name: string
  currentImageUrl?: string | null
  label: string
  className?: string
  required?: boolean
  variant?: 'default' | 'compact' | 'avatar'
  accept?: string
  maxSizeBytes?: number
}

export default function MobileImageInput({ 
  name,
  currentImageUrl, 
  label, 
  className = '',
  required = false,
  variant = 'default',
  accept = 'image/*',
  maxSizeBytes,
}: MobileImageInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)

  // Reset preview when currentImageUrl changes (successful upload)
  useEffect(() => {
    if (currentImageUrl && !previewUrl) {
      setFileName('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [currentImageUrl, previewUrl])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (maxSizeBytes && file.size > maxSizeBytes) {
      toast.error(`${label} je prevelik. Največja velikost je ${formatFileSize(maxSizeBytes)}.`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsCompressing(true)
    try {
      let fileToUse = file
      const nextPreviewType = isVideoMimeType(file.type) ? 'video' : 'image'

      if (isImageMimeType(file.type) && shouldCompress(file)) {
        fileToUse = await compressImage(file, { quality: 0.8, maxWidth: 1200, maxHeight: 1200 })
      }
      
      setCompressedFile(fileToUse)
      setFileName(file.name)
      setPreviewType(nextPreviewType)
      const preview = URL.createObjectURL(fileToUse)
      setPreviewUrl(preview)
    } catch (error) {
      console.error('Compression failed:', error)
      // Fallback to original file
      setCompressedFile(file)
      setFileName(file.name)
      setPreviewType(isVideoMimeType(file.type) ? 'video' : 'image')
      setPreviewUrl(URL.createObjectURL(file))
    } finally {
      setIsCompressing(false)
    }
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setPreviewUrl(null)
    setFileName('')
    setCompressedFile(null)
    setPreviewType('image')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const displayImage = previewUrl || currentImageUrl

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative group">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={triggerFileInput}
            className="h-10 w-10 rounded-full bg-background border-dashed border-2 hover:border-primary transition-colors"
            disabled={isCompressing}
          >
            {isCompressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-5 w-5" />}
          </Button>
          
          {previewUrl && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute -top-1 -right-1 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow-sm hover:scale-110 transition-transform"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {displayImage && (
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-muted">
            {previewType === 'video' ? (
              <video
                src={displayImage}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            ) : (
              <Image
                src={displayImage}
                alt="Preview"
                fill
                className="object-cover"
              />
            )}
          </div>
        )}
        
        {fileName && (
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate max-w-[100px]">{fileName}</span>
            <span className="text-[10px] text-muted-foreground">
              {previewType === 'video' ? 'Video pripravljen' : 'Pripravljeno za prenos'}
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          required={required && !currentImageUrl}
        />
      </div>
    )
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div 
          className="relative group cursor-pointer"
          onClick={triggerFileInput}
        >
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-background shadow-xl ring-2 ring-primary/20 bg-muted">
            {displayImage ? (
              <Image
                src={displayImage}
                alt="Preview"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white mb-1" />
              <span className="text-[10px] text-white font-bold uppercase tracking-wider">Spremeni</span>
            </div>

            {isCompressing && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute -top-1 -right-1 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors z-10"
            >
              <X size={14} />
            </button>
          )}

          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg border-2 border-background">
            <Upload size={14} />
          </div>
        </div>

        <div className="text-center">
          <label className="text-sm font-semibold text-muted-foreground block mb-1">{label}</label>
          {fileName ? (
            <Badge variant="secondary" className="gap-1 animate-in fade-in slide-in-from-bottom-1">
              <CheckCircle2 size={12} className="text-green-500" />
              {fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground/60 italic">
              Kliknite za izbiro slike
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          required={required && !currentImageUrl}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center gap-6">
        {/* Modern Image Preview Container */}
        <div 
          className="relative group cursor-pointer"
          onClick={triggerFileInput}
        >
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-muted-foreground/25 bg-muted/30 group-hover:border-primary/50 transition-all duration-300">
            {displayImage ? (
              previewType === 'video' ? (
                <video
                  src={displayImage}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={displayImage}
                  alt="Preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <div className="p-3 rounded-full bg-background/50 shadow-sm">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {accept.includes('video') ? 'Dodaj medij' : 'Dodaj sliko'}
                </span>
              </div>
            )}
            
            {/* Loading Overlay */}
            {isCompressing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase">Optimizing...</span>
              </div>
            )}
            
            {/* Hover Overlay */}
            {displayImage && !isCompressing && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 p-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Camera className="h-5 w-5 text-black" />
                </div>
              </div>
            )}
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-10 border-2 border-background"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
          <Button
            type="button"
            variant={previewUrl ? "secondary" : "outline"}
            size="sm"
            onClick={triggerFileInput}
            className="w-full gap-2 font-semibold shadow-sm"
            disabled={isCompressing}
          >
            {isCompressing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {currentImageUrl || previewUrl
              ? accept.includes('video') ? 'Zamenjaj medij' : 'Zamenjaj sliko'
              : accept.includes('video') ? 'Izberi medij' : 'Izberi sliko'}
          </Button>

          {fileName && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 size={12} className="text-green-500" />
              <span className="truncate max-w-[150px]">{fileName}</span>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          required={required && !currentImageUrl}
        />
      </div>
    </div>
  )
}
