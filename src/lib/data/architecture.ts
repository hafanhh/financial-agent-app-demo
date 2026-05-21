export type ArchItem = {
  id: string;
  label: string;
  desc: string;
  wave?: 1 | 2 | 3 | 4;
};

export type ArchLayer = {
  id: string;
  label: string;
  sublabel: string;
  items: ArchItem[];
};

// Ordered top → bottom: Users at top, Data Sources at bottom.
export const ARCH_LAYERS: ArchLayer[] = [
  {
    id: "users",
    label: "Users",
    sublabel: "Layer 6",
    items: [
      { id: "ops-user", label: "Operations", desc: "Head bakers & café managers" },
      { id: "mkt-user", label: "Marketing", desc: "CRM & campaign managers" },
      { id: "fin-user", label: "Finance / Owner", desc: "C-suite financial oversight" },
    ],
  },
  {
    id: "app",
    label: "Unified Application",
    sublabel: "Layer 5",
    items: [
      { id: "ops-dash", label: "Ops dashboard", desc: "Daily bake plan, waste tracking" },
      { id: "mkt-console", label: "Marketing console", desc: "Campaign builder + approvals" },
      { id: "fin-chat", label: "Finance chat", desc: "Natural language P&L queries" },
      { id: "mobile", label: "Mobile app", desc: "Field access for café managers" },
    ],
  },
  {
    id: "modules",
    label: "AI Modules",
    sublabel: "Layer 4",
    items: [
      { id: "m1", label: "M1 · Demand Forecasting", desc: "Daily production per SKU per location — ≤10% error on top-20 SKUs", wave: 1 },
      { id: "m2", label: "M2 · Customer Intelligence", desc: "Segmentation, dormancy scoring, auto-generated campaigns with approval gate", wave: 1 },
      { id: "m3", label: "M3 · Financial Agent", desc: "RAG over P&L, natural-language Q&A with citations, anomaly detection", wave: 1 },
      { id: "scheduling", label: "Staff Scheduling", desc: "Shift optimisation + skill-demand matching", wave: 2 },
      { id: "supplier", label: "Supplier Intel", desc: "Price benchmarking + sourcing recommendations", wave: 2 },
      { id: "pricing", label: "Dynamic Pricing", desc: "End-of-day markdown optimiser to clear slow-moving SKUs", wave: 2 },
      { id: "loyalty", label: "Loyalty Agent", desc: "Multilingual rewards, nudges & tier management", wave: 3 },
      { id: "menu-pers", label: "Menu Personalisation", desc: "POS-level recommendations based on past purchases", wave: 3 },
      { id: "site", label: "Site Selection", desc: "New location scoring + footfall feasibility modelling", wave: 4 },
    ],
  },
  {
    id: "core",
    label: "AI / ML Core",
    sublabel: "Layer 3 — shared services",
    items: [
      { id: "feature", label: "Feature store", desc: "Low-latency feature serving shared across all modules" },
      { id: "model-reg", label: "Model registry", desc: "Versioned models with A/B rollback" },
      { id: "llm-gw", label: "LLM gateway", desc: "Model-agnostic: OpenAI · Anthropic · Gemini · local" },
      { id: "vector", label: "Vector store", desc: "Semantic search over P&L docs, menus, reports" },
      { id: "a2a", label: "A2A bus", desc: "Agent-to-agent orchestration and event routing" },
    ],
  },
  {
    id: "foundation",
    label: "Data Foundation",
    sublabel: "Layer 2",
    items: [
      { id: "lake", label: "Unified data lake", desc: "Single source of truth, immutable event log" },
      { id: "schema", label: "Schema registry", desc: "Contract-tested data shapes across all sources" },
      { id: "quality", label: "Data quality", desc: "Automated profiling, freshness checks & alerts" },
      { id: "lineage", label: "Lineage", desc: "Field-level data provenance for auditability" },
    ],
  },
  {
    id: "sources",
    label: "Data Sources",
    sublabel: "Layer 1",
    items: [
      { id: "pos", label: "POS", desc: "Point-of-sale transaction data from all 7 locations" },
      { id: "crm", label: "CRM", desc: "Customer profiles, visit history, cohort attributes" },
      { id: "wms", label: "WMS", desc: "Inventory levels, production logs, waste tracking" },
      { id: "pl", label: "P&L", desc: "Financial statements — private, redacted for LLM use" },
      { id: "weather", label: "Weather", desc: "BMKG + commercial API, Bali + Jakarta" },
      { id: "events", label: "Events", desc: "Balinese calendar: Nyepi, Galungan, Kuningan…" },
    ],
  },
];

export const GOVERNANCE_ITEMS = [
  { id: "access", label: "Access control", desc: "Role-based permissions per workspace" },
  { id: "cost", label: "Cost tracking", desc: "Per-module LLM and compute spend" },
  { id: "audit", label: "Audit log", desc: "Every agent action is logged and attributable" },
  { id: "privacy", label: "Privacy redaction", desc: "P&L data redacted before LLM context injection" },
];
