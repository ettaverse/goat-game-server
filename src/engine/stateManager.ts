import { StandardUnit } from "./unit"
import { UnitState, BattleStep } from "./types"
import { FRONT_LINE_POSITION } from "../constants/battle"

/**
 * Creates a snapshot of the current battle state
 */
export function createSnapshot(teamA: StandardUnit[], teamB: StandardUnit[]): UnitState[] {
  return [...teamA, ...teamB]
    .filter((u) => u.alive)
    .map((u) => u.toState())
}

/**
 * Shifts units forward to fill gaps when units die
 */
export function shiftUnits(team: StandardUnit[]): Array<{ id: string; position: number }> {
  const alive = team.filter((u) => u.alive)
  const moved: Array<{ id: string; position: number }> = []

  alive.forEach((unit, index) => {
    const newPos = index + 1
    if (unit.position !== newPos) {
      unit.position = newPos
      moved.push({ id: unit.id, position: newPos })
    }
  })

  return moved
}

/**
 * Checks if the battle has ended
 */
export function isBattleOver(teamA: StandardUnit[], teamB: StandardUnit[]): boolean {
  return (
    teamA.every((u) => !u.alive) || teamB.every((u) => !u.alive)
  )
}

/**
 * Finds the front-line target for an attack
 */
export function findFrontLineTarget(defending: StandardUnit[]): StandardUnit | undefined {
  return defending.find((u) => u.alive && u.position === FRONT_LINE_POSITION)
}
