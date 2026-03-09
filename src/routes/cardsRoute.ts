import { Elysia } from "elysia"
import { getAllCards, getAllHeroCards } from "../data/cards"

export const cardsRoute = new Elysia()
  .get("/cards", () => getAllCards())
  .get("/heroes", () => getAllHeroCards())
