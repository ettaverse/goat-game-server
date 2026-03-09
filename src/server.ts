import express from "express"
import cors from "cors"
import matchRoute from "./routes/matchRoute"
import cardsRoute from "./routes/cardsRoute"

const app = express()
const PORT = parseInt(process.env.PORT || "3000", 10)

app.use(cors())
app.use(express.json())

// Health check for App Runner
app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/", matchRoute)
app.use("/", cardsRoute)

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Autobattler server running on port ${PORT}`)
})