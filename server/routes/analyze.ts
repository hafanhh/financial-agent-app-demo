import { Router, Request, Response } from 'express'
import { upload } from '../middleware/upload.js'
import { analyzeDocument } from '../services/claude.js'

export const analyzeRouter = Router()

analyzeRouter.post(
  '/analyze',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' })
      return
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const userQuestion = req.body.question?.trim()
    if (!userQuestion) {
      res.status(400).json({ error: 'Question is required' })
      return
    }

    const persona = (req.body.persona as 'CEO' | 'StoreManager') || 'CEO'
    const activeLocation = req.body.activeLocation || 'Chain-wide'

    try {
      const result = await analyzeDocument({
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf',
        originalName: req.file.originalname,
        userQuestion,
        persona,
        activeLocation,
      })
      res.json(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      console.error('[/api/analyze]', message)
      res.status(500).json({ error: message })
    }
  },
)
