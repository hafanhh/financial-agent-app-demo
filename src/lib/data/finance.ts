export type CitationChip = {
  id: string;
  label: string;
  // Iter2 — linking citations to Knowledge Base docs. Optional so existing data stays valid.
  docId?: string;
  page?: number;
  anchor?: string;
};

export type ChatTableRow = { metric: string; w21: string; w20: string; delta: string; negative?: boolean };
export type ChatBarItem = { label: string; value: number; highlight?: boolean };

// Iter2 — generic table for arbitrary headers/rows (used by Example 1 location breakdown).
export type GenericTableCell = {
  value: string;
  tone?: "negative" | "positive" | "muted" | "benchmark";
};

// Iter2 — ranked list with IDR amounts (Example 2) and FTE bars (Example 5).
export type RankedBarItem = {
  label: string;
  value: number;            // numeric for bar width
  valueLabel: string;       // formatted display, e.g. "Rp 58M"
  sublabel?: string;        // context line under label
  secondaryLabel?: string;  // small chip on the right (e.g. "Traffic 78")
  highlight?: boolean;
};

// Iter2 — multi-paragraph causal explanation (Example 3).
export type ParagraphBlock = { label?: string; text: string };

export type AgentMessageContent =
  | { type: "text"; text: string }
  | { type: "headline"; text: string; badge?: string }
  | { type: "table"; rows: ChatTableRow[] }
  | { type: "bullets"; items: string[] }
  | { type: "bar-list"; items: ChatBarItem[]; note?: string }
  | { type: "citations"; chips: CitationChip[] }
  | { type: "link"; label: string }
  // Iter2 additions
  | { type: "generic-table"; headers: string[]; rows: GenericTableCell[][] }
  | { type: "ranked-bars"; items: RankedBarItem[]; note?: string }
  | { type: "paragraphs"; items: ParagraphBlock[] }
  | {
      type: "view-data-button";
      label: string;
      catalogFilter?: string[]; // source ids in dataCatalog.ts
      bannerLabel?: string;     // banner shown on data catalog after filter applied
    }
  // Iter4 — real Anthropic API response rendered inline in chat
  | {
      type: "document-analysis-result";
      answer: string;
      extractedData: {
        documentType: string;
        summary: string;
        keyMetrics: { label: string; value: string; unit?: string }[];
      } | null;
      citations: { source: string; page?: number; excerpt: string }[];
      confidenceReason: string;
      crossReferenced: { module: string; dataPoint: string; insight: string }[];
    };

// Iter3 — confidence indicator carried at message level so it always renders next to the headline.
export type ConfidenceLevel = "high" | "medium" | "low";
export type Confidence = {
  level: ConfidenceLevel;
  summary: string;        // short pill text, e.g. "based on 4 sources, 22 days of data"
  whyDetails: string[];   // bullets in the expanded panel
  toIncrease?: string[];  // optional bullets on what would raise confidence
};

export type ChatMessage = {
  id: string;
  role: "user" | "agent";
  content: string | AgentMessageContent[];
  timestamp: string;
  // Iter2 — persona tagging so the chat panel can filter by persona.
  // Messages without a persona are treated as legacy/all-personas.
  persona?: "CEO" | "StoreManager";
  storeManagerLocation?: string;
  // Iter3 — confidence marker (agent messages only).
  confidence?: Confidence;
};

export type AnomalyAlert = {
  id: string;
  severity: "red" | "yellow";
  location: string;
  headline: string;
  hypothesis: string;
  timestamp: string;
  // Iter2 — wires "Open in Data tab →" button to a specific doc + highlight anchor.
  dataLink?: { docId: string; page?: number; anchor?: string };
};

