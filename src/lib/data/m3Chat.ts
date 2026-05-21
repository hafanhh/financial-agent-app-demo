// Iter2 — Persona-aware data for M3 Financial Agent.
// Provides:
//   - Locations list (for the Store Manager dropdown)
//   - Suggested prompts per persona
//   - 5 hardcoded example conversations (3 CEO, 2 Store Manager)
// Old CHAT_HISTORY (in finance.ts) is preserved and persona-tagged so it still renders.
// CANNED_RESPONSES in finance.ts are reused for live keyword matching.

import type { ChatMessage } from "./finance";

export type Persona = "CEO" | "StoreManager";

export const STORE_LOCATIONS = [
  "Seminyak",
  "Ubud",
  "Canggu",
  "Sanur",
  "Kuta",
  "Uluwatu",
  "Jakarta SCBD",
] as const;

export type StoreLocation = (typeof STORE_LOCATIONS)[number];

export const DEFAULT_SM_LOCATION: StoreLocation = "Seminyak";

export const PERSONA_SUBTITLE: Record<Persona, (location?: string) => string> = {
  CEO: () => "Cross-location view · All 7 stores · Strategic KPIs",
  StoreManager: (location = DEFAULT_SM_LOCATION) =>
    `Single location view · Currently: ${location} · Operational decisions`,
};

export const SUGGESTED_PROMPTS_CEO: string[] = [
  "Which 2 locations are dragging down chain margin this month, and why?",
  "How much revenue did we lose to stockouts in Bali this quarter?",
  "If we close Kuta on Mondays, what's the net P&L impact?",
];

export const SUGGESTED_PROMPTS_SM: string[] = [
  "What was my food cost % yesterday, and what's driving it?",
  "Which 3 SKUs at my store had the worst waste this week?",
  "Am I overstaffed on Tuesdays compared to other stores?",
];

// -----------------------------------------------------------------------------
// 5 HARDCODED CONVERSATIONS (3 CEO + 2 Store Manager — Seminyak)
// Each agent reply includes: headline + structured supporting block + 2–3 citations.
// -----------------------------------------------------------------------------

