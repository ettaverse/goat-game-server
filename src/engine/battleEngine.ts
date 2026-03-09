/**
 * @deprecated Use BattleService instead
 * This file is kept for backward compatibility but will be removed in future versions
 */
import { MatchRequest, BattleResult } from "./types"
import { battleService } from "../services/battleService"

/**
 * Simulates a turn-based battle between two teams of units
 * @param request - Contains team compositions and optional seed for reproducibility
 * @returns Complete battle result with initial state, all steps, final state, and winner
 * @deprecated Use battleService.simulateBattle() instead
 */
export function simulateBattle(request: MatchRequest): BattleResult {
  return battleService.simulateBattle(request)
}