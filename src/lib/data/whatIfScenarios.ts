export type ScenarioType = "price" | "close-day" | "staffing" | "cut-sku";

export type ConfidenceLevel = "high" | "medium" | "low";

export type WhatIfResult = {
  scenarioLabel: string;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  plImpact: {
    label: string;
    value: string;
    note?: string;
  }[];
  assumptions: string[];
  recommendation: string;
};

// ── Price change ─────────────────────────────────────────────────────────────

type PriceKey = `${string}_${string}`;

const PRICE_RESULTS: Record<PriceKey, WhatIfResult> = {
  // All locations — various price points
  "all_-10": {
    scenarioLabel: "Lower all menu prices 10% — all locations",
    confidence: "medium",
    confidenceReason: "Price elasticity benchmarked from F&B industry data",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "−Rp 42M/month" },
      { label: "Demand increase (price elasticity +0.8)", value: "+8 to +13%" },
      { label: "Net revenue impact", value: "−Rp 22M to −Rp 34M/month" },
      { label: "Margin impact", value: "−3.2pts to −4.8pts" },
    ],
    assumptions: [
      "Price elasticity −0.8 (F&B industry benchmark)",
      "No competitor response modeled",
      "Full 10% pass-through to all SKUs",
    ],
    recommendation:
      "Not recommended — margin compression exceeds the volume uplift at current cost structure. Consider targeted promotions instead.",
  },
  "all_-5": {
    scenarioLabel: "Lower all menu prices 5% — all locations",
    confidence: "medium",
    confidenceReason: "Price elasticity benchmarked from F&B industry data",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "−Rp 21M/month" },
      { label: "Demand increase", value: "+4 to +7%" },
      { label: "Net revenue impact", value: "−Rp 9M to −Rp 16M/month" },
      { label: "Margin impact", value: "−1.4pts to −2.6pts" },
    ],
    assumptions: [
      "Price elasticity −0.8 (F&B industry benchmark)",
      "No competitor response modeled",
    ],
    recommendation:
      "Marginal: limited volume uplift doesn't offset margin loss. Only viable during peak tourist season when demand is inelastic.",
  },
  "all_+5": {
    scenarioLabel: "Raise all menu prices 5% — all locations",
    confidence: "medium",
    confidenceReason: "Price elasticity benchmarked from F&B industry data",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 21M/month" },
      { label: "Demand reduction", value: "−3 to −6%" },
      { label: "Net revenue impact", value: "+Rp 9M to +Rp 18M/month" },
      { label: "Margin impact", value: "+0.8pts to +1.9pts" },
    ],
    assumptions: [
      "Price elasticity −0.8 (F&B industry benchmark)",
      "Tourist cohort less price-sensitive than local cohort",
      "No competitor response modeled",
    ],
    recommendation:
      "Viable. Test at Seminyak and Uluwatu first (highest tourist mix). Monitor demand for 2 weeks before chain-wide rollout.",
  },
  "all_+10": {
    scenarioLabel: "Raise all menu prices 10% — all locations",
    confidence: "medium",
    confidenceReason: "Price elasticity benchmarked from F&B industry data",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 42M/month" },
      { label: "Demand reduction", value: "−8 to −15%" },
      { label: "Net revenue impact", value: "+Rp 8M to +Rp 28M/month" },
      { label: "Margin impact", value: "+1.2pts to +2.8pts" },
    ],
    assumptions: [
      "Price elasticity −0.8 (F&B industry benchmark)",
      "No competitor response modeled",
      "Tourist cohort less price-sensitive than local cohort",
    ],
    recommendation:
      "Test at Seminyak first (highest tourist mix). Run for 2 weeks and compare vs M1 demand forecast variance.",
  },
  "all_+15": {
    scenarioLabel: "Raise all menu prices 15% — all locations",
    confidence: "low",
    confidenceReason: "High elasticity uncertainty at price changes above 10%",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 63M/month" },
      { label: "Demand reduction (high uncertainty)", value: "−15 to −28%" },
      { label: "Net revenue impact", value: "−Rp 2M to +Rp 30M/month" },
      { label: "Margin impact", value: "−0.3pts to +3.5pts" },
    ],
    assumptions: [
      "Wide confidence range — demand elasticity is uncertain at this level",
      "Competitor undercutting likely if local brands hold prices",
      "Local regulars highly sensitive to premium above 10%",
    ],
    recommendation:
      "High risk. Not recommended as a blanket move. If needed, apply selectively to premium SKUs (Basque Cheesecake, Matcha Cake) only.",
  },
  "all_+20": {
    scenarioLabel: "Raise all menu prices 20% — all locations",
    confidence: "low",
    confidenceReason: "Significant demand destruction risk at this level",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 84M/month" },
      { label: "Demand reduction", value: "−25 to −40%" },
      { label: "Net revenue impact", value: "−Rp 18M to +Rp 10M/month" },
      { label: "Margin impact", value: "−2pts to +1.4pts" },
    ],
    assumptions: [
      "Demand destruction likely exceeds revenue uplift",
      "Brand perception risk in competitive Bali market",
    ],
    recommendation:
      "Not recommended. Revenue destruction likely outweighs gain. Focus cost management on supply chain instead.",
  },

  // Seminyak specific
  "seminyak_+5": {
    scenarioLabel: "Raise menu prices 5% — Seminyak only",
    confidence: "medium",
    confidenceReason: "Seminyak has highest tourist mix — lower elasticity expected",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 5.1M/month" },
      { label: "Demand reduction (tourist-heavy)", value: "−2 to −4%" },
      { label: "Net revenue impact", value: "+Rp 2.9M to +Rp 4.8M/month" },
      { label: "Margin impact", value: "+0.6pts to +1.2pts" },
    ],
    assumptions: [
      "Seminyak tourist mix ~65% of covers",
      "Tourists exhibit lower price sensitivity",
      "No spillover to other locations",
    ],
    recommendation:
      "Good candidate for pilot. Low demand risk given tourist mix. Start with beverages (Iced Latte, Cold Brew) to test sensitivity.",
  },
  "seminyak_+10": {
    scenarioLabel: "Raise menu prices 10% — Seminyak only",
    confidence: "medium",
    confidenceReason: "Seminyak tourist mix reduces elasticity risk",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 10.2M/month" },
      { label: "Demand reduction", value: "−4 to −8%" },
      { label: "Net revenue impact", value: "+Rp 4.8M to +Rp 9.2M/month" },
      { label: "Margin impact", value: "+0.9pts to +2.0pts" },
    ],
    assumptions: [
      "Seminyak tourist mix ~65% of covers",
      "Local regulars (35%) may reduce frequency",
    ],
    recommendation:
      "Recommended as a 2-week pilot. Monitor return-visit rate among local regulars carefully.",
  },

  // Canggu specific
  "canggu_+5": {
    scenarioLabel: "Raise menu prices 5% — Canggu only",
    confidence: "medium",
    confidenceReason: "Canggu has mixed tourist/digital-nomad segment",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 3.3M/month" },
      { label: "Demand reduction", value: "−4 to −7%" },
      { label: "Net revenue impact", value: "+Rp 1.0M to +Rp 2.8M/month" },
      { label: "Margin impact", value: "+0.4pts to +0.9pts" },
    ],
    assumptions: [
      "Digital nomad segment is value-conscious and may switch cafés",
      "Competitor alternatives within 200m",
    ],
    recommendation:
      "Moderate risk. Canggu's digital-nomad base is price-sensitive. Focus on resolving waste first — it has a bigger margin impact.",
  },
  "canggu_+10": {
    scenarioLabel: "Raise menu prices 10% — Canggu only",
    confidence: "low",
    confidenceReason: "Canggu price sensitivity is higher than chain average",
    plImpact: [
      { label: "Revenue change (if demand holds)", value: "+Rp 6.6M/month" },
      { label: "Demand reduction", value: "−10 to −18%" },
      { label: "Net revenue impact", value: "−Rp 0.5M to +Rp 3.6M/month" },
      { label: "Margin impact", value: "−0.1pts to +0.8pts" },
    ],
    assumptions: [
      "High price sensitivity in Canggu's market",
      "Several close substitutes for coffee + pastry",
    ],
    recommendation:
      "Not recommended at Canggu. Demand destruction likely. Fix the waste issue first — reducing waste from 18% to 9% adds ~Rp 8M/month.",
  },
};

