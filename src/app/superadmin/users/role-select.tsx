'use client'

import { useFormStatus } from 'react-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { updateUserRoleAction } from '../actions'

interface Props {
  userId: string
  currentRole: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? '...' : 'Update'}
    </Button>
  )
}

export function UserRoleSelect({ userId, currentRole }: Props) {
  return (
    <form action={updateUserRoleAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <Select name="role" defaultValue={currentRole}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="superadmin">superadmin</SelectItem>
          <SelectItem value="eventAdmin">eventAdmin</SelectItem>
          <SelectItem value="player">player</SelectItem>
        </SelectContent>
      </Select>
      <SubmitButton />
    </form>
  )
}
