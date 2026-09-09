import { Loader2 } from 'lucide-react'

export default function QuickLogUserLoading() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8" aria-busy="true" aria-live="polite">
      <div className="min-h-64 flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/50 bg-card/50">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground">Nalagam izbiro pijače...</p>
      </div>
    </div>
  )
}
