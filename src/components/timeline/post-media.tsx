'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { isVideoUrl } from '@/lib/utils/media'
import { useReels } from './reel-experience'

export type PostMediaAsset = {
  id: string
  url: string
  mediaType: string
}

type Props = {
  assets: PostMediaAsset[]
  legacyUrl?: string | null
  alt: string
  priority?: boolean
  postId?: string
  postKind?: 'post' | 'reel'
}

function isVideo(asset: PostMediaAsset) {
  return asset.mediaType === 'video' || isVideoUrl(asset.url)
}

function Media({ asset, alt, priority = false, controls = true }: { asset: PostMediaAsset; alt: string; priority?: boolean; controls?: boolean }) {
  if (isVideo(asset)) {
    return <video src={asset.url} controls={controls} playsInline preload="metadata" className="size-full object-cover" />
  }

  return <Image src={asset.url} alt={alt} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" priority={priority} />
}

function ReelViewer({ asset, alt, onClose }: { asset: PostMediaAsset; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3" role="dialog" aria-modal="true" aria-label="Celozaslonski medij">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 rounded-full bg-black/50 p-2.5 text-white" aria-label="Zapri">
        <X className="size-5" />
      </button>
      <div className="relative h-full w-full max-w-[min(100%,calc(100dvh*9/16))] overflow-hidden rounded-xl bg-zinc-950">
        {isVideo(asset) ? (
          <video src={asset.url} autoPlay loop controls playsInline className="size-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={alt} className="size-full object-contain" />
        )}
      </div>
    </div>
  )
}

export default function PostMedia({ assets, legacyUrl, alt, priority = false, postId, postKind = 'post' }: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const reels = useReels()
  const slides = assets.length > 0
    ? assets
    : legacyUrl
      ? [{ id: 'legacy-media', url: legacyUrl, mediaType: isVideoUrl(legacyUrl) ? 'video' : 'image' }]
      : []

  useEffect(() => {
    if (!api) return
    const onSelect = () => setActiveIndex(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    return () => { api.off('select', onSelect) }
  }, [api])

  if (slides.length === 0) return null

  if (slides.length === 1) {
    const asset = slides[0]!
    return (
      <>
        <button type="button" onClick={() => postKind === 'reel' && postId ? reels?.openReel(postId) : setViewerOpen(true)} className="relative block aspect-square w-full overflow-hidden bg-muted text-left" aria-label="Odpri celozaslonski prikaz">
          <Media asset={asset} alt={alt} priority={priority} controls={false} />
          {postKind === 'reel' ? <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">Odpri reel</span> : null}
        </button>
        {viewerOpen ? <ReelViewer asset={asset} alt={alt} onClose={() => setViewerOpen(false)} /> : null}
      </>
    )
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-muted">
      <Carousel setApi={setApi} opts={{ loop: false, align: 'start' }} className="size-full [&_[data-slot=carousel-content]]:size-full">
        <CarouselContent className="ml-0 h-full">
          {slides.map((asset, index) => (
            <CarouselItem key={asset.id} className="h-full basis-full pl-0">
              <div className="relative size-full"><Media asset={asset} alt={alt} priority={priority && index === 0} /></div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" aria-hidden>
        {slides.map((asset, index) => <span key={asset.id} className={cn('size-1.5 rounded-full', index === activeIndex ? 'bg-white' : 'bg-white/40')} />)}
      </div>
    </div>
  )
}
