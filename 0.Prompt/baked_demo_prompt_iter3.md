# Claude Code Prompt — BAKED Demo Iteration 3

> Paste vào Claude Code trong **cùng thư mục dự án bạn đã build ở iter 1 + 2**.
> Đây là **incremental build**, không tạo project mới.

---

## ROLE & MISSION

You are continuing work on the **BAKED AI Platform demo**. Same context: client-facing 15-minute scripted screen-share, mock data, no backend, English UI, IDR currency.

**This iteration is scoped strictly to Module 3 (Financial Agent).** M1 (Demand Forecasting) and M2 (Customer Intelligence) are owned by other team members and **must not be modified**. If a new M3 feature naturally surfaces an M1 or M2 output (e.g. a "powered by M1 forecast" link), reference it through existing data only — do **not** edit M1/M2 source files.

**The goal of this iteration**: take M3 from "impressive chat demo" to "tool a CEO would actually open every morning". The CEO of BAKED is an operator-CEO — visits stores, reads numbers on a phone with morning coffee, decides on weekly/monthly cycles, runs on cash flow. The persona work in iter 2 already separated CEO from Store Manager. This iteration **goes deep on the CEO surface**.

The 4 features below are **all MUST**. They are ranked by demo importance; build in order.

---

## START BY READING THE EXISTING CODEBASE

Before any code, view:
- M3 scene component (Scene 4)
- Persona switcher implementation from iter 2
- Mock data files (`mockData/`)
- Citation chip implementation and bi-directional navigation

**Do not touch M1 or M2 scenes, components, or mock data.** If you need a value from M1 (e.g. forecast quantity) to render an M3 feature, **read it from existing mock data**, do not modify the source.

State your understanding of where each new feature will live in the file tree before coding. Confirm structure with me if you have major doubts; otherwise proceed.

---

## FEATURE 1 — Morning Briefing Card (highest priority)

The CEO opens the platform at 7am. The first thing they should see is a **briefing card pinned at the top of the M3 chat panel** when persona = CEO.

### Behavior

