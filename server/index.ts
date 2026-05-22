import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { analyzeRouter } from './routes/analyze.js'

dotenv.config()

const app = express()
const PORT = process.env.SERVER_PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api', analyzeRouter)

app.listen(PORT, () => {
  console.log(`BAKED API server running on :${PORT}`)
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠  GEMINI_API_KEY not set — /api/analyze will return 503')
  }
})
