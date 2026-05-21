import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LineChart,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { CheckCircle, HelpCircle } from "lucide-react";
import { AppShell, PageHeader, SectionTitle } from "@/components/app-shell";
import {
  ForecastLegend,
  HatchPatternDefs,
  HATCH_ID,
} from "@/components/forecast-marks";
import { LOCATIONS, SKUS, usePosHistory } from "@/lib/data/store";
import { expectedDemand, holidayMultiplier, IDR } from "@/lib/data/seed";
import { BASE_RECOMMENDATIONS, type Confidence } from "@/lib/data/recommendations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/m1")({ component: M1DemandForecasting });

const LOCATION_OPTIONS = [
  { id: "sem", label: "Seminyak" },
  { id: "can", label: "Canggu" },
  { id: "ubu", label: "Ubud" },
  { id: "kut", label: "Kuta" },
  { id: "ulu", label: "Uluwatu" },
  { id: "jkt", label: "Jakarta SCBD" },
];

const CATEGORY_OPTIONS = ["All", "Bread", "Pastry", "Cake", "Beverage"] as const;

const CONFIDENCE_COLORS: Record<Confidence, string> = {
  high: "var(--color-success)",
  med: "var(--color-warning)",
  low: "var(--color-destructive)",
};

const CONFIDENCE_BG: Record<Confidence, string> = {
  high: "bg-success/15",
  med: "bg-warning/15",
  low: "bg-destructive/15",
};

// Waste sparkline data: 8 weeks trending down, as percentage
const WASTE_SPARKLINE = [18.2, 16.8, 15.4, 14.1, 13.3, 12.4, 11.7, 10.9];

function ConfidenceBar({ level }: { level: Confidence }) {
  const filled = level === "high" ? 3 : level === "med" ? 2 : 1;
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-1.5 w-3.5 rounded-full"
          style={{
            background: i < filled ? CONFIDENCE_COLORS[level] : "var(--color-border)",
            opacity: i < filled ? 1 : 0.4,
          }}
        />
      ))}
      <span className="text-[10px] ml-1 capitalize" style={{ color: CONFIDENCE_COLORS[level] }}>
        {level}
      </span>
    </div>
  );
}

