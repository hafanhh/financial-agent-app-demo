// Iter2 — Knowledge Base for the Data & Knowledge scene + bi-directional nav with M3.
// 17 documents grouped into 5 categories. 5 docs cited by M3 examples have full body.
// The other 12 have a lighter body (header + 1 page / 1 sheet) that still looks real.

export type DocGroup = "financial" | "operations" | "hr" | "policy" | "analytics";
export type DocType = "pdf" | "xlsx" | "csv" | "json";

export type PdfBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string; level?: 2 | 3 }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "callout"; tone: "info" | "warning"; text: string };

export type PdfPage = {
  pageNumber: number;
  title?: string;
  blocks: PdfBlock[];
};

export type SheetData = {
  name: string;
  headers: string[];
  rows: string[][];
};

export type DocumentBody =
  | { kind: "pdf"; pages: PdfPage[] }
  | { kind: "spreadsheet"; sheets: SheetData[] }
  | { kind: "csv"; headers: string[]; rows: string[][] }
  | { kind: "json"; preview: string };

export type DocChunk = {
  id: string;
  // For pdf: page; for spreadsheet/csv: anchor matches a sheet name or row range key.
  page?: number;
  anchor: string;
  highlightText: string;
  citedByMessageIds: string[];
};

export type Document = {
  id: string;
  filename: string;
  type: DocType;
  group: DocGroup;
  description: string;
  updatedAt: string; // human readable for the demo
  updatedAtIso: string;
  citationCount: number;
  body: DocumentBody;
  chunks: DocChunk[];
};

// -----------------------------------------------------------------------------
// FULL-BODY DOCUMENTS (5 cited heavily by new M3 examples + 1 default selected)
// -----------------------------------------------------------------------------

