'use client'

import { upload } from '@vercel/blob/client'
import { Pause, Play, Plus, Volume2, VolumeX, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [captureOpen, setCaptureOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file])

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const selectVideo = (candidate: File | null) => {
    if (!candidate) return
    if (!candidate.type.startsWith('video/')) return toast.error('Izberi video za reel.')
    if (candidate.size > 100 * 1024 * 1024) return toast.error('Video je lahko velik največ 100 MB.')
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
      data.set('assets', JSON.stringify([{ url: blob.url, mediaType: 'video', size: file.size }]))
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

  if (captureOpen) return <MediaPostCapture videoOnly onClose={() => setCaptureOpen(false)} onPublish={async (video) => { selectVideo(video); setCaptureOpen(false); return true }} />

  return (
    <div className="fixed inset-0 z-[110] flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Ustvari reel">
      <div className="w-full rounded-t-3xl bg-card p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Ustvari reel</h2><p className="text-sm text-muted-foreground">En video, neobvezen opis.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Zapri"><X /></Button></div>
        {file && previewUrl ? <div className="relative mb-4 aspect-[9/16] max-h-[50vh] overflow-hidden rounded-2xl bg-black"><video src={previewUrl} controls playsInline className="size-full object-contain" /><Button variant="secondary" size="sm" onClick={() => setFile(null)} className="absolute right-3 top-3">Zamenjaj</Button></div> : <div className="mb-4 flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40"><p className="text-sm text-muted-foreground">Izberi ali posnemi video</p><div className="flex gap-2"><Button onClick={() => setCaptureOpen(true)}>Kamera</Button><Button variant="outline" onClick={() => inputRef.current?.click()}>Galerija</Button></div></div>}
        <Textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Dodaj opis …" className="mb-4" />
        <Button className="w-full" disabled={!file || isPublishing} onClick={() => void publish()}>{isPublishing ? 'Objavljam …' : 'Objavi reel'}</Button>
        <input ref={inputRef} type="file" accept="video/*" className="sr-only" onChange={(event) => { selectVideo(event.target.files?.[0] ?? null); event.currentTarget.value = '' }} />
      </div>
    </div>
  )
}

function ReelViewer({ reels, initialId, onClose }: { reels: Reel[]; initialId: string; onClose: () => void }) {
  const start = Math.max(0, reels.findIndex((reel) => reel.id === initialId))
  const [index, setIndex] = useState(start)
  const [paused, setPaused] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [progress, setProgress] = useState(0)
  const reel = reels[index]
  const video = reel?.assets[0]
  const goNext = useCallback(() => { setProgress(0); setPaused(false); setSoundOn(false); setIndex((value) => value >= reels.length - 1 ? (onClose(), value) : value + 1) }, [onClose, reels.length])
  const goPrev = useCallback(() => { setProgress(0); setPaused(false); setSoundOn(false); setIndex((value) => Math.max(0, value - 1)) }, [])

  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous } }, [])
  useEffect(() => { const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); else if (event.key === 'ArrowRight') goNext(); else if (event.key === 'ArrowLeft') goPrev(); else if (event.key === ' ') { event.preventDefault(); setPaused((value) => !value) } }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener) }, [goNext, goPrev, onClose])

  if (!reel || !video) return null
  return <div className="fixed inset-0 z-[120] bg-black text-white" role="dialog" aria-modal="true" aria-label="Reel predvajalnik">
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.55),transparent_30%,rgba(0,0,0,.6))]" />
    <div className="relative mx-auto flex h-full w-full max-w-[min(100%,calc(100dvh*9/16))] flex-col">
      <div className="z-10 px-3 pt-[max(1rem,env(safe-area-inset-top))]"><div className="mb-4 flex gap-1">{reels.map((item, itemIndex) => <span key={item.id} className="h-1 flex-1 overflow-hidden rounded bg-white/25"><span className="block h-full bg-white" style={{ width: itemIndex < index ? '100%' : itemIndex === index ? `${progress}%` : '0%' }} /></span>)}</div><div className="flex items-center justify-between"><div><p className="font-semibold">{reel.user.name}</p><p className="text-xs text-white/70">{index + 1} / {reels.length}</p></div><Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={onClose} aria-label="Zapri"><X /></Button></div></div>
      <button type="button" className="absolute inset-y-20 left-0 z-10 w-1/3" onClick={goPrev} aria-label="Prejšnji reel" /><button type="button" className="absolute inset-y-20 right-0 z-10 w-1/3" onClick={goNext} aria-label="Naslednji reel" />
      <div className="relative flex flex-1 items-center justify-center" onPointerDown={(event) => { if (!(event.target as HTMLElement).closest('button')) setPaused(true) }} onPointerUp={() => setPaused(false)} onPointerCancel={() => setPaused(false)}><video key={reel.id} src={video.url} muted={!soundOn} autoPlay={!paused} playsInline preload="metadata" onEnded={goNext} onTimeUpdate={(event) => { const target = event.currentTarget; if (target.duration) setProgress((target.currentTime / target.duration) * 100) }} ref={(node) => { if (node) { node.muted = !soundOn; if (paused) node.pause(); else void node.play().catch(() => {}) } }} className="size-full object-contain" /></div>
      <div className="z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><div className="flex items-end justify-between gap-3 rounded-3xl bg-black/40 p-3 backdrop-blur"><p className="min-w-0 text-sm">{reel.message || 'Brez opisa'}</p><div className="flex gap-2"><Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Nadaljuj' : 'Začasno ustavi'}>{paused ? <Play /> : <Pause />}</Button><Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? 'Izklopi zvok' : 'Vklopi zvok'}>{soundOn ? <Volume2 /> : <VolumeX />}</Button></div></div></div>
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
  return <section className="border-b border-border/50 bg-background py-2.5"><div className="flex gap-3 overflow-x-auto px-4 scrollbar-none"><button type="button" onClick={context?.openComposer} className="flex w-[72px] shrink-0 flex-col items-center gap-1"><span className="relative grid size-[66px] place-items-center rounded-full border border-border bg-muted text-lg font-semibold">{currentUser.name.slice(0, 1).toUpperCase()}<span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full bg-primary text-white ring-2 ring-background"><Plus className="size-3.5" /></span></span><span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground">Tvoja zgodba</span></button>{reels.slice(0, 10).map((reel) => { const asset = reel.assets[0]; return asset ? <button key={reel.id} type="button" onClick={() => context?.openReel(reel.id)} className="flex w-[72px] shrink-0 flex-col items-center gap-1" aria-label={`Odpri reel uporabnika ${reel.user.name}`}><span className="rounded-full bg-gradient-to-tr from-fuchsia-500 via-orange-400 to-amber-300 p-[2.5px]"><span className="relative block size-[61px] overflow-hidden rounded-full border-2 border-background bg-black"><video src={asset.url} muted playsInline preload="metadata" className="size-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/20"><Play className="size-4 fill-white text-white" /></span></span></span><span className="w-full truncate text-center text-[11px] font-medium">{reel.user.name.split(' ')[0]}</span></button> : null })}</div></section>
}
