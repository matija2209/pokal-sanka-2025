'use client'

import { useState, useRef, useActionState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitSightingAction } from '@/app/the-bachelor/actions'
import { initialBachelorActionState } from '@/lib/types/action-states'
import { upload } from '@vercel/blob/client'
import { compressImage, shouldCompress } from '@/lib/utils/client-image-compression'
import { Camera, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

type GpsState = 'idle' | 'loading' | 'acquired' | 'error'
type FlowState = 'idle' | 'uploading' | 'waiting_gps' | 'submitting'

interface QuickPhotoCaptureProps {
  actionType: 'photo_together' | 'drink_together'
  className?: string
  children?: React.ReactNode
}

export function QuickPhotoCapture({ actionType, className, children }: QuickPhotoCaptureProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(submitSightingAction, initialBachelorActionState)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingBlobUrlRef = useRef<string | null>(null)
  const pendingSubmitRef = useRef(false)

  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gpsError, setGpsError] = useState<string>('')
  const [flowState, setFlowState] = useState<FlowState>('idle')

  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsState('error')
      setGpsError('Geolocation not supported by your browser.')
      return
    }

    setGpsState('loading')
    setGpsError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setGpsState('acquired')
      },
      (error) => {
        setGpsState('error')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission denied. Enable GPS in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setGpsError('Location unavailable. Try again.')
            break
          case error.TIMEOUT:
            setGpsError('Location request timed out. Try again.')
            break
          default:
            setGpsError('Could not get location. Try again.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    )
  }, [])

  const doSubmit = useCallback((blobUrl: string, lat: number, lng: number) => {
    setFlowState('submitting')

    const formData = new FormData()
    formData.set('photoUrl', blobUrl)
    formData.set('latitude', lat.toString())
    formData.set('longitude', lng.toString())
    formData.set('actionType', actionType)

    pendingSubmitRef.current = true
    formAction(formData)
  }, [actionType, formAction])

  const handleClick = () => {
    if (pendingBlobUrlRef.current) {
      requestGps()
      return
    }
    setFlowState('idle')
    requestGps()
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setFlowState('idle')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      setFlowState('idle')
      return
    }

    let processedFile = file
    try {
      if (shouldCompress(file)) {
        processedFile = await compressImage(file)
      }
    } catch {
      toast.error('Failed to process photo.')
      setFlowState('idle')
      return
    }

    setFlowState('uploading')

    try {
      const blobResult = await upload(processedFile.name, processedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: processedFile.size > 1024 * 1024,
      })

      if (latitude !== null && longitude !== null) {
        doSubmit(blobResult.url, latitude, longitude)
      } else {
        pendingBlobUrlRef.current = blobResult.url
        requestGps()
        setFlowState('waiting_gps')
      }
    } catch {
      setFlowState('idle')
      toast.error('Failed to upload photo. Please try again.')
    }
  }

  useEffect(() => {
    if (pendingBlobUrlRef.current && gpsState === 'acquired' && latitude !== null && longitude !== null) {
      const blobUrl = pendingBlobUrlRef.current
      pendingBlobUrlRef.current = null
      doSubmit(blobUrl, latitude, longitude)
    }
  }, [gpsState, latitude, longitude, doSubmit])

  useEffect(() => {
    if (pendingBlobUrlRef.current && gpsState === 'error') {
      setFlowState('waiting_gps')
    }
  }, [gpsState])

  useEffect(() => {
    if (!pendingSubmitRef.current) return

    if (state.success && state.data?.redirectUrl) {
      pendingSubmitRef.current = false
      toast.success(state.message)
      router.push(state.data.redirectUrl)
    } else if (state.message && state.type === 'error' && !isPending) {
      pendingSubmitRef.current = false
      setFlowState('idle')
      toast.error(state.message)
    }
  }, [state, router, isPending])

  const isLoading = isPending || flowState === 'uploading' || flowState === 'submitting'

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Camera className="w-5 h-5 mr-2" />
        )}
        {flowState === 'uploading'
          ? 'Uploading photo...'
          : flowState === 'waiting_gps'
            ? 'Waiting for GPS...'
            : flowState === 'submitting'
              ? 'Submitting...'
              : gpsState === 'loading'
                ? 'Getting location...'
                : children || 'Take photo with him'}
      </button>

      {gpsState === 'acquired' && flowState !== 'idle' && (
        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1 justify-center">
          <CheckCircle2 className="w-3 h-3" />
          Location ready ({latitude?.toFixed(4)}, {longitude?.toFixed(4)})
        </p>
      )}

      {gpsState === 'error' && (
        <div className="mt-1.5 text-xs text-orange-500 flex items-center gap-1 justify-center">
          <AlertTriangle className="w-3 h-3" />
          <span>{gpsError}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              requestGps()
            }}
            className="underline hover:text-orange-600 ml-1"
          >
            Retry
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
