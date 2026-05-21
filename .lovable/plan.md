# Distinguish actual vs forecast across the dashboard

Adopt the chosen "Visual forecast distinction" pattern, but translated into the editorial palette (walnut = actual, gold = forecast) — no indigo. Apply the same vocabulary everywhere actuals and predictions appear so operators can read it at a glance.

## Visual language (used everywhere)

- **Actual / fact**: solid `walnut` stroke, filled area gradient, no badge.
- **Forecast / predicted**: `gold` stroke, dashed (`8 6`), translucent diagonal-hatch fill, italic muted label.
- **Today divider**: vertical dotted rule on charts with a small "TODAY" pill.
- **Forecast zone**: subtle cream tint background on the future side of the chart.
- **X-axis labels** beyond today rendered in gold with an `(F)` suffix.
- **Stat cards**: a small `FORECAST` chip (gold outline) on forecast-derived stats; `ACTUAL · 30D` chip (muted) on historical ones.
- **Bars / progress**: solid walnut segment for sold/actual portion, hatched gold segment for forecast portion.
- A reusable `ForecastLegend` component placed in chart card headers.

## Files to add

- `src/components/forecast-marks.tsx` — exports:
  - `ForecastLegend` (Actual ● / Forecast ╌)
  - `ForecastBadge` ("Forecast" pill, gold outline)
  - `ActualBadge` ("Actual" pill, muted)
  - `TodayReferenceLine` factory (Recharts `ReferenceLine` + `ReferenceArea` for the future zone)
  - `hatchPatternDef` (SVG `<defs><pattern>` for diagonal hatch fill, mounted once per chart)

## Files to edit

1. **`src/routes/index.tsx` (Overview)**
   - "Revenue vs waste cost" chart: split each series into an `actual` window (≤ today) and `forecast` window (> today). Render two `<Area>`/`<Line>` pairs per metric — solid walnut for actuals, dashed gold for forecast, with hatched fill in the forecast zone. Add `ReferenceArea` for the future side + `ReferenceLine` with "TODAY" label. Forecast trace extends 14 days into the future using `useForecast` revenue/waste projection (compute from forecast points × unit price / cost).
   - "Top SKUs by volume" bar chart: stacked bar — walnut segment = trailing-7d actual sold per SKU; hatched gold segment = next-7d forecast delta. Add `ForecastLegend`.
   - Stat cards: tag "Revenue 30d", "Waste cost 30d", "Waste rate" with `ActualBadge`; tag "Tomorrow's bake" with `ForecastBadge`.
   - Café roster cards: change "TODAY" label to a `ForecastBadge` since today's number is engine output.

2. **`src/routes/skus.$skuId.tsx`**
   - "Sales vs production history" chart already actual — add `ActualBadge` in section header.
   - "Forecast outlook" chart — apply dashed gold stroke + hatched fill; add `ForecastBadge` in section header.
   - "Today by café" bar chart — switch to hatched gold bars + `ForecastBadge` (these are recommendations).
   - Stat "Next 14d" → `ForecastBadge`; "Unit price / cost / shelf life" → `ActualBadge`.

3. **`src/routes/locations.$locationId.tsx`** (and similar pattern in `locations.tsx`, `forecast.tsx`)
   - Any chart or table cell sourced from `useForecast` gets the hatched gold treatment + `ForecastBadge`.
   - Any chart sourced from `usePosHistory` gets walnut + `ActualBadge`.
   - In the daily bake plan table, add a small gold dot before recommended-qty values; historical actual columns get a walnut dot.

4. **`src/styles.css`**
   - Add `--color-walnut-soft` and `--color-gold-soft` (low-alpha variants) for hatched fills if needed. No palette change beyond that.

## Technical notes

- Recharts pattern fill: define `<defs><pattern id="forecast-hatch" .../></defs>` inside each chart and reference via `fill="url(#forecast-hatch)"`. The helper `hatchPatternDef` returns the JSX so it stays DRY.
- Splitting an area into actual + forecast: pre-compute the dataset with two value keys (`actualValue`, `forecastValue`) where each row has only one populated, with the seam row (today) carrying both so the lines visually connect.
- "TODAY" divider: `<ReferenceLine x={todayISO} stroke="var(--color-muted-foreground)" strokeDasharray="2 3" label={{ value: "TODAY", position: "top", fontSize: 10 }} />`.
- "Forecast zone" tint: `<ReferenceArea x1={todayISO} x2={lastISO} fill="var(--color-muted)" fillOpacity={0.35} />`.
- No data model changes. Forecast revenue derived inline from existing `useForecast` × `SKU.unitPrice`.

## Out of scope

- No changes to seed/data layer, routing, or business logic.
- No new dependencies.
- Editorial palette preserved — indigo from the prototype is mapped to walnut/gold.
