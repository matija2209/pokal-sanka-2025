export const instant = false
import { connection } from 'next/server'
import { SightingForm } from '@/components/bachelor/sighting-form'
import { ACTION_TYPES, isActionType } from '@/lib/utils/bachelor-points'
import { Container } from '@/components/layout/container'


type NewSightingPageProps = {
  searchParams?: Promise<{
    action?: string
  }>
}

export default async function NewSightingPage({ searchParams }: NewSightingPageProps) {
  await connection()

  const params = searchParams ? await searchParams : undefined
  const initialAction = params?.action && isActionType(params.action)
    ? params.action
    : ACTION_TYPES.SPOT

  return (
    <div className="min-h-screen bg-background py-8">
      <Container size="mobile">
        <h1 className="text-3xl font-lucky text-center mb-2">Log a Bachelor Moment</h1>
        <p className="text-center text-muted-foreground mb-8">
          Pick the moment, take a photo, share your location, and help track the groom.
        </p>
        <SightingForm initialAction={initialAction} />
      </Container>
    </div>
  )
}
