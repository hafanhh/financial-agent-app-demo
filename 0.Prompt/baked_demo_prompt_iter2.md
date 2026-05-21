# Claude Code Prompt — BAKED Demo Iteration 2

> Paste vào Claude Code trong **cùng thư mục dự án bạn đã build ở prompt trước**.
> Đây là **incremental build**, không tạo project mới.

---

## ROLE & MISSION

You are continuing work on the **BAKED AI Platform demo** you built in the previous iteration. Same context: client-facing 15-minute scripted screen-share, mock data, no backend, English UI, IDR currency.

This iteration has **two goals**:
1. **Upgrade Scene 4 (M3 Financial Agent)** — currently the most visually striking module, but needs to feel more like a tool a CEO + Store Manager would actually use daily.
2. **Add a new top-level scene: "Data & Knowledge"** — the source layer that powers M3 (and conceptually M1/M2). This is the demo's **trust anchor**: it proves the platform is grounded in real client data, not LLM hallucination.

The two are tightly coupled by **bi-directional navigation** (described in detail below).

**Why this matters strategically**: the client RFP explicitly asks for RAG with "source citations". Most vendors will show citations as text labels. We show citations as **navigable references into a real knowledge base** — that's the differentiator. It also previews how the platform handles governance and trust, which the architecture diagram in Scene 1 already promises (Governance band).

---

## START BY READING THE EXISTING CODEBASE

Before writing any code, **view the current project structure**:
- Scene component organization (Scene 1-5)
- Existing mock data file(s)
- The sidebar navigation pattern
- Styling conventions (Tailwind classes, accent color, typography)
- Any shared components (cards, tables, buttons)

**Match the existing patterns exactly.** Do not introduce new libraries, new styling approaches, or new file organization conventions. The new Data scene should feel like it was built by the same hand at the same time.

If you find inconsistencies in the existing code, fix them quietly only if they directly block the new work. Don't refactor for its own sake.

---

## PART A — UPGRADE M3 (Financial Agent)

### A1. Add persona switcher in the M3 scene header

