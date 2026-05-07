export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4 mt-12">
      <div className="max-w-2xl mx-auto text-center text-xs text-muted-foreground space-y-2">
        <p>
          <strong>Keep it respectful.</strong> Only take photos in public places.
          Do not block, follow, or disturb anyone. If you approach BWSK, be friendly
          and quick.
        </p>
        <p>
          By submitting, you agree that your photo and message can be used in
          BWSK&apos;s bachelor trip album. Photos are reviewed before appearing publicly.
        </p>
        <p className="pt-4">
          BWSK Friend Collection &middot; Malta {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
