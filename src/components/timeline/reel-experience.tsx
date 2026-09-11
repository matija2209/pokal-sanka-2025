'use client'

import { upload } from '@vercel/blob/client'
import { Pause, Play, Plus, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { isImageMimeType, isVideoMimeType } from '@/lib/utils/media'
import MediaPostCapture from './media-post-capture'

export type Reel = {
  id: string
  message: string
  createdAt: Date | string
  user: { id: string; name: string; profile_image_url?: string | null }
  assets: Array<{ id: string; url: string; mediaType: string }>
}

type ReelContextValue = { openReel: (id: string) => void; openComposer: () => void }
const ReelContext = createContext<ReelContextValue | null>(null)

export function useReels() {
  return useContext(ReelContext)
}

function ReelComposer({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file])

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous } }, [])

  const selectMedia = (candidate: File | null) => {
    if (!candidate) return
    if (!isImageMimeType(candidate.type) && !isVideoMimeType(candidate.type)) return toast.error('Izberi fotografijo ali video za reel.')
    if (candidate.size > 100 * 1024 * 1024) return toast.error('Medij je lahko velik največ 100 MB.')
    setFile(candidate)
  }

  const publish = async () => {
    if (!file || isPublishing) return
    setIsPublishing(true)
    try {
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload', multipart: file.size > 1024 * 1024 })
      const data = new FormData()
      data.set('kind', 'reel')
      data.set('message', caption.trim())
      data.set('assets', JSON.stringify([{ url: blob.url, mediaType: isVideoMimeType(file.type) ? 'video' : 'image', size: file.size }]))
      const result = await createPostAction(initialDrinkLogActionState, data)
      if (!result.success) throw new Error(result.message || 'Reela ni bilo mogoče objaviti.')
      toast.success('Reel je objavljen!')
      router.refresh()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nalaganje reela ni uspelo.')
    } finally {
      setIsPublishing(false)
    }
  }

  if (!file) return <MediaPostCapture reel onClose={onClose} onPublish={async (media) => { selectMedia(media); return true }} />

  return <div className="fixed inset-0 z-[110] flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label="Dokončaj reel">
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div className="absolute inset-y-0 left-1/2 w-[min(100%,calc(100dvh*9/16))] -translate-x-1/2 bg-zinc-950">
        {previewUrl && isVideoMimeType(file.type) ? <video src={previewUrl} autoPlay loop muted playsInline className="absolute inset-0 size-full object-cover" /> : previewUrl ? <img src={previewUrl} alt="Predogled reela" className="absolute inset-0 size-full object-cover" /> : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />
        <button type="button" onClick={() => setFile(null)} disabled={isPublishing} aria-label="Posnemi znova" className="absolute left-4 top-4 z-10 rounded-full bg-black/45 p-2.5 backdrop-blur-sm"><RotateCcw className="size-5" /></button>
        <button type="button" onClick={onClose} disabled={isPublishing} aria-label="Zapri" className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-2.5 backdrop-blur-sm"><X className="size-5" /></button>
        <div className="absolute inset-x-6 top-1/2 z-10 -translate-y-1/2">
          <Textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Dodaj opis …" aria-label="Opis reela" className="min-h-24 resize-none border-white/25 bg-black/35 text-center text-lg text-white shadow-lg placeholder:text-white/65 focus-visible:ring-white" />
        </div>
      </div>
    </div>
    <div className="bg-black/90 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
      <button type="button" onClick={() => void publish()} disabled={isPublishing} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-primary-foreground disabled:opacity-50">{isPublishing ? 'Objavljam …' : 'Objavi reel'}</button>
    </div>
  </div>
}

