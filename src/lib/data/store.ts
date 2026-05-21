import { useMemo } from "react";
import { addDays, format, startOfDay } from "date-fns";
import {
  expectedDemand,
  generatePosHistory,
  holidayMultiplier,
  weatherFor,
  LOCATIONS,
  SKUS,
  type PosRow,
} from "@/lib/data/seed";
import type { ForecastPoint } from "@/lib/forecast/engine";

let posCache: PosRow[] | null = null;
export function usePosHistory(): PosRow[] {
  return useMemo(() => {
    if (posCache) return posCache;
    posCache = generatePosHistory(365);
    return posCache;
  }, []);
}

function buildDrivers(date: Date, region: "Bali" | "Jakarta") {
  const drivers: { label: string; impact: number }[] = [];
  const dow = date.getDay();
  if (dow === 5 || dow === 6) drivers.push({ label: "Weekend uplift", impact: 0.22 });
  if (dow === 0) drivers.push({ label: "Sunday brunch", impact: 0.12 });
  const h = holidayMultiplier(date, region);
  if (h.mult > 1.05 && h.name) drivers.push({ label: h.name, impact: h.mult - 1 });
  if (h.mult < 0.95 && h.name) drivers.push({ label: h.name, impact: h.mult - 1 });
  const month = date.getMonth();
  if (region === "Bali" && (month === 6 || month === 7))
    drivers.push({ label: "Peak tourist season", impact: 0.18 });
  if (region === "Bali" && month === 11) drivers.push({ label: "Holiday season", impact: 0.15 });
  return drivers.slice(0, 4);
}

let forecastCache: ForecastPoint[] | null = null;
export function useForecast(horizonDays = 14): ForecastPoint[] {
  return useMemo(() => {
    if (forecastCache && forecastCache.length) return forecastCache;
    const start = startOfDay(new Date());
    const out: ForecastPoint[] = [];
    for (let i = 0; i < horizonDays; i++) {
      const d = addDays(start, i);
      for (const loc of LOCATIONS) {
        for (const sku of SKUS) {
          const demand = expectedDemand(d, loc, sku);
          const recommended = demand * 1.04;
          const spread = 0.13 + Math.max(0, (sku.shelfLifeHours - 24) / 240);
          const w = weatherFor(d, loc.id);
          const drivers = buildDrivers(d, loc.region);
          if (w.condition === "rain") drivers.push({ label: "Rain forecast", impact: -0.12 });
          if (w.condition === "storm") drivers.push({ label: "Storm warning", impact: -0.28 });
          if (w.condition === "sunny") drivers.push({ label: "Clear skies", impact: 0.06 });
          out.push({
            date: format(d, "yyyy-MM-dd"),
            locationId: loc.id,
            skuId: sku.id,
            recommendedQty: Math.round(recommended),
            lowerBound: Math.round(recommended * (1 - spread)),
            upperBound: Math.round(recommended * (1 + spread)),
            confidence: Math.max(0.62, Math.min(0.94, 0.88 - spread * 0.4)),
            drivers: drivers.slice(0, 4),
          });
        }
      }
    }
    forecastCache = out;
    return out;
  }, [horizonDays]);
}

export { LOCATIONS, SKUS };
