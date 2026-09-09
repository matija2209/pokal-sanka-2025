export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeams, getUserWithTeamAndDrinksById } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { UserProfile, UserHistory } from '@/components/users'
import { TeamLogoForm } from '@/components/teams'
import UserMenu from '@/components/layout/user-menu'
import type { Metadata } from 'next'
import { getSiteBrandParts, getActiveEvent, getAllEvents } from '@/lib/events'
import { Container } from '@/components/layout/container'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Moj Profil',
    description:
      'Vaš osebni profil v Pokal Šanka turnirju. Upravljajte svoj račun, nastavitve profila in ekipo.',
    keywords: ['profil', 'nastavitve', 'ekipa', 'uporabnik', 'upravljanje'],
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Moj Profil | ${brand}`,
      description: 'Upravljanje osebnega profila in nastavitev.',
      locale: 'sl_SI',
    },
  }
}


export default async function ProfilePage() {
  await connection()

  const activeEvent = await getActiveEvent()
  const currentUser = await getCurrentUser(activeEvent?.id)
  
  if (!activeEvent || !currentUser) {
    redirect('/')
  }

  const [availableTeams, currentUserWithDrinks, availableEvents] = await Promise.all([
    getAllTeams(),
    getUserWithTeamAndDrinksById(currentUser.id, activeEvent.id),
    getAllEvents(),
  ])
  
  return (
    <Container size="mobile" className="py-6">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
          Moj Profil
        </h1>
        <p className="text-muted-foreground">
          Prilagodite svojo izkušnjo in upravljajte nastavitve ekipe.
        </p>
      </div>

      <div className="space-y-8">
        <UserProfile
          currentUser={currentUser}
          availableTeams={availableTeams}
        />

        {currentUser.team && (
          <TeamLogoForm currentUser={currentUser} />
        )}

        {currentUserWithDrinks && (
          <UserHistory user={currentUserWithDrinks} limit={15} />
        )}

        <div className="flex justify-center pt-2">
          <UserMenu
            currentUser={currentUser}
            currentEvent={activeEvent}
            availableEvents={availableEvents}
          />
        </div>
      </div>
    </Container>
  )
}
