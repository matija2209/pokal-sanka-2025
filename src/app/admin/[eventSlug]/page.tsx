export const instant = false
import { connection } from 'next/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma/client'
import { Button } from '@/components/ui/button'
import { EventLandingPageForm } from '@/components/admin/event-landing-page-form'
import { upsertEventLandingPageAction } from '@/lib/actions/event-actions'


interface Props {
  params: Promise<{ eventSlug: string }>
}

export default async function AdminEventPage({ params }: Props) {
  await connection()

  const { eventSlug } = await params

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { landingPage: true },
  })

  if (!event) {
    notFound()
  }

  const landingPage = event.landingPage
    ? {
        title: event.landingPage.title,
        description: event.landingPage.description,
        galleryImages: event.landingPage.galleryImages as string[],
        ctaText: event.landingPage.ctaText,
      }
    : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">&larr; Back to Events</Link>
        </Button>
      </div>

      <EventLandingPageForm event={event} landingPage={landingPage} action={upsertEventLandingPageAction} backUrl="/admin" />
    </div>
  )
}
