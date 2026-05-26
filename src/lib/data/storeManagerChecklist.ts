export type ChecklistItem = {
  id: string;
  priority: 1 | 2 | 3;
  title: string;
  detail: string;
  actionLabel: string;
  actionPrompt: string;
  dataSource: string;
};

export const CHECKLISTS: Record<string, ChecklistItem[]> = {
  Seminyak: [
    {
      id: "sem-1",
      priority: 1,
      title: "Reorder sourdough",
      detail:
        "Stock at 4 units, forecasted to sell out by 11am. Order minimum 30 units by 9am.",
      actionLabel: "Ask agent about reorder",
      actionPrompt:
        "What is the current sourdough stock level at Seminyak and when should I reorder?",
      dataSource: "W22 waste log · M1 forecast",
    },
    {
      id: "sem-2",
      priority: 2,
      title: "Review butter usage",
      detail:
        "Ran 18kg yesterday vs 11kg avg. Food cost 34% vs 28% target. Check Almond Croissant production today.",
      actionLabel: "See yesterday's detail",
      actionPrompt:
        "What caused yesterday's butter usage spike at Seminyak and which products were affected?",
      dataSource: "W22 COGS log",
    },
    {
      id: "sem-3",
      priority: 3,
      title: "Adjust Tuesday staffing",
      detail:
        "1.4 FTE above peer average for traffic level. Estimated saving if right-sized: Rp 2.1M/month.",
      actionLabel: "Compare with other stores",
      actionPrompt:
        "How does Seminyak staffing compare to peer stores for similar traffic levels on weekdays?",
      dataSource: "W21 staffing report",
    },
  ],

  Canggu: [
    {
      id: "cng-1",
      priority: 1,
      title: "Reduce Matcha Cake production 25%",
      detail:
        "Waste running at 18% (baseline 9%) for 3 consecutive weeks. Mon–Wed overproduction identified.",
      actionLabel: "See waste detail",
      actionPrompt:
        "Show me the Matcha Cake waste trend at Canggu over the last 3 weeks.",
      dataSource: "W22 waste log · W20–W22 trend",
    },
    {
      id: "cng-2",
      priority: 2,
      title: "Investigate waste spike",
      detail:
        "Yesterday waste cost Rp 480K vs Rp 190K avg. 3 SKUs above threshold: Matcha Cake, Coconut Cake, Banana Bread.",
      actionLabel: "Investigate waste spike",
      actionPrompt:
        "Why did Canggu waste spike yesterday? Break down by SKU.",
      dataSource: "W22 waste log",
    },
    {
      id: "cng-3",
      priority: 3,
      title: "Review Mon–Wed schedule",
      detail:
        "Low traffic Mon–Wed (avg 142 covers) but staffed for 165. Consider reducing 0.5 FTE on these days.",
      actionLabel: "Review schedule",
      actionPrompt:
        "What is the optimal staffing level for Canggu on Monday, Tuesday, and Wednesday based on traffic data?",
      dataSource: "W21 traffic + staffing",
    },
  ],

  Sanur: [
    {
      id: "san-1",
      priority: 1,
      title: "Review menu pricing vs butter cost",
      detail:
        "Butter +12% from supplier. Gross margin at 55% vs 60% target. Review Croissant and Pain au Chocolat pricing.",
      actionLabel: "Model price impact",
      actionPrompt:
        "If we raise Almond Croissant and Pain au Chocolat prices by 8% at Sanur, what is the estimated P&L impact?",
      dataSource: "W22 P&L · supplier invoice May",
    },
    {
      id: "san-2",
      priority: 2,
      title: "Check Sourdough waste",
      detail:
        "Sourdough waste running 14% (target <8%). 6 unsold units per day average over W21. Check production schedule.",
      actionLabel: "Check waste detail",
      actionPrompt:
        "What is driving Sourdough waste at Sanur in the past 2 weeks?",
      dataSource: "W21 waste log",
    },
    {
      id: "san-3",
      priority: 3,
      title: "Supplier payment due today",
      detail:
        "Pak Seto invoice Rp 18.4M due today. Confirm payment by 2pm to maintain preferred pricing.",
      actionLabel: "View invoice",
      actionPrompt:
        "Show me the outstanding supplier invoices for Sanur for this week.",
      dataSource: "Supplier invoices May",
    },
  ],

  Ubud: [
    {
      id: "ubu-1",
      priority: 1,
      title: "Pain au Chocolat overproduction",
      detail:
        "38 produced yesterday, 24 sold. 14 units wasted (37% waste rate vs 10% target). Reduce bake by 12 units.",
      actionLabel: "See production data",
      actionPrompt:
        "What has the Pain au Chocolat production and waste trend been at Ubud this week?",
      dataSource: "W22 waste log",
    },
    {
      id: "ubu-2",
      priority: 2,
      title: "Weekend tourist forecast review",
      detail:
        "M1 forecasting +28% tourist traffic this weekend (Galungan holiday). Review inventory and staffing before Friday.",
      actionLabel: "Review forecast",
      actionPrompt:
        "What is the weekend demand forecast for Ubud and which SKUs should I increase production on?",
      dataSource: "M1 forecast W23 · Ubud traffic history",
    },
    {
      id: "ubu-3",
      priority: 3,
      title: "Equipment maintenance due",
      detail:
        "Oven #2 service overdue by 3 days. Last service Dec 2025. Schedule before peak weekend.",
      actionLabel: "Note equipment issue",
      actionPrompt:
        "What equipment maintenance is pending at Ubud and how does it affect production capacity?",
      dataSource: "Maintenance log",
    },
  ],

  Kuta: [
    {
      id: "kut-1",
      priority: 1,
      title: "Monday closure analysis follow-up",
      detail:
        "Kuta closed last Monday (19 May). Revenue impact: −Rp 28M vs model estimate −Rp 24M. Confirm if closure continues.",
      actionLabel: "Analyze closure impact",
      actionPrompt:
        "What was the actual vs estimated revenue impact of closing Kuta last Monday?",
      dataSource: "W21 P&L · closure report",
    },
    {
      id: "kut-2",
      priority: 2,
      title: "Banana Bread freshness check",
      detail:
        "Banana Bread batch from Friday may be at shelf limit. Check 12 units in case before opening.",
      actionLabel: "Check waste policy",
      actionPrompt:
        "What is the shelf life policy for Banana Bread and what should I do with near-limit inventory?",
      dataSource: "Product spec sheet",
    },
    {
      id: "kut-3",
      priority: 3,
      title: "Review low-traffic afternoon shift",
      detail:
        "Tue–Wed 3pm–6pm average 8 covers/hr. 2 FTE on floor. Consider reducing to 1 FTE + flex.",
      actionLabel: "Review shift cost",
      actionPrompt:
        "What is the staffing cost vs revenue for Kuta afternoon shifts on Tuesday and Wednesday?",
      dataSource: "W21 traffic + staffing",
    },
  ],

  Uluwatu: [
    {
      id: "ulu-1",
      priority: 1,
      title: "Cinnamon Roll waste trend",
      detail:
        "Waste at 22% for 3 weeks running (target 8%). Production not matching surf-tourist demand pattern.",
      actionLabel: "See waste trend",
      actionPrompt:
        "What is causing the Cinnamon Roll waste trend at Uluwatu, and what production level should I target?",
      dataSource: "W20–W22 waste log",
    },
    {
      id: "ulu-2",
      priority: 2,
      title: "Confirm weekend surf-season staffing",
      detail:
        "Next 3 weekends have major surf competitions nearby. M1 forecasting +40% traffic. Add 1.5 FTE Sat–Sun.",
      actionLabel: "Review forecast",
      actionPrompt:
        "How much additional staff does Uluwatu need for the surf season weekends?",
      dataSource: "M1 surf-season forecast",
    },
    {
      id: "ulu-3",
      priority: 3,
      title: "Check cold storage temp",
      detail:
        "Cold storage #1 alert logged at 2:14am — temperature briefly hit 8°C (threshold 4°C). Check products and unit.",
      actionLabel: "Review alert",
      actionPrompt:
        "What cold storage alert was logged at Uluwatu overnight and which products may be affected?",
      dataSource: "IoT temperature log",
    },
  ],

  "Jakarta SCBD": [
    {
      id: "jkt-1",
      priority: 1,
      title: "Iced Latte sales diagnosis",
      detail:
        "Iced Latte down −22% vs forecast for 4 days running. Possible competitor or seasonal. Check neighboring competition.",
      actionLabel: "Investigate sales drop",
      actionPrompt:
        "What is causing the Iced Latte sales decline at Jakarta SCBD and what should I do about it?",
      dataSource: "W22 sales · anomaly alert A3",
    },
    {
      id: "jkt-2",
      priority: 2,
      title: "Competitor proximity check",
      detail:
        "New café reportedly opened 200m away on Jl. Jenderal Sudirman. Assess menu overlap and pricing.",
      actionLabel: "Ask for analysis",
      actionPrompt:
        "How should Jakarta SCBD respond to a new competitor opening nearby?",
      dataSource: "Market intelligence",
    },
    {
      id: "jkt-3",
      priority: 3,
      title: "Weekend B2B catering prep",
      detail:
        "Corporate catering order for 80 pax confirmed for Saturday. Prepare: 80 Croissants, 60 Banana Bread, 40 Brownies.",
      actionLabel: "Review catering order",
      actionPrompt:
        "What production and logistics do I need to prepare for the Jakarta SCBD Saturday corporate catering order?",
      dataSource: "Catering orders",
    },
  ],
};
