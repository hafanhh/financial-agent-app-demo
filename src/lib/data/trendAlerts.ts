export type TrendAlert = {
  id: string;
  location: string;
  metric: string;
  direction: "up" | "down";
  isGoodDirection: boolean;
  weeklyRate: string;
  weeksConsecutive: number;
  currentValue: string;
  projectedValue: string;
  projectedDate: string;
  projectedBreachTarget: boolean;
  cause: string;
  actionType: "askWhy" | "openDataTab" | "insertPrompt";
  actionLabel: string;
  actionPayload: string;
};

export const TREND_ALERTS: TrendAlert[] = [
  {
    id: "trend-ubud-margin",
    location: "Ubud",
    metric: "Gross margin",
    direction: "down",
    isGoodDirection: false,
    weeklyRate: "−1pt/week",
    weeksConsecutive: 5,
    currentValue: "62%",
    projectedValue: "57%",
    projectedDate: "Jun 16",
    projectedBreachTarget: true,
    cause: "Butter cost increase compressing margin steadily",
    actionType: "insertPrompt",
    actionLabel: "Ask why",
    actionPayload: "Why is Ubud margin compressing week over week?",
  },
  {
    id: "trend-canggu-waste",
    location: "Canggu",
    metric: "Waste %",
    direction: "up",
    isGoodDirection: false,
    weeklyRate: "+2pts/week",
    weeksConsecutive: 3,
    currentValue: "18%",
    projectedValue: "24%",
    projectedDate: "Jun 9",
    projectedBreachTarget: true,
    cause: "Consistent with Matcha Cake overproduction pattern",
    actionType: "openDataTab",
    actionLabel: "See waste detail",
    actionPayload: "waste-canggu-w22",
  },
  {
    id: "trend-jakarta-latte",
    location: "Jakarta SCBD",
    metric: "Iced Latte sales",
    direction: "down",
    isGoodDirection: false,
    weeklyRate: "−8%/week",
    weeksConsecutive: 4,
    currentValue: "−22% vs forecast",
    projectedValue: "−38% vs forecast",
    projectedDate: "Jun 9",
    projectedBreachTarget: true,
    cause: "Possible seasonal shift or competitor pressure",
    actionType: "insertPrompt",
    actionLabel: "Investigate",
    actionPayload:
      "What's causing the Iced Latte sales decline at Jakarta SCBD over the past 4 weeks?",
  },
  {
    id: "trend-sanur-foodcost",
    location: "Sanur",
    metric: "Food cost %",
    direction: "up",
    isGoodDirection: false,
    weeklyRate: "+0.8pts/week",
    weeksConsecutive: 4,
    currentValue: "32%",
    projectedValue: "35%",
    projectedDate: "Jun 16",
    projectedBreachTarget: true,
    cause: "Butter price hike combined with Sourdough overproduction",
    actionType: "insertPrompt",
    actionLabel: "Ask why",
    actionPayload: "Why is Sanur's food cost % trending upward week over week?",
  },
  {
    id: "trend-seminyak-ltv",
    location: "Seminyak",
    metric: "Customer LTV",
    direction: "up",
    isGoodDirection: true,
    weeklyRate: "+Rp 8K/week",
    weeksConsecutive: 6,
    currentValue: "Rp 392K",
    projectedValue: "Rp 420K",
    projectedDate: "Jun 23",
    projectedBreachTarget: false,
    cause: "Loyalty program and improving weekend tourist mix",
    actionType: "insertPrompt",
    actionLabel: "See breakdown",
    actionPayload:
      "What's driving Seminyak's improving customer LTV over the last 6 weeks?",
  },
];
