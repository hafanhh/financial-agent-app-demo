// F4 — Proactive Trend Alerts with Forecast
// Shown below AnomalySidebar in the right column.
// Persona-aware: CEO sees all trends, Store Manager sees only their location.

import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { TREND_ALERTS, type TrendAlert } from "@/lib/data/trendAlerts";
import { useAppNav } from "@/lib/app-nav-context";
import { cn } from "@/lib/utils";
import type { Persona, StoreLocation } from "@/lib/data/m3Chat";

function TrendCard({
  trend,
  onInjectPrompt,
  onOpenDataTab,
}: {
  trend: TrendAlert;
  onInjectPrompt: (prompt: string) => void;
  onOpenDataTab: (docId: string) => void;
}) {
  const isBad = !trend.isGoodDirection;
  const TrendIcon = trend.direction === "up" ? TrendingUp : TrendingDown;

  const handleAction = () => {
    if (trend.actionType === "insertPrompt" || trend.actionType === "askWhy") {
      onInjectPrompt(trend.actionPayload);
    } else if (trend.actionType === "openDataTab") {
      onOpenDataTab(trend.actionPayload);
    }
  };

  return (
    <div className="p-3.5 flex flex-col gap-2">
      {/* Location + metric */}
      <div className="flex items-start gap-2">
        <TrendIcon
          className={cn(
            "size-3.5 shrink-0 mt-0.5",
            isBad ? "text-warning" : "text-success",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] font-medium text-ink">{trend.location}</span>
            <span
              className={cn(
                "text-[9px] uppercase tracking-[0.14em] border rounded-sm px-1.5 py-0.5",
                isBad
                  ? "text-warning border-warning/30 bg-warning/8"
                  : "text-success border-success/30 bg-success/8",
              )}
            >
              {isBad ? "Declining" : "Improving"}
            </span>
          </div>
          <div className="text-xs text-foreground mt-0.5 leading-snug">{trend.metric}</div>
        </div>
      </div>

      {/* Rate + projection */}
      <div className="pl-5 space-y-1">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {trend.weeklyRate} for {trend.weeksConsecutive} consecutive weeks
        </p>
        <div
          className={cn(
            "text-xs font-medium leading-relaxed",
            isBad ? "text-warning" : "text-success",
          )}
        >
          {trend.currentValue} → {trend.projectedValue} by {trend.projectedDate}
        </div>
        {trend.cause && (
          <p className="text-[10px] text-muted-foreground/80 italic leading-relaxed">
            {trend.cause}
          </p>
        )}
      </div>

      {/* Action */}
      <div className="pl-5">
        <button
          type="button"
          onClick={handleAction}
          className="text-[11px] inline-flex items-center gap-1 rounded-sm border border-walnut/30 bg-secondary/40 hover:bg-secondary/70 hover:border-walnut/60 text-walnut hover:text-ink px-2 py-0.5 transition-colors"
        >
          {trend.actionLabel} →
        </button>
      </div>
    </div>
  );
}

export function TrendWatch({
  persona,
  smLocation,
  onInjectPrompt,
}: {
  persona: Persona;
  smLocation: StoreLocation;
  onInjectPrompt: (prompt: string) => void;
}) {
  const { openDocFromAnomaly } = useAppNav();

  const visible =
    persona === "CEO"
      ? TREND_ALERTS
      : TREND_ALERTS.filter((t) => t.location === smLocation);

  const handleOpenDataTab = (docId: string) => {
    openDocFromAnomaly({ docId, sourceLabel: "Trend watch" });
  };

  return (
    <div className="rounded-sm border border-border/70 bg-card flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="size-3.5 text-warning" />
          <div className="font-serif text-base text-ink">Trend watch</div>
        </div>
        <span className="text-xs bg-warning/10 text-warning border border-warning/20 rounded-full px-2 py-0.5 num">
          {visible.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground leading-relaxed">
          No concerning trends at {smLocation} this week. Chain average margin stable.
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {visible.map((trend) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              onInjectPrompt={onInjectPrompt}
              onOpenDataTab={handleOpenDataTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}
