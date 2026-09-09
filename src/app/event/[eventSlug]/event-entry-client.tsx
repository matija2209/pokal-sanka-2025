'use client'

import { useState } from 'react'
import { EntryScreen } from '@/components/entry'
import type { ExistingPlayerOption } from '@/components/users/select-existing-user-form'

interface Props {
  knownPersonName: string | null
  activeEventName: string
  returnTo: string
  ctaText: string
  existingPlayers?: ExistingPlayerOption[]
}

export function EventEntryClient({
  knownPersonName,
  activeEventName,
  returnTo,
  ctaText,
  existingPlayers = [],
}: Props) {
  const [showEntry, setShowEntry] = useState(false)

  if (showEntry) {
    return (
      <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-violet-950/20 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setShowEntry(false)}
          className="mb-4 inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-950"
        >
          &larr; Nazaj
        </button>
        <EntryScreen
          knownPersonName={knownPersonName}
          activeEventName={activeEventName}
          existingPlayers={existingPlayers}
          returnTo={returnTo}
        />
      </div>
    )
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => setShowEntry(true)}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-fuchsia-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-fuchsia-600/35 transition-[transform,background-color,box-shadow] hover:bg-fuchsia-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-950 active:scale-[0.98]"
      >
        {ctaText}
      </button>
    </div>
  )
}
