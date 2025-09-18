import { Prisma, User, Team, DrinkLog } from '@prisma/client'

// Re-export base types
export type { User, Team, DrinkLog, Prisma }

// Drink type constants
export const DRINK_TYPES = {
  // 1 point drinks
  BEER_RADLER: 'BEER_RADLER',
  
  // 2 point drinks
  VODKA: 'VODKA',
  GIN: 'GIN',
  AMARO: 'AMARO',
  PELINKOVAC: 'PELINKOVAC',
  JAGERMEISTER: 'JAGERMEISTER',
  AUSTRIAN_SCHNAPS: 'AUSTRIAN_SCHNAPS',
  SPARKLING_WINE: 'SPARKLING_WINE',
  JAGER_SHOT: 'JAGER_SHOT',
  TEQUILA_SHOT: 'TEQUILA_SHOT',
  BOROVNICKA_SHOT: 'BOROVNICKA_SHOT',
  JAGER_COLA: 'JAGER_COLA',
  WHISKY_COLA: 'WHISKY_COLA',
  APEROL_SPRITZ: 'APEROL_SPRITZ',
  MOJITO: 'MOJITO',
  
  // 3 point drinks
  TEQUILA_BOOM: 'TEQUILA_BOOM',
  ESPRESSO_MARTINI: 'ESPRESSO_MARTINI',
  MOSCOW_MULE: 'MOSCOW_MULE',
  
  // Legacy types (for backwards compatibility)
  REGULAR: 'REGULAR',
  SHOT: 'SHOT'
} as const

export type DrinkType = typeof DRINK_TYPES[keyof typeof DRINK_TYPES]

// Composite types with relations (using native Prisma types)
export type UserWithTeam = Prisma.UserGetPayload<{
  include: { team: true }
}>

export type UserWithTeamAndDrinks = Prisma.UserGetPayload<{
  include: { team: true, drinkLogs: true }
}>

export type TeamWithUsers = Prisma.TeamGetPayload<{
  include: { users: true }
}>

export type TeamWithUsersAndDrinks = Prisma.TeamGetPayload<{
  include: { 
    users: {
      include: { drinkLogs: true }
    }
  }
}>

export type DrinkLogWithUser = Prisma.DrinkLogGetPayload<{
  include: { user: true }
}>

export type DrinkLogWithUserAndTeam = Prisma.DrinkLogGetPayload<{
  include: { 
    user: {
      include: { team: true }
    }
  }
}>

// Team with calculated statistics
export type TeamWithStats = Team & {
  memberCount: number
  totalScore: number
  totalDrinks: number
  averageScore: number
}

// Input types for creation (using native Prisma types)
export type CreateUserInput = Prisma.UserCreateInput
export type CreateTeamInput = Prisma.TeamCreateInput
export type CreateDrinkLogInput = Prisma.DrinkLogCreateInput