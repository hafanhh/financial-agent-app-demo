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
    model: 'gemini-3-flash-preview',
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

// ── Waste log analysis ────────────────────────────────────────────────────────

export interface WasteItem {
  sku: string
  estimatedUnits: number
  estimatedCostIDR: number
  confidence: 'high' | 'medium' | 'low'
  condition: 'waste' | 'possibly-sellable' | 'unclear'
  notes?: string
}

export interface WasteLogResult {
  wasteItems: WasteItem[]
  totalEstimatedWasteCostIDR: number
  imageQuality: 'clear' | 'partial' | 'unclear'
  recommendation: string
}

const WASTE_SYSTEM_PROMPT = `You are analyzing an end-of-day waste photo from a BAKED bakery-café.

Your task:
1. IDENTIFY each food item visible in the image
2. ESTIMATE quantity (units or weight where visible)
3. ASSESS condition (clearly waste / possibly sellable / unclear)
4. MAP each item to the closest BAKED SKU:
   Sourdough Loaf, Pain au Chocolat, Almond Croissant, Cinnamon Roll,
   Matcha Cake Slice, Coconut Cake Slice, Banana Bread, Brownie,
   Gluten-free Muffin, Avocado Toast, Iced Latte, Cold Brew

Return ONLY valid JSON with no markdown:
{
  "wasteItems": [
    {
      "sku": "Almond Croissant",
      "estimatedUnits": 8,
      "estimatedCostIDR": 96000,
      "confidence": "high",
      "condition": "waste",
      "notes": "slightly stale, still presentable"
    }
  ],
  "totalEstimatedWasteCostIDR": 340000,
  "imageQuality": "clear",
  "recommendation": "one sentence action recommendation"
}`

export async function analyzeWaste(params: {
  fileBuffer: Buffer
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  location: string
}): Promise<WasteLogResult> {
  const { fileBuffer, mimeType, location } = params

  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '').getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: WASTE_SYSTEM_PROMPT,
  })

  const base64Data = fileBuffer.toString('base64')

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API timed out after 30s')), 30_000),
  )

  console.log(`[waste-log] calling Gemini for location "${location}"…`)
  const result = await Promise.race([
    model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      `Location: ${location}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\nAnalyze this end-of-day waste photo and return JSON as instructed.`,
    ]),
    timeout,
  ])
  console.log(`[waste-log] Gemini responded`)

  const rawText = result.response.text()
  return parseWasteResponse(rawText)
}

function parseWasteResponse(raw: string): WasteLogResult {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    return {
      wasteItems: parsed.wasteItems || [],
      totalEstimatedWasteCostIDR: parsed.totalEstimatedWasteCostIDR || 0,
      imageQuality: parsed.imageQuality || 'unclear',
      recommendation: parsed.recommendation || 'Review waste items and adjust production.',
    }
  } catch {
    return {
      wasteItems: [],
      totalEstimatedWasteCostIDR: 0,
      imageQuality: 'unclear',
      recommendation: 'Could not parse waste analysis. Please try with a clearer photo.',
    }
  }
}

// ── Document analysis ─────────────────────────────────────────────────────────

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
