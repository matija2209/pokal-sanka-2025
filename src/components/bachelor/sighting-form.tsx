'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitSightingAction } from '@/app/the-bachelor/actions'
import { initialBachelorActionState } from '@/lib/types/action-states'
import {
  ACTION_DESCRIPTIONS,
  ACTION_LABELS,
  ACTION_ORDER,
  ACTION_POINTS,
  ACTION_TYPES,
} from '@/lib/utils/bachelor-points'
import type { ActionType } from '@/lib/utils/bachelor-points'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { upload } from '@vercel/blob/client'
import { compressImage, shouldCompress } from '@/lib/utils/client-image-compression'
import {
  Camera,
  MapPin,
  Loader2,
  AlertTriangle,
  Send,
  Navigation,
  X,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

type GpsState = 'idle' | 'loading' | 'acquired' | 'error' | 'manual'

interface SightingFormProps {
  initialAction?: ActionType
}

const COUNTRY_OPTIONS = [
  'Slovenia',
  'Croatia',
  'Serbia',
  'Bosnia and Herzegovina',
  'Montenegro',
  'North Macedonia',
  'Austria',
  'Italy',
  'Germany',
  'France',
  'Spain',
  'Portugal',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'United Kingdom',
  'Ireland',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'Czech Republic',
  'Hungary',
  'Romania',
  'Greece',
  'Turkey',
  'United States',
  'Canada',
  'Australia',
  'New Zealand',
  'Other',
] as const

export function SightingForm({ initialAction = ACTION_TYPES.SPOT }: SightingFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    submitSightingAction,
    initialBachelorActionState,
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gpsError, setGpsError] = useState<string>('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [selectedAction, setSelectedAction] = useState<ActionType>(initialAction)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const requestGps = () => {
    if (!navigator.geolocation) {
      setGpsState('error')
      setGpsError('Geolocation is not supported by your browser.')
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
            setGpsError(
              'Location permission denied. Please enable location in your browser settings or enter coordinates manually.',
            )
            break
          case error.POSITION_UNAVAILABLE:
            setGpsError('Location unavailable. Please try again or enter coordinates manually.')
            break
          case error.TIMEOUT:
            setGpsError('Location request timed out. Please try again or enter coordinates manually.')
            break
          default:
            setGpsError('Could not get location. Please enter coordinates manually.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    )
  }

  const requestGpsIfMissing = () => {
    if (gpsState === 'loading' || gpsState === 'acquired') {
      return
    }

    if (latitude !== null && longitude !== null) {
      return
    }

    requestGps()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }

    requestGpsIfMissing()

    let processedFile = file
    if (shouldCompress(file)) {
      processedFile = await compressImage(file)
    }

    setPhotoFile(processedFile)
    const preview = URL.createObjectURL(processedFile)
    setPhotoPreview(preview)
  }

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    setPhotoFile(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!photoFile) {
      toast.error('Please select a photo.')
      return
    }

    const resolvedLat = latitude
    const resolvedLng = longitude
    if (resolvedLat === null || resolvedLng === null) {
      toast.error('Location is required.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const blobResult = await upload(photoFile.name, photoFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: photoFile.size > 1024 * 1024,
      })

      const formData = new FormData()
      formData.set('photoUrl', blobResult.url)
      formData.set('latitude', resolvedLat.toString())
      formData.set('longitude', resolvedLng.toString())
      formData.set('actionType', selectedAction)

      const submitterName = formRef.current?.submitterName?.value
      const submitterCountry = selectedCountry
      const message = formRef.current?.message?.value

      if (submitterName) formData.set('submitterName', submitterName)
      if (submitterCountry) formData.set('submitterCountry', submitterCountry)
      if (message) formData.set('message', message)

      setIsUploading(false)
      formAction(formData)
    } catch (error) {
      setIsUploading(false)
      toast.error('Failed to upload photo. Please try again.')
    }
  }

  useEffect(() => {
    if (state.success && state.data?.redirectUrl) {
      toast.success(state.message)
      router.push(state.data.redirectUrl)
    } else if (state.message && state.type === 'error' && !isPending && !isUploading) {
      toast.error(state.message)
    }
  }, [state, router, isPending, isUploading])

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">What are you logging?</span>
        </div>

        <div className="grid gap-2">
          {ACTION_ORDER.map((action) => {
            const label = ACTION_LABELS[action].en
            const description = ACTION_DESCRIPTIONS[action]
            const points = ACTION_POINTS[action]

            return (
              <button
                key={action}
                type="button"
                onClick={() => setSelectedAction(action)}
                className={cn(
                  'rounded-xl border p-3 text-left transition-colors',
                  selectedAction === action
                    ? 'border-primary bg-primary/10'
                    : 'border-muted bg-background hover:border-primary/40',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                  </div>
                  <span className="text-xs font-bold text-primary whitespace-nowrap">
                    +{points} pts
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* GPS Section */}
      <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-medium text-sm">Location</span>
        </div>

        {gpsState === 'acquired' ? (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle2 className="w-4 h-4" />
            Location acquired
            <span className="text-muted-foreground text-xs">
              ({latitude?.toFixed(5)}, {longitude?.toFixed(5)})
            </span>
            <button
              type="button"
              onClick={() => {
                setGpsState('manual')
                setLatitude(null)
                setLongitude(null)
              }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Change
            </button>
          </div>
        ) : gpsState === 'loading' ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Finding your location...
          </div>
        ) : gpsState === 'error' ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-orange-500">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{gpsError}</span>
            </div>
          </div>
        ) : null}

        {(gpsState === 'idle' || gpsState === 'error') && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={requestGps}
              disabled={false}
            >
              <Navigation className="w-3.5 h-3.5 mr-1.5" />
              Get my location
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGpsState('manual')}
            >
              Enter manually
            </Button>
          </div>
        )}

        {gpsState === 'manual' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Latitude</label>
              <Input
                type="number"
                step="0.000001"
                placeholder="35.9375"
                value={latitude ?? ''}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Longitude</label>
              <Input
                type="number"
                step="0.000001"
                placeholder="14.3754"
                value={longitude ?? ''}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Location is used to place this sighting on the BWSK Malta map.
        </p>
      </div>

      {/* Photo Section */}
      <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          <span className="font-medium text-sm">Photo</span>
          <span className="text-red-500">*</span>
        </div>

        {photoPreview ? (
          <div className="relative">
            <Image
              src={photoPreview}
              alt="Preview"
              width={400}
              height={300}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors">
            <Camera className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Tap to take a photo</span>
            <span className="text-xs text-muted-foreground mt-1">
              Take a respectful public photo of BWSK
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}

        <p className="text-xs text-muted-foreground">
          {selectedAction === ACTION_TYPES.SPOT
            ? 'No need to approach him yet. Just log the sighting and help us track the groom.'
            : 'Use a respectful photo that matches the interaction you are logging.'}
        </p>
      </div>

      {/* Optional Fields */}
      <div className="space-y-3">
        <Input
          name="submitterName"
          placeholder="Your name or nickname (optional)"
          className="h-10 text-sm"
        />
        <input type="hidden" name="submitterCountry" value={selectedCountry} />
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="h-10 w-full text-sm">
            <SelectValue placeholder="Your country (optional)" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          name="message"
          placeholder="Leave a message for BWSK... (optional)"
          className="min-h-[80px] text-sm resize-none"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending || isUploading || gpsState === 'loading'}
        className="w-full h-12 text-base"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading... {uploadProgress}%
          </>
        ) : isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit log
          </>
        )}
      </Button>
    </form>
  )
}
