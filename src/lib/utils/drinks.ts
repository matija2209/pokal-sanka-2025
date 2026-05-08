import { DRINK_TYPES } from '@/lib/prisma/types'

export interface DrinkConfig {
  label: string
  points: number
  category: string
}

export interface DrinkCategory {
  name: string
  emoji: string
  description: string
  drinks: Array<{
    type: string
    label: string
    points: number
  }>
}

// Drink configuration mapping
export const DRINK_CONFIG: Record<string, DrinkConfig> = {
  // 1 point drinks
  [DRINK_TYPES.BEER_RADLER]: {
    label: 'Pivo / Radler',
    points: 1,
    category: 'beer'
  },
  [DRINK_TYPES.SPRIC]: {
    label: 'Špric',
    points: 1,
    category: 'beer'
  },
  
  // 2 point drinks
  [DRINK_TYPES.VODKA]: {
    label: 'Vodka',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.GIN]: {
    label: 'Gin',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.AMARO]: {
    label: 'Amaro',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.PELINKOVAC]: {
    label: 'Pelinkovac',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.JAGERMEISTER]: {
    label: 'Jägermeister',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.AUSTRIAN_SCHNAPS]: {
    label: 'Avstrijski žganci',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.SPARKLING_WINE]: {
    label: 'Penina / Prosecco',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.JAGER_SHOT]: {
    label: 'Jäger shot',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.TEQUILA_SHOT]: {
    label: 'Tequila shot',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.BOROVNICKA_SHOT]: {
    label: 'Borovnička shot',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.JAGER_COLA]: {
    label: 'Jäger-Cola',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.WHISKY_COLA]: {
    label: 'Whisky-Cola',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.APEROL_SPRITZ]: {
    label: 'Aperol Spritz',
    points: 2,
    category: 'spirits'
  },
  [DRINK_TYPES.MOJITO]: {
    label: 'Mojito',
    points: 2,
    category: 'spirits'
  },
  
  // 3 point drinks
  [DRINK_TYPES.TEQUILA_BOOM]: {
    label: 'Tequila Boom',
    points: 3,
    category: 'premium'
  },
  [DRINK_TYPES.ESPRESSO_MARTINI]: {
    label: 'Espresso Martini',
    points: 3,
    category: 'premium'
  },
  [DRINK_TYPES.MOSCOW_MULE]: {
    label: 'Moscow Mule',
    points: 3,
    category: 'premium'
  },
  
  // Legacy types (for backwards compatibility)
  [DRINK_TYPES.REGULAR]: {
    label: 'Navadno',
    points: 1,
    category: 'legacy'
  },
  [DRINK_TYPES.SHOT]: {
    label: 'Žganica',
    points: 2,
    category: 'legacy'
  }
}

// Helper functions
export function getDrinkPoints(drinkType: string): number {
  return DRINK_CONFIG[drinkType]?.points || 1
}

export function getDrinkLabel(drinkType: string): string {
  return DRINK_CONFIG[drinkType]?.label || drinkType
}

export function getDrinksByCategory(): DrinkCategory[] {
  return [
    {
      name: 'Pivo & Radler',
      emoji: '🍺',
      description: '1 točka',
      drinks: Object.entries(DRINK_CONFIG)
        .filter(([_, config]) => config.category === 'beer')
        .map(([type, config]) => ({
          type,
          label: config.label,
          points: config.points
        }))
    },
    {
      name: 'Žgane pijače & Koktajli',
      emoji: '🥃',
      description: '2 točki',
      drinks: Object.entries(DRINK_CONFIG)
        .filter(([_, config]) => config.category === 'spirits')
        .map(([type, config]) => ({
          type,
          label: config.label,
          points: config.points
        }))
    },
    {
      name: 'Premium koktajli',
      emoji: '🍸',
      description: '3 točke',
      drinks: Object.entries(DRINK_CONFIG)
        .filter(([_, config]) => config.category === 'premium')
        .map(([type, config]) => ({
          type,
          label: config.label,
          points: config.points
        }))
    }
  ]
}

export function getAllDrinks() {
  return Object.entries(DRINK_CONFIG)
    .filter(([_, config]) => config.category !== 'legacy')
    .map(([type, config]) => ({
      type,
      label: config.label,
      points: config.points,
      category: config.category
    }))
}
