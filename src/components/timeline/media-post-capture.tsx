'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Square,
  SwitchCamera,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize, isImageMimeType, isVideoMimeType } from '@/lib/utils/media'

const MAX_MEDIA_SIZE_BYTES = 100 * 1024 * 1024
const RECORDER_MIME_CANDIDATES = [
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
] as const

type CameraPhase = 'loading' | 'ready' | 'recording' | 'unavailable'
type CaptureMode = 'photo' | 'video'

type Props = {
  onClose: () => void
  onPublish: (file: File) => Promise<boolean>
}

function recorderMimeType() {
  if (typeof MediaRecorder === 'undefined') return undefined
  return RECORDER_MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type))
}

function extensionForMime(mime: string) {
  return mime.split(';')[0]?.includes('mp4') ? 'mp4' : 'webm'
}

export default function MediaPostCapture({ onClose, onPublish }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [mode, setMode] = useState<CaptureMode>('photo')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('loading')
  const [media, setMedia] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const stopStream = useCallback(() => {
    recorderRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null
  }, [])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraPhase('unavailable')
      return
    }

    setCameraPhase('loading')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: mode === 'video',
      })
      streamRef.current = stream
      const video = liveVideoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
      }
      setCameraPhase('ready')
    } catch {
      stopStream()
      setCameraPhase('unavailable')
    }
  }, [facingMode, mode, stopStream])

  useEffect(() => {
    if (media) return
    void startCamera()
    return stopStream
  }, [media, startCamera, stopStream])

  useEffect(() => {
    if (!media) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(media)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [media])

  const attachMedia = useCallback(
    (file: File | null) => {
      if (!file) return
      if (file.size > MAX_MEDIA_SIZE_BYTES) {
        setError(`Datoteka je prevelika. Največ ${formatFileSize(MAX_MEDIA_SIZE_BYTES)}.`)
        return
      }
      if (!isImageMimeType(file.type) && !isVideoMimeType(file.type)) {
        setError('Izberi fotografijo ali video.')
        return
      }
      stopStream()
      setMedia(file)
      setError(null)
    },
    [stopStream],
  )

  const takePhoto = useCallback(() => {
    const video = liveVideoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('Kamera še ni pripravljena.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) {
      setError('Fotografije ni bilo mogoče zajeti.')
      return
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Fotografije ni bilo mogoče zajeti.')
        return
      }
      attachMedia(new File([blob], `objava-${Date.now()}.jpg`, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  }, [attachMedia])

  const startRecording = useCallback(() => {
    const stream = streamRef.current
    if (!stream || cameraPhase !== 'ready') return
    const mimeType = recorderMimeType()
    try {
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || 'video/webm'
        attachMedia(
          new File([new Blob(chunksRef.current, { type })], `objava-${Date.now()}.${extensionForMime(type)}`, {
            type,
          }),
        )
      }
      recorderRef.current = recorder
      recorder.start()
      setCameraPhase('recording')
      setError(null)
    } catch {
      setError('Snemanje videa ni podprto v tem brskalniku. Izberi video iz naprave.')
      setCameraPhase('unavailable')
    }
  }, [attachMedia, cameraPhase])

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  const retake = useCallback(() => {
    setMedia(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const flipCamera = useCallback(() => {
    if (cameraPhase === 'recording') return
    stopStream()
    setFacingMode((current) => (current === 'environment' ? 'user' : 'environment'))
  }, [cameraPhase, stopStream])

  const publish = async () => {
    if (!media || isPublishing) return
    setIsPublishing(true)
    setError(null)
    try {
      const published = await onPublish(media)
      if (!published) setError('Medija ni bilo mogoče dodati. Poskusi znova.')
    } catch {
      setError('Medija ni bilo mogoče dodati. Poskusi znova.')
    } finally {
      setIsPublishing(false)
    }
  }

  const showLiveCamera = !media && cameraPhase !== 'unavailable'

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label="Ustvari medijsko objavo">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 w-[min(100%,calc(100dvh*9/16))] -translate-x-1/2 bg-zinc-950">
          {media ? (
            <>
              {previewUrl && isVideoMimeType(media.type) ? (
                <video src={previewUrl} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" />
              ) : previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Predogled objave" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />
              <button type="button" onClick={retake} disabled={isPublishing} aria-label="Posnemi znova" className="absolute left-4 top-4 z-10 rounded-full bg-black/45 p-2.5 backdrop-blur-sm">
                <RotateCcw className="size-5" />
              </button>
              <button type="button" onClick={onClose} disabled={isPublishing} aria-label="Zapri" className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-2.5 backdrop-blur-sm">
                <X className="size-5" />
              </button>
              <p className="absolute inset-x-6 top-1/2 z-10 -translate-y-1/2 text-center text-xl font-semibold text-white [text-shadow:0_2px_12px_rgba(0,0,0,1)]">Dodaj ta medij v objavo</p>
            </>
          ) : (
            <>
              {showLiveCamera && <video ref={liveVideoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/75" />
              <button type="button" onClick={onClose} aria-label="Zapri" className="absolute left-4 top-4 z-10 rounded-full bg-black/45 p-2.5 backdrop-blur-sm"><X className="size-5" /></button>
              {cameraPhase === 'ready' && (
                <button type="button" onClick={flipCamera} aria-label="Preklopi kamero" className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-2.5 backdrop-blur-sm"><SwitchCamera className="size-5" /></button>
              )}
              {cameraPhase === 'loading' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/75"><Loader2 className="size-10 animate-spin" /><p className="text-sm">Odpiram kamero…</p></div>}
              {cameraPhase === 'unavailable' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                  <Camera className="size-16 text-white/75" strokeWidth={1.5} />
                  <p className="text-xl font-semibold">Kamera ni na voljo</p>
                  <p className="text-sm text-white/60">Dovoli dostop do kamere ali izberi fotografijo oziroma video iz naprave.</p>
                </div>
              )}
              <div className="absolute inset-x-5 bottom-28 z-10 text-center">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Objava v feed</p>
                <p className="mt-3 text-3xl font-semibold">{cameraPhase === 'recording' ? 'Snemanje …' : mode === 'photo' ? 'Fotografiraj trenutek' : 'Posnemi video'}</p>
                <p className="mt-2 text-sm text-white/60">Po zajemu ga dodaj v objavo in izberi še druge medije.</p>
              </div>
            </>
          )}
          {error && <p className="absolute inset-x-5 bottom-20 z-20 text-center text-sm text-red-300" role="alert">{error}</p>}
        </div>
      </div>

      {media ? (
        <div className="bg-black/90 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <button type="button" onClick={publish} disabled={isPublishing} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-primary-foreground disabled:opacity-50">
            {isPublishing ? <><Loader2 className="size-4 animate-spin" /> Dodajam …</> : <><Check className="size-4" /> Dodaj v objavo</>}
          </button>
        </div>
      ) : (
        <div className="bg-black/90 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-sm items-center justify-between gap-5">
            <button type="button" onClick={() => inputRef.current?.click()} aria-label="Izberi iz naprave" className="flex size-12 items-center justify-center rounded-full bg-white/15"><Upload className="size-5" /></button>
            <div className="flex flex-col items-center gap-3">
              <div className="flex rounded-full bg-white/10 p-1 text-xs font-semibold">
                <button type="button" onClick={() => setMode('photo')} disabled={cameraPhase === 'recording'} className={cn('rounded-full px-4 py-1.5', mode === 'photo' && 'bg-white text-black')}>Foto</button>
                <button type="button" onClick={() => setMode('video')} disabled={cameraPhase === 'recording'} className={cn('rounded-full px-4 py-1.5', mode === 'video' && 'bg-white text-black')}>Video</button>
              </div>
              {mode === 'photo' ? (
                <button type="button" onClick={takePhoto} disabled={cameraPhase !== 'ready'} aria-label="Posnemi fotografijo" className="size-20 rounded-full border-4 border-white bg-white/20 disabled:opacity-40"><span className="mx-auto block size-14 rounded-full bg-white" /></button>
              ) : cameraPhase === 'recording' ? (
                <button type="button" onClick={stopRecording} aria-label="Ustavi snemanje" className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-red-500"><Square className="size-8 fill-white" /></button>
              ) : (
                <button type="button" onClick={startRecording} disabled={cameraPhase !== 'ready'} aria-label="Začni snemanje" className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-red-500 disabled:opacity-40"><Video className="size-7" /></button>
              )}
            </div>
            <button type="button" onClick={() => inputRef.current?.click()} aria-label="Izberi medij" className="flex size-12 items-center justify-center rounded-full bg-white/15"><ImageIcon className="size-5" /></button>
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*,video/*" capture="environment" className="sr-only" onChange={(event) => attachMedia(event.target.files?.[0] ?? null)} />
    </div>
  )
}