function DeltaBadge({ value }: { value: number }) {
  const pos = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs num tabular-nums",
        pos ? "text-success" : "text-destructive",
      )}
    >
      {pos ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function FeatureTooltip({ features }: { features: [string, string, string] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-muted-foreground/60 hover:text-walnut transition-colors"
      >
        <HelpCircle className="size-3.5" />
      </button>
      {open && (
        <div className="absolute z-30 bottom-full right-0 mb-1.5 w-56 bg-popover border border-border rounded-sm shadow-md p-2.5 text-[11px] leading-relaxed pointer-events-none">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Top 3 forecast drivers
          </div>
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 py-0.5">
              <span className="text-gold mt-0.5">·</span>
              <span className="text-foreground">{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WasteSparkline() {
  const min = Math.min(...WASTE_SPARKLINE) - 1;
  const max = Math.max(...WASTE_SPARKLINE) + 1;
  const w = 80;
  const h = 28;
  const pts = WASTE_SPARKLINE.map((v, i) => {
    const x = (i / (WASTE_SPARKLINE.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--color-success)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {WASTE_SPARKLINE.map((v, i) => {
        const x = (i / (WASTE_SPARKLINE.length - 1)) * w;
        const y = h - ((v - min) / (max - min)) * h;
        return (
          <circle key={i} cx={x} cy={y} r={i === WASTE_SPARKLINE.length - 1 ? 2.5 : 1.5}
            fill="var(--color-success)" />
        );
      })}
    </svg>
  );
}

function M1DemandForecasting() {
  const pos = usePosHistory();
  const [selectedLocation, setSelectedLocation] = useState("sem");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSkuId, setSelectedSkuId] = useState("sourdough");
  const [approvedRows, setApprovedRows] = useState<Set<string>>(new Set());

  const loc = LOCATIONS.find((l) => l.id === selectedLocation) ?? LOCATIONS[0];
  // Scale all qty values by location traffic vs Seminyak baseline
  const factor = loc.trafficIndex / 1.35;

  const filteredRecs = useMemo(
    () =>
      BASE_RECOMMENDATIONS.filter(
        (r) => selectedCategory === "All" || r.category === selectedCategory,
      ),
    [selectedCategory],
  );

  const adjustedRecs = useMemo(
    () =>
      filteredRecs.map((r) => ({
        ...r,
        yesterdayActual: Math.round(r.yesterdayActual * factor),
        todayForecast: Math.round(r.todayForecast * factor),
        recommendedProduction: Math.round(r.recommendedProduction * factor),
      })),
    [filteredRecs, factor],
  );

  // Chart data: last 44 days for selected SKU + location
  const chartData = useMemo(() => {
    const sku = SKUS.find((s) => s.id === selectedSkuId);
    if (!sku) return [];
    const today = startOfDay(new Date());
    return Array.from({ length: 44 }, (_, i) => {
      const d = subDays(today, 43 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const posRow = pos.find(
        (r) => r.date === dateStr && r.locationId === loc.id && r.skuId === sku.id,
      );
      const demand = expectedDemand(d, loc, sku);
      const hol = holidayMultiplier(d, loc.region);

      // Inject a visible Galungan miss: April 12 actual should be ~48% of forecast
      const actual =
        dateStr === "2026-04-12"
          ? Math.round(demand * 0.48)
          : posRow?.soldQty ?? Math.round(demand * 0.96);

      return {
        date: dateStr,
        label: format(d, "MMM d"),
        actual,
        forecast: Math.round(demand),
        lower: Math.round(demand * 0.87),
        upper: Math.round(demand * 1.13),
        isGalungan: dateStr === "2026-04-12",
        holiday: hol.name,
      };
    });
  }, [selectedSkuId, loc, pos]);

  const selectedRec = adjustedRecs.find((r) => r.skuId === selectedSkuId) ?? adjustedRecs[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="M1 · Demand Forecasting"
        title="Daily production recommendations"
        description="AI-driven production planning per SKU per location. The model accounts for Balinese cultural events, tourist seasonality, weather, and day-of-week patterns to recommend daily bake quantities — and explains its reasoning."
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/70 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Location
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-sm bg-card border border-border/70 rounded-sm px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-walnut/40 cursor-pointer"
          >
            {LOCATION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-border/70" />

        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Date range
          </label>
          <span className="text-sm bg-secondary/60 border border-border/70 rounded-sm px-2.5 py-1.5 text-muted-foreground select-none">
            Next 7 days
          </span>
        </div>

        <div className="h-4 w-px bg-border/70" />

        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Category
          </label>
          <div className="flex gap-1">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-sm border transition-colors",
                  selectedCategory === cat
                    ? "bg-ink text-cream border-ink"
                    : "bg-card text-muted-foreground border-border/70 hover:text-foreground hover:border-walnut/40",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto text-[10px] text-muted-foreground">
          {approvedRows.size} / {filteredRecs.length} approved
        </div>
      </div>

      {/* Panel A — Production table */}
      <div className="mb-5">
        <SectionTitle hint={<ForecastLegend />}>Production recommendations</SectionTitle>
        <div className="rounded-sm border border-border/70 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-secondary/30">
                <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal w-44">
                  SKU
                </th>
                <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                  Yesterday
                </th>
                <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                  Forecast
                </th>
                <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                  Recommend
                </th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                  Confidence
                </th>
                <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                  Δ vs last wk
                </th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {adjustedRecs.map((rec) => {
                const isSelected = rec.skuId === selectedSkuId;
                const isApproved = approvedRows.has(rec.skuId);
                return (
                  <tr
                    key={rec.skuId}
                    onClick={() => setSelectedSkuId(rec.skuId)}
                    className={cn(
                      "border-b border-border/40 cursor-pointer transition-colors",
                      isSelected
                        ? "bg-gold/8 border-l-2 border-l-gold"
                        : "hover:bg-secondary/30",
                    )}
                    style={isSelected ? { borderLeftColor: "var(--color-gold)" } : {}}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-ink text-[13px]">{rec.displayName}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{rec.category}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right num text-muted-foreground">
                      {rec.yesterdayActual}
                    </td>
                    <td className="px-4 py-2.5 text-right num text-walnut font-medium italic">
                      {rec.todayForecast}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="num font-serif text-lg text-ink">
                        {rec.recommendedProduction}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ConfidenceBar level={rec.confidence} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <DeltaBadge value={rec.deltaVsLastWeek} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <FeatureTooltip features={rec.topFeatures} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setApprovedRows((prev) => {
                              const next = new Set(prev);
                              if (next.has(rec.skuId)) next.delete(rec.skuId);
                              else next.add(rec.skuId);
                              return next;
                            });
                          }}
                          className={cn(
                            "flex items-center gap-1 text-xs px-2.5 py-1 rounded-sm border transition-colors",
                            isApproved
                              ? "bg-success/15 border-success/40 text-success"
                              : "bg-card border-border/70 text-muted-foreground hover:border-walnut/50 hover:text-ink",
                          )}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle className="size-3" /> Approved
                            </>
                          ) : (
                            "Approve"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panels B + C */}
      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Panel B — Forecast vs actual chart */}
        <div className="rounded-sm border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle hint={<ForecastLegend />}>
              {selectedRec?.displayName ?? "SKU"} — forecast vs actual
            </SectionTitle>
          </div>
          <div className="text-[10px] text-muted-foreground mb-3">
            Last 44 days · {loc.name} · units
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                <HatchPatternDefs />
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="2 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--color-walnut)", strokeOpacity: 0.2 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = chartData.find((c) => c.label === label);
                    return (
                      <div
                        style={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 4,
                          fontSize: 12,
                          padding: "8px 10px",
                          minWidth: 140,
                        }}
                      >
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                          {label}
                          {d?.holiday ? ` · ${d.holiday}` : ""}
                        </div>
                        {payload.map((p: any) => (
                          <div key={p.dataKey} className="flex justify-between gap-4 py-0.5">
                            <span className="capitalize">{p.name}</span>
                            <span className="num font-medium">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                {/* Confidence band */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  fill={`url(#${HATCH_ID})`}
                  fillOpacity={0.35}
                  stroke="none"
                  name="upper bound"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  fill="var(--color-background)"
                  fillOpacity={1}
                  stroke="none"
                  name="lower bound"
                  isAnimationActive={false}
                />
                {/* Forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--color-gold)"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  name="Forecast"
                  isAnimationActive={false}
                />
                {/* Actual line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-walnut)"
                  strokeWidth={2}
                  dot={false}
                  name="Actual"
                  isAnimationActive={false}
                />
                {/* Galungan miss annotation */}
                <ReferenceLine
                  x="Apr 12"
                  stroke="var(--color-destructive)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                  label={{
                    value: "Galungan — model now learning",
                    position: "insideTopLeft",
                    fill: "var(--color-destructive)",
                    fontSize: 9,
                    fontWeight: 600,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel C — Waste impact */}
        <div className="rounded-sm border border-border/70 bg-card p-5 flex flex-col">
          <div className="text-[10px] uppercase tracking-[0.16em] text-walnut mb-1">
            Waste impact
          </div>
          <div className="font-serif text-4xl text-ink mt-2 tracking-tight">24%</div>
          <div className="text-sm text-muted-foreground mt-1">
            waste reduction this week vs baseline
          </div>

          <div className="mt-4 p-3 rounded-sm bg-success/8 border border-success/20">
            <div className="text-[10px] uppercase tracking-wider text-success/80 mb-0.5">
              Estimated saving
            </div>
            <div className="font-serif text-xl text-ink">Rp 8.4M</div>
            <div className="text-xs text-muted-foreground">~$540 USD this week</div>
          </div>

          <div className="mt-4 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Weekly waste % — 8 weeks
            </div>
            <div className="flex items-end gap-1">
              <WasteSparkline />
              <div className="ml-2">
                <div className="text-[10px] text-muted-foreground">
                  {WASTE_SPARKLINE[0].toFixed(1)}% → {WASTE_SPARKLINE.at(-1)?.toFixed(1)}%
                </div>
                <div className="text-[10px] text-success">
                  ↓ {(WASTE_SPARKLINE[0] - (WASTE_SPARKLINE.at(-1) ?? 0)).toFixed(1)} pts
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              {WASTE_SPARKLINE.map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-1.5 rounded-full"
                    style={{
                      height: `${((v - 8) / 12) * 28 + 4}px`,
                      background: `var(--color-success)`,
                      opacity: 0.3 + (i / WASTE_SPARKLINE.length) * 0.5,
                    }}
                  />
                </div>
              ))}
              <span className="ml-1">Wk trend</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/70 text-[10px] text-muted-foreground leading-relaxed">
            Model adopted at {loc.name}. Baseline = prior-month waste rate of 14.2%.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
