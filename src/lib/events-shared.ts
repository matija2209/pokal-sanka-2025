export const DEFAULT_LEGACY_EVENT_SLUG = 'birthday-party-legacy'
export const DEFAULT_LEGACY_EVENT_NAME = 'Birthday Party'
export const DEFAULT_BACHELOR_EVENT_SLUG = 'bachelor-party'
export const DEFAULT_BACHELOR_EVENT_NAME = 'Bachelor Party'

export function isBachelorEvent(
  event?: { slug?: string | null; name?: string | null } | null
): boolean {
  if (!event) return false
  if (event.slug === DEFAULT_BACHELOR_EVENT_SLUG) return true
  const normalizedSlug = event.slug?.toLowerCase() || ''
  const normalizedName = event.name?.toLowerCase() || ''
  return (
    normalizedSlug.includes('bachelor') ||
    normalizedSlug.includes('bwsk') ||
    normalizedName.includes('bachelor') ||
    normalizedName.includes('bwsk')
  )
}