- Visible **only** when persona = CEO. Hidden in Store Manager view.
- Sits **above the suggested-prompt chips** in the chat panel — it's the first thing in view.
- Collapsible: small chevron in top-right to fold into a one-line summary ("Morning briefing · 1 red · 2 yellow · 1 green · expand"). Default state: expanded.
- A timestamp top-left: "Briefing for **Monday, 20 May 2026 · 07:00**" (hardcode this — don't compute current date; the demo needs deterministic content).

### Visual layout

A card with the BAKED accent color border-left. Inside, vertical sections separated by hairlines:

**Greeting line**: "Good morning, Ivander. Here's what changed overnight."

**Section 1 — 🔴 Needs attention (1 item)**:

> **Canggu food cost ran 38% yesterday (baseline 28%).**
> Likely cause: Matcha Cake overproduction during a tour group cancellation. Estimated impact: Rp 420K extra cost for the day. The store manager has been notified.
>
> [Ask follow-up →] [Open in Data tab →]

**Section 2 — 🟡 Worth knowing (2 items)**:

> **Butter supplier price hike confirmed** — +12% effective next Monday. Estimated chain-wide P&L impact: -Rp 4.2M/month if no menu adjustment. Considered in pricing review meeting Thursday.
>
> [Run "what if" on menu price → ] [Open invoice in Data tab →]

> **Seminyak hit best Saturday revenue in 8 weeks** — Rp 47M (prior best Rp 41M). Driver: 3 wedding pickup orders + sunny weather (M1 had forecast +18% above baseline).
>
> [See breakdown →]

**Section 3 — 🟢 Going well (1 item)**:

> **Chain margin 61% week-to-date**, on track for 63% target. All 7 locations within ±3pts of target.
>
> [See all 7 locations →]

**Footer of card**: small text "Updated 7:02am · powered by M1 forecast, M3 anomaly detection, P&L stream"

### Interaction wiring

- **[Ask follow-up →]** on the Canggu red alert → inserts the prompt "Why did Canggu food cost spike yesterday?" into the chat input (don't auto-send; let presenter click send for demo timing).
- **[Open in Data tab →]** on Canggu → navigates to Data tab, opens `Waste_Log_Canggu_W22.csv` with the spike rows highlighted (use existing bi-directional nav from iter 2).
- **[Run "what if" on menu price →]** → opens the What-If panel from Feature 3 below, preset to "Raise prices" scenario.
- **[Open invoice in Data tab →]** → opens `Supplier_Invoices_May.pdf` with the butter price line highlighted.
- **[See breakdown →]** on Seminyak → inserts prompt "Why was Seminyak Saturday so strong?" into chat.
- **[See all 7 locations →]** on margin → opens the Compare panel from Feature 2 below, in chain-overview mode.

### Why this matters (so you build it with the right tone)

This card is the **single most important thing in the entire M3 module from a CEO perspective**. It demonstrates the platform is **proactive** — the CEO doesn't have to know what question to ask. The content must feel **specific, plausible, and grounded** (not generic AI summaries). Match the language style of the existing M3 chat responses — confident headlines, structured supporting blocks.

---

## FEATURE 2 — Compare Locations panel

CEO of a multi-location chain asks one question more than any other: *"How does X compare to Y?"*

### Entry points

- **Suggested prompt chip** in CEO view (add as 4th chip): *"Compare locations side-by-side"*
- **[See all 7 locations →]** button from the Morning Briefing
- **A dedicated button** in the M3 scene header (next to persona switcher): `[ ⚖️ Compare ]`

### UI

When activated, replaces the chat panel with a **2-column comparison view** (chat moves to a tab or collapses). A small breadcrumb at top: `M3 / Compare locations` with a "Back to chat" link.

Layout:

```
┌─ Compare locations ──────────────────────────── [Back to chat] ┐
│                                                                 │
│  Left:  [ Seminyak ▼ ]              Right:  [ Canggu ▼ ]        │
│                                                                 │
│  Time range: [ Week 22 (May 13-19, 2026) ▼ ]                    │
│                                                                 │
│  ┌──────────────┬────────────┬────────────┬───────────────┐    │
│  │              │  Seminyak  │  Canggu    │  Difference   │    │
│  ├──────────────┼────────────┼────────────┼───────────────┤    │
│  │ Revenue      │  Rp 312M   │  Rp 198M   │  -37% 🔴      │    │
│  │ Gross margin │  64%       │  52%       │  -12pts 🔴    │    │
│  │ Waste %      │  8%        │  18%       │  +10pts 🔴    │    │
│  │ Customers    │  1,840     │  1,210     │  -34%         │    │
│  │ Avg ticket   │  Rp 169K   │  Rp 164K   │  -3%          │    │
│  │ Top SKU      │  Sourdough │  Croissant │  —            │    │
│  │ Staff hrs    │  186 h     │  198 h     │  +6%          │    │
│  │ Hrs / Rp 1M  │  4.2 h     │  6.8 h     │  +62% 🔴      │    │
│  │ Stockouts    │  2 events  │  0 events  │  —            │    │
│  └──────────────┴────────────┴────────────┴───────────────┘    │
│                                                                 │
│  💡 Ask: "What's different between these two locations?"        │
│     [Generate explanation →]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Behavior details

- Dropdowns: both columns can pick any of 7 locations (Seminyak, Ubud, Canggu, Sanur, Kuta, Uluwatu, Jakarta SCBD). A 3rd dropdown option: "Chain average" — when picked, shows the average across all locations as the comparator.
- Difference column colored: red dot for "X worse than Y by >5%", green dot for "X better than Y by >5%", no marker otherwise. Threshold % can be hardcoded.
- "Top SKU" and "Stockouts" rows: no numeric difference, just side-by-side facts.
- Hardcode realistic comparison data for 3 location pairs:
  - **Seminyak vs Canggu** (default, biggest spread)
  - **Ubud vs Sanur** (small spread, tourist towns)
  - **Jakarta SCBD vs Chain average** (showing Jakarta as outpost vs Bali concentration)
  Other combinations can use plausible interpolations.

### "Generate explanation" wiring

Click → returns to chat view, inserts a pre-written agent response below the briefing/chips area:

> **3 things explain why Seminyak outperforms Canggu this week:**
>
> 1. **Demand pattern stability** — Seminyak has predictable tourist + expat mix; M1 forecasts within 8%. Canggu has higher variance from surf-tourist day-trip waves, forecasts within 14%, leading to defensive overproduction.
> 2. **Waste concentration** — 60% of Canggu's waste is in Matcha Cake and Coconut Cake (high-cost SKUs). Seminyak's waste is spread across cheaper bread SKUs.
> 3. **Labor utilization** — Seminyak runs 4.2 hrs per Rp 1M revenue, Canggu 6.8 hrs. The Canggu schedule was built for high season and hasn't been adjusted for shoulder.
>
> *Citations: M1_Forecast_Variance_W22.pdf · Waste_Log_Canggu_W22.csv · Staff_Schedule_Bali_May2026.xlsx*

Citations use existing iter 2 navigation — clickable chips opening Data tab.

### Out of scope for this iter

No charts inside the compare view. Numbers in table is enough. Don't build chart overlays — keep effort focused.

---

## FEATURE 3 — KPI Strip with Sparklines

A horizontal strip of 4 KPI tiles above the chat panel (below Morning Briefing when present, above suggested prompts). Persona-aware:

### CEO version (4 tiles)

```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Chain margin   │ Cash position  │ Waste %        │ Customer LTV   │
│                │                │                │                │
│ 61%            │ Rp 1.2B        │ 11%            │ Rp 380K        │
│ ↘ -2pts WoW    │ ↗ +5% WoW      │ ↗ +1pt WoW     │ ↘ -3% MoM      │
│                │                │                │                │
│ ▁▂▃▂▁▁▂        │ ▁▂▃▄▅▆▇        │ ▇▆▅▅▄▃▃        │ ▆▆▅▅▄▄▃        │
│                │                │                │                │
│ [Why? →]       │ [Detail →]     │ [Where? →]     │ [Cohort →]     │
└────────────────┴────────────────┴────────────────┴────────────────┘
```

### Store Manager version (4 tiles, single-location)

Replace the CEO tiles with:
- **My food cost %** (e.g. "28% · ↘ -2pts WoW")
- **My waste today** (e.g. "Rp 142K · ↗ +Rp 30K WoW")
- **My traffic vs forecast** (e.g. "+12% · ↗")
- **My staff hrs / Rp 1M** (e.g. "4.5h · ↘ -0.3h WoW")

Same sparkline + drill-in button pattern.

### Visual specifics

- Each tile: ~280px wide, white card with subtle border (match existing card style).
- Number: large, bold, accent color.
- Delta: smaller, with arrow + color (red for bad direction, green for good — note that for waste %, "up" is bad).
- Sparkline: ~80px wide, 8 data points, last 8 weeks. Use accent color, no axes, no labels. Pure visual.
- Bottom action button: small text link in accent color.

### Drill-in wiring

Clicking each tile inserts a pre-written prompt into chat input (don't auto-send). Example mappings for CEO:

- Chain margin [Why?] → "Which 2 locations are dragging down chain margin this month, and why?" (matches existing Example 1 from iter 2)
- Cash position [Detail] → "What's our cash position breakdown for this week?"
- Waste % [Where?] → "Which locations and SKUs have the worst waste this week?"
- Customer LTV [Cohort] → "How is customer lifetime value trending by cohort?"

Each clicked tile pre-fills the input but **doesn't auto-send** — gives presenter timing control during demo.

### Important constraint

Don't double-render KPIs. If Morning Briefing already mentions a metric (e.g. chain margin 61%), the KPI strip shows the same number — they should be consistent. Make briefing and tiles **read from the same mock data object** so they stay in sync if you tweak numbers later.

---

## FEATURE 4 — Confidence & Uncertainty Markers

Every agent message in the M3 chat gets a **confidence indicator** next to the headline.

### Visual

A small pill-shaped badge inline with the headline (or just below it):

- 🟢 **High confidence** — based on N sources, M days of data
- 🟡 **Medium confidence** — assumes [key assumption], untested
- 🟠 **Low confidence** — limited data, treat as directional

Click the badge → expands a small panel below the message:

```
┌─ Confidence: Medium ─────────────────────────────────────┐
│                                                          │
│  Why medium:                                             │
│  • Assumes 70% customer retention if Kuta closes Mondays │
│  • Based on 3 months of POS data — limited seasonality   │
│  • Competitor pricing not modeled                        │
│                                                          │
│  To increase confidence:                                 │
│  • A/B test for 4 weeks (1 closed Monday in Kuta)        │
│  • Compare to industry retention data (Wave 2 module)    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Apply to existing examples

Update the 5 existing M3 chat examples from iter 2 with confidence markers:

- **Example 1 (CEO — Canggu/Sanur margin diagnosis)** → 🟢 High (4 sources, 22 days of P&L + waste data)
- **Example 2 (CEO — Stockout revenue loss)** → 🟡 Medium (estimation method, 70% recovery assumption)
- **Example 3 (CEO — Kuta Monday closure)** → 🟠 Low (untested scenario, customer retention assumption)
- **Example 4 (Store Manager — yesterday food cost)** → 🟢 High (direct measurement from POS + waste log)
- **Example 5 (Store Manager — overstaffed Tuesdays)** → 🟡 Medium (peer benchmark may not control for store size differences)

Also apply to all responses generated by Compare-locations explanations, Morning Briefing drill-ins, KPI drill-ins.

### Why this is critical (build with intent)

This is the **trust-builder** for a kỹ-tính CEO. Agents that always sound confident are immediately distrusted by experienced operators. Agents that **flag uncertainty proactively** are trusted. This single feature, done well, separates this demo from every other vendor's demo. **Do not make it look like a disclaimer footer — make it look like a thoughtful colleague's hedge.**

---

## INTERACTIONS BETWEEN FEATURES (cross-cutting wiring)

After all 4 features are built, verify these cross-flows work:

1. **Briefing → What-if**: There is no What-If panel in this iter (that's iter 4). The Morning Briefing's [Run "what if" on menu price →] button should, for now, insert a prompt into chat: *"What would happen to chain margin if we raise menu prices 5% to absorb the butter cost increase?"* — pre-written agent response handles it. Mark this in your README as "What-If panel deferred to iter 4".

2. **Briefing → Compare**: [See all 7 locations →] opens Compare view in a special "Chain overview" mode showing all 7 locations in a compact table (not 2-column side-by-side). Use the same data source as the 2-column Compare.

3. **KPI tile → drill-in → response → confidence marker**: Click tile → prompt loads → presenter sends → response appears with confidence marker. The full chain should feel smooth.

4. **Compare → Generate explanation → Citations → Data tab**: Already wired via iter 2 navigation. Verify it still works after restructuring.

---

## STORE MANAGER VIEW UPDATES

While the focus is CEO, Store Manager view shouldn't feel abandoned. Apply minimal updates:

- **Morning Briefing**: Replace with a simpler version — single line at top of chat: *"Good morning. 1 thing to check: yesterday's food cost ran 34% (baseline 28%). [Ask why →]"*. No multi-section card.
- **KPI Strip**: Use the Store Manager version (4 single-location tiles).
- **Compare button**: Hidden in Store Manager view (compare is a CEO-thinking feature; SM compares within own store across time).
- **Confidence markers**: Apply to all SM responses as well.

---

## MOCK DATA UPDATES

Add to existing mock data (or create new file `mockData/ceoBriefing.ts` if it keeps things clean):

```ts
type BriefingItem = {
  severity: 'red' | 'yellow' | 'green'
  headline: string
  detail: string
  actions: { label: string, action: 'insertPrompt' | 'openDataTab' | 'openCompare' | 'openWhatIf', payload: any }[]
}

type KpiTile = {
  label: string
  value: string  // formatted, e.g. "61%"
  delta: { direction: 'up' | 'down', amount: string, period: string }
  deltaIsGood: boolean  // for color
  sparkline: number[]  // 8 values
  drillInPrompt: string
}

type ConfidenceLevel = {
  level: 'high' | 'medium' | 'low'
  summary: string  // e.g. "based on 4 sources, 22 days of data"
  whyDetails: string[]  // bullets explaining
  toIncrease: string[]  // bullets on what would raise confidence
}
```

Briefing and KPI tile values should **read from the same source** as existing chain margin / store metrics so iter 1 + 2 numbers don't conflict.

---

## DEMO SCRIPT — README UPDATES

Add a section to README titled **"M3 Iteration 3 — CEO surface demo flow"**. Include scripted talking points:

1. *"Open the platform, switch to CEO view. This is what the founder sees at 7am — not a blank chat box waiting for them to know what to ask. The platform tells them: here's the one red flag, here's two yellows, here's what's going well. Proactive, not reactive."*
2. *"Click Compare. Pick Seminyak and Canggu. Look at this — 37% revenue gap, 12-point margin gap, 62% labor inefficiency. Now click 'Generate explanation.' The agent doesn't just describe what's different — it diagnoses why. Three specific causes, each with a citation."*
3. *"Look at the confidence markers. 🟢 High confidence on the Canggu diagnosis — it's a measurement, not a guess. 🟠 Low confidence on the Kuta Monday scenario — it's untested. This is the agent telling the truth about what it knows and doesn't. A vendor who hides uncertainty is a vendor who burns you later."*
4. *"Click any KPI tile. Sparkline shows direction over 8 weeks. Click the drill button — turns into a question the agent answers in seconds. CEOs don't write questions, they scan numbers. We built around that."*

---

## PRIORITIES IF TIME RUNS SHORT

Strict order:

1. **Feature 1 — Morning Briefing card** (highest demo impact, lowest build cost)
2. **Feature 4 — Confidence markers on existing examples** (1-2 hours of UI work, massive trust impact)
3. **Feature 3 — KPI strip with sparklines** (visual, fast to build)
4. **Feature 2 — Compare locations** (most build effort; can be cut to single hardcoded comparison if time-pressed)
5. **Cross-cutting wiring + Store Manager updates**
6. **Polish, animations, edge cases**

If you have to cut Feature 2 to deliver well on 1+3+4, **do it**. A polished briefing + KPI + confidence demo beats a half-broken compare view.

---

## DELIVERABLES

When done:
1. Updated codebase, runnable with same command.
2. README appended with Iteration 3 demo flow section.
3. A one-paragraph note covering:
   - Which features you completed fully vs partially
   - Any judgment calls you made on ambiguous spec
   - Anything you'd add next if iter 4 happens

**Confirm file structure before deep coding.** Show me where Briefing card, KPI strip, Compare view, and Confidence component will live, plus a sample mock data entry. Then proceed.

**Reminder**: Do NOT touch M1 or M2 source files. Read existing values only.
