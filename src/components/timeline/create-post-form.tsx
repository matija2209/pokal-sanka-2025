'use client'

import { useActionState, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MobileImageInput from '@/components/ui/mobile-image-input'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { upload } from '@vercel/blob/client'
import { compressImage, shouldCompress } from '@/lib/utils/client-image-compression'

interface CreatePostFormProps {
  currentUser?: {
    id: string
    name: string
    profile_image_url?: string | null
  }
}

export default function CreatePostForm({ currentUser }: CreatePostFormProps) {
  const [message, setMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useActionState(createPostAction, initialDrinkLogActionState)
  
  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      setUploadProgress(0)
      
      // Compress image if needed
      let fileToUpload = file
      if (shouldCompress(file)) {
        console.log('Compressing image...')
        fileToUpload = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
        })
      }

      // Upload directly to Vercel Blob
      const blob = await upload(fileToUpload.name, fileToUpload, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: fileToUpload.size > 1024 * 1024, // Use multipart for files > 1MB
        onUploadProgress: (progress) => {
          setUploadProgress(progress.percentage)
        }
      })

      console.log('Image uploaded successfully:', blob.url)
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
      // Handle image upload first if there's an image
      const imageFile = formData.get('post-image') as File
      let imageUrl = ''
      
      if (imageFile && imageFile.size > 0) {
        const uploadedUrl = await handleImageUpload(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      // Create new FormData without the image file (since we uploaded it separately)
      const postData = new FormData()
      postData.append('message', formData.get('message') as string)
      if (imageUrl) {
        postData.append('imageUrl', imageUrl)
      }

      startTransition(async () => {
        await formAction(postData)
        if (state.success) {
          setMessage('')
        }
      })
    } catch (error) {
      console.error('Post submission failed:', error)
    }
  }
  
  const userInitials = currentUser?.name
    ?.split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase() || 'U'

  const placeholder = currentUser?.name 
    ? `Kaj se dogaja, ${currentUser.name.split(' ')[0]}?`
    : 'Kaj se dogaja v turnirju...'

  return (
    <Card className="border-0 shadow-sm ">
      <CardHeader>
        <CardTitle>Objavi</CardTitle>
      </CardHeader>
      <CardContent className="">
        {/* User info header */}
       

<div className='flex flex-col gap-4'>

        <form id="post-form" action={handleSubmit} className="space-y-3">
          <Textarea
            name="message"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] border-0  rounded-2xl resize-none placeholder: text-base p-4 focus: focus:ring-1 focus:ring-blue-200"
            required
          />
          
          <MobileImageInput
            name="post-image"
            label="Slika"
          />
          
          {uploadingImage && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">Compressing and uploading image...</p>
            </div>
          )}

          {state.message && !state.success && (
            <p className="text-red-500 text-sm mt-2">{state.message}</p>
          )}

          {state.message && state.success && (
            <p className="text-green-500 text-sm mt-2">{state.message}</p>
          )}
        </form>
</div>
      </CardContent>
      
      <CardFooter >
       
        <CardAction>
        <Button 
          type="submit" 
          form="post-form"
          disabled={!message.trim() || isPending || uploadingImage}
          className='w-full flex'
        >
          {uploadingImage ? 'Uploading Image...' : isPending ? 'Objavljam...' : 'Objavi'}
        </Button>

        </CardAction>
      </CardFooter>
    </Card>
  )
}