export const CHAT_HISTORY: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "What was our margin at Seminyak last week?",
    timestamp: "10:14",
    persona: "StoreManager",
    storeManagerLocation: "Seminyak",
  },
  {
    id: "m2",
    role: "agent",
    persona: "StoreManager",
    storeManagerLocation: "Seminyak",
    content: [
      {
        type: "headline",
        text: "Seminyak W21: 62% gross margin — ↓ 4 pts vs W20",
        badge: "W21 · 12–18 May",
      },
      {
        type: "table",
        rows: [
          { metric: "Revenue", w21: "Rp 48.2M", w20: "Rp 51.4M", delta: "−6.2%", negative: true },
          { metric: "COGS", w21: "Rp 18.3M", w20: "Rp 17.8M", delta: "+2.8%", negative: true },
          { metric: "Waste cost", w21: "Rp 1.8M", w20: "Rp 1.3M", delta: "+38.5%", negative: true },
          { metric: "Gross margin", w21: "Rp 28.1M (62%)", w20: "Rp 32.3M (66%)", delta: "−4 pts", negative: true },
        ],
      },
      {
        type: "bullets",
        items: [
          "Butter cost +12% from supplier → −1.8 pts on margin",
          "Rain Mon–Tue → −8.4% in walk-in traffic",
          "Public holiday Friday → +0.7 pts (offset)",
        ],
      },
      {
        type: "citations",
        chips: [
          { id: "s1", label: "P&L_W22_Seminyak.pdf · page 1", docId: "pnl-w22-seminyak", page: 1, anchor: "weekly-summary" },
          { id: "s2", label: "Waste_Log_Seminyak_W20.csv", docId: "waste-seminyak-w20", anchor: "row-tue" },
        ],
      },
    ],
    timestamp: "10:14",
  },
  {
    id: "m3",
    role: "user",
    content: "Which product has the highest waste-to-revenue ratio?",
    timestamp: "10:17",
    persona: "CEO",
  },
  {
    id: "m4",
    role: "agent",
    persona: "CEO",
    content: [
      {
        type: "text",
        text: "Top 5 products by waste-to-revenue ratio — trailing 7 days, all locations:",
      },
      {
        type: "bar-list",
        items: [
          { label: "Matcha Cake Slice", value: 18.4, highlight: true },
          { label: "Coconut Cake Slice", value: 15.2 },
          { label: "Banana Bread", value: 12.9 },
          { label: "Gluten-free Muffin", value: 11.8 },
          { label: "Basque Cheesecake", value: 10.3 },
        ],
        note: "Matcha Cake Slice is the top offender — overproduced by 22% on Mon–Wed at Canggu. Recommend reducing daily bake by 8 units.",
      },
      {
        type: "citations",
        chips: [
          { id: "s3", label: "Sales_Pattern_Analysis_W18-W26.xlsx", docId: "sales-pattern-w18-w26" },
          { id: "s4", label: "Waste_Log_Canggu_W22.csv", docId: "waste-canggu-w22", anchor: "matcha-rows" },
        ],
      },
    ],
    timestamp: "10:17",
  },
  {
    id: "m5",
    role: "user",
    content: "Why did Ubud's food cost spike on Tuesday?",
    timestamp: "10:22",
    persona: "StoreManager",
    storeManagerLocation: "Ubud",
  },
  {
    id: "m6",
    role: "agent",
    persona: "StoreManager",
    storeManagerLocation: "Ubud",
    content: [
      {
        type: "headline",
        text: "Ubud food cost Tue 19 May: Rp 4.1M — ↑ 34% vs Tuesday baseline",
        badge: "Anomaly confirmed",
      },
      {
        type: "bullets",
        items: [
          "Butter price +12% from supplier (Pak Seto, Denpasar) → adds Rp 580K to weekly COGS",
          "Matcha Cake overproduction: 38 produced, 29 sold (24% waste rate) → Rp 350K waste cost",
          "Storm forecast Tue 14:00 WIB → precautionary overbake of Sourdough: 8 unsold units → Rp 144K waste",
        ],
      },
      {
        type: "citations",
        chips: [
          { id: "s5", label: "Supplier_Invoices_May.pdf · page 7", docId: "supplier-invoices-may", page: 7, anchor: "butter-row" },
          { id: "s6", label: "Waste_Log_Seminyak_W20.csv", docId: "waste-seminyak-w20", anchor: "row-tue" },
        ],
      },
      { type: "link", label: "View raw data" },
    ],
    timestamp: "10:23",
  },
];

