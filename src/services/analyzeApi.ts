export interface AnalyzeRequest {
  file: File
  question: string
  persona: 'CEO' | 'StoreManager'
  activeLocation?: string
}

export interface AnalyzeResponse {
  answer: string
  extractedData: {
    documentType: string
    summary: string
    keyMetrics: { label: string; value: string; unit?: string }[]
  } | null
  citations: { source: string; page?: number; excerpt: string }[]
  confidence: 'high' | 'medium' | 'low'
  confidenceReason: string
  crossReferenced: { module: string; dataPoint: string; insight: string }[]
}

export async function analyzeDocument(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const formData = new FormData()
  formData.append('file', req.file)
  formData.append('question', req.question)
  formData.append('persona', req.persona)
  if (req.activeLocation) {
    formData.append('activeLocation', req.activeLocation)
  }

  const response = await fetch('http://localhost:3001/api/analyze', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error((err as { error?: string }).error || `Server error ${response.status}`)
  }

  return response.json() as Promise<AnalyzeResponse>
}
