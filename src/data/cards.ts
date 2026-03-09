import { AbilityType } from "./abilities"

/**
 * Card definitions for standard units
 */
export type CardDefinition = {
  id: string
  name: string
  type: "MELEE" | "ARCHER" | "MAGIC"
  health: number
  attack: number
  speed: number
  shield: number // Shield value (0-3), reduces damage before health
  abilities?: readonly AbilityType[] // Optional abilities for this card
}

/**
 * Buff types that heroes can apply
 */
export type HeroBuff = 
  | "PLUS_LIFE"      // Adds +1 health to own team's standard cards
  | "MINUS_LIFE"     // Deducts 1 health from opponent's standard cards
  | "PLUS_SHIELD"    // Adds +1 shield to own team's standard cards
  | "MINUS_SHIELD"   // Deducts 1 shield from opponent's standard cards

/**
 * Card definitions for hero units
 * Heroes do not have type, health, attack, or speed
 */
export type HeroCardDefinition = {
  id: string
  name: string
  buffs?: readonly HeroBuff[] // Buffs applied at match start
}

/**
 * Standard cards registry
 * Add new cards here to make them available in the game
 */
export const STANDARD_CARDS: CardDefinition[] = [
  {
    id: "archer1",
    name: "Archer Sid",
    type: "ARCHER",
    health: 8,
    attack: 3,
    speed: 4,
    shield: 1,
  },
  {
    id: "archer2",
    name: "Archer Joe",
    type: "ARCHER",
    health: 10,
    attack: 5,
    speed: 6,
    shield: 0,
  },
  {
    id: "archer3",
    name: "Archer Sniper",
    type: "ARCHER",
    health: 9,
    attack: 4,
    speed: 5,
    shield: 1,
    abilities: ["SNEAK"], // Attacks lowest health target
  },
  {
    id: "archer4",
    name: "Archer Close Combat",
    type: "ARCHER",
    health: 7,
    attack: 4,
    speed: 4,
    shield: 2,
    abilities: ["CLOSE_RANGE"], // Can attack position 1
  },
  {
    id: "melee1",
    name: "Melee Dilip",
    type: "MELEE",
    health: 8,
    attack: 3,
    speed: 4,
    shield: 2,
  },
  {
    id: "melee2",
    name: "Melee Navi",
    type: "MELEE",
    health: 8,
    attack: 3,
    speed: 4,
    shield: 1,
  },
  {
    id: "melee3",
    name: "Melee Reacher",
    type: "MELEE",
    health: 9,
    attack: 3,
    speed: 5,
    shield: 1,
    abilities: ["REACH"], // After attacking position 1, attacks position 2
  },
  {
    id: "melee4",
    name: "Melee Defender",
    type: "MELEE",
    health: 10,
    attack: 2,
    speed: 3,
    shield: 2,
    abilities: ["FORCE_FIELD"], // Only takes 1 damage
  },
  {
    id: "melee5",
    name: "Melee Stealth",
    type: "MELEE",
    health: 8,
    attack: 4,
    speed: 5,
    shield: 1,
    abilities: ["CAMOUFLAGE"], // Cannot be targeted unless in position 1
  },
  {
    id: "magic1",
    name: "Magic Shakthi",
    type: "MAGIC",
    health: 10,
    attack: 0,
    speed: 3,
    shield: 3,
  },
  {
    id: "magic2",
    name: "Magic Noorina",
    type: "MAGIC",
    health: 12,
    attack: 0,
    speed: 5,
    shield: 2,
  },
  {
    id: "magic3",
    name: "Magic Thorn",
    type: "MAGIC",
    health: 9,
    attack: 0,
    speed: 4,
    shield: 2,
    abilities: ["THORN"], // When hit, attacker loses 1 health
  },
  {
    id: "magic4",
    name: "Magic Hidden",
    type: "MAGIC",
    health: 11,
    attack: 0,
    speed: 4,
    shield: 3,
    abilities: ["CAMOUFLAGE"], // Cannot be targeted unless in position 1
  },
]

/**
 * Card registry as a map for quick lookup by ID
 */
export const CARD_REGISTRY: Record<string, CardDefinition> = STANDARD_CARDS.reduce(
  (acc, card) => {
    acc[card.id] = card
    return acc
  },
  {} as Record<string, CardDefinition>
)

/**
 * Validates that a card ID exists in the registry
 */
export function isValidCardId(cardId: string): boolean {
  return cardId in CARD_REGISTRY
}

/**
 * Gets a card definition by ID
 */
export function getCardDefinition(cardId: string): CardDefinition {
  const card = CARD_REGISTRY[cardId]
  if (!card) {
    throw new Error(`Invalid card ID: ${cardId}`)
  }
  return card
}

/**
 * Gets all available cards
 */
export function getAllCards(): CardDefinition[] {
  return [...STANDARD_CARDS]
}

/**
 * Gets cards filtered by type
 */
export function getCardsByType(type: "MELEE" | "ARCHER" | "MAGIC"): CardDefinition[] {
  return STANDARD_CARDS.filter((card) => card.type === type)
}

/**
 * Hero cards registry
 * Add new hero cards here to make them available in the game
 */
export const HERO_CARDS: HeroCardDefinition[] = [
  {
    id: "hero1",
    name: "The Protagonist",
    buffs: ["PLUS_LIFE", "PLUS_SHIELD"],
  },
  {
    id: "hero2",
    name: "The Antogonist",
    buffs: ["MINUS_LIFE", "MINUS_SHIELD"],
  },
  {
    id: "hero3",
    name: "The GodFather",
    buffs: ["PLUS_LIFE", "MINUS_LIFE"],
  },
]

/**
 * Hero card registry as a map for quick lookup by ID
 */
export const HERO_REGISTRY: Record<string, HeroCardDefinition> = HERO_CARDS.reduce(
  (acc, hero) => {
    acc[hero.id] = hero
    return acc
  },
  {} as Record<string, HeroCardDefinition>
)

/**
 * Validates that a hero ID exists in the registry
 */
export function isValidHeroId(heroId: string): boolean {
  return heroId in HERO_REGISTRY
}

/**
 * Gets a hero card definition by ID
 */
export function getHeroDefinition(heroId: string): HeroCardDefinition {
  const hero = HERO_REGISTRY[heroId]
  if (!hero) {
    throw new Error(`Invalid hero ID: ${heroId}`)
  }
  return hero
}

/**
 * Gets all available hero cards
 */
export function getAllHeroCards(): HeroCardDefinition[] {
  return [...HERO_CARDS]
}