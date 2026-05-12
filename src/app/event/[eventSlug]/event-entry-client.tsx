'use client'

import { useState } from 'react'
import { EntryScreen } from '@/components/entry'

interface Props {
  knownPersonName: string | null
  activeEventName: string
  returnTo: string
  ctaText: string
}

export function EventEntryClient({ knownPersonName, activeEventName, returnTo, ctaText }: Props) {
  const [showEntry, setShowEntry] = useState(false)

  if (showEntry) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowEntry(false)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
        <EntryScreen
          knownPersonName={knownPersonName}
          activeEventName={activeEventName}
          returnTo={returnTo}
        />
      </div>
    )
  }

  return (
    <div className="text-center">
      <button
        onClick={() => setShowEntry(true)}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
      >
        {ctaText}
      </button>
    </div>
  )
}
