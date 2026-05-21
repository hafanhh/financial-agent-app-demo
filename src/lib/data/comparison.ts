// Iter3 — Compare Locations panel.
// 7 location stat-blocks for Week 22 (May 13–19, 2026) + a chain-average row.
// 3 hardcoded comparison narratives. Other pairs use the raw stat blocks.

import type { ChatMessage } from "./finance";

export type LocationStats = {
  id: string;
  label: string;
  revenue: { value: string; n: number };       // n used for delta math
  grossMarginPct: { value: string; n: number };
  wastePct: { value: string; n: number };
  customers: { value: string; n: number };
  avgTicket: { value: string; n: number };
  topSku: string;
  staffHours: { value: string; n: number };
  hrsPerMillion: { value: string; n: number }; // staff hours per Rp 1M revenue
  stockouts: { value: string; n: number };
};

// All stats here are for Week 22 (May 13–19, 2026). Numbers chosen to line up
// with the iter2 chain narrative (Canggu 52% GM, Sanur 55%, Seminyak 64%, …).
export const LOCATION_STATS: Record<string, LocationStats> = {
  seminyak: {
    id: "seminyak",
    label: "Seminyak",
    revenue: { value: "Rp 312M", n: 312 },
    grossMarginPct: { value: "64%", n: 64 },
    wastePct: { value: "8%", n: 8 },
    customers: { value: "1,840", n: 1840 },
    avgTicket: { value: "Rp 169K", n: 169 },
    topSku: "Sourdough Loaf",
    staffHours: { value: "186 h", n: 186 },
    hrsPerMillion: { value: "4.2 h", n: 4.2 },
    stockouts: { value: "2 events", n: 2 },
  },
  ubud: {
    id: "ubud",
    label: "Ubud",
    revenue: { value: "Rp 268M", n: 268 },
    grossMarginPct: { value: "62%", n: 62 },
    wastePct: { value: "9%", n: 9 },
    customers: { value: "1,610", n: 1610 },
    avgTicket: { value: "Rp 166K", n: 166 },
    topSku: "Almond Croissant",
    staffHours: { value: "176 h", n: 176 },
    hrsPerMillion: { value: "4.6 h", n: 4.6 },
    stockouts: { value: "1 event", n: 1 },
  },
  canggu: {
    id: "canggu",
    label: "Canggu",
    revenue: { value: "Rp 198M", n: 198 },
    grossMarginPct: { value: "52%", n: 52 },
    wastePct: { value: "18%", n: 18 },
    customers: { value: "1,210", n: 1210 },
    avgTicket: { value: "Rp 164K", n: 164 },
    topSku: "Pain au Chocolat",
    staffHours: { value: "198 h", n: 198 },
    hrsPerMillion: { value: "6.8 h", n: 6.8 },
    stockouts: { value: "0 events", n: 0 },
  },
  sanur: {
    id: "sanur",
    label: "Sanur",
    revenue: { value: "Rp 241M", n: 241 },
    grossMarginPct: { value: "55%", n: 55 },
    wastePct: { value: "10%", n: 10 },
    customers: { value: "1,420", n: 1420 },
    avgTicket: { value: "Rp 170K", n: 170 },
    topSku: "Coconut Cake Slice",
    staffHours: { value: "168 h", n: 168 },
    hrsPerMillion: { value: "5.0 h", n: 5.0 },
    stockouts: { value: "1 event", n: 1 },
  },
  kuta: {
    id: "kuta",
    label: "Kuta",
    revenue: { value: "Rp 218M", n: 218 },
    grossMarginPct: { value: "59%", n: 59 },
    wastePct: { value: "12%", n: 12 },
    customers: { value: "1,290", n: 1290 },
    avgTicket: { value: "Rp 169K", n: 169 },
    topSku: "Pain au Chocolat",
    staffHours: { value: "172 h", n: 172 },
    hrsPerMillion: { value: "5.3 h", n: 5.3 },
    stockouts: { value: "0 events", n: 0 },
  },
  uluwatu: {
    id: "uluwatu",
    label: "Uluwatu",
    revenue: { value: "Rp 281M", n: 281 },
    grossMarginPct: { value: "63%", n: 63 },
    wastePct: { value: "9%", n: 9 },
    customers: { value: "1,540", n: 1540 },
    avgTicket: { value: "Rp 182K", n: 182 },
    topSku: "Basque Cheesecake",
    staffHours: { value: "164 h", n: 164 },
    hrsPerMillion: { value: "4.5 h", n: 4.5 },
    stockouts: { value: "1 event", n: 1 },
  },
  jakartaScbd: {
    id: "jakartaScbd",
    label: "Jakarta SCBD",
    revenue: { value: "Rp 326M", n: 326 },
    grossMarginPct: { value: "65%", n: 65 },
    wastePct: { value: "7%", n: 7 },
    customers: { value: "1,780", n: 1780 },
    avgTicket: { value: "Rp 183K", n: 183 },
    topSku: "Sourdough Loaf",
    staffHours: { value: "188 h", n: 188 },
    hrsPerMillion: { value: "4.0 h", n: 4.0 },
    stockouts: { value: "0 events", n: 0 },
  },
};

