import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-12 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,100,150,0.15),transparent_50%)]" />

      <div className="relative z-10 max-w-2xl mx-auto w-full">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
          Bachelor Weekend · Malta
        </span>

        <h1 className="text-4xl sm:text-7xl font-lucky mb-4 tracking-tight leading-tight">
          You found <span className="text-primary">BWSK</span>.
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed px-2">
          BWSK is on his bachelor weekend in Malta. Help us track the groom,
          hype him up, and become part of his Friend Collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Button asChild size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto shadow-xl">
            <Link href="/the-bachelor/sighting/new">
              <MapPin className="w-5 h-5 mr-2" />
              Log a sighting
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto">
            <Link href="#stats">
              View stats
            </Link>
          </Button>
        </div>

        <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl bg-muted/30 border border-primary/10 max-w-lg mx-auto backdrop-blur-sm">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Meet BWSK.</strong> Future husband. Weekend
            legend. He is roaming Malta
            with one mission: collect memories, collect
            friends, and prove he is ready for marriage. If you found him, you are now
            part of the story.
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <span className="text-muted-foreground text-sm">Scroll down</span>
      </div>
    </section>
  )
}
