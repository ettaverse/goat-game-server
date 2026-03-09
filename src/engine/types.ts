export type CardType = "MELEE" | "ARCHER" | "MAGIC"

export type StandardCardInput = {
  id: string
  // type is optional now as it can be derived from card definition
  type?: CardType
}

export type TeamInput = {
  playerId: string
  heroId: string
  standards: StandardCardInput[]
}

export type MatchRequest = {
  teamA: TeamInput
  teamB: TeamInput
  seed?: string
}

/* =======================
   STATE STRUCTURES
=======================*/

import { AbilityType } from "../data/abilities"

export type UnitState = {
  id: string
  owner: "A" | "B"
  type: CardType
  health: number
  shield: number
  position: number
  abilities?: AbilityType[]
}

export type AttackAction = {
  type: "attack"
  attacker: string
  target: string
  damage: number
}

export type RoundStartAction = {
  type: "round_start"
  round: number
}

export type BattleEndAction = {
  type: "battle_end"
  winner: string | "DRAW"
}

export type BattleStartAction = {
  type: "battle_start"
  teamASpeed: number
  teamBSpeed: number
  firstTurn: string
}

export type HeroBuffsAction = {
  type: "hero_buffs"
  teamA: {
    heroId: string
    heroName: string
    buffs: string[]
  }
  teamB: {
    heroId: string
    heroName: string
    buffs: string[]
  }
}

export type BattleAction = AttackAction | RoundStartAction | BattleEndAction | BattleStartAction | HeroBuffsAction

export type BattleStepDiff = {
  updated?: UnitState[]
  removed?: string[]
  moved?: Array<{ id: string; position: number }>
}

export type BattleStep = {
  action: BattleAction
  diff: BattleStepDiff
}

export type BattleResult = {
  seed: string
  initialState: UnitState[]
  steps: BattleStep[]
  finalState: UnitState[]
  winner: string | "DRAW"
}