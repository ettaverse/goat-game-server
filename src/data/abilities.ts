/**
 * Ability system for standard cards
 * Abilities modify card behavior during battle
 */

/**
 * All available ability types
 * Add new abilities here as the game expands
 */
export type AbilityType =
  | "REACH"           // Melee: After first attack in position 1, attacks position 2
  | "FORCE_FIELD"     // Melee: Only 1 damage taken regardless of attack points
  | "SNEAK"           // Archer: Attacks card with lowest health in any position
  | "CLOSE_RANGE"     // Archer: Can attack position 1 (normally cannot)
  | "THORN"           // Magic: When hit, attacker loses 1 health
  | "CAMOUFLAGE"      // Opponent cannot target/attack unless in position 1

/**
 * Ability metadata - describes what each ability does
 */
export type AbilityDefinition = {
  id: AbilityType
  name: string
  description: string
  applicableTypes: ("MELEE" | "ARCHER" | "MAGIC")[] // Which card types can have this ability
}

/**
 * Registry of all ability definitions
 * Add new abilities here with their metadata
 */
export const ABILITY_DEFINITIONS: Record<AbilityType, AbilityDefinition> = {
  REACH: {
    id: "REACH",
    name: "Reach",
    description: "After the first attack in position 1, attacks position 2",
    applicableTypes: ["MELEE"],
  },
  FORCE_FIELD: {
    id: "FORCE_FIELD",
    name: "Force Field",
    description: "Only 1 damage taken regardless of attack points",
    applicableTypes: ["MELEE"],
  },
  SNEAK: {
    id: "SNEAK",
    name: "Sneak",
    description: "Attacks card with lowest health in any position",
    applicableTypes: ["ARCHER"],
  },
  CLOSE_RANGE: {
    id: "CLOSE_RANGE",
    name: "Close Range",
    description: "Can attack position 1 (normally archers cannot)",
    applicableTypes: ["ARCHER"],
  },
  THORN: {
    id: "THORN",
    name: "Thorn",
    description: "When hit, attacker loses 1 health",
    applicableTypes: ["MAGIC"],
  },
  CAMOUFLAGE: {
    id: "CAMOUFLAGE",
    name: "Camouflage",
    description: "Opponent cannot target or attack unless in position 1",
    applicableTypes: ["MELEE", "ARCHER", "MAGIC"],
  },
}

/**
 * Gets an ability definition by type
 */
export function getAbilityDefinition(abilityType: AbilityType): AbilityDefinition {
  return ABILITY_DEFINITIONS[abilityType]
}

/**
 * Gets all ability definitions
 */
export function getAllAbilityDefinitions(): AbilityDefinition[] {
  return Object.values(ABILITY_DEFINITIONS)
}

/**
 * Validates that an ability can be applied to a card type
 */
export function canApplyAbilityToType(
  abilityType: AbilityType,
  cardType: "MELEE" | "ARCHER" | "MAGIC"
): boolean {
  const ability = ABILITY_DEFINITIONS[abilityType]
  return ability.applicableTypes.includes(cardType)
}

/**
 * Validates a list of abilities for a card type
 */
export function validateAbilitiesForCard(
  abilities: AbilityType[],
  cardType: "MELEE" | "ARCHER" | "MAGIC"
): { valid: boolean; invalid: AbilityType[] } {
  const invalid: AbilityType[] = []
  
  for (const ability of abilities) {
    if (!canApplyAbilityToType(ability, cardType)) {
      invalid.push(ability)
    }
  }
  
  return {
    valid: invalid.length === 0,
    invalid,
  }
}
