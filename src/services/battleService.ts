import { v4 as uuidv4 } from "uuid"
import { MatchRequest, BattleResult, BattleStep, BattleStartAction, HeroBuffsAction } from "../engine/types"
import { createTeam, calculateTeamSpeed, applyHeroBuffs } from "../engine/team"
import { createSnapshot, isBattleOver } from "../engine/stateManager"
import { processTurn } from "../engine/turnProcessor"
import { BATTLE_CONSTANTS } from "../constants/battle"
import { BattleError } from "../utils/errors"
import { StandardUnit } from "../engine/unit"
import { getHeroDefinition } from "../data/cards"

/**
 * Service layer for battle simulation
 */
export class BattleService {
  /**
   * Simulates a turn-based battle between two teams of units
   */
  simulateBattle(request: MatchRequest): BattleResult {
    const seed = request.seed || uuidv4()
    const steps: BattleStep[] = []
    let round = 0

    // Create teams
    const teamA = createTeam(request.teamA, "A")
    const teamB = createTeam(request.teamB, "B")

    // Apply hero buffs at match start (before speed comparison and battle begins)
    const teamABuffs = applyHeroBuffs(request.teamA.heroId, teamA, teamB)
    const teamBBuffs = applyHeroBuffs(request.teamB.heroId, teamB, teamA)

    // Get hero names for logging
    const heroA = getHeroDefinition(request.teamA.heroId)
    const heroB = getHeroDefinition(request.teamB.heroId)

    // Log hero buffs application
    const heroBuffsAction: HeroBuffsAction = {
      type: "hero_buffs",
      teamA: {
        heroId: request.teamA.heroId,
        heroName: heroA.name,
        buffs: teamABuffs,
      },
      teamB: {
        heroId: request.teamB.heroId,
        heroName: heroB.name,
        buffs: teamBBuffs,
      },
    }
    steps.push({
      action: heroBuffsAction,
      diff: {},
    })

    // Calculate team speeds to determine turn order (after buffs are applied)
    const teamASpeed = calculateTeamSpeed(teamA)
    const teamBSpeed = calculateTeamSpeed(teamB)
    
    // Determine which team attacks first based on speed
    // If player's (teamA) total speed > opponent's (teamB) total speed, player goes first
    // Otherwise (including when equal), opponent goes first
    const teamAGoesFirst = teamASpeed > teamBSpeed
    
    // Debug: Log speed comparison
    console.log(`[Battle] Team A Speed: ${teamASpeed}, Team B Speed: ${teamBSpeed}, Team A Goes First: ${teamAGoesFirst}`)

    // Capture initial state (after buffs are applied)
    const initialState = createSnapshot(teamA, teamB)

    // Log speed comparison and turn order at battle start
    const battleStartAction: BattleStartAction = {
      type: "battle_start",
      teamASpeed,
      teamBSpeed,
      firstTurn: teamAGoesFirst ? request.teamA.playerId : request.teamB.playerId,
    }
    steps.push({
      action: battleStartAction,
      diff: {},
    })

    // Main battle loop
    while (!isBattleOver(teamA, teamB)) {
      round++

      // Safety check to prevent infinite loops - stalemate detection
      if (round > BATTLE_CONSTANTS.MAX_ROUNDS) {
        // Both teams still have alive units, this is a stalemate/draw
        const finalState = createSnapshot(teamA, teamB)
        
        // Log battle end as draw
        steps.push({
          action: { type: "battle_end", winner: "DRAW" },
          diff: {},
        })

        return {
          seed,
          initialState,
          steps,
          finalState,
          winner: "DRAW",
        }
      }

      // Log round start
      steps.push({
        action: { type: "round_start", round },
        diff: {},
      })

      // Process turns based on speed (faster team goes first)
      if (teamAGoesFirst) {
        // Team A (player) has higher speed, attacks first
        console.log(`[Battle Round ${round}] Team A attacks first (speed advantage)`)
        processTurn(teamA, teamB, steps, round)
        if (isBattleOver(teamA, teamB)) break

        // Team B attacks Team A
        processTurn(teamB, teamA, steps, round)
      } else {
        // Team B (opponent) has higher or equal speed, attacks first
        console.log(`[Battle Round ${round}] Team B attacks first (speed advantage)`)
        processTurn(teamB, teamA, steps, round)
        if (isBattleOver(teamA, teamB)) break

        // Team A attacks Team B
        processTurn(teamA, teamB, steps, round)
      }
    }

    // Determine winner (or draw if both teams are dead, though this shouldn't happen)
    let winner: string | "DRAW"
    if (teamA.some((u) => u.alive) && !teamB.some((u) => u.alive)) {
      winner = request.teamA.playerId
    } else if (teamB.some((u) => u.alive) && !teamA.some((u) => u.alive)) {
      winner = request.teamB.playerId
    } else {
      // Both teams dead or both alive (shouldn't happen, but handle gracefully)
      winner = "DRAW"
    }

    // Capture final state
    const finalState = createSnapshot(teamA, teamB)

    // Log battle end
    steps.push({
      action: { type: "battle_end", winner },
      diff: {},
    })

    return {
      seed,
      initialState,
      steps,
      finalState,
      winner,
    }
  }
}

// Export singleton instance
export const battleService = new BattleService()
