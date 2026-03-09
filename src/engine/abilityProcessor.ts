/**
 * Ability Processor System
 * Handles ability logic during battle
 * 
 * This system is designed to be extensible - add new ability handlers here
 */

import { StandardUnit } from "./unit"
import { AbilityType } from "../data/abilities"
import { FRONT_LINE_POSITION, ARCHER_POSITION } from "../constants/battle"

/**
 * Context for ability processing during battle
 */
export type AbilityContext = {
  attacker: StandardUnit
  defender: StandardUnit
  attackingTeam: StandardUnit[]
  defendingTeam: StandardUnit[]
  damage: number
  round: number
}

/**
 * Result of ability processing
 */
export type AbilityResult = {
  modifiedDamage?: number // Modified damage amount
  canTarget?: boolean // Whether the target can be attacked
  additionalTargets?: StandardUnit[] // Additional targets to attack (e.g., Reach)
  reflectDamage?: number // Damage to reflect back to attacker (e.g., Thorn)
  skipAttack?: boolean // Whether to skip this attack
}

/**
 * Shared helper to determine if a defender can be targeted by a given attacker,
 * taking into account passive abilities like CAMOUFLAGE.
 */
function canUnitBeTargetedBy(defender: StandardUnit, attacker: StandardUnit): boolean {
  // CAMOUFLAGE: defender cannot be targeted unless it is in FRONT_LINE_POSITION (1)
  if (defender.hasAbility("CAMOUFLAGE") && defender.position !== FRONT_LINE_POSITION) {
    return false
  }

  return true
}

/**
 * Base interface for ability handlers
 * Each ability implements hooks for different battle events
 */
export interface AbilityHandler {
  /**
   * Called when determining if a unit can attack
   * Return undefined to fall back to default logic
   */
  canAttack?(unit: StandardUnit, context: Partial<AbilityContext>): boolean | undefined

  /**
   * Called when selecting a target for an attack
   * Returns the target unit or undefined if no valid target
   */
  selectTarget?(
    attacker: StandardUnit,
    defendingTeam: StandardUnit[],
    context: Partial<AbilityContext>
  ): StandardUnit | undefined

  /**
   * Called when checking if a unit can be targeted
   */
  canBeTargeted?(
    defender: StandardUnit,
    attacker: StandardUnit,
    context: Partial<AbilityContext>
  ): boolean

  /**
   * Called before damage is applied
   * Can modify the damage amount
   */
  beforeDamage?(context: AbilityContext): AbilityResult

  /**
   * Called after damage is applied
   * Can trigger additional effects (e.g., Thorn)
   */
  afterDamage?(context: AbilityContext): AbilityResult

  /**
   * Called after an attack is performed
   * Can trigger additional attacks (e.g., Reach)
   */
  afterAttack?(context: AbilityContext): AbilityResult
}

/**
 * Registry of ability handlers
 * Add new ability implementations here
 */
const abilityHandlers: Record<AbilityType, AbilityHandler> = {
  /**
   * REACH: Melee card, after first attack in position 1, attacks position 2
   */
  REACH: {
    afterAttack(context: AbilityContext): AbilityResult {
      const { attacker, defender, defendingTeam } = context
      
      // Only trigger if:
      // 1. Attacker has REACH ability
      // 2. Attacker is melee and in position 1
      // 3. The target that was just attacked is in position 1 (front line)
      // This prevents REACH from triggering when attacking position 2
      if (
        !attacker.hasAbility("REACH") || 
        attacker.type !== "MELEE" || 
        attacker.position !== FRONT_LINE_POSITION ||
        defender.position !== FRONT_LINE_POSITION
      ) {
        return {}
      }

      // Find target in position 2 that can actually be targeted (respect CAMOUFLAGE)
      const position2Target = defendingTeam.find(
        (u) => u.alive && u.position === 2 && canUnitBeTargetedBy(u, attacker)
      )

      if (position2Target) {
        return {
          additionalTargets: [position2Target],
        }
      }

      return {}
    },
  },

  /**
   * FORCE_FIELD: Melee card, only 1 damage taken regardless of attack points
   */
  FORCE_FIELD: {
    beforeDamage(context: AbilityContext): AbilityResult {
      const { defender } = context
      
      // Only apply if defender has ForceField
      if (!defender.hasAbility("FORCE_FIELD")) {
        return {}
      }

      // Limit damage to 1
      return {
        modifiedDamage: 1,
      }
    },
  },

  /**
   * SNEAK: Archer card, attacks card with lowest health in any position
   */
  SNEAK: {
    selectTarget(
      attacker: StandardUnit,
      defendingTeam: StandardUnit[],
      context: Partial<AbilityContext>
    ): StandardUnit | undefined {
      // Only apply if attacker has Sneak
      if (!attacker.hasAbility("SNEAK") || attacker.type !== "ARCHER") {
        return undefined // Use default targeting
      }

      // Find alive units that can actually be targeted (respect CAMOUFLAGE)
      const aliveUnits = defendingTeam.filter(
        (u) => u.alive && canUnitBeTargetedBy(u, attacker)
      )
      if (aliveUnits.length === 0) return undefined

      // Find unit with lowest health
      let lowestHealthUnit = aliveUnits[0]
      for (const unit of aliveUnits) {
        if (unit.health < lowestHealthUnit.health) {
          lowestHealthUnit = unit
        }
      }

      return lowestHealthUnit
    },
  },

  /**
   * CLOSE_RANGE: Archer card, can attack position 1 (normally cannot)
   */
  CLOSE_RANGE: {
    canAttack(unit: StandardUnit): boolean | undefined {
      // If archer has CloseRange, can attack from position 1
      if (unit.type === "ARCHER" && unit.hasAbility("CLOSE_RANGE")) {
        return unit.alive && unit.position === FRONT_LINE_POSITION
      }
      // Return undefined to fall back to default logic
      return undefined
    },
  },

  /**
   * THORN: Magic card, when hit, attacker loses 1 health
   */
  THORN: {
    afterDamage(context: AbilityContext): AbilityResult {
      const { defender, attacker } = context
      
      // Only apply if defender has Thorn
      if (!defender.hasAbility("THORN")) {
        return {}
      }

      // Reflect 1 damage back to attacker
      return {
        reflectDamage: 1,
      }
    },
  },

  /**
   * CAMOUFLAGE: Opponent cannot target/attack unless in position 1
   *
   * Interpretation (as per requirement):
   * - If a defender has CAMOUFLAGE, it can only be targeted when it is itself
   *   in the FRONT_LINE_POSITION (position 1).
   * - While the camouflaged unit is in any other position, it cannot be
   *   selected as a target by any attacker.
   */
  CAMOUFLAGE: {
    canBeTargeted(
      defender: StandardUnit,
      attacker: StandardUnit,
      context: Partial<AbilityContext>
    ): boolean {
      return canUnitBeTargetedBy(defender, attacker)
    },
  },
}

