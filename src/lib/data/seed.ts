// Deterministic mock data for the bakery chain.
import { addDays, format, startOfDay, subDays } from "date-fns";

export type Location = {
  id: string;
  name: string;
  city: string;
  region: "Bali" | "Jakarta";
  timezone: string;
  trafficIndex: number; // baseline demand multiplier
};

export type Sku = {
  id: string;
  name: string;
  category: "Bread" | "Pastry" | "Cake" | "Beverage";
  shelfLifeHours: number;
  unitCost: number; // IDR
  unitPrice: number; // IDR
  baseDailyDemand: number; // chain-wide reference
};

export type Holiday = {
  date: string; // yyyy-MM-dd
  name: string;
  type: "national" | "religious" | "local";
  multiplier: number;
  affects: "all" | "Bali" | "Jakarta";
};

export type WeatherDay = {
  date: string;
  locationId: string;
  tempC: number;
  rainMm: number;
  condition: "sunny" | "cloudy" | "rain" | "storm";
};

export type PosRow = {
  date: string;
  locationId: string;
  skuId: string;
  soldQty: number;
  producedQty: number;
  wasteQty: number;
  stockout: boolean;
};

export const LOCATIONS: Location[] = [
  { id: "sem", name: "BAKED. Seminyak", city: "Seminyak", region: "Bali", timezone: "Asia/Makassar", trafficIndex: 1.35 },
  { id: "can", name: "BAKED. Berawa", city: "Canggu", region: "Bali", timezone: "Asia/Makassar", trafficIndex: 1.25 },
  { id: "kut", name: "BAKED. Pererenan", city: "Canggu", region: "Bali", timezone: "Asia/Makassar", trafficIndex: 1.15 },
  { id: "ulu", name: "BAKED. Uluwatu", city: "Uluwatu", region: "Bali", timezone: "Asia/Makassar", trafficIndex: 1.05 },
  { id: "ubu", name: "BAKED. Ubud", city: "Ubud", region: "Bali", timezone: "Asia/Makassar", trafficIndex: 1.10 },
  { id: "jkt", name: "BAKED. Gunawarman", city: "Jakarta", region: "Jakarta", timezone: "Asia/Jakarta", trafficIndex: 1.40 },
];

export const SKUS: Sku[] = [
  { id: "sourdough", name: "Country Sourdough", category: "Bread", shelfLifeHours: 36, unitCost: 18000, unitPrice: 65000, baseDailyDemand: 28 },
  { id: "baguette", name: "Classic Baguette", category: "Bread", shelfLifeHours: 24, unitCost: 9000, unitPrice: 38000, baseDailyDemand: 42 },
  { id: "brioche", name: "Butter Brioche Loaf", category: "Bread", shelfLifeHours: 48, unitCost: 22000, unitPrice: 78000, baseDailyDemand: 18 },
  { id: "croissant", name: "Almond Croissant", category: "Pastry", shelfLifeHours: 18, unitCost: 14000, unitPrice: 42000, baseDailyDemand: 65 },
  { id: "pain-choc", name: "Pain au Chocolat", category: "Pastry", shelfLifeHours: 18, unitCost: 13000, unitPrice: 38000, baseDailyDemand: 58 },
  { id: "danish", name: "Seasonal Fruit Danish", category: "Pastry", shelfLifeHours: 24, unitCost: 15000, unitPrice: 45000, baseDailyDemand: 36 },
  { id: "canele", name: "Bordeaux Canelé", category: "Pastry", shelfLifeHours: 24, unitCost: 11000, unitPrice: 32000, baseDailyDemand: 48 },
  { id: "basque", name: "Burnt Basque Cheesecake", category: "Cake", shelfLifeHours: 72, unitCost: 35000, unitPrice: 95000, baseDailyDemand: 14 },
  { id: "opera", name: "Opera Cake Slice", category: "Cake", shelfLifeHours: 48, unitCost: 25000, unitPrice: 68000, baseDailyDemand: 22 },
  { id: "tart-citron", name: "Tarte au Citron", category: "Cake", shelfLifeHours: 36, unitCost: 22000, unitPrice: 58000, baseDailyDemand: 19 },
  { id: "cold-brew", name: "House Cold Brew", category: "Beverage", shelfLifeHours: 72, unitCost: 8000, unitPrice: 38000, baseDailyDemand: 72 },
  { id: "latte", name: "Single Origin Latte", category: "Beverage", shelfLifeHours: 4, unitCost: 9000, unitPrice: 42000, baseDailyDemand: 110 },
];

