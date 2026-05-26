# BAKED. AI Platform — Client Demo

15-minute scripted screen-share demo for BAKED. (premium bakery-café chain, 7 locations across Bali and Jakarta). Pitches a unified **AI Platform for F&B Operations** with three Wave 1 modules and a 5-year roadmap.

## Running the demo

```bash
npm install        # first time only
npm run dev        # frontend :5173 + backend :3001
npm run dev:server # backend only
```

> **Iteration 4 — Real LLM setup:** Copy `server.env.example` to `.env` and add your Anthropic API key before running. Without the key the server starts but returns 503 on document uploads; all mock features still work.

```bash
cp server.env.example .env
# edit .env — add ANTHROPIC_API_KEY=sk-ant-...
```

### Restart backend server

```bash
lsof -ti :3001 | xargs kill -9 && npm run dev:server
```

Navigate from the left sidebar in order: Platform Overview → M1 → M2 → M3 → **Data & Knowledge** → Future Modules.

> **What's new in Iteration 2:** M3 has a persona switcher (CEO ↔ Store Manager) with persona-aware suggested prompts and 5 hardcoded example conversations. A new "Data & Knowledge" scene shows the documents and structured sources the agents draw from, with bi-directional navigation: click a citation in M3 to jump to the document with the cited region highlighted; click "Open in M3 →" in a document to filter the chat to messages citing it.
>
> **What's new in Iteration 5 (M3-only):** 5 new features — see [New in Iteration 5](#new-in-iteration-5) section below.
>
> **What's new in Iteration 4 (M3-only):** Document upload + real Gemini API call in M3 chat. Click the paperclip icon (or drag-and-drop) to attach a PDF or image. The backend calls `gemini-1.5-flash` with the file + BAKED business context, returns a structured response (extracted metrics table, cross-references to M1/M2/M3 platform data, confidence badge). A 🟢 Live API badge appears in the M3 header after the first successful call. All existing mock conversations unchanged. Backend runs on port 3001 via Express + multer.
>
> **What's new in Iteration 3 (M3-only):** Four CEO-surface features layered onto M3: (1) Morning Briefing card (1 red / 2 yellow / 1 green) at the top of the CEO view, (2) Compare Locations panel with 2-column pair view + Chain Overview mode + auto-generated explanation, (3) KPI Strip with sparklines and one-click drill-in prompts, (4) Confidence markers on every agent answer (high / medium / low + expandable "why"). Store Manager view gets the one-line briefing + persona-specific KPIs. **M1 and M2 source files were not modified.**

---

## 5-scene demo flow

### Scene 1 — Platform Overview (`/`)
**Talking points:** "We're not building three disconnected scripts — we're building a platform. Everything you see here shares the same data lake, feature store, and LLM gateway. Wave 2-4 modules plug into this foundation at 30-50% the cost." Hover over any architecture block to show the tooltip description. Point out the dashed Wave 2-4 section to signal the 5-year roadmap.

### Scene 2 — M1 Demand Forecasting (`/m1`)
**Talking points:** Click a row in the table — notice Panel B (chart) and Panel C (waste impact) update together. Point out the `?` icon on any row to show the model explains its top 3 drivers ("Saturday uplift · Sunny 31°C · Tourist season"). On the chart, point to the April 12 Galungan miss: "The model predicted high demand because Galungan usually drives traffic — the actual was lower. The model is now learning to distinguish Galungan morning vs. afternoon patterns." Change the location dropdown to show per-location volumes scale. The `24% waste reduction · Rp 8.4M saved` card is the headline number for the client.

### Scene 3 — M2 Customer Intelligence (`/m2`)
**Talking points:** Click the Tourist cohort tile (threshold: >30 days — "shorter window; most leave the island"). Click a tourist-cohort customer row and show the email preview — note the "Welcome back to Bali" tone. Then click a local customer row and note the tone shifts to Bahasa with a 20% off pastry offer. "This isn't a template blast — the tone, offer, and copy are all cohort-aware." Hit Approve to show the human-in-the-loop gate.

