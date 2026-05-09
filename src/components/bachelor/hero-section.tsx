import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'
import Image from 'next/image'
import bachelorImage1 from '@/app/the-bachelor/bostjan-pecar.jpg'
import bachelorImage2 from '@/app/the-bachelor/bostjan-pecar-2.jpg'
import bachelorImage3 from '@/app/the-bachelor/bostjan-pecar-3.jpg'
import bachelorImage4 from '@/app/the-bachelor/bostjan-pecar-4.jpg'
import bachelorImage5 from '@/app/the-bachelor/bostjan-pecar-5.jpg'

const gallery = [
  { src: bachelorImage1, alt: 'Boštjan Pečar portrait 1' },
  { src: bachelorImage2, alt: 'Boštjan Pečar portrait 2' },
  { src: bachelorImage3, alt: 'Boštjan Pečar portrait 3' },
  { src: bachelorImage4, alt: 'Boštjan Pečar portrait 4' },
  { src: bachelorImage5, alt: 'Boštjan Pečar portrait 5' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-end pb-12 sm:pb-20 overflow-hidden">
      {/* Rotating gallery background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-stone-50 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-stone-50 to-transparent sm:w-24" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-50/70 to-stone-50/20 z-[5]" />

        <div className="flex w-max gap-3 sm:gap-6 [animation:hero-gallery-scroll_34s_linear_infinite] motion-reduce:animate-none">
          {[...gallery, ...gallery].map((image, index) => (
            <div
              key={`${image.alt}-${index}`}
              className="relative h-[70vh] w-44 shrink-0 overflow-hidden rounded-[1.25rem] border border-amber-200/70 bg-white shadow-lg shadow-amber-950/10 sm:h-[80vh] sm:w-56 sm:rounded-[1.75rem] sm:shadow-xl md:h-[85vh] md:w-72"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 176px, (max-width: 768px) 224px, 288px"
                className="object-cover"
                priority={index < gallery.length}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium mb-4">
          He's getting married
        </span>

        <h1 className="text-5xl sm:text-7xl font-lucky mb-3 tracking-tight leading-tight">
          Boštjan
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Our friend from Slovenia is getting married, and we're in Malta for his bachelor trip.
          Spot him, snap a photo, and join the fun.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto shadow-xl">
            <Link href="/the-bachelor/sighting/new?action=photo_together">
              <Camera className="w-5 h-5 mr-2" />
              Take photo with him
            </Link>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes hero-gallery-scroll {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(calc(-50% - 0.375rem), 0, 0);
          }
        }

        @media (min-width: 640px) {
          @keyframes hero-gallery-scroll {
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
  )
}
