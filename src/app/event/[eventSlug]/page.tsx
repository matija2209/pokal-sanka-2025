import Image from 'next/image'
import Link from 'next/link'
import { getEventBySlug } from '@/lib/events'
import { getCurrentPersonId, getCurrentUser } from '@/lib/utils/cookies'
import { prisma } from '@/lib/prisma/client'
import { EntryScreen } from '@/components/entry'
import { EventEntryClient } from './event-entry-client'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ eventSlug: string }>
}

export default async function EventLandingPage({ params }: Props) {
  const { eventSlug } = await params
  const event = await getEventBySlug(eventSlug)

  if (!event || !event.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-3xl font-bold text-foreground">Event not available</h1>
          <p className="text-muted-foreground">
            This event is either not found or no longer active.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const landingPage = await prisma.eventLandingPage.findUnique({
    where: { eventId: event.id },
  })

  if (!landingPage || !landingPage.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
          <p className="text-muted-foreground">No landing page has been configured for this event yet.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const galleryImages = (landingPage.galleryImages as string[]) ?? []
  const currentUser = await getCurrentUser()
  const currentPersonId = await getCurrentPersonId()
  const knownPerson = currentPersonId
    ? await prisma.person.findUnique({ where: { id: currentPersonId } })
    : null

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground pb-10">
      {galleryImages.length > 0 && (
        <section className="relative overflow-hidden py-4 sm:py-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-24 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max gap-4 sm:gap-6 [animation:event-gallery-scroll_34s_linear_infinite] motion-reduce:animate-none">
            {[...galleryImages, ...galleryImages].map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative h-48 w-36 sm:h-64 sm:w-48 md:h-80 md:w-60 shrink-0 overflow-hidden rounded-[1.75rem] border border-primary/15 bg-muted/30 shadow-xl shadow-primary/10"
              >
                <Image
                  src={url}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 240px"
                  className="object-cover"
                  priority={index < galleryImages.length}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          <style>{`
            @keyframes event-gallery-scroll {
              from { transform: translate3d(0, 0, 0); }
              to { transform: translate3d(calc(-50% - 0.5rem), 0, 0); }
            }
            @media (min-width: 640px) {
              @keyframes event-gallery-scroll {
                from { transform: translate3d(0, 0, 0); }
                to { transform: translate3d(calc(-50% - 0.75rem), 0, 0); }
              }
            }
          `}</style>
        </section>
      )}

      <div className="w-full px-4 pb-8 pt-3 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {landingPage.title}
          </h1>
          {landingPage.description && (
            <div className="mx-auto max-w-2xl space-y-3 text-muted-foreground">
              <p className="text-base md:text-lg whitespace-pre-wrap">{landingPage.description}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-4">Active event: {event.name}</p>
        </div>

        {currentUser ? (
          <div className="rounded-3xl border border-primary/20 bg-card/95 p-6 shadow-xl shadow-primary/10 space-y-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-primary/20 bg-muted">
                {currentUser.profile_image_url ? (
                  <Image
                    src={currentUser.profile_image_url}
                    alt={currentUser.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Already signed in</p>
                <h2 className="text-2xl font-bold text-foreground">
                  You are signed in as {currentUser.name}
                </h2>
                <p className="text-muted-foreground">
                  {currentUser.teamId
                    ? 'Your player is ready. Continue to the event.'
                    : 'Your player is ready, but you need to pick a team first.'}
                </p>
              </div>
            </div>

            <Link
              href={currentUser.teamId ? '/app/feed' : '/app/select-team'}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {landingPage.ctaText}
            </Link>
          </div>
        ) : (
          <EventEntryClient
            knownPersonName={knownPerson?.name ?? null}
            activeEventName={event.name}
            returnTo={`/event/${eventSlug}`}
            ctaText={landingPage.ctaText}
          />
        )}
      </div>
    </div>
  )
}
