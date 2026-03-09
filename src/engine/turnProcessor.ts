import { StandardUnit } from "./unit"
import { BattleStep, AttackAction } from "./types"
import { findFrontLineTarget, shiftUnits } from "./stateManager"
import { AbilityProcessor, AbilityContext } from "./abilityProcessor"

/**
 * Processes one team's turn, allowing all eligible units to attack
 * Now includes ability-aware targeting, damage calculation, and additional attacks
 */
export function processTurn(
  attacking: StandardUnit[],
  defending: StandardUnit[],
  steps: BattleStep[],
  round: number = 1
): void {
  // Track which units have already attacked this turn
  const attackedThisTurn = new Set<string>()

  for (const unit of attacking) {
    // Skip if unit has already attacked this turn
    if (attackedThisTurn.has(unit.id)) continue

    // Use ability-aware canAttack check
    if (!AbilityProcessor.canAttack(unit, {})) continue

    // Use ability-aware target selection
    const target = AbilityProcessor.selectTarget(unit, defending, {
      attacker: unit,
      attackingTeam: attacking,
      defendingTeam: defending,
      round,
    })

    if (!target) continue

    // Process attack with abilities (isReachAttack = false for initial attack)
    const turnEnded = processAttack(unit, target, attacking, defending, steps, round, attackedThisTurn, false)
    
    // Mark unit as having attacked this turn
    attackedThisTurn.add(unit.id)
  }
}

/**
 * Processes a single attack, including ability effects
 * @param isReachAttack - true if this attack is triggered by REACH ability (prevents REACH from triggering again)
 * @returns true if the attacker's turn should end (e.g., after REACH ability)
 */
function processAttack(
  attacker: StandardUnit,
  target: StandardUnit,
  attackingTeam: StandardUnit[],
  defendingTeam: StandardUnit[],
  steps: BattleStep[],
  round: number,
  attackedThisTurn: Set<string>,
  isReachAttack: boolean = false
): boolean {
  const context: AbilityContext = {
    attacker,
    defender: target,
    attackingTeam,
    defendingTeam,
    damage: attacker.attack,
    round,
  }

  // Process before-damage abilities (e.g., ForceField)
  const beforeDamageResult = AbilityProcessor.beforeDamage(context)
  const actualDamage = beforeDamageResult.modifiedDamage ?? attacker.attack

  // Apply damage
  target.takeDamage(actualDamage)

  // Process after-damage abilities (e.g., Thorn)
  const afterDamageResult = AbilityProcessor.afterDamage(context)
  
  // Apply reflected damage (e.g., Thorn)
  if (afterDamageResult.reflectDamage && afterDamageResult.reflectDamage > 0) {
    attacker.takeDamage(afterDamageResult.reflectDamage)
  }

  // Build diff for this attack
  const diff: BattleStep["diff"] = {
    updated: [],
  }

  // Add updated units
  if (target.alive) {
    diff.updated!.push(target.toState())
  } else {
    diff.removed = [target.id]
    diff.moved = shiftUnits(defendingTeam)
  }

  // If attacker took reflected damage, add to updated
  if (afterDamageResult.reflectDamage && afterDamageResult.reflectDamage > 0) {
    if (attacker.alive) {
      diff.updated!.push(attacker.toState())
    } else {
      // Attacker died from reflected damage
      if (!diff.removed) diff.removed = []
      diff.removed.push(attacker.id)
      diff.moved = shiftUnits(attackingTeam)
    }
  }

  // Log the attack
  const action: AttackAction = {
    type: "attack",
    attacker: attacker.id,
    target: target.id,
    damage: actualDamage,
  }

  steps.push({
    action,
    diff,
  })

  // Process after-attack abilities (e.g., Reach - additional attacks)
  // Skip if this is already a REACH-triggered attack to prevent infinite loops
  let afterAttackResult
  if (!isReachAttack) {
    afterAttackResult = AbilityProcessor.afterAttack(context)
  } else {
    afterAttackResult = {}
  }
  
  if (afterAttackResult.additionalTargets && afterAttackResult.additionalTargets.length > 0) {
    // Attack additional targets (e.g., Reach ability)
    // Mark as REACH attack to prevent REACH from triggering again
    for (const additionalTarget of afterAttackResult.additionalTargets) {
      if (additionalTarget.alive) {
        processAttack(attacker, additionalTarget, attackingTeam, defendingTeam, steps, round, attackedThisTurn, true)
      }
    }
    // After REACH ability triggers (attacking position 2), the unit's turn ends
    // Return true to indicate turn should end
    return true
  }

  // Normal attack completed, turn continues (though we mark it as attacked in processTurn)
  return false
}
