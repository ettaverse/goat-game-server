/**
 * Battle system constants
 */
export const BATTLE_CONSTANTS = {
  MAX_ROUNDS: 1000, // Prevent infinite loops
} as const

export const FRONT_LINE_POSITION = 1
export const ARCHER_POSITION = 2

export const TEAM_OWNERS = {
  A: "A",
  B: "B",
} as const

export type TeamOwner = typeof TEAM_OWNERS[keyof typeof TEAM_OWNERS]