// ── Close a day ──────────────────────────────────────────────────────────────

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayName = typeof DAY_NAMES[number];

const DAY_REVENUE_WEIGHTS: Record<DayName, number> = {
  Monday: 0.10,
  Tuesday: 0.11,
  Wednesday: 0.12,
  Thursday: 0.14,
  Friday: 0.16,
  Saturday: 0.20,
  Sunday: 0.17,
};

const LOCATION_WEEKLY_REVENUE: Record<string, number> = {
  Seminyak: 312,
  Ubud: 268,
  Canggu: 198,
  Sanur: 241,
  Kuta: 218,
  Uluwatu: 281,
  "Jakarta SCBD": 290,
};

function buildCloseDayResult(location: string, day: DayName, permanent: boolean): WhatIfResult {
  const weeklyRev = LOCATION_WEEKLY_REVENUE[location] ?? 250;
  const dayShare = DAY_REVENUE_WEIGHTS[day];
  const dailyRevLoss = Math.round(weeklyRev * dayShare);
  const monthlyRevLoss = Math.round(dailyRevLoss * 4.3);
  const staffSaving = Math.round(monthlyRevLoss * 0.18); // approx 18% of lost rev saved in staff costs
  const netMonthlyImpact = monthlyRevLoss - staffSaving;
  const isWeekend = day === "Saturday" || day === "Sunday";

  return {
    scenarioLabel: `Close ${location} on ${day}s${permanent ? " (permanent)" : " (1-week trial)"}`,
    confidence: "low",
    confidenceReason:
      "Customer retention rate after closure is unknown — some customers may not return on other days",
    plImpact: [
      { label: "Revenue lost per week", value: `−Rp ${dailyRevLoss}M` },
      { label: "Revenue lost per month", value: `−Rp ${monthlyRevLoss}M` },
      { label: "Staff cost saving", value: `+Rp ${staffSaving}M/month` },
      {
        label: "Net P&L impact (monthly)",
        value: `−Rp ${netMonthlyImpact}M/month`,
        note: "Assumes 0% customer retention on closed day",
      },
    ],
    assumptions: [
      "All revenue on closed day is permanently lost (worst case)",
      "~15–20% of customers may shift to adjacent days",
      `${isWeekend ? "Weekend closure has outsized revenue impact" : "Weekday closure has lower revenue impact but affects local regulars"}`,
      permanent ? "No lease/utility saving modeled" : "Trial cost only (no structural savings)",
    ],
    recommendation:
      isWeekend
        ? `Closing ${day} at ${location} would cost Rp ${monthlyRevLoss}M/month in revenue. Not recommended unless operational need is critical.`
        : `${day} is a lower-traffic day at ${location}. A trial closure could validate demand elasticity. Monitor adjacent-day uplift during the trial week.`,
  };
}

