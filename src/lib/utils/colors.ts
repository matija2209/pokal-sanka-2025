import { Team } from '../prisma/types'

// Party-appropriate vibrant colors with good contrast
const TEAM_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Mint Green
  '#FECA57', // Sunflower Yellow
  '#FF9FF3', // Pink
  '#54A0FF', // Royal Blue
  '#5F27CD', // Purple
  '#00D2D3', // Cyan
  '#FF9F43', // Orange
  '#10AC84', // Emerald
  '#EE5A24', // Red Orange
  '#0984E3', // Blue
  '#6C5CE7', // Lavender
  '#FD79A8'  // Rose Pink
]

export function getRandomTeamColor(): string {
  return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)]
}

export function isColorUsed(color: string, existingTeams: Team[]): boolean {
  return existingTeams.some(team => team.color === color)
}

export function getNextAvailableColor(existingTeams: Team[]): string {
  const usedColors = existingTeams.map(team => team.color)
  const availableColors = TEAM_COLORS.filter(color => !usedColors.includes(color))

  // If all colors are used, return a random one
  if (availableColors.length === 0) {
    return getRandomTeamColor()
  }

  // Return first available color
  return availableColors[0]
}

// Picks readable black/white text for an arbitrary hex background using
// perceived brightness (YIQ), since team colors are free-form hex values.
export function getContrastTextColor(hex: string): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return '#ffffff'

  const r = parseInt(normalized.substring(0, 2), 16)
  const g = parseInt(normalized.substring(2, 4), 16)
  const b = parseInt(normalized.substring(4, 6), 16)

  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150 ? '#000000' : '#ffffff'
}