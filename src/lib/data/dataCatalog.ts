// Iter2 — Data Catalog: 9 source cards for the Data & Knowledge → Data Catalog sub-tab.
// 7 live (green), 2 manual/weekly (yellow) — the 2 yellow cards intentionally preview
// "Wave 2: automation" opportunities that the presenter can call out.

export type SourceStatus = "live" | "manual";

export type SchemaColumn = { name: string; type: string; example: string; note?: string };

export type CatalogSource = {
  id: string;
  name: string;
  category: string;       // shown above source name
  status: SourceStatus;
  syncCadence: string;    // e.g. "syncing every 5 min"
  lastRecord: string;     // human readable
  recordsToday: string;   // "3,847"
  usedBy: ("M1" | "M2" | "M3")[];
  schema: SchemaColumn[];
};

export const CATALOG_SOURCES: CatalogSource[] = [
  {
    id: "pos-square",
    name: "Square",
    category: "POS",
    status: "live",
    syncCadence: "syncing every 5 min",
    lastRecord: "2 minutes ago",
    recordsToday: "3,847",
    usedBy: ["M1", "M2", "M3"],
    schema: [
      { name: "order_id", type: "string", example: "sq_20260520_07412" },
      { name: "location", type: "string", example: "Seminyak" },
      { name: "sku", type: "string", example: "Almond Croissant" },
      { name: "qty", type: "int", example: "2" },
      { name: "gross_amount", type: "decimal", example: "Rp 96,000" },
      { name: "channel", type: "enum", example: "in_store / takeaway / delivery" },
      { name: "timestamp", type: "datetime", example: "2026-05-20T07:42:13+08:00" },
    ],
  },
  {
    id: "crm-mailchimp-audience",
    name: "Mailchimp Audience",
    category: "CRM",
    status: "live",
    syncCadence: "syncing every 15 min",
    lastRecord: "7 minutes ago",
    recordsToday: "412",
    usedBy: ["M2", "M3"],
    schema: [
      { name: "customer_id", type: "string", example: "cm_84212" },
      { name: "email", type: "string", example: "j*****@gmail.com" },
      { name: "consent_status", type: "enum", example: "opted_in" },
      { name: "last_visit_location", type: "string", example: "Ubud" },
      { name: "lifetime_value", type: "decimal", example: "Rp 1,840,000" },
      { name: "cohort_tag", type: "string", example: "dormant_60d" },
    ],
  },
  {
    id: "wms-cloud-inventory",
    name: "Cloud Inventory",
    category: "WMS",
    status: "live",
    syncCadence: "syncing every 10 min",
    lastRecord: "4 minutes ago",
    recordsToday: "1,206",
    usedBy: ["M1", "M3"],
    schema: [
      { name: "sku", type: "string", example: "Sourdough Loaf" },
      { name: "location", type: "string", example: "Canggu" },
      { name: "on_hand_units", type: "int", example: "12" },
      { name: "reorder_point", type: "int", example: "8" },
      { name: "last_count_at", type: "datetime", example: "2026-05-20T06:15:00+08:00" },
    ],
  },
  {
    id: "xero-pnl",
    name: "Xero accounting",
    category: "P&L",
    status: "live",
    syncCadence: "syncing every 1 hour",
    lastRecord: "23 minutes ago",
    recordsToday: "84",
    usedBy: ["M3"],
    schema: [
      { name: "journal_id", type: "string", example: "jx_2026_05_20_0014" },
      { name: "account", type: "string", example: "COGS — Dairy" },
      { name: "location", type: "string", example: "Sanur" },
      { name: "amount", type: "decimal", example: "Rp 12,900,000" },
      { name: "memo", type: "string", example: "Pak Seto — W21 butter delivery" },
      { name: "posted_at", type: "datetime", example: "2026-05-20T09:00:00+08:00" },
    ],
  },
  {
    id: "weather-openweather",
    name: "OpenWeather",
    category: "Weather API",
    status: "live",
    syncCadence: "syncing every 30 min",
    lastRecord: "9 minutes ago",
    recordsToday: "168",
    usedBy: ["M1"],
    schema: [
      { name: "location", type: "string", example: "Ubud" },
      { name: "observed_at", type: "datetime", example: "2026-05-20T09:00:00+08:00" },
      { name: "condition", type: "enum", example: "rain / clear / cloudy" },
      { name: "temperature_c", type: "decimal", example: "27.2" },
      { name: "precip_prob_pct", type: "int", example: "62" },
    ],
  },
  {
    id: "events-bali-cal",
    name: "Bali Cultural Calendar",
    category: "Events",
    status: "live",
    syncCadence: "syncing daily 03:00 WIB",
    lastRecord: "Today 03:02 WIB",
    recordsToday: "12",
    usedBy: ["M1", "M2"],
    schema: [
      { name: "event_date", type: "date", example: "2026-05-23" },
      { name: "name", type: "string", example: "Galungan eve" },
      { name: "category", type: "enum", example: "religious / civic / tourism" },
      { name: "expected_footfall_lift_pct", type: "decimal", example: "+18%" },
    ],
  },
  {
    id: "email-mailchimp-campaigns",
    name: "Mailchimp Campaigns",
    category: "Email Platform",
    status: "live",
    syncCadence: "syncing every 1 hour",
    lastRecord: "44 minutes ago",
    recordsToday: "6",
    usedBy: ["M2"],
    schema: [
      { name: "campaign_id", type: "string", example: "mc_reactivation_w22" },
      { name: "sent_at", type: "datetime", example: "2026-05-19T11:00:00+08:00" },
      { name: "audience_size", type: "int", example: "1,402" },
      { name: "open_rate", type: "decimal", example: "31.4%" },
      { name: "click_rate", type: "decimal", example: "7.8%" },
    ],
  },
  {
    id: "hr-internal-sheet",
    name: "internal sheet",
    category: "HR System",
    status: "manual",
    syncCadence: "Manual sync — last 4 days ago",
    lastRecord: "16 May 2026, 09:00 WIB",
    recordsToday: "—",
    usedBy: ["M3"],
    schema: [
      { name: "employee_id", type: "string", example: "emp_0184" },
      { name: "location", type: "string", example: "Seminyak" },
      { name: "role", type: "string", example: "Baker" },
      { name: "ftes", type: "decimal", example: "1.0" },
      { name: "hourly_rate", type: "decimal", example: "Rp 28,000" },
    ],
  },
  {
    id: "supplier-invoices-email",
    name: "Email scrape",
    category: "Supplier Invoices",
    status: "manual",
    syncCadence: "Weekly sync — every Monday 08:00 WIB",
    lastRecord: "19 May 2026, 08:00 WIB",
    recordsToday: "—",
    usedBy: ["M3"],
    schema: [
      { name: "supplier", type: "string", example: "Pak Seto" },
      { name: "invoice_id", type: "string", example: "ps_2026_05_06" },
      { name: "amount", type: "decimal", example: "Rp 12,900,000" },
      { name: "scraped_at", type: "datetime", example: "2026-05-19T08:02:14+08:00" },
      { name: "confidence", type: "decimal", example: "0.97", note: "OCR confidence score" },
    ],
  },
];

export const CATALOG_HEADER = {
  totalSources: CATALOG_SOURCES.length,
  liveCount: CATALOG_SOURCES.filter((s) => s.status === "live").length,
  manualCount: CATALOG_SOURCES.filter((s) => s.status === "manual").length,
  lastPipelineRun: "5 minutes ago",
};
