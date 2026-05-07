import { notFound } from 'next/navigation'
import { getSightingById } from '@/lib/prisma/fetchers/sighting-fetchers'
import { SightingSuccess } from '@/components/bachelor/sighting-success'

export const dynamic = 'force-dynamic'

export default async function SightingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sighting = await getSightingById(id)

  if (!sighting) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <SightingSuccess sighting={sighting} />
      </div>
    </div>
  )
}