export const COMPARE_LOCATION_IDS = Object.keys(LOCATION_STATS);

// Chain average — derived once, statically (no need to recompute on render).
function avg(prop: (s: LocationStats) => number): number {
  const arr = Object.values(LOCATION_STATS).map(prop);
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function mostCommon(prop: (s: LocationStats) => string): string {
  const counts: Record<string, number> = {};
  for (const s of Object.values(LOCATION_STATS)) {
    counts[prop(s)] = (counts[prop(s)] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export const CHAIN_AVERAGE: LocationStats = {
  id: "chainAvg",
  label: "Chain average",
  revenue: { value: "Rp 263M", n: 263 },
  grossMarginPct: { value: "61%", n: 61 },
  wastePct: { value: "11%", n: 11 },
  customers: { value: "1,527", n: 1527 },
  avgTicket: { value: "Rp 172K", n: 172 },
  topSku: mostCommon((s) => s.topSku),
  staffHours: { value: `${Math.round(avg((s) => s.staffHours.n))} h`, n: Math.round(avg((s) => s.staffHours.n)) },
  hrsPerMillion: { value: `${avg((s) => s.hrsPerMillion.n).toFixed(1)} h`, n: Number(avg((s) => s.hrsPerMillion.n).toFixed(1)) },
  stockouts: { value: "5 events", n: 5 },
};

export const ALL_LOCATIONS_FOR_PICKER: { id: string; label: string }[] = [
  ...Object.values(LOCATION_STATS).map((s) => ({ id: s.id, label: s.label })),
  { id: CHAIN_AVERAGE.id, label: CHAIN_AVERAGE.label },
];

export function getLocation(id: string): LocationStats {
  if (id === CHAIN_AVERAGE.id) return CHAIN_AVERAGE;
  return LOCATION_STATS[id] ?? CHAIN_AVERAGE;
}

export const COMPARE_ROWS: {
  key: keyof Omit<LocationStats, "id" | "label">;
  label: string;
  format: "pct" | "currency" | "count" | "text";
}[] = [
  { key: "revenue", label: "Revenue", format: "currency" },
  { key: "grossMarginPct", label: "Gross margin", format: "pct" },
  { key: "wastePct", label: "Waste %", format: "pct" },
  { key: "customers", label: "Customers", format: "count" },
  { key: "avgTicket", label: "Avg ticket", format: "currency" },
  { key: "topSku", label: "Top SKU", format: "text" },
  { key: "staffHours", label: "Staff hrs", format: "count" },
  { key: "hrsPerMillion", label: "Hrs / Rp 1M", format: "count" },
  { key: "stockouts", label: "Stockouts", format: "count" },
];

// % difference for numeric rows; "—" for text rows. Sign convention: left vs right.
export function rowDifference(
  left: LocationStats,
  right: LocationStats,
  row: (typeof COMPARE_ROWS)[number],
): { text: string; tone: "good" | "bad" | "neutral" } {
  if (row.key === "topSku") return { text: "—", tone: "neutral" };
  const l = left[row.key] as { value: string; n: number };
  const r = right[row.key] as { value: string; n: number };
  if (r.n === 0 && l.n === 0) return { text: "—", tone: "neutral" };

  if (row.format === "pct") {
    const diff = l.n - r.n;
    const text = `${diff > 0 ? "+" : ""}${diff} pts`;
    return classifyTone(diff, row.key);
  }
  if (row.key === "stockouts") {
    const diff = l.n - r.n;
    if (diff === 0) return { text: "—", tone: "neutral" };
    return { text: `${diff > 0 ? "+" : ""}${diff} events`, tone: diff > 0 ? "bad" : "good" };
  }
  // generic % delta
  const pct = r.n === 0 ? 0 : ((l.n - r.n) / r.n) * 100;
  const text = `${pct > 0 ? "+" : ""}${pct.toFixed(0)}%`;
  return classifyTone(pct, row.key);

  function classifyTone(value: number, key: string): { text: string; tone: "good" | "bad" | "neutral" } {
    const abs = Math.abs(value);
    if (abs <= 5) return { text, tone: "neutral" };
    // For these metrics "up" is bad (left is worse than right):
    const upIsBad = key === "wastePct" || key === "hrsPerMillion" || key === "staffHours";
    if (upIsBad) {
      return { text, tone: value > 0 ? "bad" : "good" };
    }
    // For revenue/margin/customers/avgTicket "up" is good:
    return { text, tone: value > 0 ? "good" : "bad" };
  }
}

// --- 3 hardcoded explanations (Generate explanation button) ------------------

export type ComparePairId = "seminyak-canggu" | "ubud-sanur" | "jakartaScbd-chainAvg" | "generic";

export function pairId(leftId: string, rightId: string): ComparePairId {
  if (leftId === "seminyak" && rightId === "canggu") return "seminyak-canggu";
  if (leftId === "canggu" && rightId === "seminyak") return "seminyak-canggu";
  if (leftId === "ubud" && rightId === "sanur") return "ubud-sanur";
  if (leftId === "sanur" && rightId === "ubud") return "ubud-sanur";
  if (leftId === "jakartaScbd" && rightId === "chainAvg") return "jakartaScbd-chainAvg";
  if (leftId === "chainAvg" && rightId === "jakartaScbd") return "jakartaScbd-chainAvg";
  return "generic";
}

// The reply that gets injected back into chat when "Generate explanation" is clicked.
// Returns a partial ChatMessage; the caller assigns id/timestamp/persona.
export function buildExplanationMessage(
  leftId: string,
  rightId: string,
): Pick<ChatMessage, "content" | "confidence"> {
  const left = getLocation(leftId);
  const right = getLocation(rightId);

  const matrix: Record<ComparePairId, Pick<ChatMessage, "content" | "confidence">> = {
    "seminyak-canggu": {
      content: [
        {
          type: "headline",
          text: "3 things explain why Seminyak outperforms Canggu this week:",
          badge: "W22 · pair analysis",
        },
        {
          type: "paragraphs",
          items: [
            {
              label: "Demand pattern stability",
              text: "Seminyak has predictable tourist + expat mix; M1 forecasts within 8%. Canggu has higher variance from surf-tourist day-trip waves, forecasts within 14%, leading to defensive overproduction.",
            },
            {
              label: "Waste concentration",
              text: "60% of Canggu's waste is in Matcha Cake and Coconut Cake (high-cost SKUs). Seminyak's waste is spread across cheaper bread SKUs.",
            },
            {
              label: "Labor utilization",
              text: "Seminyak runs 4.2 hrs per Rp 1M revenue; Canggu 6.8 hrs. The Canggu schedule was built for high season and hasn't been adjusted for shoulder.",
            },
          ],
        },
        {
          type: "citations",
          chips: [
            { id: "cmp-sc-1", label: "M1_Backtest_Report.pdf · page 4", docId: "m1-backtest", page: 4, anchor: "counterfactual" },
            { id: "cmp-sc-2", label: "Waste_Log_Canggu_W22.csv", docId: "waste-canggu-w22", anchor: "matcha-rows" },
            { id: "cmp-sc-3", label: "Staff_Schedule_Bali_May2026.xlsx", docId: "staff-schedule-bali", anchor: "Tuesdays — May" },
          ],
        },
      ],
      confidence: {
        level: "high",
        summary: "3 sources · 22 days of P&L + waste data",
        whyDetails: [
          "All three claims are direct measurements, not model estimates",
          "Forecast variance gap is statistically significant (n = 67 days)",
          "Waste SKU mix verified against POS line items",
        ],
      },
    },
    "ubud-sanur": {
      content: [
        {
          type: "headline",
          text: "Ubud and Sanur are similar — but Sanur is leaking margin to butter cost, Ubud isn't.",
          badge: "W22 · pair analysis",
        },
        {
          type: "paragraphs",
          items: [
            {
              label: "Margin gap",
              text: "Ubud 62% GM vs Sanur 55%. Sanur's gap is fully explained by butter cost +12% from Pak Seto, which Sanur hasn't yet passed through to menu prices.",
            },
            {
              label: "Customer behaviour",
              text: "Both lean tourist (~70% of weekly customers). Avg ticket is within 2.5% — the same product mix is being sold.",
            },
            {
              label: "Recommendation",
              text: "Mirror Ubud's pricing approach: a 4% rise on butter-heavy SKUs would close most of the margin gap without denting traffic.",
            },
          ],
        },
        {
          type: "citations",
          chips: [
            { id: "cmp-us-1", label: "Supplier_Invoices_May.pdf · page 7", docId: "supplier-invoices-may", page: 7, anchor: "butter-row" },
            { id: "cmp-us-2", label: "P&L_May2026_Chain.xlsx · sheet \"By Location\"", docId: "pnl-may2026-chain", anchor: "By Location" },
          ],
        },
      ],
      confidence: {
        level: "medium",
        summary: "Pricing assumption · 2 sources",
        whyDetails: [
          "Butter pass-through impact estimated, not measured",
          "Tourist mix assumed constant week-on-week",
        ],
        toIncrease: [
          "Run pilot 4% price rise at Sanur for 2 weeks",
          "Compare elasticity vs Ubud as control",
        ],
      },
    },
    "jakartaScbd-chainAvg": {
      content: [
        {
          type: "headline",
          text: "Jakarta SCBD outperforms the chain on every metric except staff hours.",
          badge: "W22 · Jakarta vs chain",
        },
        {
          type: "paragraphs",
          items: [
            {
              label: "Premium-pricing holds",
              text: "Jakarta avg ticket Rp 183K vs chain Rp 172K (+6%). Margin gap (+4 pts) tracks pricing power, not unit cost.",
            },
            {
              label: "Single-location risk",
              text: "Jakarta is 19% of chain revenue from one store. Bali is 81% from 6 stores. If anything happens to Jakarta SCBD (lease, talent), exposure is concentrated.",
            },
            {
              label: "Operational efficiency",
              text: "Hrs/Rp 1M is best-in-chain at 4.0 — Jakarta is the model for what right-sized staffing looks like.",
            },
          ],
        },
        {
          type: "citations",
          chips: [
            { id: "cmp-jc-1", label: "P&L_May2026_Chain.xlsx · sheet \"By Location\"", docId: "pnl-may2026-chain", anchor: "By Location" },
            { id: "cmp-jc-2", label: "Staff_Schedule_Bali_May2026.xlsx", docId: "staff-schedule-bali", anchor: "Tuesdays — May" },
          ],
        },
      ],
      confidence: {
        level: "high",
        summary: "Direct measurement · 2 sources",
        whyDetails: [
          "All metrics are observed, not modelled",
          "Single-location concentration risk is structural, not interpretive",
        ],
      },
    },
    generic: {
      content: [
        {
          type: "headline",
          text: `Differences between ${left.label} and ${right.label}:`,
          badge: "W22 · pair analysis",
        },
        {
          type: "bullets",
          items: [
            `Revenue gap: ${left.label} ${left.revenue.value} vs ${right.label} ${right.revenue.value}.`,
            `Margin gap: ${left.label} ${left.grossMarginPct.value} vs ${right.label} ${right.grossMarginPct.value}.`,
            `Waste gap: ${left.label} ${left.wastePct.value} vs ${right.label} ${right.wastePct.value}.`,
          ],
        },
        {
          type: "text",
          text: "Detailed diagnostic narrative not pre-written for this pair. Pick Seminyak/Canggu, Ubud/Sanur, or Jakarta SCBD vs Chain average to see the agent's full diagnosis.",
        },
        {
          type: "citations",
          chips: [
            { id: "cmp-g-1", label: "P&L_May2026_Chain.xlsx · sheet \"By Location\"", docId: "pnl-may2026-chain", anchor: "By Location" },
          ],
        },
      ],
      confidence: {
        level: "medium",
        summary: "Aggregated metrics · 1 source",
        whyDetails: [
          "Pair not pre-analyzed for diagnostic narrative",
          "Metrics correct, but causal chain not yet established",
        ],
        toIncrease: ["Ask: 'Diagnose the largest driver of this gap.'"],
      },
    },
  };
  return matrix[pairId(leftId, rightId)];
}