/**
 * Processes abilities for a given event
 */
export class AbilityProcessor {
  /**
   * Checks if a unit can attack, considering abilities
   */
  static canAttack(unit: StandardUnit, context: Partial<AbilityContext>): boolean {
    // Check CLOSE_RANGE ability first
    const closeRangeHandler = abilityHandlers.CLOSE_RANGE
    if (closeRangeHandler.canAttack) {
      const result = closeRangeHandler.canAttack(unit, context)
      if (result !== undefined) {
        return result
      }
    }

    // Default logic (fallback to unit's canAttack method)
    return unit.canAttack()
  }

  /**
   * Selects a target for an attack, considering abilities
   */
  static selectTarget(
    attacker: StandardUnit,
    defendingTeam: StandardUnit[],
    context: Partial<AbilityContext>
  ): StandardUnit | undefined {
    // Check SNEAK ability first
    const sneakHandler = abilityHandlers.SNEAK
    if (sneakHandler.selectTarget) {
      const target = sneakHandler.selectTarget(attacker, defendingTeam, context)
      if (target) {
        return target
      }
    }

    // Default targeting: find front-line target that can be targeted
    const frontLineTarget = defendingTeam.find(
      (u) => u.alive && u.position === FRONT_LINE_POSITION
    )

    if (frontLineTarget && this.canBeTargeted(frontLineTarget, attacker, context)) {
      return frontLineTarget
    }

    // If front-line is camouflaged, try other positions
    for (const unit of defendingTeam) {
      if (unit.alive && this.canBeTargeted(unit, attacker, context)) {
        return unit
      }
    }

    return undefined
  }

  /**
   * Checks if a unit can be targeted, considering abilities
   */
  static canBeTargeted(
    defender: StandardUnit,
    attacker: StandardUnit,
    context: Partial<AbilityContext>
  ): boolean {
    // Check CAMOUFLAGE ability
    const camouflageHandler = abilityHandlers.CAMOUFLAGE
    if (camouflageHandler.canBeTargeted) {
      return camouflageHandler.canBeTargeted(defender, attacker, context)
    }

    return true
  }

  /**
   * Processes before-damage abilities
   */
  static beforeDamage(context: AbilityContext): AbilityResult {
    let result: AbilityResult = {}

    // Process FORCE_FIELD
    const forceFieldHandler = abilityHandlers.FORCE_FIELD
    if (forceFieldHandler.beforeDamage) {
      const forceFieldResult = forceFieldHandler.beforeDamage(context)
      if (forceFieldResult.modifiedDamage !== undefined) {
        result.modifiedDamage = forceFieldResult.modifiedDamage
      }
    }

    return result
  }

  /**
   * Processes after-damage abilities
   */
  static afterDamage(context: AbilityContext): AbilityResult {
    let result: AbilityResult = {}

    // Process THORN
    const thornHandler = abilityHandlers.THORN
    if (thornHandler.afterDamage) {
      const thornResult = thornHandler.afterDamage(context)
      if (thornResult.reflectDamage !== undefined) {
        result.reflectDamage = thornResult.reflectDamage
      }
    }

    return result
  }

  /**
   * Processes after-attack abilities
   */
  static afterAttack(context: AbilityContext): AbilityResult {
    let result: AbilityResult = {}

    // Process REACH
    const reachHandler = abilityHandlers.REACH
    if (reachHandler.afterAttack) {
      const reachResult = reachHandler.afterAttack(context)
      if (reachResult.additionalTargets) {
        result.additionalTargets = reachResult.additionalTargets
      }
    }

    return result
  }
}
