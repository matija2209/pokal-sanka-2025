'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import UserAvatar from '@/components/users/user-avatar'
import MediaPostCapture from './media-post-capture'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { compressImage, shouldCompress } from '@/lib/utils/client-image-compression'
import { formatFileSize, isImageMimeType } from '@/lib/utils/media'

const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024

interface CreatePostFormProps {
  currentUser?: {
    id: string
    name: string
    profile_image_url?: string | null
  }
}

export default function CreatePostForm({ currentUser }: CreatePostFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [showCapture, setShowCapture] = useState(false)

  const uploadMedia = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(`Datoteka je prevelika. Največ ${formatFileSize(MAX_UPLOAD_SIZE_BYTES)}.`)
    }

    let fileToUpload = file
    if (isImageMimeType(file.type) && shouldCompress(file)) {
      fileToUpload = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 })
    }

    const blob = await upload(fileToUpload.name, fileToUpload, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      multipart: fileToUpload.size > 1024 * 1024,
      onUploadProgress: (progress) => onProgress?.(progress.percentage),
    })
    return blob.url
  }

  const publishPost = async (
    caption: string,
    media?: File,
    onProgress?: (progress: number) => void,
  ): Promise<boolean> => {
    const trimmedCaption = caption.trim()
    if (!trimmedCaption && !media) {
      toast.error('Dodaj besedilo ali medij.')
      return false
    }

    setIsPosting(true)
    try {
      const imageUrl = media ? await uploadMedia(media, onProgress) : undefined
      const data = new FormData()
      data.set('message', trimmedCaption)
      data.set('isPrivate', String(isPrivate))
      if (imageUrl) data.set('imageUrl', imageUrl)

      const result = await createPostAction(initialDrinkLogActionState, data)
      if (!result.success) {
        toast.error(result.message || 'Objave ni bilo mogoče ustvariti.')
        return false
      }

      toast.success(result.message || 'Objava uspešno ustvarjena!')
      setMessage('')
      setIsPrivate(true)
      setShowCapture(false)
      router.refresh()
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nalaganje medija ni uspelo.')
      return false
    } finally {
      setIsPosting(false)
    }
  }

  const handleTextSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await publishPost(message)
  }

  const placeholder = `Kaj se dogaja, ${currentUser?.name?.split(' ')[0] || 'ti'}?`

  return (
    <>
      <div className="px-4 py-3">
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <UserAvatar
              user={{ name: currentUser?.name || 'Uporabnik', profile_image_url: currentUser?.profile_image_url }}
              size="md"
              className="mt-1"
            />
            <div className="flex-1">
              <Textarea
                name="message"
                placeholder={placeholder}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-[60px] w-full resize-none border-0 bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
              />
              <div className="mt-2 flex flex-col gap-3 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCapture(true)} disabled={isPosting} className="gap-2 rounded-full">
                    <Camera className="size-4" /> Fotografija ali video
                  </Button>
                  <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(checked === true)} />
                    Private
                  </label>
                </div>
                <Button type="submit" disabled={!message.trim() || isPosting} size="sm" className="w-full rounded-full bg-primary px-6 font-semibold sm:w-auto">
                  {isPosting ? <><Loader2 className="size-4 animate-spin" /> Objavljam …</> : 'Objavi'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      {showCapture ? <MediaPostCapture onClose={() => setShowCapture(false)} onPublish={(file, caption, onProgress) => publishPost(caption, file, onProgress)} /> : null}
    </>
  )
}
