'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { ArrowLeft, ArrowRight, Camera, ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import UserAvatar from '@/components/users/user-avatar'
import MediaPostCapture from './media-post-capture'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { compressImage, shouldCompress } from '@/lib/utils/client-image-compression'
import { formatFileSize, isImageMimeType, isVideoMimeType } from '@/lib/utils/media'

const MAX_ASSETS = 10
const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024
const MAX_TOTAL_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024

interface CreatePostFormProps {
  currentUser?: { id: string; name: string; profile_image_url?: string | null }
}

type UploadedAsset = { url: string; mediaType: 'image' | 'video'; size: number }

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function MediaPreview({ file, alt }: { file: File; alt: string }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!previewUrl) return null
  if (isVideoMimeType(file.type)) return <video src={previewUrl} className="size-full object-cover" muted />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={previewUrl} alt={alt} className="size-full object-cover" />
}

export default function CreatePostForm({ currentUser }: CreatePostFormProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [showCapture, setShowCapture] = useState(false)

  const appendFiles = (incoming: File[]) => {
    const validFiles = incoming.filter((file) => isImageMimeType(file.type) || isVideoMimeType(file.type))
    if (validFiles.length !== incoming.length) {
      toast.error('Izberi samo fotografije ali videe.')
      return false
    }
    if (validFiles.some((file) => file.size > MAX_UPLOAD_SIZE_BYTES)) {
      toast.error(`Posamezna datoteka je lahko velika največ ${formatFileSize(MAX_UPLOAD_SIZE_BYTES)}.`)
      return false
    }
    const next = [...files, ...validFiles]
    if (next.length > MAX_ASSETS) {
      toast.error(`Objava lahko vsebuje največ ${MAX_ASSETS} medijev.`)
      return false
    }
    if (next.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_UPLOAD_SIZE_BYTES) {
      toast.error(`Mediji skupaj lahko zasedejo največ ${formatFileSize(MAX_TOTAL_UPLOAD_SIZE_BYTES)}.`)
      return false
    }
    setFiles(next)
    return true
  }

  const uploadMedia = async (file: File): Promise<UploadedAsset> => {
    let fileToUpload = file
    if (isImageMimeType(file.type) && shouldCompress(file)) {
      fileToUpload = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 })
    }
    const blob = await upload(fileToUpload.name, fileToUpload, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      multipart: fileToUpload.size > 1024 * 1024,
    })
    return { url: blob.url, mediaType: isVideoMimeType(fileToUpload.type) ? 'video' : 'image', size: fileToUpload.size }
  }

  const publishPost = async () => {
    const trimmedCaption = message.trim()
    if (!trimmedCaption && files.length === 0) {
      toast.error('Dodaj besedilo ali medij.')
      return
    }
    setIsPosting(true)
    try {
      const uploaded: UploadedAsset[] = []
      for (const [index, file] of files.entries()) {
        uploaded.push(await uploadMedia(file))
        if (index + 1 < files.length) toast.message(`Naložen ${index + 1}/${files.length} medijev`)
      }
      const data = new FormData()
      data.set('message', trimmedCaption)
      data.set('assets', JSON.stringify(uploaded))
      const result = await createPostAction(initialDrinkLogActionState, data)
      if (!result.success) {
        toast.error(result.message || 'Objave ni bilo mogoče ustvariti.')
        return
      }
      toast.success(result.message || 'Objava uspešno ustvarjena!')
      setMessage('')
      setFiles([])
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nalaganje medija ni uspelo.')
    } finally {
      setIsPosting(false)
    }
  }

  const moveFile = (index: number, offset: -1 | 1) => {
    setFiles((current) => {
      const target = index + offset
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target]!, next[index]!]
      return next
    })
  }

  return (
    <>
      <div className="px-4 py-2">
        <form onSubmit={(event) => { event.preventDefault(); void publishPost() }} className="space-y-2">
          <div className="flex items-start gap-3">
            <UserAvatar user={{ name: currentUser?.name || 'Uporabnik', profile_image_url: currentUser?.profile_image_url }} size="md" />
            <div className="min-w-0 flex-1">
              <Textarea placeholder={`Kaj se dogaja, ${currentUser?.name?.split(' ')[0] || 'ti'}?`} value={message} onChange={(event) => setMessage(event.target.value)} rows={1} className="max-h-36 min-h-10 w-full resize-none overflow-y-auto border-0 bg-transparent px-0 py-2 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0" />
              {files.length > 0 ? <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {files.map((file, index) => {
                  return <div key={fileKey(file)} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <MediaPreview file={file} alt={`Medij ${index + 1}`} />
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{index + 1}</span>
                    <button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white" aria-label={`Odstrani medij ${index + 1}`}><X className="size-3" /></button>
                    <div className="absolute bottom-1.5 left-1.5 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <button type="button" disabled={index === 0} onClick={() => moveFile(index, -1)} className="rounded-full bg-black/60 p-1 text-white disabled:opacity-30" aria-label="Premakni levo"><ArrowLeft className="size-3" /></button>
                      <button type="button" disabled={index === files.length - 1} onClick={() => moveFile(index, 1)} className="rounded-full bg-black/60 p-1 text-white disabled:opacity-30" aria-label="Premakni desno"><ArrowRight className="size-3" /></button>
                    </div>
                  </div>
                })}
              </div> : null}
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCapture(true)} disabled={isPosting || files.length >= MAX_ASSETS} className="gap-2 rounded-full"><Camera className="size-4" /> Kamera</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isPosting || files.length >= MAX_ASSETS} className="gap-2 rounded-full"><ImagePlus className="size-4" /> Galerija</Button>
                  <span className="text-xs text-muted-foreground">{files.length}/{MAX_ASSETS}</span>
                </div>
                <Button type="submit" disabled={(!message.trim() && files.length === 0) || isPosting} size="sm" className="rounded-full bg-primary px-6 font-semibold">{isPosting ? <><Loader2 className="size-4 animate-spin" /> Objavljam …</> : 'Objavi'}</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(event) => { appendFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = '' }} />
      {showCapture ? <MediaPostCapture onClose={() => setShowCapture(false)} onPublish={async (file) => { const added = appendFiles([file]); if (added) setShowCapture(false); return added }} /> : null}
    </>
  )
}
