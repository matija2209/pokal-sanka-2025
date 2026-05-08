'use client'

import { resetBachelorEventData } from '@/app/superadmin/bachelor/actions'

type ResetBachelorDataFormProps = {
  eventName: string
}

export function ResetBachelorDataForm({ eventName }: ResetBachelorDataFormProps) {
  return (
    <form
      action={resetBachelorEventData}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete all data for "${eventName}"? This clears sightings, hype, trivia, teams, users, posts, drink logs, and commentary for the bachelor event only. This cannot be undone.`,
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="w-full sm:w-auto bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 font-black py-4 px-8 rounded-xl transition-colors text-lg shadow-sm"
      >
        Delete bachelor event data
      </button>
    </form>
  )
}