### Scene 4 — M3 Financial Agent (`/m3`)
**Talking points (Iteration 2 — persona-aware):** Start on **CEO View** (default). The 3 suggested prompts and 3 pre-populated conversations are all chain-wide strategic queries. Walk through Example 1 (Canggu/Sanur margin drag), Example 2 (Rp 142M stockout loss), Example 3 (Kuta Monday closure scenario — point out the *"View underlying data"* button, which deep-links into the Data Catalog tab filtered to the 3 sources that fed the answer). Then flip to **Store Manager View → Seminyak**. Suggested prompts and conversations change to operational/single-store: yesterday's food cost, weekly waste, Tuesday overstaffing. "Same platform, two role-aware surfaces — not two products." Click any citation chip to jump to the underlying document in the Data tab. Click "Investigate →" on an anomaly to fire a query; click "Open in Data tab →" to deep-link to the raw waste/invoice file with the relevant row highlighted.

### Scene 5 — Data & Knowledge (`/data`) — *new in Iter 2*

**Talking points:** "This is the trust anchor — proof that everything you just saw is grounded in real client documents and pipelines, not LLM imagination."

The scene has two sub-tabs:

- **Knowledge Base** — 17 documents grouped by category (Financial, Operations, HR, Policy, Analytics). Each file shows how many times it was cited this week. Click any file to preview it; clicking the blue *"cited Nx this week"* badge filters M3's chat to only the messages that cited it. Click *"Open in M3 →"* in any document's header to do the reverse: jump to M3 with a pre-loaded "Show me what you learned from \[filename]" prompt.
- **Data Catalog** — 9 connected sources (POS Square, Mailchimp, Cloud Inventory, Xero, OpenWeather, Bali events calendar, Mailchimp campaigns, HR sheet, supplier email scrape). 7 live (green), 2 manual (yellow) — the manuals are intentional, previewing "Wave 2: automate supplier invoice ingestion" without saying it explicitly. Each card has a *"View schema →"* drawer for the structured columns.

### Scene 6 — Future Modules (`/future-modules`)
**Talking points:** "Everything here is indicative and not included in the Wave 1 price. But the point is that we've already built the foundation. Wave 2-4 don't require another greenfield data project — they connect to what's already running. That's the platform value."

---

## M3 Iteration 3 — CEO surface demo flow

The 4-beat sequence to demonstrate iter3 features. Stay on `/m3` the whole time; switch to `/data` only when a citation is clicked.

1. *"Open the platform, switch to CEO view. This is what the founder sees at 7am — not a blank chat box waiting for them to know what to ask. The platform tells them: here's the one red flag, here's two yellows, here's what's going well. Proactive, not reactive."*  *(Point to the Morning Briefing card. Optionally click the chevron to show it collapses to a 1-line summary.)*

2. *"Click Compare. Pick Seminyak and Canggu. Look at this — 37% revenue gap, 12-point margin gap, 62% labor inefficiency. Now click 'Generate explanation.' The agent doesn't just describe what's different — it diagnoses why. Three specific causes, each with a citation."*  *(Use the Compare button next to the persona switcher; the agent reply appears back in chat with a confidence pill attached.)*

3. *"Look at the confidence markers. 🟢 High on the Canggu diagnosis — it's a measurement, not a guess. 🟠 Low on the Kuta Monday scenario — it's untested. Click the pill to see exactly why."* *(Expand the Low badge on the Kuta example to show the "Why low" + "To increase confidence" panel.)*  *"This is the agent telling the truth about what it knows and doesn't. A vendor who hides uncertainty is a vendor who burns you later."*

4. *"Click any KPI tile. Sparkline shows direction over 8 weeks. Click the drill button — turns into a question the agent answers in seconds. CEOs don't write questions, they scan numbers. We built around that."* *(Click "Why?" under Chain margin → prompt loads in the input → presenter hits Send → answer appears with its own confidence marker.)*

---

## M3 + Data tab demo flow (Iteration 2)

A scripted 4-beat sequence that highlights the bi-directional navigation and persona model:

1. **"Notice the persona toggle. Same platform, different views — a CEO sees chain-level strategy, a store manager sees their own location's daily numbers. We don't build two products; we build one platform with role-aware surfaces."** *(Toggle CEO ↔ Store Manager at the top of M3.)*

2. **"This is the chat agent the RFP asks for. But look at the citations — these aren't text labels. Let me click."** *(Click any citation chip in an agent message → Data tab opens with the document and the cited region highlighted in gold.)* **"This is the actual document the answer came from. The platform is grounded in the client's real records, not LLM imagination."**

