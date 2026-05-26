import { Router } from 'express'
import multer from 'multer'
import { analyzeWaste } from '../services/claude.js'
import { saveWasteLog, confirmWasteLog, getOrCreateSession } from '../services/db.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  },
})

export const wasteLogRouter = Router()

// POST /api/waste-log — analyze a waste photo via Gemini
wasteLogRouter.post('/', upload.single('file'), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({ error: 'GEMINI_API_KEY not set' })
    return
  }

  const file = req.file
  const location = (req.body.location as string) || 'Unknown'
  const sessionId = req.body.sessionId as string | undefined

  if (!file) {
    res.status(400).json({ error: 'Image file required' })
    return
  }

  const mimeType = file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp'

  try {
    const result = await analyzeWaste({ fileBuffer: file.buffer, mimeType, location })

    // Save to DB as unconfirmed
    const logId = saveWasteLog({
      id: `wl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      session_id: sessionId ?? null,
      location,
      logged_at: Date.now(),
      items: JSON.stringify(result.wasteItems),
      total_cost_idr: result.totalEstimatedWasteCostIDR,
      image_quality: result.imageQuality ?? null,
    })

    // Ensure session exists if provided
    if (sessionId) {
      getOrCreateSession(sessionId, 'StoreManager', location)
    }

    res.json({ logId, ...result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Waste analysis failed'
    console.error('[waste-log]', message)
    res.status(500).json({ error: message })
  }
})

// POST /api/waste-log/:id/confirm — user confirms the logged items
wasteLogRouter.post('/:id/confirm', (req, res) => {
  const { id } = req.params
  try {
    confirmWasteLog(id)
    res.json({ ok: true, logId: id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Confirm failed'
    res.status(500).json({ error: message })
  }
})
