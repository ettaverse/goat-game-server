import { Elysia } from "elysia"
import { battleService } from "../services/battleService"
import { validateMatchRequest } from "../utils/validation"
import { BattleError } from "../utils/errors"

export const matchRoute = new Elysia()
  .post("/match", ({ body, set }) => {
    try {
      validateMatchRequest(body)
      return battleService.simulateBattle(body)
    } catch (err) {
      if (err instanceof BattleError) {
        set.status = err.statusCode
        return { error: err.message }
      }
      if (err instanceof Error) {
        set.status = 500
        return { error: err.message }
      }
      set.status = 500
      return { error: "An unknown error occurred" }
    }
  })
