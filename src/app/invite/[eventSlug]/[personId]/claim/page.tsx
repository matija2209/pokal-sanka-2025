import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateUserForm } from '@/components/users'
import PersonClaimForm from '@/components/auth/person-claim-form'
import { prisma } from '@/lib/prisma/client'
import { getEventBySlug, getEventEntryPathBySlug } from '@/lib/events'
import { getUserByPersonAndEvent } from '@/lib/prisma/fetchers/user-fetchers'
import { getCurrentPersonId } from '@/lib/utils/cookies'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'

export const dynamic = 'force-dynamic'

export default async function InviteClaimPage({
  params,
}: {
  params: Promise<{ eventSlug: string; personId: string }>
}) {
  const { eventSlug, personId } = await params

  if (!(await isMultiEventSchemaAvailable())) {
    redirect('/')
  }

  const [event, person, currentPersonId] = await Promise.all([
    getEventBySlug(eventSlug),
    prisma.person.findUnique({ where: { id: personId } }),
    getCurrentPersonId(),
  ])

  if (!event || !person) {
    redirect('/')
  }

  if (currentPersonId !== personId) {
    redirect(`/invite/${eventSlug}/${personId}`)
  }

  const [eventUser, existingAuth] = await Promise.all([
    getUserByPersonAndEvent(personId, event.id),
    prisma.authUser.findFirst({
      where: { personId },
      select: { email: true },
    }),
  ])

  if (eventUser) {
    const redirectPath = getEventEntryPathBySlug(eventSlug) === '/bwsk/enter'
      ? '/bwsk/enter'
      : (eventUser.teamId ? '/app/feed' : '/app/select-team')
    redirect(redirectPath)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link
            href={getEventEntryPathBySlug(eventSlug)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
            Continue as {person.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            You were invited to join <span className="font-semibold text-foreground">{event.name}</span>.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Join without login</CardTitle>
              <CardDescription>
                Keep the current lightweight flow and create your event player first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateUserForm
                knownPersonName={person.name}
                activeEventName={event.name}
                returnTo={getEventEntryPathBySlug(eventSlug)}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <PersonClaimForm
              defaultEmail={existingAuth?.email ?? null}
              eventSlug={eventSlug}
              personId={personId}
              personName={person.name}
            />

            <Card>
              <CardHeader>
                <CardTitle>What this does</CardTitle>
                <CardDescription>
                  Claiming links this person to your Better Auth account so future invite links can recognize you.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  If this person already has an account, use the sign-in tab. If the email is linked to a different
                  person, the claim will be blocked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
