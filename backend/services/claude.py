import os
import json
import asyncio
from datetime import datetime
from typing import Optional, List, Literal
from google import genai
from google.genai import types
from backend.prompts.system import build_system_prompt

_client: Optional[genai.Client] = None

def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
    return _client


class KeyMetric:
    def __init__(self, label: str, value: str, unit: Optional[str] = None):
        self.label = label
        self.value = value
        self.unit = unit

    def to_dict(self):
        return {"label": self.label, "value": self.value, "unit": self.unit}


class ExtractedData:
    def __init__(self, document_type: str, summary: str, key_metrics: List[KeyMetric]):
        self.documentType = document_type
        self.summary = summary
        self.keyMetrics = key_metrics

    def to_dict(self):
        return {
            "documentType": self.documentType,
            "summary": self.summary,
            "keyMetrics": [m.to_dict() for m in self.keyMetrics],
        }


class Citation:
    def __init__(self, source: str, excerpt: str, page: Optional[int] = None):
        self.source = source
        self.page = page
        self.excerpt = excerpt

    def to_dict(self):
        d = {"source": self.source, "excerpt": self.excerpt}
        if self.page is not None:
            d["page"] = self.page
        return d


class CrossReference:
    def __init__(self, module: Literal["M1", "M2", "M3"], data_point: str, insight: str):
        self.module = module
        self.dataPoint = data_point
        self.insight = insight

    def to_dict(self):
        return {
            "module": self.module,
            "dataPoint": self.dataPoint,
            "insight": self.insight,
        }


class AnalyzeResult:
    def __init__(
        self,
        answer: str,
        extracted_data: Optional[ExtractedData],
        citations: List[Citation],
        confidence: Literal["high", "medium", "low"],
        confidence_reason: str,
        cross_referenced: List[CrossReference],
    ):
        self.answer = answer
        self.extractedData = extracted_data
        self.citations = citations
        self.confidence = confidence
        self.confidenceReason = confidence_reason
        self.crossReferenced = cross_referenced

    def to_dict(self):
        return {
            "answer": self.answer,
            "extractedData": self.extractedData.to_dict() if self.extractedData else None,
            "citations": [c.to_dict() for c in self.citations],
            "confidence": self.confidence,
            "confidenceReason": self.confidenceReason,
            "crossReferenced": [cr.to_dict() for cr in self.crossReferenced],
        }


class WasteItem:
    def __init__(
        self,
        sku: str,
        estimated_units: int,
        estimated_cost_idr: int,
        confidence: Literal["high", "medium", "low"],
        condition: Literal["waste", "possibly-sellable", "unclear"],
        notes: Optional[str] = None,
    ):
        self.sku = sku
        self.estimatedUnits = estimated_units
        self.estimatedCostIDR = estimated_cost_idr
        self.confidence = confidence
        self.condition = condition
        self.notes = notes

    def to_dict(self):
        return {
            "sku": self.sku,
            "estimatedUnits": self.estimatedUnits,
            "estimatedCostIDR": self.estimatedCostIDR,
            "confidence": self.confidence,
            "condition": self.condition,
            "notes": self.notes,
        }


class WasteLogResult:
    def __init__(
        self,
        waste_items: List[WasteItem],
        total_estimated_waste_cost_idr: int,
        image_quality: Literal["clear", "partial", "unclear"],
        recommendation: str,
    ):
        self.wasteItems = waste_items
        self.totalEstimatedWasteCostIDR = total_estimated_waste_cost_idr
        self.imageQuality = image_quality
        self.recommendation = recommendation

    def to_dict(self):
        return {
            "wasteItems": [item.to_dict() for item in self.wasteItems],
            "totalEstimatedWasteCostIDR": self.totalEstimatedWasteCostIDR,
            "imageQuality": self.imageQuality,
            "recommendation": self.recommendation,
        }


WASTE_SYSTEM_PROMPT = """You are analyzing an end-of-day waste photo from a BAKED bakery-café.

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
}"""

MODEL = "gemini-2.0-flash"