// ── Staffing change ──────────────────────────────────────────────────────────

type StaffingKey = `${string}_${string}`;

function buildStaffingResult(location: string, fteDelta: number, shift: string): WhatIfResult {
  const weeklyRev = LOCATION_WEEKLY_REVENUE[location] ?? 250;
  const hrRate = 35; // Rp 35K/hr
  const hrsPerFtePerMonth = 160;
  const monthlySaving = Math.abs(fteDelta) * hrsPerFtePerMonth * hrRate;
  const isReduction = fteDelta < 0;
  const revenueRisk = isReduction ? Math.round(weeklyRev * 0.04 * 4.3 * Math.abs(fteDelta)) : 0;

  return {
    scenarioLabel: `${isReduction ? "Reduce" : "Add"} ${Math.abs(fteDelta)} FTE at ${location}${shift !== "All" ? ` (${shift} shift)` : ""}`,
    confidence: "high",
    confidenceReason: "Based on actual hours-per-revenue data across all locations",
    plImpact: [
      {
        label: isReduction ? "Staff cost saving/month" : "Staff cost increase/month",
        value: `${isReduction ? "+" : "−"}Rp ${(monthlySaving / 1000).toFixed(0)}K/month`,
      },
      ...(isReduction
        ? [
            {
              label: "Revenue at risk (service degradation)",
              value: `−Rp ${(revenueRisk / 1000).toFixed(0)}K/month`,
              note: "Assumes 4% revenue sensitivity per FTE reduction",
            },
            {
              label: "Net benefit",
              value: `+Rp ${((monthlySaving - revenueRisk) / 1000).toFixed(0)}K/month`,
            },
          ]
        : [
            {
              label: "Expected revenue uplift (service quality)",
              value: `+Rp ${(revenueRisk / 1000).toFixed(0)}K/month`,
              note: "Assumes improved service quality drives repeat visits",
            },
          ]),
    ],
    assumptions: [
      `Current ${location} Hrs/Rp1M: ${location === "Canggu" ? "6.8" : location === "Seminyak" ? "4.5" : "5.2"}h (chain avg 5.0h)`,
      "Rp 35K/hr blended staff cost",
      "4% revenue sensitivity per FTE change",
      shift !== "All" ? `${shift} shift only — no impact on other shifts` : "Across all shifts",
    ],
    recommendation: isReduction
      ? `${Math.abs(fteDelta)} FTE reduction at ${location} saves Rp ${(monthlySaving / 1000).toFixed(0)}K/month. Net benefit after revenue risk: Rp ${((monthlySaving - revenueRisk) / 1000).toFixed(0)}K/month. ${location === "Canggu" ? "Canggu is overstaffed relative to traffic — high confidence this improves efficiency." : "Monitor NPS and queue times weekly."}`
      : `Adding ${fteDelta} FTE at ${location} costs Rp ${(monthlySaving / 1000).toFixed(0)}K/month. Justified only if current service scores are below target.`,
  };
}

