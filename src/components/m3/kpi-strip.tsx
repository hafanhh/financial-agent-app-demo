// Iter3 — 4-tile KPI strip with sparklines. Persona-aware:
// CEO sees chain-level tiles, Store Manager sees single-location tiles.
// Clicking a tile pre-fills the chat input but does not auto-send.

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAppNav } from "@/lib/app-nav-context";
import { CEO_METRICS, CEO_TILE_ORDER, SM_METRICS, SM_TILE_ORDER, type KpiMetric } from "@/lib/data/m3Metrics";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export function KpiStrip() {
  const { m3 } = useAppNav();
  const isCeo = m3.persona === "CEO";

  const tiles: KpiMetric[] = isCeo
    ? CEO_TILE_ORDER.map((k) => CEO_METRICS[k])
    : SM_TILE_ORDER.map((k) => SM_METRICS[k]);

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      {tiles.map((tile) => (
        <KpiTile key={tile.id} tile={tile} />
      ))}
    </div>
  );
}

const ACTION_LABEL: Record<string, string> = {
  "chain-margin": "Why?",
  "cash-position": "Detail",
  "waste-pct": "Where?",
  "customer-ltv": "Cohort",
  "sm-food-cost": "Why?",
  "sm-waste-today": "Where?",
  "sm-traffic-vs-forecast": "Why?",
  "sm-staff-hrs-per-m": "Compare",
};

function KpiTile({ tile }: { tile: KpiMetric }) {
  const { setPendingPrompt } = useAppNav();
  const isUp = tile.delta.direction === "up";
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const toneClass = tile.deltaIsGood ? "text-success" : "text-destructive";
  const action = ACTION_LABEL[tile.id] ?? "Drill in";

  return (
    <div className="rounded-sm border border-border/70 bg-card p-3.5 flex flex-col gap-2 hover:border-walnut/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{tile.label}</div>
      </div>
      <div>
        <div className="font-serif text-2xl text-ink num leading-none">{tile.value}</div>
        <div className={cn("inline-flex items-center gap-0.5 text-[11px] num mt-1", toneClass)}>
          <Arrow className="size-3" />
          {tile.delta.amount}
          <span className="text-muted-foreground ml-1">{tile.delta.period}</span>
        </div>
      </div>
      <div className="h-7">
        <Sparkline
          values={tile.sparkline}
          width={140}
          height={28}
          stroke={tile.deltaIsGood ? "var(--color-success)" : "var(--color-walnut)"}
          fill={tile.deltaIsGood ? "var(--color-success)" : "var(--color-walnut)"}
          ariaLabel={`${tile.label} sparkline`}
        />
      </div>
      <button
        type="button"
        onClick={() => setPendingPrompt(tile.drillPrompt)}
        className="self-start text-[11px] text-walnut hover:text-ink underline underline-offset-2 decoration-walnut/40 hover:decoration-ink transition-colors"
      >
        {action} →
      </button>
    </div>
  );
}
