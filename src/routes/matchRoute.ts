import { Router, Request, Response } from "express"
import { battleService } from "../services/battleService"
import { validateMatchRequest } from "../utils/validation"
import { BattleError } from "../utils/errors"

const router = Router()

router.post("/match", (req: Request, res: Response) => {
  try {
    // Validate request
    validateMatchRequest(req.body)

    // Simulate battle
    const result = battleService.simulateBattle(req.body)
    res.json(result)
  } catch (err) {
    if (err instanceof BattleError) {
      res.status(err.statusCode).json({ error: err.message })
    } else if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
})

export default router