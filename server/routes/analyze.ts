import { Router, Request, Response } from 'express'
import { upload } from '../middleware/upload.js'
import { analyzeDocument } from '../services/claude.js'
import { saveMessage, getOrCreateSession } from '../services/db.js'

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
    const sessionId = req.body.sessionId as string | undefined

    try {
      const result = await analyzeDocument({
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf',
        originalName: req.file.originalname,
        userQuestion,
        persona,
        activeLocation,
      })

      // Persist to memory if session provided
      if (sessionId) {
        getOrCreateSession(sessionId, persona, persona === 'StoreManager' ? activeLocation : undefined)
        const now = Date.now()
        saveMessage({
          id: `u-${now}`,
          session_id: sessionId,
          role: 'user',
          content: `[Document: ${req.file.originalname}] ${userQuestion}`,
          citations: null,
          confidence: null,
          message_type: 'upload',
        })
        saveMessage({
          id: `a-${now}`,
          session_id: sessionId,
          role: 'agent',
          content: result.answer,
          citations: JSON.stringify(result.citations),
          confidence: result.confidence,
          message_type: 'upload',
        })
      }

      res.json(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      console.error('[/api/analyze]', message)
      res.status(500).json({ error: message })
    }
  },
)
