// Static production recommendations for today, keyed to Seminyak as baseline.
// Multiply qty fields by (location.trafficIndex / 1.35) to adjust per location.

export type Confidence = "high" | "med" | "low";

export type Recommendation = {
  skuId: string; // matches SKUS in seed.ts for chart lookups
  displayName: string;
  category: "Bread" | "Pastry" | "Cake" | "Beverage";
  yesterdayActual: number;
  todayForecast: number;
  recommendedProduction: number;
  confidence: Confidence;
  deltaVsLastWeek: number; // signed percentage
  topFeatures: [string, string, string];
  approved: boolean;
};

export const BASE_RECOMMENDATIONS: Recommendation[] = [
  {
    skuId: "sourdough",
    displayName: "Sourdough Loaf",
    category: "Bread",
    yesterdayActual: 42,
    todayForecast: 38,
    recommendedProduction: 40,
    confidence: "high",
    deltaVsLastWeek: -9.5,
    topFeatures: ["Thursday post-weekend dip", "Cloudy 29°C", "Week 2 of month"],
    approved: false,
  },
  {
    skuId: "pain-choc",
    displayName: "Pain au Chocolat",
    category: "Pastry",
    yesterdayActual: 58,
    todayForecast: 62,
    recommendedProduction: 65,
    confidence: "high",
    deltaVsLastWeek: 6.9,
    topFeatures: ["Tourist season peak (Jun-Aug)", "Sunny 31°C", "2 days post-payday"],
    approved: false,
  },
  {
    skuId: "croissant",
    displayName: "Almond Croissant",
    category: "Pastry",
    yesterdayActual: 71,
    todayForecast: 68,
    recommendedProduction: 72,
    confidence: "high",
    deltaVsLastWeek: 3.0,
    topFeatures: ["Saturday peak ahead", "High tourist volume", "Clear weather morning"],
    approved: false,
  },
  {
    skuId: "canele",
    displayName: "Cinnamon Roll",
    category: "Pastry",
    yesterdayActual: 34,
    todayForecast: 36,
    recommendedProduction: 38,
    confidence: "med",
    deltaVsLastWeek: 5.9,
    topFeatures: ["Weekend approaching", "Morning rush pattern", "Hotel group checkout nearby"],
    approved: false,
  },
  {
    skuId: "basque",
    displayName: "Matcha Cake Slice",
    category: "Cake",
    yesterdayActual: 28,
    todayForecast: 24,
    recommendedProduction: 26,
    confidence: "med",
    deltaVsLastWeek: -14.3,
    topFeatures: ["Mid-week slowdown", "Lower tourist volume Thu", "Rain forecast 3 pm"],
    approved: false,
  },
  {
    skuId: "latte",
    displayName: "Iced Latte",
    category: "Beverage",
    yesterdayActual: 118,
    todayForecast: 125,
    recommendedProduction: 130,
    confidence: "high",
    deltaVsLastWeek: 5.9,
    topFeatures: ["Hot weather 33°C", "Tourism surge Jul-Aug", "Pre-weekend uplift"],
    approved: false,
  },
  {
    skuId: "cold-brew",
    displayName: "Cold Brew",
    category: "Beverage",
    yesterdayActual: 88,
    todayForecast: 92,
    recommendedProduction: 96,
    confidence: "high",
    deltaVsLastWeek: 4.5,
    topFeatures: ["Sunny 31°C", "Peak tourist season", "72h shelf life allows buffer"],
    approved: false,
  },
  {
    skuId: "danish",
    displayName: "Avocado Toast",
    category: "Pastry",
    yesterdayActual: 45,
    todayForecast: 42,
    recommendedProduction: 44,
    confidence: "med",
    deltaVsLastWeek: -6.7,
    topFeatures: ["Thursday dip typical", "Cloud cover reduces walk-ins", "Competing lunch options"],
    approved: false,
  },
  {
    skuId: "brioche",
    displayName: "Banana Bread",
    category: "Bread",
    yesterdayActual: 31,
    todayForecast: 34,
    recommendedProduction: 36,
    confidence: "low",
    deltaVsLastWeek: 9.7,
    topFeatures: ["Recent menu feature", "Instagram promotion active", "Limited 14-day history"],
    approved: false,
  },
  {
    skuId: "opera",
    displayName: "Brownie",
    category: "Cake",
    yesterdayActual: 52,
    todayForecast: 55,
    recommendedProduction: 57,
    confidence: "high",
    deltaVsLastWeek: 5.8,
    topFeatures: ["Afternoon peak pattern", "Tourist group orders", "Weekend pre-stock"],
    approved: false,
  },
  {
    skuId: "tart-citron",
    displayName: "Coconut Cake Slice",
    category: "Cake",
    yesterdayActual: 19,
    todayForecast: 22,
    recommendedProduction: 23,
    confidence: "med",
    deltaVsLastWeek: 15.8,
    topFeatures: ["New recipe launch (W18)", "Social media spike", "Weekend upcoming"],
    approved: false,
  },
  {
    skuId: "baguette",
    displayName: "Gluten-free Muffin",
    category: "Bread",
    yesterdayActual: 14,
    todayForecast: 12,
    recommendedProduction: 14,
    confidence: "low",
    deltaVsLastWeek: -14.3,
    topFeatures: ["Niche demand, high variance", "Rain forecast reduces foot traffic", "Low baseline (14 units)"],
    approved: false,
  },
];
