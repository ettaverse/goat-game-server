/**
 * Custom error classes for battle system
 */
export class BattleError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message)
    this.name = "BattleError"
    Object.setPrototypeOf(this, BattleError.prototype)
  }
}

export class ValidationError extends BattleError {
  constructor(message: string) {
    super(message, 400)
    this.name = "ValidationError"
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class InvalidCardError extends BattleError {
  constructor(cardId: string) {
    super(`Invalid card ID: ${cardId}`, 400)
    this.name = "InvalidCardError"
    Object.setPrototypeOf(this, InvalidCardError.prototype)
  }
}
