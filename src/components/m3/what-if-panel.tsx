// F2 — What-if Scenario Simulator
// Replaces chat area (same pattern as ComparePanel) when whatIfMode is active.
// 3 steps: pick scenario type → fill parameters → view results.

import { useState } from "react";
import {
  DollarSign,
  CalendarX,
  Users,
  Package,
  ChevronLeft,
  RotateCcw,
  Zap,
} from "lucide-react";
import { ConfidenceBadge } from "@/components/m3/confidence-badge";
import {
  getPriceResult,
  getCloseDayResult,
  getStaffingResult,
  getCutSkuResult,
  type WhatIfResult,
} from "@/lib/data/whatIfScenarios";
import { cn } from "@/lib/utils";

const STORE_LOCATIONS = [
  "All locations",
  "Seminyak",
  "Ubud",
  "Canggu",
  "Sanur",
  "Kuta",
  "Uluwatu",
  "Jakarta SCBD",
];
const SKUS = [
  "Sourdough Loaf",
  "Pain au Chocolat",
  "Almond Croissant",
  "Cinnamon Roll",
  "Matcha Cake Slice",
  "Coconut Cake Slice",
  "Banana Bread",
  "Brownie",
  "Gluten-free Muffin",
  "Avocado Toast",
  "Iced Latte",
  "Cold Brew",
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type ScenarioType = "price" | "close-day" | "staffing" | "cut-sku" | null;

function ConfidenceDot({ level }: { level: "high" | "medium" | "low" }) {
  const cls =
    level === "high"
      ? "text-success"
      : level === "medium"
        ? "text-warning"
        : "text-destructive";
  const dot = level === "high" ? "🟢" : level === "medium" ? "🟡" : "🟠";
  return (
    <span className={cn("text-xs font-medium", cls)}>
      {dot} {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function ResultView({
  result,
  onRunAnother,
  onAskFollowUp,
}: {
  result: WhatIfResult;
  onRunAnother: () => void;
  onAskFollowUp: (text: string) => void;
}) {
  const confidence = {
    level: result.confidence,
    summary: result.confidenceReason,
    whyDetails: [result.confidenceReason],
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onRunAnother}
          className="flex items-center gap-1 text-walnut hover:text-ink transition-colors"
        >
          <ChevronLeft className="size-3.5" />
          Run another
        </button>
        <span>/</span>
        <span>Scenario result</span>
      </div>

      {/* Result card */}
      <div className="rounded-sm border border-border/70 bg-card p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-walnut flex items-center gap-1.5 mb-1">
              <Zap className="size-3" />
              Scenario result
            </div>
            <div className="font-serif text-[15px] text-ink leading-snug">
              "{result.scenarioLabel}"
            </div>
          </div>
          <ConfidenceDot level={result.confidence} />
        </div>

        <ConfidenceBadge confidence={confidence} />

        {/* P&L table */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Estimated P&L impact (monthly)
          </div>
          <div className="rounded-sm border border-border/60 overflow-hidden">
            <table className="text-xs w-full">
              <tbody>
                {result.plImpact.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0">
                    <td className="py-2 px-3 text-foreground font-medium">{row.label}</td>
                    <td className="py-2 px-3 text-right num font-medium text-ink">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.plImpact.some((r) => r.note) && (
            <p className="text-[10px] text-muted-foreground mt-1.5 italic">
              * {result.plImpact.find((r) => r.note)?.note}
            </p>
          )}
        </div>

        {/* Assumptions */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
            Key assumptions
          </div>
          <ul className="space-y-1">
            {result.assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="text-gold mt-0.5 shrink-0">·</span>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendation */}
        <div className="rounded-sm bg-secondary/50 border border-border/60 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-walnut mb-1">
            Recommendation
          </div>
          <p className="text-xs text-foreground leading-relaxed">{result.recommendation}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              onAskFollowUp(
                `Tell me more about this scenario: ${result.scenarioLabel}`,
              )
            }
            className="text-xs inline-flex items-center gap-1.5 rounded-sm border border-walnut/30 bg-secondary/40 hover:bg-secondary/70 hover:border-walnut/60 text-walnut hover:text-ink px-2.5 py-1 transition-colors"
          >
            Ask follow-up in chat →
          </button>
          <button
            type="button"
            onClick={onRunAnother}
            className="text-xs inline-flex items-center gap-1.5 rounded-sm border border-border/70 bg-card hover:bg-secondary/40 text-muted-foreground hover:text-foreground px-2.5 py-1 transition-colors"
          >
            <RotateCcw className="size-3" />
            Run another scenario
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 1 — pick scenario type ───────────────────────────────────────────────

const SCENARIO_TYPES: {
  id: Exclude<ScenarioType, null>;
  icon: React.ElementType;
  label: string;
  description: string;
}[] = [
  {
    id: "price",
    icon: DollarSign,
    label: "Price change",
    description: "Raise or lower menu prices",
  },
  {
    id: "close-day",
    icon: CalendarX,
    label: "Close a day",
    description: "Remove a weekday at one location",
  },
  {
    id: "staffing",
    icon: Users,
    label: "Change staffing",
    description: "Hire or reduce FTE at a location",
  },
  {
    id: "cut-sku",
    icon: Package,
    label: "Cut / add SKU",
    description: "Remove or launch a product",
  },
];

function ScenarioPicker({ onPick }: { onPick: (type: Exclude<ScenarioType, null>) => void }) {
  return (
    <div className="flex flex-col h-full p-5 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-walnut flex items-center gap-1.5 mb-1">
          <Zap className="size-3" />
          What-if simulator
        </div>
        <div className="font-serif text-lg text-ink">Pick a scenario type</div>
        <p className="text-xs text-muted-foreground mt-1">
          Model the P&L impact of a business decision before committing.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SCENARIO_TYPES.map(({ id, icon: Icon, label, description }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="text-left rounded-sm border border-border/70 bg-card hover:bg-secondary/40 hover:border-walnut/40 px-4 py-4 transition-colors group"
          >
            <Icon className="size-5 text-walnut mb-2 group-hover:text-ink transition-colors" />
            <div className="font-medium text-sm text-ink">{label}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2 — parameter forms ──────────────────────────────────────────────────

function PriceForm({ onRun }: { onRun: (result: WhatIfResult) => void }) {
  const [location, setLocation] = useState("All locations");
  const [changePct, setChangePct] = useState(10);

  const run = () => {
    const scopeKey =
      location === "All locations"
        ? "all"
        : location.toLowerCase().replace(" ", "_");
    onRun(getPriceResult(scopeKey, changePct));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full text-sm bg-card border border-border/70 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-walnut/40"
        >
          {STORE_LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Price change: <span className="num text-ink font-medium">{changePct > 0 ? "+" : ""}{changePct}%</span>
        </label>
        <input
          type="range"
          min={-20}
          max={20}
          step={5}
          value={changePct}
          onChange={(e) => setChangePct(Number(e.target.value))}
          className="w-full accent-walnut"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>−20%</span>
          <span>0</span>
          <span>+20%</span>
        </div>
      </div>
      <button
        type="button"
        onClick={run}
        className="w-full text-sm bg-ink text-cream rounded-sm py-2 hover:bg-ink/90 transition-colors"
      >
        Run scenario →
      </button>
    </div>
  );
}

function CloseDayForm({ onRun }: { onRun: (result: WhatIfResult) => void }) {
  const [location, setLocation] = useState("Seminyak");
  const [day, setDay] = useState("Monday");
  const [permanent, setPermanent] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full text-sm bg-card border border-border/70 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-walnut/40"
        >
          {STORE_LOCATIONS.filter((l) => l !== "All locations").map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Day to close
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={cn(
                "text-xs rounded-sm border px-2.5 py-1 transition-colors",
                day === d
                  ? "border-walnut bg-walnut/10 text-ink font-medium"
                  : "border-border/70 text-muted-foreground hover:border-walnut/40 hover:text-foreground",
              )}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Duration
        </label>
        <div className="flex gap-2">
          {[false, true].map((p) => (
            <button
              key={String(p)}
              type="button"
              onClick={() => setPermanent(p)}
              className={cn(
                "flex-1 text-xs rounded-sm border px-3 py-1.5 transition-colors",
                permanent === p
                  ? "border-walnut bg-walnut/10 text-ink font-medium"
                  : "border-border/70 text-muted-foreground hover:border-walnut/40",
              )}
            >
              {p ? "Permanent" : "1-week trial"}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRun(getCloseDayResult(location, day, permanent))}
        className="w-full text-sm bg-ink text-cream rounded-sm py-2 hover:bg-ink/90 transition-colors"
      >
        Run scenario →
      </button>
    </div>
  );
}

function StaffingForm({ onRun }: { onRun: (result: WhatIfResult) => void }) {
  const [location, setLocation] = useState("Seminyak");
  const [fteDelta, setFteDelta] = useState(-1);
  const [shift, setShift] = useState("All");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full text-sm bg-card border border-border/70 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-walnut/40"
        >
          {STORE_LOCATIONS.filter((l) => l !== "All locations").map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          FTE change: <span className="num text-ink font-medium">{fteDelta > 0 ? "+" : ""}{fteDelta} FTE</span>
        </label>
        <input
          type="range"
          min={-3}
          max={3}
          step={1}
          value={fteDelta}
          onChange={(e) => setFteDelta(Number(e.target.value))}
          className="w-full accent-walnut"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>−3 FTE</span>
          <span>0</span>
          <span>+3 FTE</span>
        </div>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Shift
        </label>
        <div className="flex gap-2">
          {["All", "Morning", "Evening"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShift(s)}
              className={cn(
                "flex-1 text-xs rounded-sm border px-3 py-1.5 transition-colors",
                shift === s
                  ? "border-walnut bg-walnut/10 text-ink font-medium"
                  : "border-border/70 text-muted-foreground hover:border-walnut/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={fteDelta === 0}
        onClick={() => onRun(getStaffingResult(location, fteDelta, shift))}
        className="w-full text-sm bg-ink text-cream rounded-sm py-2 hover:bg-ink/90 transition-colors disabled:opacity-40"
      >
        Run scenario →
      </button>
    </div>
  );
}

function CutSkuForm({ onRun }: { onRun: (result: WhatIfResult) => void }) {
  const [action, setAction] = useState<"Cut" | "Add">("Cut");
  const [sku, setSku] = useState(SKUS[0]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Action
        </label>
        <div className="flex gap-2">
          {(["Cut", "Add"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAction(a)}
              className={cn(
                "flex-1 text-xs rounded-sm border px-3 py-1.5 transition-colors",
                action === a
                  ? "border-walnut bg-walnut/10 text-ink font-medium"
                  : "border-border/70 text-muted-foreground hover:border-walnut/40",
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          SKU
        </label>
        {action === "Cut" ? (
          <select
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full text-sm bg-card border border-border/70 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-walnut/40"
          >
            {SKUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="New SKU name…"
            className="w-full text-sm bg-card border border-border/70 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-walnut/40 placeholder:text-muted-foreground/50"
          />
        )}
      </div>
      <button
        type="button"
        disabled={!sku.trim()}
        onClick={() => {
          if (action === "Cut") {
            onRun(getCutSkuResult(sku));
          } else {
            onRun({
              scenarioLabel: `Add new SKU: ${sku}`,
              confidence: "low",
              confidenceReason: "No historical data available for new SKU",
              plImpact: [
                {
                  label: "Estimated launch investment",
                  value: "Rp 8M–15M (recipe dev + equipment)",
                },
                {
                  label: "Revenue potential (year 1)",
                  value: "Rp 4M–12M/month if adopted",
                },
              ],
              assumptions: [
                "Benchmark based on last 3 SKU launches at BAKED",
                "Success rate for new SKUs: ~40% reach target volume in 6 months",
                "Cannibalization of adjacent SKUs not modeled",
              ],
              recommendation: `Test ${sku} at 1 location for 4 weeks before chain-wide launch. Validate demand against M1 forecast.`,
            });
          }
        }}
        className="w-full text-sm bg-ink text-cream rounded-sm py-2 hover:bg-ink/90 transition-colors disabled:opacity-40"
      >
        Run scenario →
      </button>
    </div>
  );
}

function ParamForm({
  type,
  onRun,
}: {
  type: Exclude<ScenarioType, null>;
  onRun: (result: WhatIfResult) => void;
}) {
  const LABELS: Record<Exclude<ScenarioType, null>, string> = {
    price: "Price change",
    "close-day": "Close a day",
    staffing: "Change staffing",
    "cut-sku": "Cut / add SKU",
  };

  return (
    <div className="flex flex-col h-full p-5 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-walnut flex items-center gap-1.5 mb-1">
          <Zap className="size-3" />
          What-if · {LABELS[type]}
        </div>
        <div className="font-serif text-lg text-ink">Set parameters</div>
      </div>
      {type === "price" && <PriceForm onRun={onRun} />}
      {type === "close-day" && <CloseDayForm onRun={onRun} />}
      {type === "staffing" && <StaffingForm onRun={onRun} />}
      {type === "cut-sku" && <CutSkuForm onRun={onRun} />}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

type Step = "pick" | "params" | "result";

export function WhatIfPanel({
  onClose,
  onAskFollowUp,
}: {
  onClose: () => void;
  onAskFollowUp: (text: string) => void;
}) {
  const [step, setStep] = useState<Step>("pick");
  const [scenarioType, setScenarioType] = useState<Exclude<ScenarioType, null>>("price");
  const [result, setResult] = useState<WhatIfResult | null>(null);

  const handlePick = (type: Exclude<ScenarioType, null>) => {
    setScenarioType(type);
    setStep("params");
  };

  const handleRun = (r: WhatIfResult) => {
    setResult(r);
    setStep("result");
  };

  const handleRunAnother = () => {
    setResult(null);
    setStep("pick");
  };

  return (
    <div
      className="rounded-sm border border-border/70 bg-background flex flex-col"
      style={{ height: "calc(100vh - 300px)", minHeight: 520 }}
    >
      {/* Top breadcrumb bar */}
      <div className="px-5 py-3 border-b border-border/70 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-walnut font-medium">M3</span>
        <span>/</span>
        <span>What-if simulator</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-walnut hover:text-ink transition-colors"
        >
          ← Back to chat
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        {step === "pick" && <ScenarioPicker onPick={handlePick} />}
        {step === "params" && (
          <div className="flex flex-col h-full">
            <div className="px-5 pt-1 pb-2 border-b border-border/40">
              <button
                type="button"
                onClick={() => setStep("pick")}
                className="flex items-center gap-1 text-xs text-walnut hover:text-ink transition-colors py-2"
              >
                <ChevronLeft className="size-3.5" />
                Back to scenario types
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ParamForm type={scenarioType} onRun={handleRun} />
            </div>
          </div>
        )}
        {step === "result" && result && (
          <ResultView
            result={result}
            onRunAnother={handleRunAnother}
            onAskFollowUp={(text) => {
              onAskFollowUp(text);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