const DOC_PNL_CHAIN: Document = {
  id: "pnl-may2026-chain",
  filename: "P&L_May2026_Chain.xlsx",
  type: "xlsx",
  group: "financial",
  description: "Chain-wide P&L, May 2026",
  updatedAt: "2 days ago",
  updatedAtIso: "2026-05-18T08:00:00+08:00",
  citationCount: 4,
  body: {
    kind: "spreadsheet",
    sheets: [
      {
        name: "Summary",
        headers: ["Metric", "May 2026", "Apr 2026", "Δ"],
        rows: [
          ["Net Revenue", "Rp 1.94B", "Rp 2.02B", "−3.9%"],
          ["COGS", "Rp 758M", "Rp 728M", "+4.1%"],
          ["Gross Margin", "61.0%", "63.9%", "−2.9 pts"],
          ["Labor", "Rp 312M", "Rp 305M", "+2.3%"],
          ["Utilities", "Rp 84M", "Rp 80M", "+5.0%"],
          ["Operating Profit", "Rp 412M", "Rp 478M", "−13.8%"],
        ],
      },
      {
        name: "By Location",
        headers: ["Location", "Revenue", "GM %", "vs Chain Avg", "Primary Driver"],
        rows: [
          ["Seminyak", "Rp 324M", "64%", "+3 pts", "Benchmark"],
          ["Ubud", "Rp 268M", "62%", "+1 pts", "Stable"],
          ["Sanur", "Rp 241M", "55%", "−6 pts", "Butter cost +12% — not yet passed to menu"],
          ["Canggu", "Rp 287M", "52%", "−9 pts", "Waste spike (Matcha Cake overproduction)"],
          ["Kuta", "Rp 218M", "59%", "−2 pts", "Monday traffic well below other days"],
          ["Uluwatu", "Rp 281M", "63%", "+2 pts", "Strong weekend traffic"],
          ["Jakarta SCBD", "Rp 326M", "65%", "+4 pts", "Premium pricing holds"],
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k1",
      anchor: "By Location",
      highlightText: "Canggu 52% GM (−9 pts), Sanur 55% GM (−6 pts) vs chain avg 61%",
      citedByMessageIds: ["ceo-ex1-agent"],
    },
  ],
};

const DOC_WASTE_CANGGU: Document = {
  id: "waste-canggu-w22",
  filename: "Waste_Log_Canggu_W22.csv",
  type: "csv",
  group: "operations",
  description: "Weekly waste log, Canggu",
  updatedAt: "1 day ago",
  updatedAtIso: "2026-05-19T07:30:00+08:00",
  citationCount: 2,
  body: {
    kind: "csv",
    headers: ["Date", "SKU", "Produced", "Sold", "Wasted", "Waste %", "Notes"],
    rows: [
      ["2026-05-12", "Matcha Cake Slice", "34", "26", "8", "23.5%", "Mon — overbake from weekend pattern"],
      ["2026-05-13", "Matcha Cake Slice", "34", "24", "10", "29.4%", "Tue — rain, walk-in low"],
      ["2026-05-14", "Matcha Cake Slice", "34", "27", "7", "20.6%", "Wed — overbake continues"],
      ["2026-05-15", "Matcha Cake Slice", "28", "26", "2", "7.1%", "Thu — bake adjusted"],
      ["2026-05-16", "Matcha Cake Slice", "30", "29", "1", "3.3%", "Fri — clear sell-through"],
      ["2026-05-17", "Matcha Cake Slice", "32", "31", "1", "3.1%", "Sat — peak day"],
      ["2026-05-18", "Matcha Cake Slice", "30", "28", "2", "6.7%", "Sun — closing inventory ok"],
      ["2026-05-12", "Sourdough Loaf", "40", "39", "1", "2.5%", "On target"],
      ["2026-05-13", "Sourdough Loaf", "40", "38", "2", "5.0%", "On target"],
      ["2026-05-14", "Pain au Chocolat", "60", "57", "3", "5.0%", "On target"],
      ["2026-05-15", "Pain au Chocolat", "60", "58", "2", "3.3%", "On target"],
      ["2026-05-16", "Coconut Cake Slice", "24", "20", "4", "16.7%", "Sat — slight overbake"],
      ["2026-05-17", "Almond Croissant", "48", "47", "1", "2.1%", "On target"],
      ["2026-05-18", "Basque Cheesecake", "16", "15", "1", "6.3%", "On target"],
    ],
  },
  chunks: [
    {
      id: "k2",
      anchor: "matcha-rows",
      highlightText: "Matcha Cake Slice Mon–Wed 23–29% waste rate — Rp ~480K weekly waste cost",
      citedByMessageIds: ["ceo-ex1-agent", "anomaly-a1"],
    },
  ],
};

const DOC_SUPPLIER_INV: Document = {
  id: "supplier-invoices-may",
  filename: "Supplier_Invoices_May.pdf",
  type: "pdf",
  group: "financial",
  description: "May supplier invoices, 47 pages",
  updatedAt: "4 days ago",
  updatedAtIso: "2026-05-16T10:15:00+08:00",
  citationCount: 3,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 1,
        title: "Supplier Invoices — May 2026",
        blocks: [
          { kind: "heading", text: "Cover summary", level: 2 },
          { kind: "paragraph", text: "Consolidated invoices from 14 suppliers servicing all 7 BAKED locations during May 2026. Highlights include butter price escalation (Pak Seto) and a one-off cocoa surcharge from PT Sumber Pangan." },
          {
            kind: "table",
            headers: ["Supplier", "Category", "May total", "vs Apr"],
            rows: [
              ["Pak Seto", "Dairy / Butter", "Rp 138M", "+12%"],
              ["PT Sumber Pangan", "Flour & cocoa", "Rp 96M", "+4%"],
              ["Bali Eggs Co", "Eggs", "Rp 41M", "+1%"],
              ["Java Roasters", "Coffee beans", "Rp 64M", "0%"],
              ["Fresh Dairy ID", "Milk", "Rp 28M", "+2%"],
            ],
          },
        ],
      },
      {
        pageNumber: 7,
        title: "Page 7 — Pak Seto, Dairy (Denpasar)",
        blocks: [
          { kind: "heading", text: "Pak Seto — invoice batch 05/2026", level: 2 },
          { kind: "paragraph", text: "All locations served. Unit price for unsalted butter (block, 1kg) increased from Rp 96,000 to Rp 107,500 effective 6 May 2026. Increase attributed to import surcharge on EU dairy." },
          {
            kind: "table",
            headers: ["Date", "SKU", "Qty", "Unit price", "Line total"],
            rows: [
              ["2026-05-06", "Unsalted butter 1kg", "120 blocks", "Rp 107,500", "Rp 12.90M"],
              ["2026-05-13", "Unsalted butter 1kg", "118 blocks", "Rp 107,500", "Rp 12.68M"],
              ["2026-05-20", "Unsalted butter 1kg", "124 blocks", "Rp 107,500", "Rp 13.33M"],
              ["2026-05-27", "Unsalted butter 1kg", "122 blocks", "Rp 107,500", "Rp 13.11M"],
            ],
          },
          { kind: "callout", tone: "warning", text: "Procurement to review contract terms. At chain volume, +12% on butter translates to ~Rp 580K/week added COGS at each Bali location." },
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k3",
      page: 7,
      anchor: "butter-row",
      highlightText: "Butter unit price +12% effective 6 May (Rp 96,000 → Rp 107,500)",
      citedByMessageIds: ["ceo-ex1-agent", "sm-ex4-agent", "anomaly-a2", "m6"],
    },
  ],
};

const DOC_STOCKOUT: Document = {
  id: "stockout-q2-2026",
  filename: "Stockout_Events_Q2_2026.csv",
  type: "csv",
  group: "operations",
  description: "Stockout events log, Q2",
  updatedAt: "3 days ago",
  updatedAtIso: "2026-05-17T09:00:00+08:00",
  citationCount: 2,
  body: {
    kind: "csv",
    headers: ["Date", "Location", "SKU", "Time window", "Est. units missed", "Est. revenue lost (IDR)"],
    rows: [
      ["2026-04-06", "Canggu", "Sourdough Loaf", "Sat 09:30–11:00", "22", "Rp 4.2M"],
      ["2026-04-13", "Canggu", "Sourdough Loaf", "Sat 10:00–11:30", "26", "Rp 5.0M"],
      ["2026-04-20", "Canggu", "Sourdough Loaf", "Sun 09:00–10:30", "19", "Rp 3.6M"],
      ["2026-04-12", "Seminyak", "Pain au Chocolat", "Sat 07:30–08:30", "31", "Rp 1.8M"],
      ["2026-04-19", "Seminyak", "Pain au Chocolat", "Sat 07:00–08:15", "29", "Rp 1.7M"],
      ["2026-04-26", "Seminyak", "Pain au Chocolat", "Sun 07:30–08:30", "27", "Rp 1.6M"],
      ["2026-05-04", "Ubud", "Almond Croissant", "Sat 09:00–10:30", "18", "Rp 1.3M"],
      ["2026-05-11", "Ubud", "Almond Croissant", "Sun 09:00–10:00", "16", "Rp 1.1M"],
      ["2026-05-18", "Ubud", "Almond Croissant", "Sat 09:30–10:30", "14", "Rp 1.0M"],
      ["2026-05-03", "Canggu", "Sourdough Loaf", "Sat 09:45–10:45", "21", "Rp 4.0M"],
      ["2026-05-10", "Canggu", "Sourdough Loaf", "Sun 09:00–10:30", "23", "Rp 4.4M"],
      ["2026-05-17", "Canggu", "Sourdough Loaf", "Sat 09:30–10:30", "20", "Rp 3.8M"],
    ],
  },
  chunks: [
    {
      id: "k4",
      anchor: "canggu-sourdough",
      highlightText: "Canggu Sourdough: Rp 58M lost across 14 weekend stockout events",
      citedByMessageIds: ["ceo-ex2-agent"],
    },
  ],
};

const DOC_KUTA_DOW: Document = {
  id: "kuta-dow-revenue",
  filename: "Kuta_DOW_Revenue_2026.xlsx",
  type: "xlsx",
  group: "financial",
  description: "DOW revenue analysis, Kuta",
  updatedAt: "1 week ago",
  updatedAtIso: "2026-05-13T11:20:00+08:00",
  citationCount: 1,
  body: {
    kind: "spreadsheet",
    sheets: [
      {
        name: "DOW averages",
        headers: ["Day", "Avg revenue", "Avg labor", "Avg utilities", "Spoilage", "Contribution"],
        rows: [
          ["Monday", "Rp 6.8M", "Rp 7.4M", "Rp 1.6M", "Rp 2.0M", "−Rp 4.2M"],
          ["Tuesday", "Rp 9.2M", "Rp 7.4M", "Rp 1.6M", "Rp 1.3M", "−Rp 1.1M"],
          ["Wednesday", "Rp 10.4M", "Rp 7.4M", "Rp 1.6M", "Rp 1.2M", "+Rp 0.2M"],
          ["Thursday", "Rp 11.8M", "Rp 7.4M", "Rp 1.6M", "Rp 1.1M", "+Rp 1.7M"],
          ["Friday", "Rp 14.2M", "Rp 8.6M", "Rp 1.8M", "Rp 1.4M", "+Rp 2.4M"],
          ["Saturday", "Rp 18.6M", "Rp 9.2M", "Rp 2.0M", "Rp 1.6M", "+Rp 5.8M"],
          ["Sunday", "Rp 17.4M", "Rp 9.2M", "Rp 2.0M", "Rp 1.5M", "+Rp 4.7M"],
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k5",
      anchor: "DOW averages",
      highlightText: "Monday avg revenue Rp 6.8M, direct cost Rp 11.0M → −Rp 4.2M contribution",
      citedByMessageIds: ["ceo-ex3-agent"],
    },
  ],
};

const DOC_PNL_W22_SEMINYAK: Document = {
  id: "pnl-w22-seminyak",
  filename: "P&L_W22_Seminyak.pdf",
  type: "pdf",
  group: "financial",
  description: "Weekly P&L, Seminyak",
  updatedAt: "1 day ago",
  updatedAtIso: "2026-05-19T08:15:00+08:00",
  citationCount: 2,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 1,
        title: "Weekly P&L — Seminyak — W22 (19–25 May 2026)",
        blocks: [
          { kind: "heading", text: "Weekly snapshot", level: 2 },
          { kind: "paragraph", text: "Top-line summary of revenue, COGS and waste for Seminyak across the trading week. Numbers are reconciled against POS (Square) and inventory (Cloud Inventory)." },
          {
            kind: "table",
            headers: ["Metric", "W22", "W21", "Δ"],
            rows: [
              ["Revenue", "Rp 51.6M", "Rp 48.2M", "+7.1%"],
              ["COGS", "Rp 18.6M", "Rp 18.3M", "+1.6%"],
              ["Waste cost", "Rp 1.5M", "Rp 1.8M", "−16.7%"],
              ["Gross margin", "Rp 31.5M (61%)", "Rp 28.1M (58%)", "+3 pts"],
            ],
          },
        ],
      },
      {
        pageNumber: 3,
        title: "Page 3 — vs Chain benchmark",
        blocks: [
          { kind: "heading", text: "Location benchmarks", level: 2 },
          { kind: "paragraph", text: "Seminyak holds the highest margin in the chain this week, ahead of Jakarta SCBD. Comparison rows show position vs chain average for the same period." },
          {
            kind: "table",
            headers: ["Location", "Gross margin", "vs Chain avg"],
            rows: [
              ["Seminyak", "64%", "+3 pts"],
              ["Jakarta SCBD", "65%", "+4 pts"],
              ["Ubud", "62%", "+1 pts"],
              ["Uluwatu", "63%", "+2 pts"],
              ["Sanur", "55%", "−6 pts"],
              ["Canggu", "52%", "−9 pts"],
            ],
          },
          { kind: "callout", tone: "info", text: "Seminyak benchmark used as reference for chain-level comparisons. See Chain P&L for full breakdown." },
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k6",
      page: 1,
      anchor: "weekly-summary",
      highlightText: "Seminyak W22 gross margin 61%, +3 pts vs prior week",
      citedByMessageIds: ["m2"],
    },
    {
      id: "k7",
      page: 3,
      anchor: "seminyak-benchmark",
      highlightText: "Seminyak 64% GM (+3 pts vs chain avg) — benchmark for the chain",
      citedByMessageIds: ["ceo-ex1-agent"],
    },
  ],
};

// -----------------------------------------------------------------------------
// LIGHTER-BODY DOCUMENTS (each cited at most once, or referenced for context)
// -----------------------------------------------------------------------------

const DOC_DAILY_PNL_SEMINYAK: Document = {
  id: "daily-pnl-seminyak-0518",
  filename: "Daily_PnL_Seminyak_2026-05-18.pdf",
  type: "pdf",
  group: "financial",
  description: "Daily P&L",
  updatedAt: "2 days ago",
  updatedAtIso: "2026-05-18T22:00:00+08:00",
  citationCount: 1,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 1,
        title: "Daily P&L — Seminyak — 18 May 2026 (Saturday)",
        blocks: [
          { kind: "paragraph", text: "End-of-day summary reconciled at 22:00 WIB after final close." },
          {
            kind: "table",
            headers: ["Metric", "Today", "Baseline (Sat)", "Δ"],
            rows: [
              ["Revenue", "Rp 8.4M", "Rp 8.6M", "−2.3%"],
              ["COGS", "Rp 2.86M", "Rp 2.41M", "+18.7%"],
              ["Waste cost", "Rp 240K", "Rp 110K", "+118%"],
              ["Food cost %", "34%", "28%", "+6 pts"],
              ["Butter usage", "18 kg", "11 kg", "+64%"],
            ],
          },
          { kind: "callout", tone: "warning", text: "Food cost ran 34% vs 28% baseline — extra Almond Croissant batch flagged for review." },
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k8",
      page: 1,
      anchor: "food-cost-row",
      highlightText: "Food cost 34% vs 28% baseline; butter usage 18kg vs 11kg typical",
      citedByMessageIds: ["sm-ex4-agent"],
    },
  ],
};

const DOC_SALES_PATTERN: Document = {
  id: "sales-pattern-w18-w26",
  filename: "Sales_Pattern_Analysis_W18-W26.xlsx",
  type: "xlsx",
  group: "analytics",
  description: "Sales pattern analysis, W18–W26",
  updatedAt: "5 days ago",
  updatedAtIso: "2026-05-15T16:00:00+08:00",
  citationCount: 1,
  body: {
    kind: "spreadsheet",
    sheets: [
      {
        name: "SKU sell-through",
        headers: ["SKU", "Avg sell-through", "Stockout sensitivity", "Weekend skew"],
        rows: [
          ["Sourdough Loaf", "94%", "High", "+38%"],
          ["Pain au Chocolat", "92%", "High", "+24%"],
          ["Almond Croissant", "89%", "Medium", "+19%"],
          ["Matcha Cake Slice", "76%", "Low", "−4%"],
          ["Coconut Cake Slice", "82%", "Medium", "+6%"],
          ["Banana Bread", "85%", "Medium", "+9%"],
          ["Basque Cheesecake", "90%", "Medium", "+12%"],
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k9",
      anchor: "SKU sell-through",
      highlightText: "Top 3 stockout-sensitive SKUs: Sourdough, Pain au Chocolat, Almond Croissant",
      citedByMessageIds: ["ceo-ex2-agent", "m4"],
    },
  ],
};

const DOC_M1_BACKTEST: Document = {
  id: "m1-backtest",
  filename: "M1_Backtest_Report.pdf",
  type: "pdf",
  group: "analytics",
  description: "Forecast model backtest",
  updatedAt: "1 week ago",
  updatedAtIso: "2026-05-13T09:00:00+08:00",
  citationCount: 1,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 4,
        title: "Page 4 — Stockout prevention backtest",
        blocks: [
          { kind: "heading", text: "Counterfactual analysis", level: 2 },
          { kind: "paragraph", text: "We replayed M1 forecasts against actual Q2 2026 stockout windows. Of the 47 stockout events recorded, the M1 production plan would have prevented an estimated 70% if followed strictly." },
          {
            kind: "table",
            headers: ["Metric", "Without M1", "With M1 plan"],
            rows: [
              ["Stockout events Q2", "47", "14"],
              ["Estimated revenue lost", "Rp 142M", "Rp 42M"],
              ["Prevention rate", "—", "70%"],
            ],
          },
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k10",
      page: 4,
      anchor: "counterfactual",
      highlightText: "M1 plan would have prevented ~70% of Q2 stockouts (Rp 100M recoverable)",
      citedByMessageIds: ["ceo-ex2-agent"],
    },
  ],
};

const DOC_LABOR_SCHED: Document = {
  id: "labor-schedule-q2",
  filename: "Labor_Schedule_Q2.xlsx",
  type: "xlsx",
  group: "hr",
  description: "Quarterly labor planning",
  updatedAt: "1 week ago",
  updatedAtIso: "2026-05-13T14:30:00+08:00",
  citationCount: 1,
  body: {
    kind: "spreadsheet",
    sheets: [
      {
        name: "Kuta — Monday",
        headers: ["Shift", "Role", "Hours", "Cost (IDR)"],
        rows: [
          ["07:00–11:00", "Baker × 2", "8", "Rp 1.6M"],
          ["07:00–15:00", "Barista × 2", "16", "Rp 2.8M"],
          ["10:00–18:00", "Front of house × 2", "16", "Rp 2.4M"],
          ["12:00–20:00", "Front of house × 1", "8", "Rp 1.2M"],
          ["Total", "—", "48", "Rp 8.0M (incl. utilities/spoilage)"],
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k11",
      anchor: "Kuta — Monday",
      highlightText: "Kuta Monday labor cost Rp 8.0M — driving the negative contribution",
      citedByMessageIds: ["ceo-ex3-agent"],
    },
  ],
};

const DOC_CUSTOMER_CROSSVISIT: Document = {
  id: "customer-crossvisit",
  filename: "Customer_Cross-visit_Analysis.pdf",
  type: "pdf",
  group: "analytics",
  description: "Customer cross-visit analysis",
  updatedAt: "2 weeks ago",
  updatedAtIso: "2026-05-06T10:00:00+08:00",
  citationCount: 1,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 1,
        title: "Customer cross-visit analysis — Bali region",
        blocks: [
          { kind: "paragraph", text: "Analysis of CRM identifiers across Bali locations to understand how often the same customer visits more than one location in a week." },
          { kind: "paragraph", text: "Key finding: ~12% of weekly customers visit more than one Bali location during their stay (heavily skewed toward tourists). For Kuta specifically, ~14% of Monday-visitors are tourists planning multi-day trips." },
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k12",
      page: 1,
      anchor: "cross-visit-12pct",
      highlightText: "~12% of weekly customers visit more than one Bali location",
      citedByMessageIds: ["ceo-ex3-agent"],
    },
  ],
};

const DOC_WASTE_SEMINYAK_W20: Document = {
  id: "waste-seminyak-w20",
  filename: "Waste_Log_Seminyak_W20.csv",
  type: "csv",
  group: "operations",
  description: "Weekly waste log, Seminyak",
  updatedAt: "3 days ago",
  updatedAtIso: "2026-05-17T07:30:00+08:00",
  citationCount: 1,
  body: {
    kind: "csv",
    headers: ["Date", "SKU", "Produced", "Sold", "Wasted", "Waste %"],
    rows: [
      ["2026-05-18", "Almond Croissant", "60", "50", "10", "16.7%"],
      ["2026-05-18", "Sourdough Loaf", "40", "39", "1", "2.5%"],
      ["2026-05-18", "Pain au Chocolat", "60", "58", "2", "3.3%"],
      ["2026-05-17", "Almond Croissant", "48", "47", "1", "2.1%"],
      ["2026-05-17", "Pain au Chocolat", "60", "59", "1", "1.7%"],
      ["2026-05-16", "Almond Croissant", "48", "46", "2", "4.2%"],
      ["2026-05-15", "Almond Croissant", "48", "47", "1", "2.1%"],
      ["2026-05-14", "Almond Croissant", "48", "48", "0", "0%"],
      ["2026-05-13", "Almond Croissant", "48", "47", "1", "2.1%"],
      ["2026-05-12", "Almond Croissant", "48", "46", "2", "4.2%"],
    ],
  },
  chunks: [
    {
      id: "k13",
      anchor: "row-tue",
      highlightText: "Almond Croissant Sat 18 May: 60 made, 50 sold, 10 wasted (16.7%)",
      citedByMessageIds: ["sm-ex4-agent", "m2", "m6"],
    },
  ],
};

const DOC_M1_FORECAST: Document = {
  id: "m1-forecast-0518",
  filename: "M1_Forecast_2026-05-18.json",
  type: "json",
  group: "analytics",
  description: "M1 daily forecast payload",
  updatedAt: "2 days ago",
  updatedAtIso: "2026-05-18T03:00:00+08:00",
  citationCount: 1,
  body: {
    kind: "json",
    preview: `{
  "date": "2026-05-18",
  "location": "Seminyak",
  "forecasts": [
    { "sku": "Almond Croissant", "recommended_units": 52, "confidence": 0.88,
      "drivers": ["Sat morning rush", "tourist arrivals +8%"] },
    { "sku": "Sourdough Loaf", "recommended_units": 38, "confidence": 0.91 },
    { "sku": "Pain au Chocolat", "recommended_units": 60, "confidence": 0.92 },
    { "sku": "Matcha Cake Slice", "recommended_units": 18, "confidence": 0.79 }
  ],
  "notes": "Forecast suggested 52 Almond Croissant; actual production was 60 (overbake +15%)."
}`,
  },
  chunks: [
    {
      id: "k14",
      anchor: "almond-row",
      highlightText: "Recommended 52 Almond Croissant; actual produced 60 → +8 unit overbake",
      citedByMessageIds: ["sm-ex4-agent"],
    },
  ],
};

const DOC_STAFF_SCHED_BALI: Document = {
  id: "staff-schedule-bali",
  filename: "Staff_Schedule_Bali_May2026.xlsx",
  type: "xlsx",
  group: "hr",
  description: "Bali staff schedule, May",
  updatedAt: "4 days ago",
  updatedAtIso: "2026-05-16T11:00:00+08:00",
  citationCount: 1,
  body: {
    kind: "spreadsheet",
    sheets: [
      {
        name: "Tuesdays — May",
        headers: ["Location", "FTE", "Traffic index", "Cost / Tue (IDR)"],
        rows: [
          ["Seminyak", "6.2", "78", "Rp 5.4M"],
          ["Ubud", "4.5", "95", "Rp 3.9M"],
          ["Sanur", "4.8", "88", "Rp 4.2M"],
          ["Canggu", "5.0", "102", "Rp 4.4M"],
          ["Kuta", "5.1", "82", "Rp 4.5M"],
          ["Uluwatu", "4.6", "91", "Rp 4.0M"],
        ],
      },
    ],
  },
  chunks: [
    {
      id: "k15",
      anchor: "Tuesdays — May",
      highlightText: "Seminyak Tue 6.2 FTE / Traffic 78 vs peer avg 4.7 FTE / Traffic 94",
      citedByMessageIds: ["sm-ex5-agent"],
    },
  ],
};

const DOC_TRAFFIC: Document = {
  id: "traffic-counter-logs",
  filename: "Traffic_Counter_Logs.csv",
  type: "csv",
  group: "operations",
  description: "Foot traffic counters, all locations",
  updatedAt: "1 day ago",
  updatedAtIso: "2026-05-19T06:00:00+08:00",
  citationCount: 1,
  body: {
    kind: "csv",
    headers: ["Date", "Location", "DOW", "Entries", "Traffic index"],
    rows: [
      ["2026-05-13", "Seminyak", "Tue", "312", "78"],
      ["2026-05-13", "Ubud", "Tue", "380", "95"],
      ["2026-05-13", "Sanur", "Tue", "352", "88"],
      ["2026-05-13", "Canggu", "Tue", "408", "102"],
      ["2026-05-06", "Seminyak", "Tue", "298", "75"],
      ["2026-05-06", "Ubud", "Tue", "372", "93"],
      ["2026-05-06", "Sanur", "Tue", "344", "86"],
      ["2026-05-06", "Canggu", "Tue", "400", "100"],
    ],
  },
  chunks: [
    {
      id: "k16",
      anchor: "tue-rows",
      highlightText: "Seminyak Tuesday traffic index 78 — 20% below peer avg",
      citedByMessageIds: ["sm-ex5-agent"],
    },
  ],
};

// -----------------------------------------------------------------------------
// POLICY / SOP DOCUMENTS — no citations this week (used for "not cited" visual state)
// -----------------------------------------------------------------------------

const DOC_PROD_SOP: Document = {
  id: "production-sop-v3",
  filename: "BAKED_Production_SOP_v3.pdf",
  type: "pdf",
  group: "policy",
  description: "Standard operating procedures, production",
  updatedAt: "2 weeks ago",
  updatedAtIso: "2026-05-06T08:00:00+08:00",
  citationCount: 0,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 1,
        title: "BAKED Production SOP — v3 (April 2026)",
        blocks: [
          { kind: "heading", text: "Purpose", level: 2 },
          { kind: "paragraph", text: "This document defines the standard daily production workflow across all BAKED locations — from pre-bake mise en place through end-of-day inventory reconciliation." },
          { kind: "heading", text: "Daily timeline", level: 3 },
          {
            kind: "table",
            headers: ["Time", "Activity"],
            rows: [
              ["04:00", "Doughs out of cold proof; oven warm-up"],
              ["05:00", "First bake (sourdough, pain au chocolat, croissant)"],
              ["07:00", "Open service; second bake starts"],
              ["11:30", "Lunch bake (sandwiches, savouries)"],
              ["15:00", "Afternoon top-up bake (cookies, slices)"],
              ["19:30", "Closing inventory & next-day prep"],
              ["20:00", "EOD waste log submitted to corporate"],
            ],
          },
        ],
      },
    ],
  },
  chunks: [],
};

