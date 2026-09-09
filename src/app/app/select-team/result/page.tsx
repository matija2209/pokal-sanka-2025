export const instant = false
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllTeamsWithUsers } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { TeamResultReveal } from '@/components/teams'
import type { Metadata } from 'next'
import { getActiveEvent, getSiteBrandParts } from '@/lib/events'
import { Container } from '@/components/layout/container'

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSiteBrandParts()
  return {
    title: 'Tvoja Ekipa',
    description: 'Oglej si svojo izžrebano ekipo in se ji pridruži.',
    robots: 'noindex, nofollow',
    openGraph: {
      title: `Tvoja Ekipa | ${brand}`,
      description: 'Oglej si svojo izžrebano ekipo in se ji pridruži.',
      locale: 'sl_SI',
    },
  }
}


export default async function SelectTeamResultPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>
}) {
  await connection()

  const currentEvent = await getActiveEvent()
  const currentUser = await getCurrentUser(currentEvent?.id)

  if (!currentUser) {
    redirect('/')
  }

  if (currentUser.teamId) {
    redirect('/app/feed')
  }

  const { team: teamId } = await searchParams
  const availableTeams = await getAllTeamsWithUsers()
  const chosenTeam = teamId ? availableTeams.find((t) => t.id === teamId) : undefined

  if (!chosenTeam) {
    redirect('/app/select-team')
  }

  return (
    <Container size="mobile" className="py-4">
      <TeamResultReveal
        currentUserId={currentUser.id}
        team={chosenTeam}
        redirectUrl="/app/feed"
      />
    </Container>
  )
}
