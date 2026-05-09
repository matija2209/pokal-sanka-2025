import Image from 'next/image'
import { QuickPhotoCapture } from '@/components/bachelor/quick-photo-capture'
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
    <section className="relative flex min-h-[88svh] flex-col items-center justify-end overflow-hidden pb-8 sm:min-h-screen sm:pb-20">
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
      <div className="relative z-20 mx-auto w-full max-w-2xl px-4 text-center">
        <span className="mb-3 inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary sm:mb-4 sm:text-sm">
          He's getting married
        </span>

        <h1 className="mb-2 text-6xl font-lucky leading-none tracking-tight sm:mb-3 sm:text-7xl">
          Boštjan
        </h1>

        <p className="mx-auto mb-5 max-w-md text-lg leading-snug text-muted-foreground sm:mb-8 sm:text-xl sm:leading-relaxed">
          Our friend from Slovenia is getting married, and we're in Malta for his bachelor trip.
          Spot him, snap a photo, and join the fun.
        </p>

        <div className="flex justify-center gap-3">
          <QuickPhotoCapture
            actionType="photo_together"
            className="inline-flex items-center justify-center h-auto w-full px-6 py-4 text-xl font-medium shadow-xl sm:w-auto sm:px-8 sm:py-6 sm:text-lg rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            Take photo with him
          </QuickPhotoCapture>
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
