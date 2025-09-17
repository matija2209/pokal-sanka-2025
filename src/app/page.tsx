import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { EntryScreen } from '@/components/entry'
import type { Metadata } from 'next'

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

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  
  if (currentUser?.teamId) {
    redirect('/players')
  }
  
  if (currentUser && !currentUser.teamId) {
    redirect('/select-team')
  }

  // Fetch existing users for selection
  const existingUsers = await getAllUsersWithTeamAndDrinks()
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full screen logo background */}
      <div className="absolute inset-0">
        <Image 
          src="/logo.jpg"
          alt="Pokal Šanka - Drinking Game"
          fill
          className="object-contain object-center md:object-cover"
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>
      
      {/* Login section at bottom */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end">
        <div className="p-6 pb-12 max-w-lg mx-auto w-full">
          {/* Welcome text */}
          <div className="text-center mb-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shadow-lg">
              Dobrodošli!
            </h1>
            <p className="text-lg md:text-xl text-white/90 text-shadow">
              Pridružite se turnirju in pokažite svoje spretnosti
            </p>
          </div>
          
          {/* Entry options */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <EntryScreen existingUsers={existingUsers} />
          </div>
        </div>
      </div>
    </div>
  )
}