3. **"Now from the other direction — from Data tab back to chat."** *(In the document viewer header, click "Open in M3 →".)* **"Anyone in the team can ask 'what has the agent told us about this document'. Audit trail in both directions, by design — that's the Governance band you saw in the architecture diagram."**

4. **"The Data Catalog tab. 9 sources connected, 7 live, 2 manual. The two manuals — supplier invoices and HR — are exactly the kind of data flow that Wave 2 modules would automate. Today they work, tomorrow they scale."**

---

## Where to edit mock data

| What to change | File |
|---|---|
| SKU names, quantities, confidence levels, features | `src/lib/data/recommendations.ts` |
| Dormant customer names, scores, email copy | `src/lib/data/customers.ts` |
| Original chat transcript, anomaly alerts, canned responses | `src/lib/data/finance.ts` |
| Persona-aware chat examples + suggested prompts | `src/lib/data/m3Chat.ts` |
| Documents in the Knowledge Base (17 mocks) | `src/lib/data/knowledgeBase.ts` |
| Connected sources in the Data Catalog (9 mocks) | `src/lib/data/dataCatalog.ts` |
| CEO Morning Briefing items + SM one-liner | `src/lib/data/ceoBriefing.ts` |
| KPI strip metrics + sparklines (CEO + SM) | `src/lib/data/m3Metrics.ts` |
| Compare-locations stats matrix + 3 hardcoded explanations | `src/lib/data/comparison.ts` |
| Architecture diagram labels and descriptions | `src/lib/data/architecture.ts` |
| Locations, SKUs, IDR prices, holidays | `src/lib/data/seed.ts` |

## Where to swap the accent colour

All accent usage flows from `--gold` in `src/styles.css` (line ~51):

```css
--gold: oklch(0.74 0.11 80);
```

Change this one value to shift the amber highlight across the entire demo.

---

## Decisions worth revisiting

The routing uses TanStack Router file-based routes (`/m1`, `/m2`, `/m3`, `/future-modules`) rather than a single in-page `useState` switch — this was intentional so the URL changes on screen-share reinforce that it's a real application. If you want a cleaner "single-page" feel with no URL changes, you could replace the sidebar `Link` components with an `onClick` handler and manage scene state with `useState` in a wrapper component, then collapse all routes into `index.tsx`.

The architecture diagram is hand-rolled HTML/CSS rather than a diagramming library (Mermaid, ReactFlow) — this keeps it fully under control for pixel-perfect polish and avoids a new dependency. If the client asks for an editable or zoomable version, ReactFlow would be the natural next step.

The `bunfig.toml` has a 24-hour release-age guard on new packages; no new dependencies were added to avoid triggering it.

---

## Iteration 4 — implementation notes

- **Completed fully.** Backend (Express + multer + Anthropic SDK) at `server/`, frontend upload UI wired into M3 chat input. Real API call → structured `document-analysis-result` message bubble with extracted metrics table, cross-reference badges, citation row, confidence badge (reuses iter3 component). Live API / Mock data transparency badges in M3 header.
- **No streaming.** Standard JSON response per spec. Cycling thinking animation ("Reading document… → Extracting data… → Cross-referencing platform metrics…") gives visual feedback while waiting.
- **API key not yet set.** Build and all mock features work without the key. Backend returns 503 with friendly error message in chat when key is missing. Add key to `.env` when ready to demo the real call.
- **Model used.** `claude-sonnet-4-20250514` as specified. Native PDF + image support via Anthropic's document/image content blocks — no pre-processing.
- **Server runs as a separate process.** `npm run dev` starts both via `concurrently`. Old `dev:frontend` alias still works standalone if backend not needed.
- **M1/M2 untouched.** Only `src/routes/m3.tsx`, `src/lib/data/finance.ts`, `src/services/analyzeApi.ts`, and the new `src/components/m3/document-analysis-bubble.tsx` were added/modified.
- **What I would add next.** (a) What-If panel (iter3 placeholder now ready to replace). (b) Streaming response — swap `response.json()` for a streaming fetch and show text token by token. (c) Save uploaded documents to the Knowledge Base as new entries so they appear in the Data tab.

### Demo script for iter4

*"Phần này không phải mock. Tôi sẽ upload file thật — bất kỳ PDF hoặc ảnh nào."* *(Click paperclip hoặc drag-drop file vào chat.)* *"Gõ câu hỏi, nhấn send. Đây là live call đến Anthropic Claude API — agent đọc document, cross-reference với data platform, trả lời trong context BAKED. Badge xanh 'Live API' xuất hiện sau call đầu tiên."*

