import { CardType, UnitState } from "./types"
import { FRONT_LINE_POSITION, ARCHER_POSITION } from "../constants/battle"
import { AbilityType } from "../data/abilities"

export class StandardUnit {
  public readonly id: string
  public readonly owner: "A" | "B"
  public readonly type: CardType
  public health: number
  public shield: number
  public readonly attack: number
  public readonly speed: number
  public position: number
  public alive: boolean = true
  public readonly abilities: readonly AbilityType[]

  constructor(
    id: string,
    owner: "A" | "B",
    type: CardType,
    health: number,
    attack: number,
    speed: number,
    shield: number,
    position: number,
    abilities: AbilityType[] = []
  ) {
    this.id = id
    this.owner = owner
    this.type = type
    this.health = health
    this.shield = shield
    this.attack = attack
    this.speed = speed
    this.position = position
    this.abilities = abilities
  }

  /**
   * Checks if this unit has a specific ability
   */
  hasAbility(abilityType: AbilityType): boolean {
    return this.abilities.includes(abilityType)
  }

  /**
   * Checks if this unit can attack based on its type and position
   * Note: AbilityProcessor.canAttack should be used instead for ability-aware checks
   */
  canAttack(): boolean {
    if (!this.alive) return false
    if (this.type === "MAGIC") return false // Magic cards don't attack
    if (this.type === "MELEE" && this.position === FRONT_LINE_POSITION) return true
    if (this.type === "ARCHER" && this.position === ARCHER_POSITION) return true
    // CLOSE_RANGE ability is handled by AbilityProcessor
    return false
  }

  /**
   * Applies damage to this unit
   * Shield reduces damage first, then health
   */
  takeDamage(dmg: number): void {
    // Reduce shield first
    if (this.shield > 0) {
      const shieldDamage = Math.min(this.shield, dmg)
      this.shield -= shieldDamage
      dmg -= shieldDamage
    }
    
    // Remaining damage goes to health
    if (dmg > 0) {
      this.health -= dmg
      if (this.health <= 0) {
        this.alive = false
        this.health = 0 // Ensure health doesn't go negative
      }
    }
  }

  /**
   * Converts this unit to a serializable state object
   */
  toState(): UnitState {
    return {
      id: this.id,
      owner: this.owner,
      type: this.type,
      health: this.health,
      shield: this.shield,
      position: this.position,
      abilities: this.abilities.length > 0 ? [...this.abilities] : undefined,
    }
  }
}