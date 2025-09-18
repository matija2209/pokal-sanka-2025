'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MobileImageInput from '@/components/ui/mobile-image-input'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'
import { getCurrentUser } from '@/lib/utils/cookies'

interface CreatePostFormProps {
  currentUser?: {
    id: string
    name: string
    profile_image_url?: string | null
  }
}

export default function CreatePostForm({ currentUser }: CreatePostFormProps) {
  const [message, setMessage] = useState('')
  const [state, formAction, isPending] = useActionState(createPostAction, initialDrinkLogActionState)
  
  const handleSubmit = async (formData: FormData) => {
    // Log form data for debugging
    console.log('Form data entries:')
    for (const [key, value] of formData.entries()) {
      console.log(key, value)
    }
    
    await formAction(formData)
    if (state.success) {
      setMessage('')
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
    <Card className="border-0 shadow-sm bg-white">
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
            className="min-h-[100px] border-0 bg-gray-50 rounded-2xl resize-none placeholder:text-gray-500 text-base p-4 focus:bg-white focus:ring-1 focus:ring-blue-200"
            required
          />
          
          <MobileImageInput
            name="post-image"
            label="Slika"
          />
          
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
          disabled={!message.trim() || isPending}
          className='w-full flex'
        >
          {isPending ? 'Objavljam...' : 'Objavi'}
        </Button>

        </CardAction>
      </CardFooter>
    </Card>
  )
}