### Test files for demo

Place in `/demo-assets/` (add to `.gitignore`):
- **PDF financial report** → ask: *"What's our food cost and how does it compare to target?"*
- **Screenshot/photo of invoice or dashboard** → ask: *"Is this butter price higher than usual? How does it affect our margin?"*
- **Store interior or product photo** → ask: *"What do you see, and is there anything operationally relevant?"* ← wow moment

### What's real vs mock

| Feature | Status |
| --- | --- |
| Document upload → Claude API → structured response | **REAL** |
| All M3 chat history (examples 1–5, CEO + SM) | Mock |
| Morning Briefing, KPI Strip, Compare Locations | Mock |
| M1 Demand Forecasting, M2 Customer Intelligence | Mock |

---

## Iteration 3 — implementation notes

A one-paragraph summary of completion status, judgment calls, and what would come next:

- **Completed fully.** All 4 features shipped end-to-end: Morning Briefing (CEO card with red/yellow/green sections and action buttons; SM single-line variant), Compare Locations (2-column pair view, Chain Overview mode, 3 hardcoded explanation narratives + generic fallback, Generate-explanation flow that closes the panel and appends a confidence-tagged agent reply to chat), KPI Strip (4 persona-aware tiles with SVG sparklines and drill-in prompts), Confidence markers (top-level `confidence` field on `ChatMessage`, applied to all 5 iter2 examples + Compare-explanation replies; pill renders inline after the headline, click to expand "Why" + "To increase").
- **Layout deviation.** Spec wording placed both Briefing and KPI strip "inside the chat panel". Both were rendered as full-width bands above the chat-grid instead. Reason: 4 tiles × 280px = 1120px doesn't fit inside the ~760px chat column once the 340px anomaly sidebar is accounted for. Confirmed with stakeholder before implementing.
- **Single source of truth for metrics.** Briefing's green item ("chain margin 61%") and the KPI tile both read from `src/lib/data/m3Metrics.ts`. Tweak the value in one place and both stay consistent.
- **What-If button is a placeholder.** Per spec, the briefing's "Run 'what if' on menu price →" button currently dispatches `insertPrompt` with the relevant question. The real What-If panel is deferred to iter 4 — annotated in `ceoBriefing.ts`.
- **M3 only, M1/M2 untouched.** No files under `src/routes/m1.tsx`, `src/routes/m2.tsx`, `src/lib/data/recommendations.ts`, or `src/lib/data/customers.ts` were modified. The "powered by M1 forecast" line in the briefing footer is plain text — no live link.
- **What I would add next.** (a) The What-If panel (raise menu price, close a location, change supplier) with side-by-side P&L projections — natural iter 4. (b) Briefing personalisation: pull the CEO's name from a profile store, learn which sections they expand most. (c) KPI tile click could optionally also send the prompt (toggle) — currently insert-only, intentionally giving presenter control during demo.

---

## Iteration 2 — implementation notes

A one-paragraph summary of deviations, ambiguities, and what was cut:

- **State management.** The spec offered Zustand, React Context, or "whatever matches the project". Project had no global state lib, so a React Context (`src/lib/app-nav-context.tsx`) was added rather than introducing a new dep — keeps `bunfig.toml`'s release-age guard happy and matches the lightweight convention.
- **Old chat history preserved.** Per choice, the original 6 messages in `CHAT_HISTORY` and the 4 `CANNED_RESPONSES` (used for live keyword-matched typing) were kept. The 6 legacy messages were retroactively persona-tagged (margin question → Store Manager Seminyak; waste-ranking → CEO; Ubud cost spike → Store Manager Ubud) so they fit cleanly into the new persona filtering.
- **Default document selection.** Spec called for `P&L_W22_Seminyak.pdf` as default, but the 5 new examples don't cite this exact file. The default was kept and the file's body was hardcoded to contain a "By location" page that matches Example 1's narrative — so opening it directly from the sidebar still looks demo-relevant.
- **Highlight matching.** The spec described "highlighted citation regions" by `(page, anchor)`. To keep mock data terse, anchors are loose keywords matched inside the rendered body (heading text, callout content, row substrings) — easy to extend but not bullet-proof if a doc gains conflicting content.
- **Animations.** No new animations beyond the gold ring-flash on the target message when jumping back from Data → M3 — kept minimal to stay within the existing aesthetic.
- **What was cut / would add next.** (a) The "messages that cited this document (max 3)" list under the chat input in C2a — the *pendingPrompt* is loaded into the input box but the recent-citation list under it was deemed lower value than the prompt itself. Easy add. (b) The Catalog filter in C1b shows the 3 source cards but doesn't animate them in — a soft fade would polish. (c) The Knowledge Base file search box is filename + description substring only; full-text body search would be a real RAG-like demo move.

