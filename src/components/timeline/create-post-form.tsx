'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
      <CardContent className="p-4">
        {/* User info header */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.profile_image_url || undefined} />
            <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {currentUser?.name || 'Uporabnik'}
            </p>
          </div>
        </div>

        <form id="post-form" action={handleSubmit} className="space-y-3">
          <Textarea
            name="message"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] border-0 bg-gray-50 rounded-2xl resize-none placeholder:text-gray-500 text-base p-4 focus:bg-white focus:ring-1 focus:ring-blue-200"
            required
          />
          
          {state.message && !state.success && (
            <p className="text-red-500 text-sm mt-2">{state.message}</p>
          )}

          {state.message && state.success && (
            <p className="text-green-500 text-sm mt-2">{state.message}</p>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-2 border-t border-gray-100">
        <MobileImageInput
          name="post-image"
          label="Slika"
          className="border-0 p-0 text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer"
        />
        
        <Button 
          type="submit" 
          form="post-form"
          disabled={!message.trim() || isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium"
        >
          {isPending ? 'Objavljam...' : 'Objavi'}
        </Button>
      </CardFooter>
    </Card>
  )
}