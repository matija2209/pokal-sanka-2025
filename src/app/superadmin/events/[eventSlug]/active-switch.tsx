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

export function RandomTeamsSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <input type="hidden" name="isRandomTeams" value={defaultChecked ? 'true' : 'false'} id="isRandomTeamsHidden" />
      <Switch
        id="isRandomTeamsSwitch"
        defaultChecked={defaultChecked}
        onCheckedChange={(checked) => {
          const el = document.getElementById('isRandomTeamsHidden') as HTMLInputElement
          if (el) el.value = String(checked)
        }}
        className="mt-0.5"
      />
      <div>
        <Label htmlFor="isRandomTeamsSwitch" className="font-medium">
          Naključna dodelitev ekip (Random Teams / Kolo sreče)
        </Label>
        <p className="text-xs text-muted-foreground">
          Igralci se ekipi pridružijo preko kolesa sreče (bonding exercise) namesto ročne izbire.
        </p>
      </div>
    </div>
  )
}

export function TriviaSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <input type="hidden" name="isTriviaEnabled" value={defaultChecked ? 'true' : 'false'} id="isTriviaEnabledHidden" />
      <Switch
        id="isTriviaEnabledSwitch"
        defaultChecked={defaultChecked}
        onCheckedChange={(checked) => {
          const el = document.getElementById('isTriviaEnabledHidden') as HTMLInputElement
          if (el) el.value = String(checked)
        }}
        className="mt-0.5"
      />
      <div>
        <Label htmlFor="isTriviaEnabledSwitch" className="font-medium">
          Trivia Modul
        </Label>
        <p className="text-xs text-muted-foreground">
          Omogoči trivia kviz, pravila (/app/trivia/rules), vodenje in točkovanje za ta dogodek.
        </p>
      </div>
    </div>
  )
}

