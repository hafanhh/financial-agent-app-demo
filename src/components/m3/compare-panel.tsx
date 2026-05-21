// Iter3 — Compare Locations panel. Two modes:
//   "pair"  — side-by-side 2-column comparison (default)
//   "chain" — all 7 locations in a compact horizontal table

import { ArrowLeft, Scale, Wand2 } from "lucide-react";
import { useAppNav } from "@/lib/app-nav-context";
import {
  ALL_LOCATIONS_FOR_PICKER,
  CHAIN_AVERAGE,
  COMPARE_ROWS,
  LOCATION_STATS,
  getLocation,
  rowDifference,
} from "@/lib/data/comparison";
import { cn } from "@/lib/utils";

type Props = {
  onGenerateExplanation: (leftId: string, rightId: string) => void;
};

export function ComparePanel({ onGenerateExplanation }: Props) {
  const { m3, closeCompareView, setCompareLeft, setCompareRight } = useAppNav();
  const left = getLocation(m3.compareLeftId);
  const right = getLocation(m3.compareRightId);
  const isChain = m3.compareMode === "chain";

  return (
    <div
      className="rounded-sm border border-border/70 bg-background flex flex-col"
      style={{ height: "calc(100vh - 360px)", minHeight: 560 }}
    >
      {/* Breadcrumb header */}
      <header className="px-4 py-3 border-b border-border/70 flex items-center gap-3 flex-wrap">
        <Scale className="size-4 text-walnut shrink-0" />
        <div className="text-sm text-ink font-medium">
          M3 <span className="text-muted-foreground mx-1">/</span>{" "}
          {isChain ? "Chain overview" : "Compare locations"}
        </div>
        <button
          type="button"
          onClick={closeCompareView}
          className="ml-auto text-xs text-walnut hover:text-ink inline-flex items-center gap-1 border border-walnut/30 hover:border-walnut/60 rounded-sm px-2 py-1 transition-colors"
        >
          <ArrowLeft className="size-3" /> Back to chat
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {isChain ? (
          <ChainOverviewTable />
        ) : (
          <PairCompare
            leftId={m3.compareLeftId}
            rightId={m3.compareRightId}
            onLeftChange={setCompareLeft}
            onRightChange={setCompareRight}
            onGenerate={() => onGenerateExplanation(left.id, right.id)}
          />
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------

function PairCompare({
  leftId,
  rightId,
  onLeftChange,
  onRightChange,
  onGenerate,
}: {
  leftId: string;
  rightId: string;
  onLeftChange: (id: string) => void;
  onRightChange: (id: string) => void;
  onGenerate: () => void;
}) {
  const left = getLocation(leftId);
  const right = getLocation(rightId);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <LocationPicker label="Left" value={leftId} onChange={onLeftChange} />
        <LocationPicker label="Right" value={rightId} onChange={onRightChange} />
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        Time range:{" "}
        <span className="bg-card border border-border/70 rounded-sm px-2 py-0.5 text-foreground">
          Week 22 (May 13–19, 2026)
        </span>
      </div>

      <div className="rounded-sm border border-border/70 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-secondary/40">
            <tr>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Metric</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">{left.label}</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">{right.label}</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Difference</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => {
              const lCell = (left as Record<string, unknown>)[row.key];
              const rCell = (right as Record<string, unknown>)[row.key];
              const lValue = row.key === "topSku" ? (lCell as string) : (lCell as { value: string }).value;
              const rValue = row.key === "topSku" ? (rCell as string) : (rCell as { value: string }).value;
              const diff = rowDifference(left, right, row);
              return (
                <tr key={row.key} className="border-t border-border/30">
                  <td className="px-3 py-2 text-foreground font-medium">{row.label}</td>
                  <td className="px-3 py-2 num">{lValue}</td>
                  <td className="px-3 py-2 num">{rValue}</td>
                  <td className={cn("px-3 py-2 num", toneCls(diff.tone))}>
                    <span className="inline-flex items-center gap-1">
                      {diff.text}
                      {diff.tone === "bad" && <span aria-hidden="true">🔴</span>}
                      {diff.tone === "good" && <span aria-hidden="true">🟢</span>}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-sm border border-border/70 bg-card px-3 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-[16px]" aria-hidden="true">💡</span>
        <div className="text-xs text-foreground flex-1 min-w-[260px]">
          Ask: <span className="italic">"What's different between these two locations?"</span>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="text-xs inline-flex items-center gap-1.5 rounded-sm bg-ink text-cream hover:bg-ink/90 px-3 py-1.5 transition-colors"
        >
          <Wand2 className="size-3" />
          Generate explanation →
        </button>
      </div>
    </div>
  );
}

function toneCls(tone: "good" | "bad" | "neutral"): string {
  if (tone === "bad") return "text-destructive";
  if (tone === "good") return "text-success";
  return "text-muted-foreground";
}

function LocationPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground shrink-0">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-card border border-border/70 rounded-sm px-2 py-1.5 text-sm text-foreground hover:border-walnut/40 focus:outline-none focus:ring-1 focus:ring-walnut/40"
      >
        {ALL_LOCATIONS_FOR_PICKER.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// -----------------------------------------------------------------------------

function ChainOverviewTable() {
  const locations = Object.values(LOCATION_STATS);
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-3">
        All 7 locations · Week 22 (May 13–19, 2026)
      </div>
      <div className="overflow-x-auto rounded-sm border border-border/70">
        <table className="w-full text-xs">
          <thead className="bg-secondary/40">
            <tr>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Location</th>
              {COMPARE_ROWS.map((row) => (
                <th key={row.key} className="text-left px-3 py-2 text-muted-foreground font-medium whitespace-nowrap">
                  {row.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((s) => (
              <tr key={s.id} className="border-t border-border/30 hover:bg-secondary/20">
                <td className="px-3 py-1.5 text-foreground font-medium whitespace-nowrap">{s.label}</td>
                {COMPARE_ROWS.map((row) => {
                  const cell = (s as Record<string, unknown>)[row.key];
                  const text = row.key === "topSku" ? (cell as string) : (cell as { value: string }).value;
                  return (
                    <td key={row.key} className="px-3 py-1.5 num text-foreground whitespace-nowrap">
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-border/70 bg-gold/8">
              <td className="px-3 py-1.5 text-ink font-medium whitespace-nowrap">{CHAIN_AVERAGE.label}</td>
              {COMPARE_ROWS.map((row) => {
                const cell = (CHAIN_AVERAGE as Record<string, unknown>)[row.key];
                const text = row.key === "topSku" ? (cell as string) : (cell as { value: string }).value;
                return (
                  <td key={row.key} className="px-3 py-1.5 num text-ink whitespace-nowrap">
                    {text}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