function ReelViewer({ reels: allReels, initialId, onClose }: { reels: Reel[]; initialId: string; onClose: () => void }) {
  const authorId = allReels.find((reel) => reel.id === initialId)?.user.id
  const reels = useMemo(() => allReels.filter((reel) => reel.user.id === authorId), [allReels, authorId])
  const start = Math.max(0, reels.findIndex((reel) => reel.id === initialId))
  const [index, setIndex] = useState(start)
  const [paused, setPaused] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [progress, setProgress] = useState(0)
  const photoElapsedRef = useRef(0)
  const photoStartedAtRef = useRef<number | null>(null)
  const photoReelIdRef = useRef<string | null>(null)
  const reel = reels[index]
  const video = reel?.assets[0]
  const goNext = useCallback(() => { setProgress(0); setPaused(false); setSoundOn(false); setIndex((value) => value >= reels.length - 1 ? (onClose(), value) : value + 1) }, [onClose, reels.length])
  const goPrev = useCallback(() => { setProgress(0); setPaused(false); setSoundOn(false); setIndex((value) => Math.max(0, value - 1)) }, [])

  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous } }, [])
  useEffect(() => { const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); else if (event.key === 'ArrowRight') goNext(); else if (event.key === 'ArrowLeft') goPrev(); else if (event.key === ' ') { event.preventDefault(); setPaused((value) => !value) } }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener) }, [goNext, goPrev, onClose])
  useEffect(() => {
    if (!reel || !video || video.mediaType === 'video') return
    if (photoReelIdRef.current !== reel.id) {
      photoReelIdRef.current = reel.id
      photoElapsedRef.current = 0
      photoStartedAtRef.current = null
    }
    if (paused) return
    photoStartedAtRef.current = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = photoElapsedRef.current + performance.now() - (photoStartedAtRef.current ?? performance.now())
      setProgress(Math.min((elapsed / 5000) * 100, 100))
      if (elapsed >= 5000) {
        window.clearInterval(timer)
        goNext()
      }
    }, 50)
    return () => {
      window.clearInterval(timer)
      if (photoStartedAtRef.current !== null) {
        photoElapsedRef.current += performance.now() - photoStartedAtRef.current
        photoStartedAtRef.current = null
      }
    }
  }, [goNext, paused, reel, video])

  if (!reel || !video) return null
  return <div className="fixed inset-0 z-[120] bg-black text-white" role="dialog" aria-modal="true" aria-label="Reel predvajalnik">
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.55),transparent_30%,rgba(0,0,0,.6))]" />
    <div className="relative mx-auto flex h-full w-full max-w-[min(100%,calc(100dvh*9/16))] flex-col">
      <div className="z-10 px-3 pt-[max(1rem,env(safe-area-inset-top))]"><div className="mb-4 flex gap-1">{reels.map((item, itemIndex) => <span key={item.id} className="h-1 flex-1 overflow-hidden rounded bg-white/25"><span className="block h-full bg-white" style={{ width: itemIndex < index ? '100%' : itemIndex === index ? `${progress}%` : '0%' }} /></span>)}</div><div className="flex items-center justify-between"><div><p className="font-semibold">{reel.user.name}</p><p className="text-xs text-white/70">{index + 1} / {reels.length}</p></div><Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={onClose} aria-label="Zapri"><X /></Button></div></div>
      <button type="button" className="absolute inset-y-20 left-0 z-10 w-1/3" onClick={goPrev} aria-label="Prejšnji reel" /><button type="button" className="absolute inset-y-20 right-0 z-10 w-1/3" onClick={goNext} aria-label="Naslednji reel" />
      <div className="relative flex flex-1 items-center justify-center" onPointerDown={(event) => { if (!(event.target as HTMLElement).closest('button')) setPaused(true) }} onPointerUp={() => setPaused(false)} onPointerCancel={() => setPaused(false)}>{video.mediaType === 'video' ? <video key={reel.id} src={video.url} muted={!soundOn} autoPlay={!paused} playsInline preload="metadata" onEnded={goNext} onTimeUpdate={(event) => { const target = event.currentTarget; if (target.duration) setProgress((target.currentTime / target.duration) * 100) }} ref={(node) => { if (node) { node.muted = !soundOn; if (paused) node.pause(); else void node.play().catch(() => {}) } }} className="size-full object-contain" /> : <img src={video.url} alt={`Reel uporabnika ${reel.user.name}`} className="size-full object-contain" />}</div>
      <div className="z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><div className="flex items-end justify-between gap-3 rounded-3xl bg-black/40 p-3 backdrop-blur"><p className="min-w-0 text-sm">{reel.message || 'Brez opisa'}</p><div className="flex gap-2"><Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Nadaljuj' : 'Začasno ustavi'}>{paused ? <Play /> : <Pause />}</Button>{video.mediaType === 'video' ? <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? 'Izklopi zvok' : 'Vklopi zvok'}>{soundOn ? <Volume2 /> : <VolumeX />}</Button> : null}</div></div></div>
    </div><p className="sr-only" aria-live="polite">{reel.user.name}: reel {index + 1} od {reels.length}</p>
  </div>
}

export function ReelProvider({ reels, children }: { reels: Reel[]; children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const value = useMemo(() => ({ openReel: setActiveId, openComposer: () => setComposerOpen(true) }), [])
  return <ReelContext.Provider value={value}>{children}{composerOpen ? <ReelComposer onClose={() => setComposerOpen(false)} /> : null}{activeId ? <ReelViewer reels={reels} initialId={activeId} onClose={() => setActiveId(null)} /> : null}</ReelContext.Provider>
}

export function ReelStoryStrip({ reels, currentUser }: { reels: Reel[]; currentUser: { name: string; profile_image_url?: string | null } }) {
  const context = useReels()
  const authorReels = useMemo(() => {
    const seen = new Set<string>()
    const result: Reel[] = []
    for (const reel of reels) {
      if (seen.has(reel.user.id)) continue
      seen.add(reel.user.id)
      result.push(reel)
    }
    return result
  }, [reels])
  return <section className="border-b border-border/50 bg-background py-2.5"><div className="flex gap-3 overflow-x-auto px-4 scrollbar-none"><button type="button" onClick={context?.openComposer} className="flex w-[72px] shrink-0 flex-col items-center gap-1"><span className="relative grid size-[66px] place-items-center rounded-full border border-border bg-muted text-lg font-semibold">{currentUser.name.slice(0, 1).toUpperCase()}<span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full bg-primary text-white ring-2 ring-background"><Plus className="size-3.5" /></span></span><span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground">Tvoja zgodba</span></button>{authorReels.slice(0, 10).map((reel) => { const asset = reel.assets[0]; return asset ? <button key={reel.id} type="button" onClick={() => context?.openReel(reel.id)} className="flex w-[72px] shrink-0 flex-col items-center gap-1" aria-label={`Odpri reel uporabnika ${reel.user.name}`}><span className="rounded-full bg-gradient-to-tr from-fuchsia-500 via-orange-400 to-amber-300 p-[2.5px]"><span className="relative block size-[61px] overflow-hidden rounded-full border-2 border-background bg-black">{asset.mediaType === 'video' ? <><video src={asset.url} muted playsInline preload="metadata" className="size-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/20"><Play className="size-4 fill-white text-white" /></span></> : <img src={asset.url} alt="" className="size-full object-cover" />}</span></span><span className="w-full truncate text-center text-[11px] font-medium">{reel.user.name.split(' ')[0]}</span></button> : null })}</div></section>
}
