'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MobileImageInput from '@/components/ui/mobile-image-input'
import { createPostAction } from '@/app/actions'
import { initialDrinkLogActionState } from '@/lib/types/action-states'

export default function CreatePostForm() {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delite objavo s svojo ekipo</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <Textarea
            name="message"
            placeholder="Kaj se dogaja v turnirju..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px]"
            required
          />
          
          <MobileImageInput
            name="post-image"
            label="Dodaj sliko (neobvezno)"
          />

          {state.message && !state.success && (
            <p className="text-red-500 text-sm">{state.message}</p>
          )}

          {state.message && state.success && (
            <p className="text-green-500 text-sm">{state.message}</p>
          )}
          
          <Button 
            type="submit" 
            disabled={!message.trim() || isPending}
            className="w-full"
          >
            {isPending ? 'Objavljam...' : 'Objavi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}