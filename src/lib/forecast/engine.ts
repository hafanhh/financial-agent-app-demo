// Mock forecasting engine. Implements a ForecastEngine interface so a future
// Python service (FastAPI + Prophet/LightGBM) can be swapped in by replacing
// the implementation behind ml.functions.ts.
import { addDays, format, startOfDay } from "date-fns";
import {
  expectedDemand,
  holidayMultiplier,
  weatherFor,
  LOCATIONS,
  SKUS,
  type Location,
  type Sku,
} from "@/lib/data/seed";

export type ForecastDriver = { label: string; impact: number };

export type ForecastPoint = {
  date: string;
  locationId: string;
  skuId: string;
  recommendedQty: number;
  lowerBound: number;
  upperBound: number;
  confidence: number; // 0..1
  drivers: ForecastDriver[];
};

export interface ForecastEngine {
  forecast(input: {
    locationIds?: string[];
    skuIds?: string[];
    horizonDays: number;
    startDate?: Date;
  }): Promise<ForecastPoint[]>;
}

function buildDrivers(date: Date, loc: Location, _sku: Sku): ForecastDriver[] {
  const drivers: ForecastDriver[] = [];
  const dow = date.getDay();
  if (dow === 5 || dow === 6) drivers.push({ label: "Weekend uplift", impact: 0.22 });
  if (dow === 0) drivers.push({ label: "Sunday brunch", impact: 0.12 });
  const w = weatherFor(date, loc.id);
  if (w.condition === "rain") drivers.push({ label: "Rain forecast", impact: -0.12 });
  if (w.condition === "storm") drivers.push({ label: "Storm warning", impact: -0.28 });
  if (w.condition === "sunny") drivers.push({ label: "Clear skies", impact: 0.06 });
  const h = holidayMultiplier(date, loc.region);
  if (h.mult > 1.05) drivers.push({ label: h.name ?? "Holiday", impact: h.mult - 1 });
  if (h.mult < 0.95) drivers.push({ label: h.name ?? "Holiday closure", impact: h.mult - 1 });
  const month = date.getMonth();
  if (loc.region === "Bali" && (month === 6 || month === 7))
    drivers.push({ label: "Peak tourist season", impact: 0.18 });
  if (loc.region === "Bali" && month === 11)
    drivers.push({ label: "Holiday season", impact: 0.15 });
  return drivers.slice(0, 4);
}

export const mockEngine: ForecastEngine = {
  async forecast({ locationIds, skuIds, horizonDays, startDate }) {
    const start = startOfDay(startDate ?? new Date());
    const locs = LOCATIONS.filter((l) => !locationIds?.length || locationIds.includes(l.id));
    const skus = SKUS.filter((s) => !skuIds?.length || skuIds.includes(s.id));
    const out: ForecastPoint[] = [];
    for (let i = 0; i < horizonDays; i++) {
      const d = addDays(start, i);
      for (const loc of locs) {
        for (const sku of skus) {
          const demand = expectedDemand(d, loc, sku);
          // Recommend slightly above expected sales to hit ~96% service level
          const recommended = demand * 1.04;
          const spread = 0.13 + Math.max(0, (sku.shelfLifeHours - 24) / 240);
          out.push({
            date: format(d, "yyyy-MM-dd"),
            locationId: loc.id,
            skuId: sku.id,
            recommendedQty: Math.round(recommended),
            lowerBound: Math.round(recommended * (1 - spread)),
            upperBound: Math.round(recommended * (1 + spread)),
            confidence: Math.max(0.62, Math.min(0.94, 0.88 - spread * 0.4)),
            drivers: buildDrivers(d, loc, sku),
          });
        }
      }
    }
    return out;
  },
};