// Indonesian + Balinese calendar — selected high-impact dates
export const HOLIDAYS: Holiday[] = [
  { date: "2025-01-01", name: "New Year's Day", type: "national", multiplier: 1.35, affects: "all" },
  { date: "2025-01-29", name: "Chinese New Year", type: "religious", multiplier: 1.20, affects: "all" },
  { date: "2025-03-29", name: "Nyepi (Day of Silence)", type: "religious", multiplier: 0.10, affects: "Bali" },
  { date: "2025-04-23", name: "Galungan", type: "religious", multiplier: 1.45, affects: "Bali" },
  { date: "2025-05-03", name: "Kuningan", type: "religious", multiplier: 1.30, affects: "Bali" },
  { date: "2025-08-17", name: "Independence Day", type: "national", multiplier: 1.25, affects: "all" },
  { date: "2025-12-25", name: "Christmas Day", type: "national", multiplier: 1.55, affects: "all" },
  { date: "2025-12-31", name: "New Year's Eve", type: "national", multiplier: 1.65, affects: "all" },
  { date: "2026-01-01", name: "New Year's Day", type: "national", multiplier: 1.35, affects: "all" },
  { date: "2026-02-17", name: "Chinese New Year", type: "religious", multiplier: 1.20, affects: "all" },
  { date: "2026-04-12", name: "Galungan", type: "religious", multiplier: 1.45, affects: "Bali" },
  { date: "2026-05-18", name: "Waisak", type: "religious", multiplier: 1.15, affects: "all" },
  { date: "2026-05-22", name: "Kuningan", type: "religious", multiplier: 1.30, affects: "Bali" },
];

// Simple deterministic PRNG so seeded data is stable across reloads.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const DOW_FACTOR = [0.85, 0.82, 0.86, 0.95, 1.10, 1.30, 1.25]; // Sun..Sat

// Tourist seasonality for Bali (month index 0..11): peaks Jul/Aug, Dec/Jan
const BALI_SEASON = [1.20, 1.10, 1.00, 0.95, 0.95, 1.05, 1.30, 1.35, 1.10, 1.00, 0.95, 1.25];
const JKT_SEASON = [1.05, 1.00, 1.00, 1.00, 1.00, 1.10, 1.15, 1.05, 1.00, 1.00, 1.05, 1.20];

export function holidayMultiplier(date: Date, region: Location["region"]): { mult: number; name?: string } {
  const key = format(date, "yyyy-MM-dd");
  for (const h of HOLIDAYS) {
    if (h.date !== key) continue;
    if (h.affects === "all" || h.affects === region) return { mult: h.multiplier, name: h.name };
  }
  return { mult: 1 };
}

export function weatherFor(date: Date, locationId: string): WeatherDay {
  const rnd = mulberry32(hashStr(locationId + format(date, "yyyy-MM-dd")));
  const r = rnd();
  const condition: WeatherDay["condition"] = r < 0.12 ? "storm" : r < 0.38 ? "rain" : r < 0.62 ? "cloudy" : "sunny";
  const rainMm = condition === "storm" ? 18 + rnd() * 22 : condition === "rain" ? 2 + rnd() * 12 : 0;
  const tempC = 26 + rnd() * 6 - (condition === "storm" ? 2 : 0);
  return { date: format(date, "yyyy-MM-dd"), locationId, tempC: Number(tempC.toFixed(1)), rainMm: Number(rainMm.toFixed(1)), condition };
}

function weatherMult(w: WeatherDay): number {
  if (w.condition === "storm") return 0.72;
  if (w.condition === "rain") return 0.88;
  if (w.condition === "sunny") return 1.06;
  return 1.0;
}

export function expectedDemand(date: Date, loc: Location, sku: Sku): number {
  const dow = DOW_FACTOR[date.getDay()];
  const season = (loc.region === "Bali" ? BALI_SEASON : JKT_SEASON)[date.getMonth()];
  const w = weatherFor(date, loc.id);
  const h = holidayMultiplier(date, loc.region);
  const skuLoc = mulberry32(hashStr(loc.id + sku.id))(); // 0..1 stable per pair
  const skuLocFactor = 0.85 + skuLoc * 0.35;
  const noise = 0.92 + mulberry32(hashStr(loc.id + sku.id + format(date, "yyyy-MM-dd")))() * 0.16;
  return sku.baseDailyDemand * loc.trafficIndex * dow * season * weatherMult(w) * h.mult * skuLocFactor * noise;
}

export function generatePosHistory(days = 365, endDate = new Date()): PosRow[] {
  const rows: PosRow[] = [];
  const end = startOfDay(endDate);
  for (let i = days; i >= 1; i--) {
    const d = subDays(end, i);
    for (const loc of LOCATIONS) {
      for (const sku of SKUS) {
        const demand = expectedDemand(d, loc, sku);
        // Naive baker plan: previous-week same-day produced
        const produced = Math.round(demand * (0.95 + mulberry32(hashStr("p" + loc.id + sku.id + i))() * 0.20));
        const sold = Math.round(Math.min(produced, demand * (0.92 + mulberry32(hashStr("s" + loc.id + sku.id + i))() * 0.16)));
        const waste = Math.max(0, produced - sold);
        const stockout = produced < demand * 0.92;
        rows.push({
          date: format(d, "yyyy-MM-dd"),
          locationId: loc.id,
          skuId: sku.id,
          soldQty: sold,
          producedQty: produced,
          wasteQty: waste,
          stockout,
        });
      }
    }
  }
  return rows;
}

export function dateRange(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  let d = startOfDay(start);
  const e = startOfDay(end);
  while (d <= e) {
    out.push(d);
    d = addDays(d, 1);
  }
  return out;
}

export const IDR = (n: number) =>
  new Intl.NumberFormat("en-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const NUM = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
