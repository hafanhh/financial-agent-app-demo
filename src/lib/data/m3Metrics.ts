// Iter3 — Single source of truth for top-level M3 metrics.
// Briefing card, KPI strip, and chat responses all read from here so numbers stay in sync.
// Values are hand-picked to match the iter2 chat responses (e.g. chain margin 61%, Canggu 18% waste, etc.)

export type MetricDirection = "up" | "down";

export type Sparkline = readonly number[]; // 8 weekly values, oldest → newest

export type KpiMetric = {
  id: string;
  label: string;
  value: string;            // formatted display, e.g. "61%" / "Rp 1.2B"
  delta: { direction: MetricDirection; amount: string; period: string };
  deltaIsGood: boolean;     // green/red colouring
  sparkline: Sparkline;
  drillPrompt: string;      // pre-fills chat input when tile clicked
};

// --- CEO tiles ---------------------------------------------------------------

export const CEO_METRICS = {
  chainMargin: {
    id: "chain-margin",
    label: "Chain margin",
    value: "61%",
    delta: { direction: "down", amount: "−2 pts", period: "WoW" },
    deltaIsGood: false,
    sparkline: [63, 64, 63, 62, 63, 62, 61, 61],
    drillPrompt: "Which 2 locations are dragging down chain margin this month, and why?",
  },
  cashPosition: {
    id: "cash-position",
    label: "Cash position",
    value: "Rp 1.2B",
    delta: { direction: "up", amount: "+5%", period: "WoW" },
    deltaIsGood: true,
    sparkline: [0.92, 0.96, 1.0, 1.05, 1.08, 1.12, 1.15, 1.2],
    drillPrompt: "What's our cash position breakdown for this week?",
  },
  wastePct: {
    id: "waste-pct",
    label: "Waste %",
    value: "11%",
    delta: { direction: "up", amount: "+1 pt", period: "WoW" },
    deltaIsGood: false,
    sparkline: [13, 12, 11, 11, 10, 10, 11, 11],
    drillPrompt: "Which locations and SKUs have the worst waste this week?",
  },
  customerLtv: {
    id: "customer-ltv",
    label: "Customer LTV",
    value: "Rp 380K",
    delta: { direction: "down", amount: "−3%", period: "MoM" },
    deltaIsGood: false,
    sparkline: [410, 405, 400, 398, 392, 388, 384, 380],
    drillPrompt: "How is customer lifetime value trending by cohort?",
  },
} as const satisfies Record<string, KpiMetric>;

export const CEO_TILE_ORDER: (keyof typeof CEO_METRICS)[] = [
  "chainMargin",
  "cashPosition",
  "wastePct",
  "customerLtv",
];

// --- Store Manager tiles (Seminyak baseline; values shift slightly per location) ---

export const SM_METRICS = {
  foodCost: {
    id: "sm-food-cost",
    label: "My food cost %",
    value: "28%",
    delta: { direction: "down", amount: "−2 pts", period: "WoW" },
    deltaIsGood: true,
    sparkline: [31, 30, 30, 29, 29, 28, 28, 28],
    drillPrompt: "What's driving my food cost this week, day by day?",
  },
  wasteToday: {
    id: "sm-waste-today",
    label: "My waste today",
    value: "Rp 142K",
    delta: { direction: "up", amount: "+Rp 30K", period: "WoW" },
    deltaIsGood: false,
    sparkline: [110, 105, 118, 120, 125, 130, 142, 142],
    drillPrompt: "Which 3 SKUs at my store had the worst waste this week?",
  },
  trafficVsForecast: {
    id: "sm-traffic-vs-forecast",
    label: "My traffic vs forecast",
    value: "+12%",
    delta: { direction: "up", amount: "+4 pts", period: "WoW" },
    deltaIsGood: true,
    sparkline: [-2, 0, 3, 5, 7, 9, 11, 12],
    drillPrompt: "Why is my traffic running above forecast?",
  },
  staffHrsPerM: {
    id: "sm-staff-hrs-per-m",
    label: "My staff hrs / Rp 1M",
    value: "4.5 h",
    delta: { direction: "down", amount: "−0.3 h", period: "WoW" },
    deltaIsGood: true,
    sparkline: [5.0, 5.0, 4.9, 4.8, 4.8, 4.7, 4.6, 4.5],
    drillPrompt: "Am I overstaffed on Tuesdays compared to other stores?",
  },
} as const satisfies Record<string, KpiMetric>;

export const SM_TILE_ORDER: (keyof typeof SM_METRICS)[] = [
  "foodCost",
  "wasteToday",
  "trafficVsForecast",
  "staffHrsPerM",
];