async def analyze_document(
    file_buffer: bytes,
    mime_type: str,
    original_name: str,
    user_question: str,
    persona: Literal["CEO", "StoreManager"],
    activeLocation: str,
) -> AnalyzeResult:
    """Analyze uploaded document using Gemini."""

    role_text = (
        "CEO (chain-wide view)" if persona == "CEO" else f"Store Manager ({activeLocation})"
    )
    prompt = f"""Filename: {original_name}
User role: {role_text}
Question: {user_question}

Please analyze the uploaded document and answer the question. Follow the response format in your system prompt exactly."""

    system_prompt = build_system_prompt(persona, activeLocation)
    print(f'[analyze] calling Gemini for "{original_name}"…')

    try:
        raw = await asyncio.wait_for(
            _call_gemini(file_buffer, mime_type, prompt, system_prompt),
            timeout=30.0,
        )
        print("[analyze] Gemini responded")
        return parse_response(raw, original_name)
    except asyncio.TimeoutError:
        return AnalyzeResult(
            answer="Gemini API timed out after 30 seconds.",
            extracted_data=None,
            citations=[Citation(source=original_name, excerpt="Uploaded document")],
            confidence="low",
            confidence_reason="Request timed out.",
            cross_referenced=[],
        )


async def analyze_waste(
    file_buffer: bytes,
    mime_type: str,
    location: str,
) -> WasteLogResult:
    """Analyze waste photo using Gemini."""

    date_str = datetime.now().strftime("%d/%m/%Y")
    prompt = f"""Location: {location}
Date: {date_str}

Analyze this end-of-day waste photo and return JSON as instructed."""

    print(f'[waste-log] calling Gemini for location "{location}"…')

    try:
        raw = await asyncio.wait_for(
            _call_gemini(file_buffer, mime_type, prompt, WASTE_SYSTEM_PROMPT),
            timeout=30.0,
        )
        print("[waste-log] Gemini responded")
        return parse_waste_response(raw)
    except asyncio.TimeoutError:
        return WasteLogResult(
            waste_items=[],
            total_estimated_waste_cost_idr=0,
            image_quality="unclear",
            recommendation="Gemini API timed out. Please try again.",
        )


async def _call_gemini(
    file_buffer: bytes,
    mime_type: str,
    prompt: str,
    system_instruction: str,
) -> str:
    """Call Gemini API asynchronously with an image and a text prompt."""
    client = _get_client()
    loop = asyncio.get_event_loop()

    def _sync_call():
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(data=file_buffer, mime_type=mime_type),
                prompt,
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        return response.text

    return await loop.run_in_executor(None, _sync_call)


def parse_response(raw: str, filename: str) -> AnalyzeResult:
    """Parse JSON response from Gemini."""
    cleaned = raw.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()

    try:
        parsed = json.loads(cleaned)

        extracted_data = None
        if parsed.get("extractedData"):
            ed = parsed["extractedData"]
            key_metrics = [
                KeyMetric(m["label"], m["value"], m.get("unit"))
                for m in ed.get("keyMetrics", [])
            ]
            extracted_data = ExtractedData(
                ed.get("documentType", ""),
                ed.get("summary", ""),
                key_metrics,
            )

        citations = [
            Citation(c["source"], c["excerpt"], c.get("page"))
            for c in parsed.get("citations", [])
        ]
        if not citations:
            citations = [Citation(source=filename, excerpt="Uploaded document")]

        cross_referenced = [
            CrossReference(cr["module"], cr["dataPoint"], cr["insight"])
            for cr in parsed.get("crossReferenced", [])
        ]

        return AnalyzeResult(
            answer=parsed.get("answer", "Could not extract answer."),
            extracted_data=extracted_data,
            citations=citations,
            confidence=parsed.get("confidence", "medium"),
            confidence_reason=parsed.get("confidenceReason", "Based on uploaded document only."),
            cross_referenced=cross_referenced,
        )
    except json.JSONDecodeError:
        return AnalyzeResult(
            answer=raw,
            extracted_data=None,
            citations=[Citation(source=filename, excerpt="Uploaded document")],
            confidence="medium",
            confidence_reason="Response could not be fully structured.",
            cross_referenced=[],
        )


def parse_waste_response(raw: str) -> WasteLogResult:
    """Parse JSON response from Gemini for waste analysis."""
    cleaned = raw.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()

    try:
        parsed = json.loads(cleaned)

        waste_items = [
            WasteItem(
                item["sku"],
                item["estimatedUnits"],
                item["estimatedCostIDR"],
                item["confidence"],
                item["condition"],
                item.get("notes"),
            )
            for item in parsed.get("wasteItems", [])
        ]

        return WasteLogResult(
            waste_items=waste_items,
            total_estimated_waste_cost_idr=parsed.get("totalEstimatedWasteCostIDR", 0),
            image_quality=parsed.get("imageQuality", "unclear"),
            recommendation=parsed.get("recommendation", "Review waste items and adjust production."),
        )
    except json.JSONDecodeError:
        return WasteLogResult(
            waste_items=[],
            total_estimated_waste_cost_idr=0,
            image_quality="unclear",
            recommendation="Could not parse waste analysis. Please try with a clearer photo.",
        )
