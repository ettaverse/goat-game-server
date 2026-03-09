import { BattleService } from "../src/services/battleService"
import { validateMatchRequest } from "../src/utils/validation"
import { getAllCards, getAllHeroCards, getCardDefinition, getHeroDefinition } from "../src/data/cards"
import { MatchRequest } from "../src/engine/types"

const battleService = new BattleService()

// A valid match request for reuse
function makeRequest(overrides?: Partial<MatchRequest>): MatchRequest {
  return {
    teamA: {
      playerId: "player1",
      heroId: "hero1",
      standards: [{ id: "melee1" }, { id: "archer1" }, { id: "magic1" }],
    },
    teamB: {
      playerId: "player2",
      heroId: "hero2",
      standards: [{ id: "melee2" }, { id: "archer2" }, { id: "magic2" }],
    },
    ...overrides,
  }
}

describe("Card Data", () => {
  test("getAllCards returns all standard cards", () => {
    const cards = getAllCards()
    expect(cards.length).toBeGreaterThan(0)
    cards.forEach((c) => {
      expect(c.id).toBeDefined()
      expect(["MELEE", "ARCHER", "MAGIC"]).toContain(c.type)
    })
  })

  test("getAllHeroCards returns all heroes", () => {
    const heroes = getAllHeroCards()
    expect(heroes.length).toBeGreaterThan(0)
    heroes.forEach((h) => expect(h.id).toBeDefined())
  })

  test("getCardDefinition throws for invalid id", () => {
    expect(() => getCardDefinition("nonexistent")).toThrow()
  })

  test("getHeroDefinition throws for invalid id", () => {
    expect(() => getHeroDefinition("nonexistent")).toThrow()
  })
})

describe("Validation", () => {
  test("rejects empty body", () => {
    expect(() => validateMatchRequest(null)).toThrow("Request body is required")
  })

  test("rejects missing teams", () => {
    expect(() => validateMatchRequest({})).toThrow("Both teamA and teamB are required")
  })

  test("rejects invalid card id", () => {
    const req = makeRequest()
    req.teamA.standards = [{ id: "fake_card" }]
    expect(() => validateMatchRequest(req)).toThrow("not a valid card ID")
  })

  test("rejects invalid hero id", () => {
    const req = makeRequest()
    req.teamA.heroId = "fake_hero"
    expect(() => validateMatchRequest(req)).toThrow("not a valid hero ID")
  })

  test("accepts valid request", () => {
    expect(() => validateMatchRequest(makeRequest())).not.toThrow()
  })
})

describe("Battle Simulation", () => {
  test("produces a result with a winner or draw", () => {
    const result = battleService.simulateBattle(makeRequest())
    expect(result.seed).toBeDefined()
    expect(result.initialState.length).toBeGreaterThan(0)
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.finalState).toBeDefined()
    expect(result.winner).toBeDefined()
  })

  test("initial state contains units from both teams", () => {
    const result = battleService.simulateBattle(makeRequest())
    const owners = new Set(result.initialState.map((u) => u.owner))
    expect(owners.has("A")).toBe(true)
    expect(owners.has("B")).toBe(true)
  })

  test("steps include hero_buffs, battle_start, and battle_end", () => {
    const result = battleService.simulateBattle(makeRequest())
    const types = result.steps.map((s) => s.action.type)
    expect(types).toContain("hero_buffs")
    expect(types).toContain("battle_start")
    expect(types).toContain("battle_end")
  })

  test("winner matches a player id or DRAW", () => {
    const req = makeRequest()
    const result = battleService.simulateBattle(req)
    expect([req.teamA.playerId, req.teamB.playerId, "DRAW"]).toContain(result.winner)
  })

  test("deterministic with same seed", () => {
    const req = makeRequest({ seed: "test-seed-123" })
    const r1 = battleService.simulateBattle(req)
    const r2 = battleService.simulateBattle(req)
    expect(r1.winner).toBe(r2.winner)
    expect(r1.steps.length).toBe(r2.steps.length)
  })
})