// ── Cut/Add SKU ──────────────────────────────────────────────────────────────

const CUT_SKU_RESULTS: Record<string, WhatIfResult> = {
  "Sourdough Loaf": {
    scenarioLabel: "Cut Sourdough Loaf from menu",
    confidence: "medium",
    confidenceReason: "High cross-sell dependency makes cannibalization uncertain",
    plImpact: [
      { label: "Direct revenue loss", value: "−Rp 28M/month" },
      { label: "COGS saving (ingredients + labor)", value: "+Rp 11M/month" },
      { label: "Cross-sell loss (toast, sandwiches)", value: "−Rp 8M/month" },
      { label: "Net P&L impact", value: "−Rp 25M/month" },
    ],
    assumptions: [
      "Sourdough Loaf is a top-selling anchor SKU at 6/7 locations",
      "~30% of Avocado Toast orders depend on Sourdough",
      "Some customers visit specifically for Sourdough — risk of lost visits",
    ],
    recommendation:
      "Not recommended. Sourdough is a brand-defining product. If costs are the concern, renegotiate flour/butter supply terms instead.",
  },
  Croissant: {
    scenarioLabel: "Cut Croissant from menu",
    confidence: "medium",
    confidenceReason: "Cannibalization with Pain au Chocolat partially offsets loss",
    plImpact: [
      { label: "Direct revenue loss", value: "−Rp 18M/month" },
      { label: "COGS saving", value: "+Rp 6M/month" },
      { label: "Demand shift to Pain au Chocolat (+40%)", value: "+Rp 9M/month" },
      { label: "Net P&L impact", value: "−Rp 3M/month" },
    ],
    assumptions: [
      "~40% of Croissant buyers will substitute with Pain au Chocolat",
      "PaC has slightly higher margin (38% vs 35% food cost)",
      "Some customers may leave if Croissant unavailable",
    ],
    recommendation:
      "Marginal loss. Only worthwhile if SKU complexity causes production strain. Consider keeping Croissant at high-volume locations (Seminyak, Jakarta SCBD) only.",
  },
  "Matcha Cake Slice": {
    scenarioLabel: "Cut Matcha Cake Slice from menu",
    confidence: "medium",
    confidenceReason: "High waste rate makes this a strong cost-reduction candidate",
    plImpact: [
      { label: "Direct revenue loss", value: "−Rp 12M/month" },
      { label: "COGS saving (ingredients)", value: "+Rp 4M/month" },
      { label: "Waste cost eliminated (18% waste rate)", value: "+Rp 6M/month" },
      { label: "Net P&L impact", value: "−Rp 2M/month" },
    ],
    assumptions: [
      "Matcha Cake Slice is high-waste at Canggu (18%) and Ubud",
      "Revenue loss partially offset by waste elimination",
      "Low cross-sell dependency — standalone impulse purchase",
    ],
    recommendation:
      "Near break-even cut. If production efficiency cannot be improved, cutting at Canggu specifically (worst waste) saves Rp 4M/month there with minimal revenue impact.",
  },
  "Iced Latte": {
    scenarioLabel: "Cut Iced Latte from menu",
    confidence: "medium",
    confidenceReason: "Beverages are high-margin — cutting has outsized impact",
    plImpact: [
      { label: "Direct revenue loss", value: "−Rp 35M/month" },
      { label: "COGS saving", value: "+Rp 8M/month" },
      { label: "Cross-sell loss (pastry combos)", value: "−Rp 5M/month" },
      { label: "Net P&L impact", value: "−Rp 32M/month" },
    ],
    assumptions: [
      "Iced Latte is highest-volume beverage (28% of beverage revenue)",
      "Very low substitutability — customers will go elsewhere",
      "~20% of food orders paired with Iced Latte",
    ],
    recommendation:
      "Strongly not recommended. Iced Latte drives ~18% of total chain revenue. Instead, investigate the Jakarta SCBD decline and address root cause.",
  },
  "Avocado Toast": {
    scenarioLabel: "Cut Avocado Toast from menu",
    confidence: "medium",
    confidenceReason: "Medium cross-sell dependency, manageable substitution",
    plImpact: [
      { label: "Direct revenue loss", value: "−Rp 14M/month" },
      { label: "COGS saving", value: "+Rp 5M/month" },
      { label: "Demand shift to other breakfast items", value: "+Rp 4M/month" },
      { label: "Net P&L impact", value: "−Rp 5M/month" },
    ],
    assumptions: [
      "~30% of Avocado Toast buyers will order another breakfast item",
      "Avocado import cost is volatile — seasonal exposure",
      "Lower margin than alternatives (32% food cost vs 26% chain avg)",
    ],
    recommendation:
      "Possible at low-performing locations (Kuta, Canggu). The −Rp 5M/month net loss is manageable if avocado cost spikes become a recurring issue.",
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export function getPriceResult(
  scope: string,
  changePct: number,
): WhatIfResult {
  const scopeKey = scope.toLowerCase().replace(" ", "_").replace("all locations", "all");
  const pctKey = changePct > 0 ? `+${changePct}` : `${changePct}`;
  const key: PriceKey = `${scopeKey}_${pctKey}`;
  if (PRICE_RESULTS[key]) return PRICE_RESULTS[key];

  // Fallback: interpolate from nearest match
  const sign = changePct >= 0 ? "+" : "";
  return {
    scenarioLabel: `${changePct > 0 ? "Raise" : "Lower"} menu prices ${Math.abs(changePct)}% — ${scope}`,
    confidence: "medium",
    confidenceReason: "Interpolated from benchmark data",
    plImpact: [
      {
        label: "Estimated revenue impact",
        value: `${changePct > 0 ? "+" : "−"}Rp ${Math.round(Math.abs(changePct) * 2.1)}M/month`,
        note: "Approximate — based on chain-average elasticity",
      },
      {
        label: "Demand change",
        value: `${changePct > 0 ? "−" : "+"}${Math.round(Math.abs(changePct) * 0.8)}%`,
      },
    ],
    assumptions: [
      "Price elasticity −0.8 (F&B industry benchmark)",
      `${sign}${changePct}% applied uniformly across all SKUs`,
    ],
    recommendation: `Run a 2-week pilot at one location before chain-wide rollout.`,
  };
}

export function getCloseDayResult(
  location: string,
  day: string,
  permanent: boolean,
): WhatIfResult {
  if (DAY_NAMES.includes(day as DayName)) {
    return buildCloseDayResult(location, day as DayName, permanent);
  }
  return buildCloseDayResult(location, "Monday", permanent);
}

export function getStaffingResult(
  location: string,
  fteDelta: number,
  shift: string,
): WhatIfResult {
  return buildStaffingResult(location, fteDelta, shift);
}

export function getCutSkuResult(sku: string): WhatIfResult {
  return (
    CUT_SKU_RESULTS[sku] ?? {
      scenarioLabel: `Cut ${sku} from menu`,
      confidence: "medium",
      confidenceReason: "Limited historical data for this SKU",
      plImpact: [
        {
          label: "Estimated revenue loss",
          value: "−Rp 8M to −Rp 15M/month",
          note: "Highly dependent on SKU volume and cross-sell",
        },
      ],
      assumptions: [
        "No historical data available for this specific SKU cut",
        "Estimate based on average SKU revenue contribution",
      ],
      recommendation:
        "Gather 4 weeks of sales data before cutting. Ensure you understand cross-sell dependency.",
    }
  );
}
