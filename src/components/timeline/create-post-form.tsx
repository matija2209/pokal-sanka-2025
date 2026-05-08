'use client'

import { useActionState, useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MobileImageInput from '@/components/ui/mobile-image-input'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { upload } from '@vercel/blob/client'
import { compressImage, shouldCompress } from '@/lib/utils/client-image-compression'
import { toast } from 'sonner'
import UserAvatar from '@/components/users/user-avatar'
import { Checkbox } from '@/components/ui/checkbox'

interface CreatePostFormProps {
  currentUser?: {
    id: string
    name: string
    profile_image_url?: string | null
  }
}

export default function CreatePostForm({ currentUser }: CreatePostFormProps) {
  const [message, setMessage] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useActionState(createPostAction, initialDrinkLogActionState)
  
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'Objava uspešno ustvarjena!')
      setMessage('')
      setIsPrivate(true)
    } else if (state.message && !state.success) {
      toast.error(state.message)
    }
  }, [state.success, state.message])
  
  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      setUploadProgress(0)
      
      let fileToUpload = file
      if (shouldCompress(file)) {
        fileToUpload = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
        })
      }

      const blob = await upload(fileToUpload.name, fileToUpload, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: fileToUpload.size > 1024 * 1024,
        onUploadProgress: (progress) => {
          setUploadProgress(progress.percentage)
        }
      })

      return blob.url
    } catch (error) {
      console.error('Image upload failed:', error)
      return null
    } finally {
      setUploadingImage(false)
      setUploadProgress(0)
    }
  }
  
  const handleSubmit = async (formData: FormData) => {
    try {
      const imageFile = formData.get('post-image') as File
      let imageUrl = ''
      
      if (imageFile && imageFile.size > 0) {
        const uploadedUrl = await handleImageUpload(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const postData = new FormData()
      postData.append('message', formData.get('message') as string)
      postData.append('isPrivate', String(isPrivate))
      if (imageUrl) {
        postData.append('imageUrl', imageUrl)
      }

      startTransition(async () => {
        await formAction(postData)
      })
    } catch (error) {
      console.error('Post submission failed:', error)
    }
  }
  
  const placeholder = `Kaj se dogaja, ${currentUser?.name?.split(' ')[0] || 'ti'}?`

  return (
    <div className="px-4 py-3">
      <form id="post-form" action={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <UserAvatar
            user={{
              name: currentUser?.name || 'Uporabnik',
              profile_image_url: currentUser?.profile_image_url,
            }}
            size="md"
            className="mt-1"
          />
          <div className="flex-1">
            <Textarea
              name="message"
              placeholder={placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[60px] w-full border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 resize-none"
              required
            />
            
            <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-3">
              <div className="flex items-center gap-4">
                <MobileImageInput
                  name="post-image"
                  label="Fotografija"
                  variant="compact"
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked === true)}
                  />
                  Private
                </label>
              </div>
              <Button 
                type="submit"
                disabled={!message.trim() || isPending || uploadingImage}
                size="sm"
                className="rounded-full bg-primary font-semibold px-6"
              >
                {uploadingImage ? 'Nalaganje...' : isPending ? 'Objavljanje...' : 'Objavi'}
              </Button>
            </div>
          </div>
        </div>

        {uploadingImage && (
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Priprava slike...</span>
              <span className="text-xs font-bold text-primary">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

