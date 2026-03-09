import { Router, Request, Response } from "express"
import { getAllCards, getAllHeroCards } from "../data/cards"

const router = Router()

/**
 * GET /cards
 * Returns all available standard cards
 */
router.get("/cards", (req: Request, res: Response) => {
  try {
    const cards = getAllCards()
    res.json(cards)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
})

/**
 * GET /heroes
 * Returns all available hero cards
 */
router.get("/heroes", (req: Request, res: Response) => {
  try {
    const heroes = getAllHeroCards()
    res.json(heroes)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "An unknown error occurred" })
    }
  }
})

export default router
