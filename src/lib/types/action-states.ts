export interface BaseActionState {
  success: boolean
  message: string
  type: 'idle' | 'create' | 'update' | 'delete' | 'error'
  errors?: Record<string, string[]>
}

export interface UserActionState extends BaseActionState {
  data?: {
    userId?: string
    redirectUrl?: string
  }
}

export interface TeamActionState extends BaseActionState {
  data?: {
    teamId?: string
    redirectUrl?: string
  }
}

export interface DrinkLogActionState extends BaseActionState {
  data?: {
    drinkLogId?: string
    points?: number
  }
}

export const initialUserActionState: UserActionState = {
  success: false,
  message: '',
  type: 'idle'
}

export const initialTeamActionState: TeamActionState = {
  success: false,
  message: '',
  type: 'idle'
}

export const initialDrinkLogActionState: DrinkLogActionState = {
  success: false,
  message: '',
  type: 'idle'
}

export const initialMultiDrinkLogActionState: DrinkLogActionState = {
  success: false,
  message: '',
  type: 'idle'
}