// Canned responses for the live input box.
// Match by checking if the lowercased user message contains any keyword.
export type CannedResponse = {
  keywords: string[];
  messages: ChatMessage[];
};

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    keywords: ["margin", "revenue", "profit", "gross"],
    messages: [
      {
        id: "live-agent-margin",
        role: "agent",
        content: [
          {
            type: "headline",
            text: "Chain-wide W21: 61.4% gross margin — ↓ 2.1 pts vs W20",
            badge: "All 7 locations",
          },
          {
            type: "bullets",
            items: [
              "Seminyak and Ubud under-performing vs prior week due to butter cost spike",
              "Jakarta SCBD performing above chain average at 64.8%",
              "Canggu recovering after Matcha Cake waste issue identified",
            ],
          },
          {
            type: "citations",
            chips: [{ id: "cl1", label: "Source: P&L W21 All Locations" }],
          },
        ],
        timestamp: "now",
      },
    ],
  },
  {
    keywords: ["waste", "overproduction", "unsold"],
    messages: [
      {
        id: "live-agent-waste",
        role: "agent",
        content: [
          {
            type: "headline",
            text: "Chain-wide waste rate W21: 11.8% — ↓ 2.4 pts vs baseline",
            badge: "M1 impact visible",
          },
          {
            type: "bullets",
            items: [
              "Canggu waste still elevated at 18% (see active alert) — Matcha Cake root cause",
              "Seminyak and Ubud tracking well at 8–9%",
              "Demand Forecasting module driving a 24% reduction at pilot locations",
            ],
          },
          {
            type: "citations",
            chips: [{ id: "cl2", label: "Source: Waste log W21 All Locations" }],
          },
        ],
        timestamp: "now",
      },
    ],
  },
  {
    keywords: ["forecast", "predict", "next week", "tomorrow"],
    messages: [
      {
        id: "live-agent-forecast",
        role: "agent",
        content: [
          {
            type: "headline",
            text: "Next 7-day outlook: demand up 8–12% across Bali locations",
            badge: "Peak season signal",
          },
          {
            type: "bullets",
            items: [
              "Jun–Aug is peak tourist season for Bali — expect 1.3× baseline demand",
              "Beverage category (Iced Latte, Cold Brew) leading with +18% forecast",
              "Recommend increasing production budget for pastries by Rp 2.1M next week",
            ],
          },
          {
            type: "citations",
            chips: [
              { id: "cl3", label: "Source: Forecast engine W22" },
              { id: "cl4", label: "Source: Seasonality model" },
            ],
          },
        ],
        timestamp: "now",
      },
    ],
  },
  {
    keywords: ["canggu", "berawa"],
    messages: [
      {
        id: "live-agent-canggu",
        role: "agent",
        content: [
          {
            type: "headline",
            text: "Canggu W21: 58.2% gross margin — lowest in the chain this week",
            badge: "Action required",
          },
          {
            type: "bullets",
            items: [
              "Waste spiked to 18% (baseline 9%) — driven by Matcha Cake overproduction Mon–Wed",
              "Recommended fix: reduce Matcha Cake daily bake from 34 to 26 units",
              "Revenue on track; waste cost is the sole drag on margin",
            ],
          },
          {
            type: "citations",
            chips: [
              { id: "cl5", label: "Source: P&L W21 Canggu" },
              { id: "cl6", label: "Source: Active alert #A-001" },
            ],
          },
        ],
        timestamp: "now",
      },
    ],
  },
];

export const ANOMALY_ALERTS: AnomalyAlert[] = [
  {
    id: "a1",
    severity: "red",
    location: "Canggu",
    headline: "Waste spiked to 18% (baseline 9%)",
    hypothesis: "Driven by overproduction of Matcha Cake on Mon–Wed. Recommend −8 units/day.",
    timestamp: "Today 06:14 WIB",
    dataLink: { docId: "waste-canggu-w22", anchor: "matcha-rows" },
  },
  {
    id: "a2",
    severity: "yellow",
    location: "Sanur",
    headline: "Gross margin −3.2 pts WoW",
    hypothesis: "Cost of butter up 12% from Pak Seto supplier. Review procurement contract.",
    timestamp: "Yesterday 23:59 WIB",
    dataLink: { docId: "supplier-invoices-may", page: 7, anchor: "butter-row" },
  },
  {
    id: "a3",
    severity: "yellow",
    location: "Jakarta SCBD",
    headline: "Iced Latte sales −22% vs forecast, 4 days running",
    hypothesis: "Possible seasonal slowdown or nearby competitor opening. Monitor Wk 22.",
    timestamp: "Today 06:15 WIB",
  },
];
