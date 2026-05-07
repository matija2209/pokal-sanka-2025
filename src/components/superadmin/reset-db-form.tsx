'use client'

import { resetActiveEventData } from '@/app/superadmin/actions'

type ResetDatabaseFormProps = {
  eventName: string
}

export function ResetDatabaseForm({ eventName }: ResetDatabaseFormProps) {
  return (
    <form
      action={resetActiveEventData}
      onSubmit={(e) => {
        if (
          !confirm(
            `Reset ALL data for the event "${eventName}"? Other events will not be affected. This cannot be undone.`,
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black py-4 px-8 rounded-xl transition-colors text-lg shadow-sm"
      >
        🗑️ Reset event data
      </button>
    </form>
  )
}
