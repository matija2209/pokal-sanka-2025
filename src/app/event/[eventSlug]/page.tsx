export const instant = false
import { connection } from 'next/server'
import Image from 'next/image'
import Link from 'next/link'
import { getEventBySlug } from '@/lib/events'
import { getCurrentPersonId, getCurrentUser } from '@/lib/utils/cookies'
import { prisma } from '@/lib/prisma/client'
import { EventEntryClient } from './event-entry-client'
import pokalSankaArtwork from '@/assets/pokal-sanka.jpg'


interface Props {
  params: Promise<{ eventSlug: string }>
}

export default async function EventLandingPage({ params }: Props) {
  await connection()

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

  const eventPlayers = await prisma.user.findMany({
    where: { eventId: event.id },
    include: {
      person: {
        select: {
          name: true,
        },
      },
      team: {
        select: {
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  const existingPlayers = eventPlayers.map((player) => ({
    id: player.id,
    name: player.name,
    personName: player.person?.name ?? null,
    profileImageUrl: player.profile_image_url ?? null,
    teamName: player.team?.name ?? null,
    teamColor: player.team?.color ?? null,
  }))

  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden bg-[#16052d] text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {galleryImages.length > 0 ? (
          <div className="absolute inset-0 flex items-center overflow-hidden opacity-55 blur-[2px] scale-105">
            <div className="flex w-max gap-3 [animation:event-gallery-scroll_38s_linear_infinite] motion-reduce:animate-none">
              {[...galleryImages, ...galleryImages].map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative h-[78svh] w-[46vw] max-w-52 shrink-0 overflow-hidden rounded-[1.5rem] bg-violet-950"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(max-width: 430px) 46vw, 198px"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Image
            src={pokalSankaArtwork}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(251,191,36,0.34),transparent_38%),linear-gradient(180deg,rgba(28,8,55,0.46)_0%,rgba(255,250,238,0.94)_40%,rgba(255,247,237,0.97)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col justify-center px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))]">
        <header className="mb-8 text-center">
          <p className="mb-3 inline-flex rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-violet-950 shadow-sm backdrop-blur-sm">
            {event.name}
          </p>
          <h1 className="font-lucky text-[clamp(2.75rem,14vw,4.25rem)] leading-[0.9] tracking-tight text-violet-950 drop-shadow-[0_2px_0_rgba(255,255,255,0.55)]">
            {landingPage.title}
          </h1>
          {landingPage.description && (
            <p className="mx-auto mt-5 max-w-[21rem] whitespace-pre-wrap text-base leading-relaxed text-violet-950/80">
              {landingPage.description}
            </p>
          )}
        </header>

        {currentUser ? (
          <section className="space-y-5 rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-violet-950/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-violet-950/10 bg-violet-100">
                {currentUser.profile_image_url ? (
                  <Image
                    src={currentUser.profile_image_url}
                    alt={currentUser.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-violet-700">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-fuchsia-700">Že prijavljen</p>
                <h2 className="font-roboto text-lg font-bold text-violet-950">
                  Prijavljen si kot {currentUser.name}
                </h2>
                <p className="text-sm leading-snug text-violet-950/70">
                  {currentUser.teamId
                    ? 'Tvoj igralec je pripravljen. Nadaljuj na dogodek.'
                    : 'Tvoj igralec je pripravljen, vendar moraš najprej izbrati ekipo.'}
                </p>
              </div>
            </div>

            <div>
              <Link
                href={currentUser.teamId ? '/app/feed' : '/app/select-team'}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-fuchsia-600 px-5 py-3 text-base font-bold text-white shadow-lg shadow-fuchsia-600/30 transition-[transform,background-color,box-shadow] hover:bg-fuchsia-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-950 active:scale-[0.98]"
              >
                {landingPage.ctaText}
              </Link>
            </div>
          </section>
        ) : (
          <EventEntryClient
            knownPersonName={knownPerson?.name ?? null}
            activeEventName={event.name}
            existingPlayers={existingPlayers}
            returnTo={`/event/${eventSlug}`}
            ctaText={landingPage.ctaText}
          />
        )}
      </div>

      <style>{`
        @keyframes event-gallery-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(calc(-50% - 0.375rem), 0, 0); }
        }
      `}</style>
    </main>
  )
}
