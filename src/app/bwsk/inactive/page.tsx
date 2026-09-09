import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'

export default function BwskInactivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Container size="mobile">
        <div className="rounded-2xl border bg-card p-6 text-center space-y-4 shadow-sm">
          <h1 className="text-2xl font-bold">Bachelor Weekend trenutno ni aktiven</h1>
          <p className="text-sm text-muted-foreground">
            Trenutno ni aktivnega BWSK dogodka. Poskusite ponovno kasneje ali vstopite v glavni tok aplikacije.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Nazaj na zacetno stran</Link>
          </Button>
        </div>
      </Container>
    </div>
  )
}