export const PERSONA_CHAT_HISTORY: ChatMessage[] = [
  // Example 1 (CEO) — Cross-location margin diagnosis
  {
    id: "ceo-ex1-user",
    role: "user",
    persona: "CEO",
    content: "Which 2 locations are dragging down chain margin this month, and why?",
    timestamp: "09:42",
  },
  {
    id: "ceo-ex1-agent",
    role: "agent",
    persona: "CEO",
    timestamp: "09:42",
    confidence: {
      level: "high",
      summary: "4 sources · 22 days of P&L + waste data",
      whyDetails: [
        "All numbers are direct measurements from chain P&L, not estimates",
        "Margin drivers verified against waste log and supplier invoice line items",
        "Sample size sufficient to rule out single-day noise",
      ],
    },
    content: [
      {
        type: "headline",
        text: "Canggu (52% GM, −8 pts MoM) and Sanur (55% GM, −5 pts MoM) are below chain average of 61%.",
        badge: "May 2026 · All 7 locations",
      },
      {
        type: "generic-table",
        headers: ["Location", "Gross Margin", "vs Chain Avg", "Primary driver"],
        rows: [
          [{ value: "Canggu" }, { value: "52%" }, { value: "−9 pts", tone: "negative" }, { value: "Waste spike (Matcha Cake overproduction)" }],
          [{ value: "Sanur" }, { value: "55%" }, { value: "−6 pts", tone: "negative" }, { value: "Butter cost +12%, not yet passed to menu" }],
          [{ value: "Seminyak" }, { value: "64%" }, { value: "+3 pts", tone: "positive" }, { value: "(benchmark)", tone: "muted" }],
        ],
      },
      {
        type: "citations",
        chips: [
          { id: "ceo1-c1", label: "P&L_May2026_Chain.xlsx · sheet \"By Location\"", docId: "pnl-may2026-chain", anchor: "By Location" },
          { id: "ceo1-c2", label: "Waste_Log_Canggu_W22.csv", docId: "waste-canggu-w22", anchor: "matcha-rows" },
          { id: "ceo1-c3", label: "Supplier_Invoices_May.pdf · page 7", docId: "supplier-invoices-may", page: 7, anchor: "butter-row" },
        ],
      },
    ],
  },

  // Example 2 (CEO) — Hidden revenue loss
  {
    id: "ceo-ex2-user",
    role: "user",
    persona: "CEO",
    content: "How much revenue did we lose to stockouts in Bali this quarter?",
    timestamp: "10:08",
  },
  {
    id: "ceo-ex2-agent",
    role: "agent",
    persona: "CEO",
    timestamp: "10:08",
    confidence: {
      level: "medium",
      summary: "Estimation method · 70% recovery assumption",
      whyDetails: [
        "Lost-revenue figure applies avg sell-through to documented stockout windows",
        "Assumes 70% of stockouts would have converted with M1 forecast adjustments",
        "Substitution behaviour within the same store not modeled",
      ],
      toIncrease: [
        "Pilot M1-driven production at Canggu for 4 weeks, measure actual stockout reduction",
        "Add cross-SKU substitution tracking to POS analytics",
      ],
    },
    content: [
      {
        type: "headline",
        text: "Estimated Rp 142M (~$9,100) in lost revenue from Apr–Jun 2026, concentrated in 3 SKUs at 2 locations.",
        badge: "Q2 2026 · Bali region",
      },
      {
        type: "ranked-bars",
        items: [
          { label: "Sourdough Loaf @ Canggu", value: 58, valueLabel: "Rp 58M lost", sublabel: "weekends, 14 stockout events", highlight: true },
          { label: "Pain au Chocolat @ Seminyak", value: 41, valueLabel: "Rp 41M lost", sublabel: "morning rush, 22 events" },
          { label: "Almond Croissant @ Ubud", value: 28, valueLabel: "Rp 28M lost", sublabel: "holiday peaks" },
        ],
        note: "Estimation method: applied avg sell-through rate to documented stockout windows. M1 forecast adjustments would have prevented ~70% of these.",
      },
      {
        type: "citations",
        chips: [
          { id: "ceo2-c1", label: "Stockout_Events_Q2_2026.csv", docId: "stockout-q2-2026", anchor: "canggu-sourdough" },
          { id: "ceo2-c2", label: "Sales_Pattern_Analysis_W18-W26.xlsx", docId: "sales-pattern-w18-w26", anchor: "SKU sell-through" },
          { id: "ceo2-c3", label: "M1_Backtest_Report.pdf · page 4", docId: "m1-backtest", page: 4, anchor: "counterfactual" },
        ],
      },
    ],
  },

  // Example 3 (CEO) — Strategic scenario (Kuta Monday closure)
  {
    id: "ceo-ex3-user",
    role: "user",
    persona: "CEO",
    content: "If we close Kuta on Mondays, what's the net P&L impact?",
    timestamp: "10:31",
  },
  {
    id: "ceo-ex3-agent",
    role: "agent",
    persona: "CEO",
    timestamp: "10:31",
    confidence: {
      level: "low",
      summary: "Untested scenario · directional only",
      whyDetails: [
        "Assumes 70% customer retention if Kuta closes Mondays",
        "Based on 3 months of POS data — limited seasonality coverage",
        "Competitor pricing not modeled",
      ],
      toIncrease: [
        "A/B test for 4 weeks (1 closed Monday in Kuta)",
        "Compare to industry retention data (Wave 2 module)",
      ],
    },
    content: [
      {
        type: "headline",
        text: "Net positive: ~Rp 4.2M/month savings. But qualitative risks worth weighing.",
        badge: "Scenario · Kuta · Mondays closed",
      },
      {
        type: "paragraphs",
        items: [
          { label: "Direct P&L", text: "Mondays at Kuta avg Rp 6.8M revenue, lowest of the week. Direct costs (labor + utilities + spoilage) avg Rp 11M → −Rp 4.2M contribution. Closing Mondays removes that loss." },
          { label: "Risk 1 — Customer experience", text: "Tourists planning multi-day visits expect 7-day operation. ~12% of weekly customers visit on more than one day; some will redirect to competitors. Soft impact, hard to recover." },
          { label: "Risk 2 — HR & contracts", text: "Staff hours redistribution may trigger contract renegotiation. Discuss with HR before action — particularly for the 4 full-time staff currently scheduled Mondays." },
        ],
      },
      {
        type: "view-data-button",
        label: "View underlying data",
        catalogFilter: ["xero-pnl", "hr-internal-sheet", "crm-mailchimp-audience"],
        bannerLabel: "Kuta Monday closure analysis",
      },
      {
        type: "citations",
        chips: [
          { id: "ceo3-c1", label: "Kuta_DOW_Revenue_2026.xlsx", docId: "kuta-dow-revenue", anchor: "DOW averages" },
          { id: "ceo3-c2", label: "Labor_Schedule_Q2.xlsx", docId: "labor-schedule-q2", anchor: "Kuta — Monday" },
          { id: "ceo3-c3", label: "Customer_Cross-visit_Analysis.pdf", docId: "customer-crossvisit", page: 1, anchor: "cross-visit-12pct" },
        ],
      },
    ],
  },

  // Example 4 (Store Manager — Seminyak) — Daily operational
  {
    id: "sm-ex4-user",
    role: "user",
    persona: "StoreManager",
    storeManagerLocation: "Seminyak",
    content: "What was my food cost % yesterday, and what's driving it?",
    timestamp: "08:14",
  },
  {
    id: "sm-ex4-agent",
    role: "agent",
    persona: "StoreManager",
    storeManagerLocation: "Seminyak",
    timestamp: "08:14",
    confidence: {
      level: "high",
      summary: "Direct measurement · POS + waste log + M1 forecast file",
      whyDetails: [
        "Food cost ratio is calculated from end-of-day POS + delivered-ingredient cost",
        "Butter usage measured at receiving, not estimated",
        "Cross-checked against M1 forecast variance for the same day",
      ],
    },
    content: [
      {
        type: "headline",
        text: "Food cost ran 34% yesterday vs 28% baseline. Driver: 18kg butter usage (vs typical 11kg).",
        badge: "Seminyak · Sat 18 May",
      },
      {
        type: "paragraphs",
        items: [
          { label: "Likely cause", text: "Extra Almond Croissant production for Sat morning rush — 60 units made (50 sold, 10 wasted)." },
          { label: "Recommendation", text: "M1 forecast suggested 52 units. Variance of 8 units = Rp 96K extra cost. Align Saturday morning production to the M1 number unless walk-in signals shift before 06:00." },
        ],
      },
      {
        type: "citations",
        chips: [
          { id: "sm4-c1", label: "Daily_PnL_Seminyak_2026-05-18.pdf", docId: "daily-pnl-seminyak-0518", page: 1, anchor: "food-cost-row" },
          { id: "sm4-c2", label: "Waste_Log_Seminyak_W20.csv", docId: "waste-seminyak-w20", anchor: "row-tue" },
          { id: "sm4-c3", label: "M1_Forecast_2026-05-18.json", docId: "m1-forecast-0518", anchor: "almond-row" },
        ],
      },
    ],
  },

  // Example 5 (Store Manager — Seminyak) — Self-comparison
  {
    id: "sm-ex5-user",
    role: "user",
    persona: "StoreManager",
    storeManagerLocation: "Seminyak",
    content: "Am I overstaffed on Tuesdays compared to other stores?",
    timestamp: "08:39",
  },
  {
    id: "sm-ex5-agent",
    role: "agent",
    persona: "StoreManager",
    storeManagerLocation: "Seminyak",
    timestamp: "08:39",
    confidence: {
      level: "medium",
      summary: "Peer benchmark · doesn't control for store size",
      whyDetails: [
        "Compares raw FTE counts; peer stores have different square footage and seating",
        "Traffic index is a proxy for true demand — outliers (weddings, events) not adjusted",
        "Tuesday alone — same-day-of-week comparison across 4 weeks only",
      ],
      toIncrease: [
        "Add square-footage normalization to staff benchmarks",
        "Use 8 weeks of Tuesdays to smooth outliers",
      ],
    },
    content: [
      {
        type: "headline",
        text: "Yes — Seminyak runs 1.4 FTE more on Tuesdays than peer-store average, despite 20% lower traffic.",
        badge: "Tuesday · vs Bali peers",
      },
      {
        type: "ranked-bars",
        items: [
          { label: "Seminyak Tue", value: 6.2, valueLabel: "6.2 FTE", secondaryLabel: "Traffic 78", highlight: true },
          { label: "Ubud Tue", value: 4.5, valueLabel: "4.5 FTE", secondaryLabel: "Traffic 95" },
          { label: "Sanur Tue", value: 4.8, valueLabel: "4.8 FTE", secondaryLabel: "Traffic 88" },
          { label: "Canggu Tue", value: 5.0, valueLabel: "5.0 FTE", secondaryLabel: "Traffic 102" },
        ],
        note: "Suggest reviewing Tue shift pattern. Estimated savings if right-sized: Rp 2.1M/month.",
      },
      {
        type: "citations",
        chips: [
          { id: "sm5-c1", label: "Staff_Schedule_Bali_May2026.xlsx", docId: "staff-schedule-bali", anchor: "Tuesdays — May" },
          { id: "sm5-c2", label: "Traffic_Counter_Logs.csv", docId: "traffic-counter-logs", anchor: "tue-rows" },
        ],
      },
    ],
  },
];