const DOC_PRICING_POLICY: Document = {
  id: "pricing-policy-2026",
  filename: "Pricing_Policy_2026.pdf",
  type: "pdf",
  group: "policy",
  description: "Menu pricing policy, 2026",
  updatedAt: "3 weeks ago",
  updatedAtIso: "2026-04-29T08:00:00+08:00",
  citationCount: 0,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 1,
        title: "BAKED Menu Pricing Policy — 2026",
        blocks: [
          { kind: "paragraph", text: "Menu pricing reviews occur quarterly. Trigger conditions for an off-cycle review: ingredient cost movement >10% sustained for 4+ weeks, or competitor price shift of >15% on category leaders." },
          { kind: "callout", tone: "info", text: "Butter +12% (May 2026) currently sits at the boundary — finance to monitor through end of W23 before triggering off-cycle review." },
        ],
      },
    ],
  },
  chunks: [],
};

const DOC_WASTE_THRESHOLD: Document = {
  id: "waste-threshold-guidelines",
  filename: "Waste_Threshold_Guidelines.pdf",
  type: "pdf",
  group: "policy",
  description: "Waste tolerance guidelines per SKU category",
  updatedAt: "1 month ago",
  updatedAtIso: "2026-04-20T08:00:00+08:00",
  citationCount: 0,
  body: {
    kind: "pdf",
    pages: [
      {
        pageNumber: 1,
        title: "Waste Threshold Guidelines — by SKU category",
        blocks: [
          {
            kind: "table",
            headers: ["Category", "Daily waste tolerance", "Weekly tolerance"],
            rows: [
              ["Viennoiserie", "≤ 5%", "≤ 4%"],
              ["Slices & cakes", "≤ 8%", "≤ 6%"],
              ["Loaves", "≤ 4%", "≤ 3%"],
              ["Sandwiches (savoury)", "≤ 10%", "≤ 8%"],
              ["Beverages (chilled)", "≤ 6%", "≤ 5%"],
            ],
          },
          { kind: "paragraph", text: "Anything sustained above category tolerance for 3+ days triggers an automated anomaly alert via M3." },
        ],
      },
    ],
  },
  chunks: [],
};

