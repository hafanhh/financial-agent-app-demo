import type { ReactNode } from "react";
import { ReferenceArea, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

/** Small pill labels distinguishing factual vs forecasted figures. */
export function ActualBadge({ className, label = "Actual" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground border border-border/70 bg-secondary/40 px-1.5 py-0.5 rounded-sm",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-walnut" />
      {label}
    </span>
  );
}

export function ForecastBadge({ className, label = "Forecast" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.16em] text-walnut/90 border border-gold/60 bg-gold/10 px-1.5 py-0.5 rounded-sm italic",
        className,
      )}
    >
      <span className="size-1.5 rounded-full border border-gold bg-transparent" />
      {label}
    </span>
  );
}

/** Inline legend pairing actual + forecast swatches for chart headers. */
export function ForecastLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-[10px] uppercase tracking-wider", className)}>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className="w-3.5 h-[2px] bg-walnut" />
        Actual
      </span>
      <span className="inline-flex items-center gap-1.5 text-walnut/80 italic">
        <span
          className="w-3.5 h-0 border-t-2 border-dashed"
          style={{ borderColor: "var(--color-gold)" }}
        />
        Forecast
      </span>
    </div>
  );
}

/** SVG <defs> pattern for hatched fills on forecast areas/bars. Mount once per chart inside the SVG. */
export const HATCH_ID = "forecast-hatch";
export function HatchPatternDefs() {
  return (
    <defs>
      <pattern id={HATCH_ID} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="var(--color-gold)" fillOpacity="0.16" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-gold)" strokeWidth="2" strokeOpacity="0.55" />
      </pattern>
    </defs>
  );
}

/** Today reference + future zone. Pass the date keys present in the data. */
export function TodayReference({ todayKey, lastKey }: { todayKey: string; lastKey: string }) {
  return (
    <>
      <ReferenceArea
        x1={todayKey}
        x2={lastKey}
        fill="var(--color-gold)"
        fillOpacity={0.05}
        ifOverflow="visible"
      />
      <ReferenceLine
        x={todayKey}
        stroke="var(--color-muted-foreground)"
        strokeDasharray="2 3"
        label={{
          value: "TODAY",
          position: "insideTopRight",
          fill: "var(--color-muted-foreground)",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: 1.2,
        }}
      />
    </>
  );
}

/**
 * Highlight Saturday + Sunday columns by drawing a faint band per weekend day.
 * Pass an ordered list of yyyy-MM-dd keys present on the X axis.
 */
export function WeekendBands({ dateKeys }: { dateKeys: string[] }) {
  const bands: ReactNode[] = [];
  for (let i = 0; i < dateKeys.length; i++) {
    const key = dateKeys[i];
    // parse yyyy-MM-dd as local date
    const [y, m, d] = key.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    if (dow !== 0 && dow !== 6) continue;
    const next = dateKeys[i + 1] ?? key;
    bands.push(
      <ReferenceArea
        key={`wk-${key}`}
        x1={key}
        x2={next}
        fill="var(--color-walnut)"
        fillOpacity={0.06}
        ifOverflow="visible"
      />,
    );
  }
  return <>{bands}</>;
}
