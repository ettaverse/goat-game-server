import { TeamInput } from "./types"
import { StandardUnit } from "./unit"
import { getCardDefinition, getHeroDefinition, HeroBuff } from "../data/cards"
import { InvalidCardError } from "../utils/errors"
import { TeamOwner } from "../constants/battle"

/**
 * Creates a team of StandardUnit objects from team input data
 */
export function createTeam(teamInput: TeamInput, owner: TeamOwner): StandardUnit[] {
  return teamInput.standards.map((card, index) => {
    let def
    try {
      def = getCardDefinition(card.id)
    } catch (error) {
      throw new InvalidCardError(card.id)
    }

    // Use type from card definition (more reliable than input)
    const unitType = def.type

    return new StandardUnit(
      `${owner}_${card.id}_${index}`,
      owner,
      unitType,
      def.health,
      def.attack,
      def.speed,
      def.shield,
      index + 1,
      def.abilities ? [...def.abilities] : []
    )
  })
}

/**
 * Calculates the total speed of all units in a team
 */
export function calculateTeamSpeed(team: StandardUnit[]): number {
  return team.reduce((total, unit) => total + unit.speed, 0)
}

/**
 * Applies hero buffs to teams at match start
 * @param heroId - The hero ID whose buffs to apply
 * @param ownTeam - The team that owns the hero (receives positive buffs)
 * @param opponentTeam - The opponent team (receives negative buffs)
 * @returns The hero's buffs array (for logging purposes)
 */
export function applyHeroBuffs(
  heroId: string,
  ownTeam: StandardUnit[],
  opponentTeam: StandardUnit[]
): string[] {
  try {
    const hero = getHeroDefinition(heroId)
    if (!hero.buffs || hero.buffs.length === 0) {
      return [] // No buffs to apply
    }

    hero.buffs.forEach((buff) => {
      switch (buff) {
        case "PLUS_LIFE":
          // Add +1 health to own team's standard cards
          ownTeam.forEach((unit) => {
            unit.health += 1
          })
          break

        case "MINUS_LIFE":
          // Deduct 1 health from opponent's standard cards (minimum 0)
          opponentTeam.forEach((unit) => {
            unit.health = Math.max(0, unit.health - 1)
            // If health becomes 0, unit dies
            if (unit.health === 0) {
              unit.alive = false
            }
          })
          break

        case "PLUS_SHIELD":
          // Add +1 shield to own team's standard cards
          ownTeam.forEach((unit) => {
            unit.shield += 1
          })
          break

        case "MINUS_SHIELD":
          // Deduct 1 shield from opponent's standard cards (minimum 0)
          opponentTeam.forEach((unit) => {
            unit.shield = Math.max(0, unit.shield - 1)
          })
          break
      }
    })
    
    return [...hero.buffs]
  } catch (error) {
    // Hero not found or invalid, skip buff application
    console.warn(`Failed to apply buffs for hero ${heroId}:`, error)
    return []
  }
}
