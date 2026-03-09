import { MatchRequest, TeamInput, StandardCardInput } from "../engine/types"
import { ValidationError } from "./errors"
import { CARD_REGISTRY, getCardDefinition, HERO_REGISTRY, getHeroDefinition } from "../data/cards"

/**
 * Validates a match request
 */
export function validateMatchRequest(request: unknown): asserts request is MatchRequest {
  if (!request || typeof request !== "object") {
    throw new ValidationError("Request body is required")
  }

  const req = request as Partial<MatchRequest>

  if (!req.teamA || !req.teamB) {
    throw new ValidationError("Both teamA and teamB are required")
  }

  validateTeamInput(req.teamA, "teamA")
  validateTeamInput(req.teamB, "teamB")

  if (req.seed && typeof req.seed !== "string") {
    throw new ValidationError("Seed must be a string")
  }
}

/**
 * Validates a team input
 */
function validateTeamInput(team: unknown, teamName: string): asserts team is TeamInput {
  if (!team || typeof team !== "object") {
    throw new ValidationError(`${teamName} must be an object`)
  }

  const t = team as Partial<TeamInput>

  if (!t.playerId || typeof t.playerId !== "string") {
    throw new ValidationError(`${teamName}.playerId is required and must be a string`)
  }

  if (!t.heroId || typeof t.heroId !== "string") {
    throw new ValidationError(`${teamName}.heroId is required and must be a string`)
  }

  // Validate hero exists in hero registry
  if (!(t.heroId in HERO_REGISTRY)) {
    throw new ValidationError(`${teamName}.heroId "${t.heroId}" is not a valid hero ID`)
  }

  if (!Array.isArray(t.standards)) {
    throw new ValidationError(`${teamName}.standards must be an array`)
  }

  if (t.standards.length === 0) {
    throw new ValidationError(`${teamName}.standards must contain at least one card`)
  }

  t.standards.forEach((card, index) => {
    validateCardInput(card, `${teamName}.standards[${index}]`)
  })
}

/**
 * Validates a card input
 */
function validateCardInput(card: unknown, path: string): asserts card is StandardCardInput {
  if (!card || typeof card !== "object") {
    throw new ValidationError(`${path} must be an object`)
  }

  const c = card as Partial<StandardCardInput>

  if (!c.id || typeof c.id !== "string") {
    throw new ValidationError(`${path}.id is required and must be a string`)
  }

  // Type is optional now (can be derived from card definition)
  // But if provided, validate it
  if (c.type !== undefined && c.type !== "MELEE" && c.type !== "ARCHER" && c.type !== "MAGIC") {
    throw new ValidationError(`${path}.type must be either "MELEE", "ARCHER", or "MAGIC"`)
  }

  // Validate card exists in card definitions
  if (!(c.id in CARD_REGISTRY)) {
    throw new ValidationError(`${path}.id "${c.id}" is not a valid card ID`)
  }

  // If type is provided, validate it matches the card definition
  if (c.type !== undefined) {
    try {
      const cardDef = getCardDefinition(c.id)
      if (cardDef.type !== c.type) {
        throw new ValidationError(
          `${path}.type "${c.type}" does not match card definition type "${cardDef.type}"`
        )
      }
    } catch (error) {
      // Card not found, error already thrown above
    }
  }
}
