import { Elysia } from "elysia"
import { getAllGameCards } from "../data/cards"

export const cardsRoute = new Elysia()
  .get("/cards", () => getAllGameCards())
