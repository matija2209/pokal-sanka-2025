import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { EntryScreen } from '@/components/entry'
import { getCurrentPersonId, getCurrentUser } from '@/lib/utils/cookies'
import { DEFAULT_BACHELOR_EVENT_SLUG, getActiveEvent, getEventBySlug } from '@/lib/events'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { isMultiEventSchemaAvailable } from '@/lib/prisma/schema-capabilities'
import { prisma } from '@/lib/prisma/client'
import bachelorImage1 from '../../the-bachelor/bostjan-pecar.jpg'
import bachelorImage2 from '../../the-bachelor/bostjan-pecar-2.jpg'
import bachelorImage3 from '../../the-bachelor/bostjan-pecar-3.jpg'
import bachelorImage4 from '../../the-bachelor/bostjan-pecar-4.jpg'
import bachelorImage5 from '../../the-bachelor/bostjan-pecar-5.jpg'

export const dynamic = 'force-dynamic'

export default async function BwskEntryPage() {
  const bachelorGallery = [
    { src: bachelorImage1, alt: 'Portret Boštjana Pečarja za fantovščino 1' },
    { src: bachelorImage2, alt: 'Portret Boštjana Pečarja za fantovščino 2' },
    { src: bachelorImage3, alt: 'Portret Boštjana Pečarja za fantovščino 3' },
    { src: bachelorImage4, alt: 'Portret Boštjana Pečarja za fantovščino 4' },
    { src: bachelorImage5, alt: 'Portret Boštjana Pečarja za fantovščino 5' },
  ]

  const bachelorEvent = await getEventBySlug(DEFAULT_BACHELOR_EVENT_SLUG)
  const activeEvent = await getActiveEvent()

  if (!bachelorEvent || !bachelorEvent.isActive) {
    redirect('/bwsk/inactive')
  }

  if (!activeEvent || activeEvent.id !== bachelorEvent.id) {
    redirect('/bwsk/resolve')
  }

  const currentUser = await getCurrentUser()
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
            where: { eventId: bachelorEvent.id },
            include: { team: true },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }).then(people => people.map(person => ({
        id: person.id,
        name: person.name,
        teamName: person.users[0]?.team?.name ?? null,
        teamColor: person.users[0]?.team?.color ?? null,
      })))
    : []

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground pb-10">
      <section className="relative overflow-hidden py-4 sm:py-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max gap-4 sm:gap-6 [animation:bwsk-gallery-scroll_34s_linear_infinite] motion-reduce:animate-none">
          {[...bachelorGallery, ...bachelorGallery].map((image, index) => (
            <div
              key={`${image.alt}-${index}`}
              className="relative h-48 w-36 sm:h-64 sm:w-48 md:h-80 md:w-60 shrink-0 overflow-hidden rounded-[1.75rem] border border-primary/15 bg-muted/30 shadow-xl shadow-primary/10"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 240px"
                className="object-cover"
                priority={index < bachelorGallery.length}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <style>{`
          @keyframes bwsk-gallery-scroll {
            from {
              transform: translate3d(0, 0, 0);
            }
            to {
              transform: translate3d(calc(-50% - 0.5rem), 0, 0);
            }
          }

          @media (min-width: 640px) {
            @keyframes bwsk-gallery-scroll {
              from {
                transform: translate3d(0, 0, 0);
              }
              to {
                transform: translate3d(calc(-50% - 0.75rem), 0, 0);
              }
            }
          }
        `}</style>
      </section>

      <div className="w-full px-4 pb-8 pt-3 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Boštjan Pečar Bachelor 2026</h1>
          <div className="mx-auto max-w-2xl space-y-3 text-muted-foreground">
            <p className="text-lg md:text-xl font-medium text-foreground">Pozdravljen, dragi prijatelj!</p>
            <p className="text-base md:text-lg">
              Izbran si bil, da se pridružiš fantovščini našega dragega prijatelja Boštjana - znanega pod
              številnimi vzdevki: Bošto, Pečo, Bwšk, Berštrukelj, AppleMan ... in zagotovo bi se našel še kakšen.
            </p>
            <p className="text-base md:text-lg">Pridruži se dogodivščini, ki je ne bomo pozabili.</p>
            <p className="text-sm md:text-base">Aktivni dogodek: {bachelorEvent.name}</p>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-muted/20 shadow-xl shadow-primary/10">
          <video
            className="h-auto w-full object-cover"
            src="/bwsk/video"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
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
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Že prijavljen</p>
              <h2 className="text-2xl font-bold text-foreground">Trenutno si prijavljen kot {currentUser.name}</h2>
              <p className="text-muted-foreground">
                {currentUser.teamId
                  ? 'Tvoj igralec je pripravljen. Nadaljuj v dogajanje fantovščine.'
                  : 'Tvoj igralec je pripravljen, vendar moraš pred vstopom v aplikacijo izbrati ekipo.'}
              </p>
            </div>
            </div>

            <div>
              <Link
                href={currentUser.teamId ? '/app/feed' : '/app/select-team'}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Pridruži se
              </Link>
            </div>
          </div>
        ) : (
          <EntryScreen
            existingUsers={existingUsers}
            existingPeople={existingPeople}
            knownPersonName={knownPerson?.name ?? null}
            activeEventName={bachelorEvent.name}
            returnTo="/bwsk/enter"
          />
        )}
      </div>
    </div>
  )
}