// -----------------------------------------------------------------------------
// REGISTRY
// -----------------------------------------------------------------------------

export const DOCUMENTS: Document[] = [
  // Financial
  DOC_PNL_CHAIN,
  DOC_PNL_W22_SEMINYAK,
  DOC_DAILY_PNL_SEMINYAK,
  DOC_SUPPLIER_INV,
  DOC_KUTA_DOW,
  // Operations
  DOC_WASTE_CANGGU,
  DOC_WASTE_SEMINYAK_W20,
  DOC_STOCKOUT,
  DOC_TRAFFIC,
  // HR
  DOC_STAFF_SCHED_BALI,
  DOC_LABOR_SCHED,
  // Policy
  DOC_PROD_SOP,
  DOC_PRICING_POLICY,
  DOC_WASTE_THRESHOLD,
  // Analytics
  DOC_SALES_PATTERN,
  DOC_M1_BACKTEST,
  DOC_CUSTOMER_CROSSVISIT,
  DOC_M1_FORECAST,
];

export const DOCUMENT_GROUPS: { id: DocGroup; label: string }[] = [
  { id: "financial", label: "Financial Documents" },
  { id: "operations", label: "Operations Logs" },
  { id: "hr", label: "HR & Scheduling" },
  { id: "policy", label: "Policies & SOPs" },
  { id: "analytics", label: "Analytics Reports" },
];

export const DEFAULT_SELECTED_DOC_ID = "pnl-w22-seminyak";

export function findDocument(id: string | null | undefined): Document | undefined {
  if (!id) return undefined;
  return DOCUMENTS.find((d) => d.id === id);
}

export function findChunk(doc: Document | undefined, anchor: string | null | undefined): DocChunk | undefined {
  if (!doc || !anchor) return undefined;
  return doc.chunks.find((c) => c.anchor === anchor);
}
