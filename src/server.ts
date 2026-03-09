import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { matchRoute } from "./routes/matchRoute"
import { cardsRoute } from "./routes/cardsRoute"

const PORT = parseInt(process.env.PORT || "3000", 10)

const app = new Elysia()
  .use(cors())
  .get("/health", () => ({ status: "ok" }))
  .use(matchRoute)
  .use(cardsRoute)
  .listen(PORT)

console.log(`Goat Game server running on port ${app.server?.port}`)
