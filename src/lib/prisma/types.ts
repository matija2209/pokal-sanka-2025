import { Prisma, User, Team, DrinkLog } from '@prisma/client'

// Re-export base types
export type { User, Team, DrinkLog, Prisma }

// Drink type constants
export const DRINK_TYPES = {
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

// Input types for creation (using native Prisma types)
export type CreateUserInput = Prisma.UserCreateInput
export type CreateTeamInput = Prisma.TeamCreateInput
export type CreateDrinkLogInput = Prisma.DrinkLogCreateInput