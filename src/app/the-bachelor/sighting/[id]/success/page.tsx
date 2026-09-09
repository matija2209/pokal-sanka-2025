export const instant = false
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { getSightingById } from '@/lib/prisma/fetchers/sighting-fetchers'
import { SightingSuccess } from '@/components/bachelor/sighting-success'
import { Container } from '@/components/layout/container'


export default async function SightingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await connection()

  const { id } = await params
  const sighting = await getSightingById(id)

  if (!sighting) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container size="mobile">
        <SightingSuccess sighting={sighting} />
      </Container>
    </div>
  )
}