A single segmented control at the top of the M3 scene (not in the global sidebar — it's M3-specific):

```
[ 👔 CEO View ]   [ 🏪 Store Manager View ]
```

Selected state is one accent-colored button; the other is muted. State is local to M3 (doesn't persist or affect other scenes).

A small subtitle under the control changes with the persona:
- CEO: *"Cross-location view · All 7 stores · Strategic KPIs"*
- Store Manager: *"Single location view · Currently: **Seminyak** · Operational decisions"*

When **Store Manager** is selected, also show a location dropdown next to the subtitle (Seminyak / Ubud / Canggu / Sanur / Kuta / Uluwatu / Jakarta SCBD), defaulting to Seminyak.

### A2. Persona-driven suggested prompts

The 3 suggested-prompt chips at the top of the chat must **change with persona**. Replace whatever is there now with these (this is the heart of the persona feature):

**CEO View** — strategic, cross-location, P&L-level:
1. *"Which 2 locations are dragging down chain margin this month, and why?"*
2. *"How much revenue did we lose to stockouts in Bali this quarter?"*
3. *"If we close Kuta on Mondays, what's the net P&L impact?"*

**Store Manager View** — operational, single-location, this-week-level:
1. *"What was my food cost % yesterday, and what's driving it?"*
2. *"Which 3 SKUs at my store had the worst waste this week?"*
3. *"Am I overstaffed on Tuesdays compared to other stores?"*

Each chip click loads a pre-written answer (mock).

### A3. Five hardcoded chat examples (the "demo script")

The chat panel should have **5 pre-populated example conversations** the presenter can scroll through during the demo, plus the suggested-prompt chips above. Pick **3 for CEO persona, 2 for Store Manager**, chosen to land as "wow these answers are sharp".

For each example, the agent reply must include:
- A **one-line headline** with the punchline (margin, IDR amount, %)
- A **structured supporting block** — small table, ranked list, or 2-3 sentence causal explanation
- **2-3 citation chips** at the bottom of the message — clickable, with this exact format:
  ```
  📄 P&L_W22_Seminyak.pdf  ·  page 3
  ```
  These chips are the bi-directional navigation entry point (see Part C).

Here are the 5 examples — implement these exact conversations:

---

**Example 1 (CEO)** — Cross-location margin diagnosis
- Q: *"Which 2 locations are dragging down chain margin this month, and why?"*
- A headline: **"Canggu (52% GM, -8pts MoM) and Sanur (55% GM, -5pts MoM) are below chain average of 61%."**
- A table:
  | Location | Gross Margin | vs Chain Avg | Primary driver |
  | Canggu | 52% | -9pts | Waste spike (Matcha Cake overproduction) |
  | Sanur | 55% | -6pts | Butter cost +12%, not yet passed to menu |
  | Seminyak | 64% | +3pts | (benchmark) |
- Citations: `P&L_May2026_Chain.xlsx · sheet "By Location"`, `Waste_Log_Canggu_W22.csv`, `Supplier_Invoices_May.pdf · page 7`

---

**Example 2 (CEO)** — Hidden revenue loss
- Q: *"How much revenue did we lose to stockouts in Bali this quarter?"*
- A headline: **"Estimated Rp 142M (~$9,100) in lost revenue from Apr-Jun 2026, concentrated in 3 SKUs at 2 locations."**
- A ranked list with bars:
  - Sourdough Loaf @ Canggu — Rp 58M lost (weekends, 14 stockout events)
  - Pain au Chocolat @ Seminyak — Rp 41M lost (morning rush, 22 events)
  - Almond Croissant @ Ubud — Rp 28M lost (holiday peaks)
- A note: *"Estimation method: applied avg sell-through rate to documented stockout windows. M1 forecast adjustments would have prevented ~70% of these."*
- Citations: `Stockout_Events_Q2_2026.csv`, `Sales_Pattern_Analysis_W18-W26.xlsx`, `M1_Backtest_Report.pdf · page 4`

---

**Example 3 (CEO)** — Strategic scenario
- Q: *"If we close Kuta on Mondays, what's the net P&L impact?"*
- A headline: **"Net positive: ~Rp 4.2M/month savings. But qualitative risks worth weighing."**
- A causal explanation in 3 short paragraphs:
  - "Mondays at Kuta avg Rp 6.8M revenue, lowest of the week. Direct costs (labor + utilities + spoilage) avg Rp 11M → -Rp 4.2M contribution."
  - "Risk 1: Tourists planning multi-day visits expect 7-day operation. ~12% of weekly customers visit on >1 day; some will redirect to competitors."
  - "Risk 2: Staff hours redistribution may trigger contract renegotiation. Discussed with HR before action."
- A "View underlying data" button at the end (this is the bi-directional anchor — see Part C).
- Citations: `Kuta_DOW_Revenue_2026.xlsx`, `Labor_Schedule_Q2.xlsx`, `Customer_Cross-visit_Analysis.pdf`

---

**Example 4 (Store Manager — Seminyak)** — Daily operational
- Q: *"What was my food cost % yesterday, and what's driving it?"*
- A headline: **"Food cost ran 34% yesterday vs 28% baseline. Driver: 18kg butter usage (vs typical 11kg)."**
- A short structured block:
  - "Cause likely: extra Almond Croissant production for Sat morning rush — 60 units made (50 sold, 10 wasted)."
  - "Recommendation: M1 forecast suggested 52 units. Variance of 8 units = Rp 96K extra cost."
- Citations: `Daily_PnL_Seminyak_2026-05-18.pdf`, `Waste_Log_Seminyak_W20.csv`, `M1_Forecast_2026-05-18.json`

---

**Example 5 (Store Manager — Seminyak)** — Self-comparison
- Q: *"Am I overstaffed on Tuesdays compared to other stores?"*
- A headline: **"Yes — Seminyak runs 1.4 FTE more on Tuesdays than peer-store average, despite 20% lower traffic."**
- A small bar chart description (render as actual bars):
  - Seminyak Tue: 6.2 FTE · Traffic index 78
  - Ubud Tue: 4.5 FTE · Traffic index 95
  - Sanur Tue: 4.8 FTE · Traffic index 88
  - Canggu Tue: 5.0 FTE · Traffic index 102
- A line: *"Suggest reviewing Tue shift pattern. Estimated savings if right-sized: Rp 2.1M/month."*
- Citations: `Staff_Schedule_Bali_May2026.xlsx`, `Traffic_Counter_Logs.csv`

---

When a persona is toggled, the chat panel **shows only that persona's examples**, plus that persona's suggested prompts. Persist scroll position is not needed.

### A4. UI polish for M3

The current Scene 4 is described as "60/40 chat + anomaly sidebar". Keep that split. Apply these polish moves:

- Each chat message has clear sender styling: agent messages with the BAKED accent border on the left, user messages right-aligned in a muted bubble.
- Citation chips are visibly clickable (hover state, small icon, color change). They look like pill buttons, not plain text.
- The "thinking" animation for newly-typed messages (already in the original prompt) stays as-is.
- Add a small **"Cited from 3 sources · view in Data tab"** link at the bottom of every agent message, alongside the chips.
- Anomaly sidebar: each alert card gets an **"Open in Data tab →"** button below the existing [Investigate] button. This is the second bi-directional anchor.

---

## PART B — NEW SCENE: "Data & Knowledge"

Add a new sidebar item between **M3** and **Future Modules**. Label: **"Data & Knowledge"** with a small dot indicator showing it's "live" (active source layer).

### B1. Structure

The scene has a **top sub-tab switcher** with 2 tabs:

```
[ 📚 Knowledge Base ]   [ 🗄️ Data Catalog ]
```

Default to Knowledge Base.

### B2. Sub-tab 1 — Knowledge Base

This is where the documents M3 cites actually live.

**Layout**: left-side file list (40% width) + right-side document viewer (60% width).

**Left side — file list with grouping**:

Group 1: **Financial Documents** (5 files)
- 📄 `P&L_May2026_Chain.xlsx` — Chain-wide P&L, May 2026 · Updated 2 days ago · 🔵 *cited 4× this week*
- 📄 `P&L_W22_Seminyak.pdf` — Weekly P&L, Seminyak · Updated 1 day ago · 🔵 *cited 2× this week*
- 📄 `Daily_PnL_Seminyak_2026-05-18.pdf` — Daily P&L · Updated 2 days ago · 🔵 *cited 1× this week*
- 📄 `Supplier_Invoices_May.pdf` — May supplier invoices, 47 pages · Updated 4 days ago · 🔵 *cited 3× this week*
- 📄 `Kuta_DOW_Revenue_2026.xlsx` — DOW revenue analysis, Kuta · Updated 1 week ago · 🔵 *cited 1× this week*

Group 2: **Operations Logs** (4 files)
- 📊 `Waste_Log_Canggu_W22.csv` — Weekly waste log, Canggu · 🔵 *cited 2× this week*
- 📊 `Waste_Log_Seminyak_W20.csv` — Weekly waste log, Seminyak · 🔵 *cited 1× this week*
- 📊 `Stockout_Events_Q2_2026.csv` — Stockout events log, Q2 · 🔵 *cited 2× this week*
- 📊 `Traffic_Counter_Logs.csv` — Foot traffic counters, all locations · 🔵 *cited 1× this week*

Group 3: **HR & Scheduling** (2 files)
- 📋 `Staff_Schedule_Bali_May2026.xlsx` — Bali staff schedule, May · 🔵 *cited 1× this week*
- 📋 `Labor_Schedule_Q2.xlsx` — Quarterly labor planning · 🔵 *cited 1× this week*

Group 4: **Policies & SOPs** (3 files)
- 📘 `BAKED_Production_SOP_v3.pdf` — Standard operating procedures, production · Updated 2 weeks ago · *no citations this week*
- 📘 `Pricing_Policy_2026.pdf` — Menu pricing policy, 2026 · *no citations this week*
- 📘 `Waste_Threshold_Guidelines.pdf` — Waste tolerance guidelines per SKU category · *no citations this week*

Group 5: **Analytics Reports** (3 files)
- 📈 `Sales_Pattern_Analysis_W18-W26.xlsx` · 🔵 *cited 1× this week*
- 📈 `M1_Backtest_Report.pdf` — Forecast model backtest · 🔵 *cited 1× this week*
- 📈 `Customer_Cross-visit_Analysis.pdf` · 🔵 *cited 1× this week*

Each file row has: icon, filename, one-line description, updated-time, citation badge. Citation badge is colored using the accent color when >0, muted gray when 0. Clicking the badge filters M3 to "show messages citing this doc" (see Part C2).

A small search box at the top of the list. Doesn't need to work fully — typing filters the list by filename substring is enough.

**Right side — document viewer**:

When a file is selected, show a **mock document preview**:
- Header bar with filename, "Open in M3 →" button (top right), and a small "Last cited:" timestamp.
- For PDFs (P&L, SOPs, reports): render a **mock document body** — header, a table of numbers, some paragraphs. Use realistic bakery/F&B content. Hardcode 2-3 pages worth, scrollable.
- For Excel files (.xlsx): render a **mock spreadsheet** — proper grid, header row, ~15-20 rows of realistic data, multiple sheet tabs at the bottom (1-2 sheets max).
- For CSV files: render a **table view** with headers + ~20 rows.

**Default selected file**: `P&L_W22_Seminyak.pdf` (matches Example 1 from M3).

**The key feature — highlighted citation regions**:
When the user arrives at this scene **via a citation chip click from M3**, the document opens directly to the cited page/section, and the cited region is **highlighted with the accent color background** (semi-transparent, like a marker pen highlight). A small floating chip says:
```
"This passage is cited in: [agent message about cross-location margins] ↗"
```
Clicking the chip jumps back to M3 with that message scrolled into view.

### B3. Sub-tab 2 — Data Catalog

This is the structured-data view — what the platform "knows about" beyond documents.

**Layout**: grid of data source cards, 3 per row, ~9-12 cards total.

Each card shows:
- Icon + source name (e.g. **POS — Square**)
- Status pill: 🟢 *Connected · syncing every 5 min*
- 3 stat lines:
  - Last record: *2 minutes ago*
  - Records ingested today: *3,847*
  - Used by: M1, M2, M3 (chip badges)
- Small "View schema →" link at the bottom (clicking opens a side drawer with a mock schema table — column name, type, example value)

Sources to include (9 cards):

1. **POS — Square** · Connected · Used by M1, M2, M3
2. **CRM — Mailchimp Audience** · Connected · Used by M2, M3
3. **WMS — Cloud Inventory** · Connected · Used by M1, M3
4. **P&L — Xero accounting** · Connected · Used by M3
5. **Weather API — OpenWeather** · Connected · Used by M1
6. **Events Calendar — Bali Cultural Cal** · Connected · Used by M1, M2
7. **Email Platform — Mailchimp Campaigns** · Connected · Used by M2
8. **HR System — internal sheet** · 🟡 *Manual sync — last 4 days ago* · Used by M3
9. **Supplier Invoices — Email scrape** · 🟡 *Weekly sync* · Used by M3

The two "🟡" cards (manual / weekly sync) are intentional — they preview future-improvement opportunities ("Wave 2: automate supplier invoice ingestion") without saying it explicitly. A presenter can point this out as evidence of platform-thinking.

A header bar above the grid:
- Total active sources: **9**
- Health: **7 live, 2 manual**
- Last full pipeline run: **5 minutes ago**

---

## PART C — BI-DIRECTIONAL NAVIGATION (the "wow" of this iteration)

This is the connective tissue between M3 and Data tab. Implement carefully.

### C1. M3 → Data (drill into source)

Three entry points from M3:

**C1a. Citation chip click**
Click on any citation chip (e.g. `📄 P&L_W22_Seminyak.pdf · page 3`):
- Navigate to Data tab → Knowledge Base
- Auto-select that file
- Scroll the document viewer to the cited section
- Highlight the cited passage with the accent color background
- Show the floating "cited in: [message] ↗" chip described in B2

**C1b. "View underlying data" button** (in Example 3 — Kuta scenario)
- Click → navigate to Data tab → Data Catalog
- Pre-filter to show only sources used in that answer (P&L Xero + Labor Schedule + CRM)
- A small banner at top: *"Filtered to data behind: 'Kuta Monday closure analysis' — Clear filter"*

**C1c. Anomaly card "Open in Data tab →" button**
- Click → navigate to Data tab → Knowledge Base
- For the Canggu waste alert: open `Waste_Log_Canggu_W22.csv` with the waste spike rows highlighted
- For the Sanur margin alert: open `Supplier_Invoices_May.pdf` with the butter price line highlighted

### C2. Data → M3 (find usages)

Two entry points from Data tab:

**C2a. "Open in M3 →" button** in the document viewer header
- Click → navigate to M3
- Pre-load a suggested prompt: *"Show me what you learned from [filename]"*
- Below the chat input, show recent agent messages that cited this document (max 3, with "go to message" links)

**C2b. Citation badge click** (the blue "cited 4× this week" badge in the file list)
- Click → navigate to M3
- Filter chat to show **only the messages that cited this document** (other messages hidden, with a "Show all messages" toggle)

### C3. State management

Use simple in-memory state (Zustand, React Context, or whatever matches the existing project). State to track:

```
{
  m3: {
    persona: 'CEO' | 'StoreManager',
    storeManagerLocation: 'Seminyak' | ...,
    scrollToMessageId: string | null,
    filterByCitedDoc: string | null
  },
  dataTab: {
    activeSubTab: 'kb' | 'catalog',
    selectedDocId: string | null,
    highlightRegion: { page: number, anchor: string } | null,
    floatingChip: { message: string, returnToMessageId: string } | null,
    catalogFilter: string[] | null
  }
}
```

Navigation actions update this state, then the sidebar selection change does the rest.

---

## PART D — MOCK DATA STRUCTURE

Add a new file `mockData/knowledgeBase.ts` (or align with existing convention). Structure:

```ts
type DocChunk = {
  id: string
  page: number
  anchor: string  // an HTML id we can scroll to
  highlightText: string  // the text that gets highlighted
  citedByMessageIds: string[]
}

type Document = {
  id: string
  filename: string
  type: 'pdf' | 'xlsx' | 'csv' | 'pptx'
  group: 'financial' | 'operations' | 'hr' | 'policy' | 'analytics'
  description: string
  updatedAt: string  // ISO
  citationCount: number
  body: DocumentBody  // see below
  chunks: DocChunk[]
}

type DocumentBody =
  | { kind: 'pdf', pages: PdfPage[] }
  | { kind: 'spreadsheet', sheets: SheetData[] }
  | { kind: 'csv', headers: string[], rows: string[][] }
```

For each of the 17 documents listed in B2, provide a `Document` object with:
- A realistic `body` (at least 1 page / 1 sheet / 10+ rows — enough to look real, not so much it becomes work).
- 1-3 `chunks` per document with `highlightText` taken from realistic content.
- `citedByMessageIds` matching the 5 M3 conversation examples.

For chat messages in M3, structure them so each message has:
```ts
type Message = {
  id: string
  persona: 'CEO' | 'StoreManager'
  role: 'user' | 'agent'
  content: string  // or structured content for the agent answers
  citations?: { docId: string, page?: number, anchor: string }[]
  storeManagerLocation?: string  // for SM messages
}
```

This is the data model that makes bi-directional navigation work cleanly. Get this right and the UI is straightforward.

---

## PART E — DEMO SCRIPT NOTES (for the README)

Add a section to the existing README titled **"M3 + Data tab demo flow (Iteration 2)"**. Include these scripted talking points the presenter (me) will use:

1. *"Notice the persona toggle. Same platform, different views — a CEO sees chain-level strategy, a store manager sees their own location's daily numbers. We don't build two products; we build one platform with role-aware surfaces."*
2. *"This is the chat agent the RFP asks for. But look at the citations — these aren't text labels. Let me click."* (click → Data tab opens with highlighted region) *"This is the actual document the answer came from. The platform is grounded in the client's real records, not LLM imagination."*
3. *"Now from the other direction — from Data tab back to chat."* (open a file → click "Open in M3") *"Anyone in the team can ask 'what has the agent told us about this document'. Audit trail in both directions, by design — that's the Governance band you saw in the architecture diagram."*
4. *"The Data Catalog tab. 9 sources connected, 7 live, 2 manual. The two manuals — supplier invoices and HR — are exactly the kind of data flow that Wave 2 modules would automate. Today they work, tomorrow they scale."*

---

## PRIORITIES IF TIME RUNS SHORT

In strict order — do not skip earlier to polish later:

1. **A1 + A2 + A3** — Persona switcher + suggested prompts + 5 chat examples. This is the heart of the M3 upgrade.
2. **B1 + B2 (Knowledge Base sub-tab)** — File list + document viewer with at least 5 of the 17 docs working (focus on the ones cited by Examples 1-3).
3. **C1a (citation chip → Data tab with highlight)** — The single most important navigation moment of the demo.
4. **C2a ("Open in M3" button)** — Reverse direction.
5. **B3 (Data Catalog sub-tab)** — Visual only is fine, schema drawer can be static.
6. **C1b + C1c** (other M3 → Data flows) — Nice-to-have.
7. **C2b** (citation badge filter) — Nice-to-have.
8. Polish, animations, edge cases.

---

## DELIVERABLES

When done:
1. The updated codebase, runnable with same command as before.
2. Updated README with the Iteration 2 demo flow section.
3. A one-paragraph note flagging:
   - Any deviation from the existing project's conventions you had to make and why.
   - Any place where the spec was ambiguous and you made a judgment call.
   - Anything you cut due to time/scope and would recommend adding next.

**Confirm the file structure you're going to add before going deep.** Show me the proposed file tree and the mock-data shape for one document, then proceed.
