export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getCurrentPersonId } from '@/lib/utils/cookies'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { HomeEntryFlow } from '@/components/entry'
import type { Metadata } from 'next'
import { getActiveEvent, getAllEvents, getSiteBrandParts } from '@/lib/events'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import { prisma } from '@/lib/prisma/client'

export async function generateMetadata(): Promise<Metadata> {
  const { brand, eventName } = await getSiteBrandParts()
  const ogTitle = `${brand} — Turnir v Pitju`
  return {
    title: brand,
    description: `Pridružite se najbolj zabavnemu turnirju v pitju (${eventName})! Tekmujte s prijatelji, zbirajte točke in pokažite svoje spretnosti v igri Pokal Šanka.`,
    keywords: ['turnir', 'pitje', 'igra', 'tekmovanje', 'zabava', 'prijatelji', 'pokal', 'šanka'],
    authors: [{ name: 'Pokal Šanka Team' }],
    creator: 'Pokal Šanka',
    publisher: 'Pokal Šanka',
    robots: 'noindex, nofollow',
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#1e293b',
    colorScheme: 'dark light',
    openGraph: {
      title: ogTitle,
      description: `Najbolj zabaven turnir v pitju (${eventName})! Tekmujte s prijatelji in pokažite svoje spretnosti.`,
      type: 'website',
      locale: 'sl_SI',
      siteName: 'Pokal Šanka',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: `Najbolj zabaven turnir v pitju! Tekmujte s prijatelji.`,
    },
    icons: {
      icon: '/logo.jpg',
      apple: '/logo.jpg',
    },
  }
}


export default async function HomePage() {
  await connection()

  const [activeEvent, allEvents] = await Promise.all([
    getActiveEvent(),
    getAllEvents(),
  ])
  const currentUser = await getCurrentUser()
  
  if (currentUser?.teamId) {
    redirect('/app/feed')
  }
  
  if (currentUser && !currentUser.teamId) {
    redirect('/app/select-team')
  }

  const currentPersonId = await getCurrentPersonId()
  const multiEventEnabled = await isMultiEventSchemaAvailable()
  const knownPerson = multiEventEnabled && currentPersonId
    ? await prisma.person.findUnique({
        where: { id: currentPersonId },
      })
    : null

  const eventPlayers = activeEvent
    ? await prisma.user.findMany({
        where: { eventId: activeEvent.id },
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
    : []

  const existingPlayers = eventPlayers.map((player) => ({
    id: player.id,
    name: player.name,
    personName: player.person?.name ?? null,
    profileImageUrl: player.profile_image_url ?? null,
    teamName: player.team?.name ?? null,
    teamColor: player.team?.color ?? null,
  }))

  const eventIds = allEvents.map((event) => event.id)
  const [playerCountsByEvent, activeLandingPages] = eventIds.length > 0
    ? await Promise.all([
        prisma.user.groupBy({
          by: ['eventId'],
          where: { eventId: { in: eventIds } },
          _count: { _all: true },
        }),
        prisma.eventLandingPage.findMany({
          where: { eventId: { in: eventIds }, isActive: true },
          select: { eventId: true },
        }),
      ])
    : [[], []]

  const playerCounts = Object.fromEntries(
    playerCountsByEvent.map((entry) => [entry.eventId, entry._count._all])
  )
  const landingPageEventIds = activeLandingPages.map((entry) => entry.eventId)

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      {/* Full screen logo background */}
      <div className="absolute inset-0">
        <Image 
          src="/logo.jpg"
          alt="Pokal Šanka - Drinking Game"
          fill
          className="object-contain object-top"
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
      
      {/* Login section at bottom */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end">
        <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          {/* Welcome text */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Dobrodošli!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Pridružite se turnirju in pokažite svoje spretnosti
            </p>
          </div>

          {activeEvent && allEvents.length > 0 ? (
            <HomeEntryFlow
              events={allEvents}
              activeEvent={activeEvent}
              playerCounts={playerCounts}
              landingPageEventIds={landingPageEventIds}
              existingPlayers={existingPlayers}
              knownPersonName={knownPerson?.name ?? null}
            />
          ) : (
            <p className="text-center text-muted-foreground">
              Trenutno ni aktivnih dogodkov.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
