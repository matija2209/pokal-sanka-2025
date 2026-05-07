import { SightingForm } from '@/components/bachelor/sighting-form'

export const dynamic = 'force-dynamic'

export default function NewSightingPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-lucky text-center mb-2">Log a Sighting</h1>
        <p className="text-center text-muted-foreground mb-8">
          Take a photo, share your location, and help track the groom.
        </p>
        <SightingForm />
      </div>
    </div>
  )
}
