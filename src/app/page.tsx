import { getCurrentUser } from '@/lib/utils/cookies'
import { getCurrentPersonId } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { EntryScreen } from '@/components/entry'
import type { Metadata } from 'next'
import { getActiveEvent, getAllEvents } from '@/lib/events'
import EventSwitcher from '@/components/events/event-switcher'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import { prisma } from '@/lib/prisma/client'

export const metadata: Metadata = {
  title: 'Pokal Šanka - Matija Edition',
  description: 'Pridružite se najbolj zabavnemu turnirju v pitju! Tekmujte s prijatelji, zbirajte točke in pokažite svoje spretnosti v igri Pokal Šanka.',
  keywords: ['turnir', 'pitje', 'igra', 'tekmovanje', 'zabava', 'prijatelji', 'pokal', 'šanka'],
  authors: [{ name: 'Pokal Šanka Team' }],
  creator: 'Pokal Šanka',
  publisher: 'Pokal Šanka',
  robots: 'noindex, nofollow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e293b',
  colorScheme: 'dark light',
  openGraph: {
    title: 'Pokal Šanka - Turnir v Pitju',
    description: 'Najbolj zabaven turnir v pitju! Tekmujte s prijatelji in pokažite svoje spretnosti.',
    type: 'website',
    locale: 'sl_SI',
    siteName: 'Pokal Šanka'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokal Šanka - Turnir v Pitju',
    description: 'Najbolj zabaven turnir v pitju! Tekmujte s prijatelji.'
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg'
  }
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [activeEvent, allEvents] = await Promise.all([
    getActiveEvent(),
    getAllEvents(),
  ])
  const currentUser = await getCurrentUser()
  
  if (currentUser?.teamId) {
    redirect('/players')
  }
  
  if (currentUser && !currentUser.teamId) {
    redirect('/select-team')
  }

  // Fetch existing users for selection
  const existingUsers = await getAllUsersWithTeamAndDrinks()
  const currentPersonId = await getCurrentPersonId()
  const multiEventEnabled = await isMultiEventSchemaAvailable()
  const knownPerson = multiEventEnabled && currentPersonId
    ? await prisma.person.findUnique({
        where: { id: currentPersonId },
      })
    : null
  const existingPeople = multiEventEnabled
    ? await prisma.person.findMany({
        include: {
          users: {
            where: activeEvent ? { eventId: activeEvent.id } : undefined,
            include: {
              team: true,
            },
            take: 1,
          },
        },
        orderBy: {
          name: 'asc',
        },
      }).then(people => people.map(person => ({
        id: person.id,
        name: person.name,
        teamName: person.users[0]?.team?.name ?? null,
        teamColor: person.users[0]?.team?.color ?? null,
      })))
    : []
  
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
        <div className="p-6 pb-12 max-w-lg mx-auto w-full">
          {/* Welcome text */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Dobrodošli!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Pridružite se turnirju in pokažite svoje spretnosti
            </p>
          </div>

          {activeEvent && allEvents.length > 0 && (
            <div className="mb-6 rounded-xl bg-card p-4 shadow-sm border border-border">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Aktivni dogodek</p>
              <EventSwitcher
                events={allEvents}
                currentEventId={activeEvent.id}
                className="w-full bg-secondary text-secondary-foreground"
              />
            </div>
          )}
          
          {/* Entry options */}

            <EntryScreen
              existingUsers={existingUsers}
              existingPeople={existingPeople}
              knownPersonName={knownPerson?.name ?? null}
              activeEventName={activeEvent?.name ?? null}
            />
        </div>
      </div>
    </div>
  )
}