---

## New in Iteration 5

### Store Manager Daily Checklist
Switch to Store Manager persona → see today's 3 action items instead of the CEO Morning Briefing.
Checklist changes per location (all 7 hardcoded). Checkboxes persist in `localStorage` and reset daily.
Each item has an **[Ask agent →]** button that injects a pre-written prompt into the chat input (doesn't auto-send).

### What-if Scenario Simulator
CEO view → click **⚡ What-if** button → pick scenario type → fill parameters → see P&L impact.
4 scenario types: price change (slider −20% to +20%), close a day (7 days × 7 locations), staffing (FTE slider), cut/add SKU.
Each result shows a P&L table, key assumptions, and a recommendation with a confidence marker.
"Ask follow-up in chat →" closes the panel and injects the context into chat.

### Photo Waste Logging
Store Manager → click **🗑️** button next to the paperclip → upload waste photo → Gemini identifies items, estimates quantities and cost → confirm to save.
Saved to SQLite `waste_logs` table with `confirmed = 1` after user taps confirm.

### Proactive Trend Alerts
New **Trend watch** section below the Active Alerts sidebar.
Shows multi-week direction (rate + consecutive weeks) + projection: `Current → Projected by [date]`.
Persona-aware: CEO sees all 7 locations; Store Manager sees only their location's trends.
Includes 1 positive trend (green) alongside problem trends.

### Conversation Memory (SQLite)
Chat history persists across page refreshes via SQLite at `server/data/baked.db` (gitignored).
Every user and agent message is saved with session ID, persona, and message type.
Memory badge in the M3 header shows message count; click to see session start time, topics, and a **Clear memory** button.
Context injection is save-only in this iteration — summarization shipped as stubs.

---

## Demo talking points (Iteration 5)

1. **"Switch to Store Manager. Instead of a blank chat, they see three things to do today — specific, actionable, sourced from yesterday's data. No WhatsApp from the CEO needed."**

2. **"Back to CEO. I want to model a scenario — what if we raise croissant prices 10%? [click What-if → fill form → run] Here's the P&L impact with a confidence range and assumptions listed. This is what the CEO runs before a board meeting."**

3. **"Now watch this — store manager takes a photo of end-of-day waste. [upload photo] Agent identifies each item, estimates cost, recommends tomorrow's production. One tap to confirm and it's logged. No spreadsheet."**

4. **"Trend watch — this is different from anomalies. Anomalies tell you what went wrong this week. Trends tell you what's going wrong over 5 weeks. Ubud margin is down 1pt every week. At this rate, below target in 3 weeks. That's the difference between reactive and proactive."**

5. **"And notice this badge — N messages remembered. [click badge] Session started at 9am. The agent knows what we discussed. Next time I log in, it picks up where we left off."**

---

## Implementation notes (Iteration 5)

- **Mock data location:** `src/lib/data/` (project convention), not a new root-level `mockData/` folder.
- **SQLite:** `better-sqlite3` synchronous driver. DB at `server/data/baked.db` (created on first `npm run dev`). WAL mode enabled.
- **What-if context injection:** Scenario results close the panel and inject a follow-up prompt into chat. Not yet saved to memory as `message_type: 'scenario'` — that's the next step.
- **Waste log confirm:** Calls `POST /api/waste-log/:id/confirm`. If backend is down, toast shows an error but UI remains usable.
- **Memory context injection:** Save-only this iteration. The `buildContextMessages` + `generateSummary` flow is designed but not yet wired into `/api/analyze` calls — next iteration.
- **What to build next:** (a) Context injection into every Gemini call, (b) scenario result saved as `message_type: 'scenario'` for cross-session memory, (c) "Updated just now" badge on waste CSV in the Data Catalog tab after logging, (d) Morning Briefing "Continuing from yesterday…" line when session has >5 prior messages.
