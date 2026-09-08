'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function ActiveSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name="isActive" value={defaultChecked ? 'true' : 'false'} id="isActiveHidden" />
      <Switch
        id="isActiveSwitch"
        defaultChecked={defaultChecked}
        onCheckedChange={(checked) => {
          const el = document.getElementById('isActiveHidden') as HTMLInputElement
          if (el) el.value = String(checked)
        }}
      />
      <Label htmlFor="isActiveSwitch">Event is active</Label>
    </div>
  )
}
