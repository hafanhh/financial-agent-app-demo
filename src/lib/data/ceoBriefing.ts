// Iter3 — Morning Briefing data for the M3 CEO surface.
// All deterministic for demo timing. Wired to actions that the briefing card
// dispatches through app-nav-context.

export type BriefingSeverity = "red" | "yellow" | "green";

export type BriefingAction =
  | { kind: "insertPrompt"; label: string; payload: string }
  | { kind: "openDoc"; label: string; payload: { docId: string; page?: number; anchor?: string } }
  | { kind: "openCompare"; label: string; payload: { mode: "pair" | "chain"; left?: string; right?: string } }
  | { kind: "openWhatIf"; label: string; payload: string }; // for now == insertPrompt; iter4 will wire a real panel

export type BriefingItem = {
  id: string;
  severity: BriefingSeverity;
  headline: string;
  detail: string;
  actions: BriefingAction[];
};

export type BriefingDay = {
  forDate: string;
  greeting: string;
  updatedAt: string;
  items: BriefingItem[];
};

export const CEO_BRIEFING: BriefingDay = {
  forDate: "Monday, 20 May 2026 · 07:00",
  greeting: "Good morning, Ivander. Here's what changed overnight.",
  updatedAt: "Updated 7:02am · powered by M1 forecast, M3 anomaly detection, P&L stream",
  items: [
    // ── Section 1 — red ─────────────────────────────────────────────────────
    {
      id: "red-canggu-food-cost",
      severity: "red",
      headline: "Canggu food cost ran 38% yesterday (baseline 28%).",
      detail:
        "Likely cause: Matcha Cake overproduction during a tour group cancellation. Estimated impact: Rp 420K extra cost for the day. The store manager has been notified.",
      actions: [
        {
          kind: "insertPrompt",
          label: "Ask follow-up",
          payload: "Why did Canggu food cost spike yesterday?",
        },
        {
          kind: "openDoc",
          label: "Open in Data tab",
          payload: { docId: "waste-canggu-w22", anchor: "matcha-rows" },
        },
      ],
    },
    // ── Section 2 — yellow ──────────────────────────────────────────────────
    {
      id: "yellow-butter-hike",
      severity: "yellow",
      headline: "Butter supplier price hike confirmed — +12% effective next Monday.",
      detail:
        "Estimated chain-wide P&L impact: −Rp 4.2M/month if no menu adjustment. To be considered in pricing review meeting Thursday.",
      actions: [
        {
          kind: "openWhatIf",
          label: 'Run "what if" on menu price',
          payload:
            "What would happen to chain margin if we raise menu prices 5% to absorb the butter cost increase?",
        },
        {
          kind: "openDoc",
          label: "Open invoice in Data tab",
          payload: { docId: "supplier-invoices-may", page: 7, anchor: "butter-row" },
        },
      ],
    },
    {
      id: "yellow-seminyak-saturday",
      severity: "yellow",
      headline: "Seminyak hit best Saturday revenue in 8 weeks — Rp 47M (prior best Rp 41M).",
      detail:
        "Driver: 3 wedding pickup orders + sunny weather. M1 had forecast +18% above baseline — actual landed +21%.",
      actions: [
        {
          kind: "insertPrompt",
          label: "See breakdown",
          payload: "Why was Seminyak Saturday so strong?",
        },
      ],
    },
    // ── Section 3 — green ───────────────────────────────────────────────────
    {
      id: "green-chain-margin",
      severity: "green",
      headline: "Chain margin 61% week-to-date, on track for 63% target.",
      detail: "All 7 locations within ±3 pts of target.",
      actions: [
        {
          kind: "openCompare",
          label: "See all 7 locations",
          payload: { mode: "chain" },
        },
      ],
    },
  ],
};

// Simpler one-liner for the Store Manager view.
export type SmBriefing = {
  text: string;
  followUpPrompt: string;
};

export const SM_BRIEFING: SmBriefing = {
  text: "Good morning. 1 thing to check: yesterday's food cost ran 34% (baseline 28%).",
  followUpPrompt: "What was my food cost % yesterday, and what's driving it?",
};
