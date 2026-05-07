export const ACTION_TYPES = {
  SPOT: 'spot',
  MESSAGE: 'message',
  SAY_HI: 'say_hi',
  DRINK_TOGETHER: 'drink_together',
  PHOTO_TOGETHER: 'photo_together',
  CHALLENGE: 'challenge',
} as const

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES]

export const ACTION_ORDER: ActionType[] = [
  ACTION_TYPES.SPOT,
  ACTION_TYPES.MESSAGE,
  ACTION_TYPES.SAY_HI,
  ACTION_TYPES.DRINK_TOGETHER,
  ACTION_TYPES.PHOTO_TOGETHER,
  ACTION_TYPES.CHALLENGE,
]

export const ACTION_POINTS: Record<ActionType, number> = {
  spot: 1,
  message: 2, // 1 base + 1
  say_hi: 4, // 1 base + 1 + 2
  drink_together: 6, // 1 base + 1 + 2 + 2
  photo_together: 9, // 1 base + 1 + 2 + 2 + 3
  challenge: 17, // 1 base + 1 + 2 + 2 + 3 + 8
}

export const ACTION_FRIENDSHIP: Record<ActionType, string> = {
  spot: 'Witness',
  message: 'Messenger',
  say_hi: 'Acquaintance',
  drink_together: 'Drinking Buddy',
  photo_together: 'Collected Friend',
  challenge: 'Legendary Friend',
}

export const ACTION_LABELS: Record<ActionType, { en: string; sl: string }> = {
  spot: { en: 'Spot him', sl: 'Opazi ga' },
  message: { en: 'Leave a message', sl: 'Pusti sporocilo' },
  say_hi: { en: 'Say hi', sl: 'Pozdravi ga' },
  drink_together: { en: 'Drink together', sl: 'Spij z njim' },
  photo_together: { en: 'Photo together', sl: 'Fotkaj se z njim' },
  challenge: { en: 'Challenge him', sl: 'Izzovi ga' },
}

export const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  spot: 'You saw BWSK out in the wild and logged the moment.',
  message: 'You left him a message, some marriage advice, or a note.',
  say_hi: 'You actually went up and said hello.',
  drink_together: 'You shared a drink together like proper weekend friends.',
  photo_together: 'You took a proper photo together with the groom.',
  challenge: 'You completed a mini challenge together.',
}

export function isActionType(value: string): value is ActionType {
  return ACTION_ORDER.includes(value as ActionType)
}

export const HYPE_VOTE_THRESHOLD = 5
export const HYPE_EVENT_POINTS = 5
