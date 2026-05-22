import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildSystemPrompt } from '../prompts/system.js'


export interface AnalyzeParams {
  fileBuffer: Buffer
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'
  originalName: string
  userQuestion: string
  persona: 'CEO' | 'StoreManager'
  activeLocation: string
}

export interface KeyMetric {
  label: string
  value: string
  unit?: string
}

export interface ExtractedData {
  documentType: string
  summary: string
  keyMetrics: KeyMetric[]
}

export interface Citation {
  source: string
  page?: number
  excerpt: string
}

export interface CrossReference {
  module: 'M1' | 'M2' | 'M3'
  dataPoint: string
  insight: string
}

export interface AnalyzeResult {
  answer: string
  extractedData: ExtractedData | null
  citations: Citation[]
  confidence: 'high' | 'medium' | 'low'
  confidenceReason: string
  crossReferenced: CrossReference[]
}

export async function analyzeDocument(params: AnalyzeParams): Promise<AnalyzeResult> {
  const { fileBuffer, mimeType, originalName, userQuestion, persona, activeLocation } = params

  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '').getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction: buildSystemPrompt(persona, activeLocation),
  })

  const base64Data = fileBuffer.toString('base64')

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API timed out after 30s')), 30_000),
  )

  console.log(`[analyze] calling Gemini for "${originalName}"…`)
  const result = await Promise.race([
    model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      `Filename: ${originalName}\nUser role: ${persona === 'CEO' ? 'CEO (chain-wide view)' : `Store Manager (${activeLocation})`}\nQuestion: ${userQuestion}\n\nPlease analyze the uploaded document and answer the question. Follow the response format in your system prompt exactly.`,
    ]),
    timeout,
  ])
  console.log(`[analyze] Gemini responded`)

  const rawText = result.response.text()
  return parseResponse(rawText, originalName)
}

function parseResponse(raw: string, filename: string): AnalyzeResult {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    return {
      answer: parsed.answer || 'Could not extract answer.',
      extractedData: parsed.extractedData || null,
      citations: parsed.citations || [{ source: filename, excerpt: 'Uploaded document' }],
      confidence: parsed.confidence || 'medium',
      confidenceReason: parsed.confidenceReason || 'Based on uploaded document only.',
      crossReferenced: parsed.crossReferenced || [],
    }
  } catch {
    return {
      answer: raw,
      extractedData: null,
      citations: [{ source: filename, excerpt: 'Uploaded document' }],
      confidence: 'medium',
      confidenceReason: 'Response could not be fully structured.',
      crossReferenced: [],
    }
  }
}
