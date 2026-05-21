# Claude Code Prompt — BAKED AI Platform Demo

> Paste toàn bộ phần dưới đây vào Claude Code (cwd = thư mục trống bạn muốn tạo demo).

---

## ROLE & MISSION

You are a senior full-stack engineer + product designer building a **client-facing showcase demo** for an AI platform pitch.

This is **NOT a production build**. It is a **15-minute scripted screen-share demo** that I (the consultant) will present to a client to win an RFP. The goal is to **tell the platform story visually**, not to ship working ML.

**Success metric**: when the client watches me click through this in 15 minutes, they should think *"these people understand our business and have a real architecture, not just three disconnected scripts."*

---

## CONTEXT — READ THIS FIRST

**Client**: BAKED — premium bakery-café chain, 7 locations (6 in Bali, 1 in Jakarta, Indonesia).

**RFP scope (3 modules, fixed price $30-41K)**:
- **M1 — Demand Forecasting & Waste Reduction**: predict daily production per SKU per location, target ≤10% error on top-20 SKUs, 20-30% waste reduction.
- **M2 — Customer Intelligence & Reactivation**: segment CRM, score dormant customers (60/90/120 days), auto-generate email/push campaigns with manual approval.
- **M3 — Financial Intelligence Agent**: private RAG over P&L data, natural language Q&A with citations, anomaly detection for waste spikes / margin compression / cost overruns.

**My strategic reframe (this is the demo's central narrative)**:
We are not building 3 disconnected apps. We are building **an AI Platform for F&B Operations** with 3 launch modules. Future modules (Wave 2-4: staff scheduling, supplier price intelligence, dynamic pricing, loyalty agent, site selection) plug into the same foundation at 30-50% the effort.

**Why this framing wins**: client explicitly mentioned a "3-5 year AI roadmap" and "long-term vendor relationship". A platform pitch positions us as a strategic partner, not a one-off vendor.

**Bali F&B context that must show up in the demo**:
- Tourist seasonality (peak Jun-Aug & Dec-Jan, demand swings 2-3x)
- Cultural events: Nyepi (island shutdown 24h), Galungan, Kuningan
- Customer cohorts: tourist, expat, local, Jakarta visitor (each needs different dormancy threshold)
- Currency: IDR (use realistic Indonesian Rupiah amounts, e.g. Rp 45,000 for a croissant)

---

## DEMO SHAPE (the scripted flow I will present)

The demo is a **single-page app with a left sidebar** representing the unified BAKED platform. Sidebar shows 4 sections in this order:

1. **Platform Overview** (landing — architecture story)
2. **M1 — Demand Forecasting** (Ops workspace)
3. **M2 — Customer Intelligence** (Marketing workspace)
4. **M3 — Financial Agent** (Finance workspace)

Plus a footer item: **"Future Modules"** (Wave 2-4, locked/dashed, for the closing pitch).

I will click through them in order. Each section is a **showcase scene**, not a full app — depth comes from one or two "wow moments" per module, not feature completeness.

### Scene 1 — Platform Overview (landing page)

**Purpose**: anchor the platform narrative before any module.

Content:
- Hero: "BAKED AI Platform — One foundation. Three launch modules. A 5-year roadmap."
- A **visual architecture diagram** (rendered in-page, not an image — use SVG or HTML/CSS) showing 6 layers stacked vertically:
  1. Data sources (POS, CRM, WMS, P&L, Weather, Events) — pill labels
  2. Data foundation (Unified data lake, Schema registry, Data quality, Lineage)
  3. AI/ML core shared services (Feature store, Model registry, **LLM gateway**, Vector store, A2A bus)
  4. AI modules — **M1, M2, M3 highlighted in solid color** as "Wave 1 — RFP scope", plus Wave 2-4 modules in dashed/muted style (Scheduling, Supplier, Pricing, Loyalty, Site selection)
  5. Unified application (Ops dashboard, Marketing console, Finance chat, Mobile)
  6. Users (Operations, Marketing, Finance/Owner)
- A **cross-cutting governance band** along the side or bottom: Access control · Cost tracking · Audit log · Privacy redaction (P&L)
- 3 stat tiles at the bottom:
  - "30-50% lower cost per future module" (vs greenfield)
  - "LLM-agnostic by design" (vendor lock-in mitigation)
  - "Human-in-the-loop by default"

Make the diagram **clean and confident** — this is the slide I'll spend 2-3 minutes on. Wave 2-4 modules should be visually distinct (dashed border, muted color) so it's obvious they're indicative, not quoted.

### Scene 2 — M1 Demand Forecasting

**Purpose**: prove we understand bakery operations + show forecasting output that looks production-grade.

Layout: top filters + 3 panels.

- **Top filter bar**: Location dropdown (Seminyak, Ubud, Canggu, Sanur, Kuta, Uluwatu, Jakarta SCBD), Date range (default: next 7 days), SKU category (All / Bread / Pastry / Cake / Beverage).

- **Panel A — Daily Production Recommendations table** (the hero):
  Columns: SKU | Yesterday actual | Today forecast | Recommended production | Confidence | Δ vs last week | Action
  ~12 rows of realistic bakery SKUs: Sourdough Loaf, Pain au Chocolat, Almond Croissant, Cinnamon Roll, Matcha Cake Slice, Iced Latte, Cold Brew, Avocado Toast, Banana Bread, Brownie, Coconut Cake Slice, Gluten-free Muffin.
  Quantities in units (e.g. 42 → 38), confidence as a colored bar (high/med/low). Action column: "Approve" button (mock) + small "?" tooltip showing top 3 features driving the forecast (e.g. "Saturday • Sunny 31°C • 2 days post-payday").

- **Panel B — Forecast vs Actual chart** for one selected SKU (default: Sourdough Loaf), last 30 days. Line chart with: actual (solid), forecast (dashed), confidence band (shaded). Show the model tracking the actual within ~8% most days, with one obvious miss labeled "Galungan — model now learning".

- **Panel C — Waste Impact card**: "Estimated waste reduction this week: **24%** vs baseline. Saving Rp 8.4M (~$540)." Plus a small sparkline of weekly waste % trending down over the last 8 weeks.

The "wow": clicking on a row in Panel A updates Panel B and Panel C. Show that the model **explains itself** (features in the tooltip) and **quantifies the waste win** (Panel C).

### Scene 3 — M2 Customer Intelligence

**Purpose**: show segmentation + campaign generation, hammer the tourist-cohort insight.

Layout: top cohort summary + two-panel split.

- **Top summary strip**: 4 cohort tiles with counts and dormancy thresholds:
  - 🧳 Tourist (3,420 customers · dormant >30 days) — note: "shorter window; most leave the island"
  - 🏝️ Expat (1,180 · dormant >60 days)
  - 🏠 Local (2,750 · dormant >90 days)
  - ✈️ Jakarta visitor (640 · dormant >45 days)
  Each tile shows count of newly-dormant this week + a small "review" button.

- **Left panel — Dormant Customers ready for reactivation** (table):
  Columns: Name (mock, e.g. "Sarah K.") | Cohort | Last visit | Reactivation score | Suggested offer | Status
  10 rows with mixed cohorts. Score 0-100 with color band. Suggested offer differs by cohort (Tourist: "Welcome back to Bali — 15% off pastries"; Local: "Your favorite Almond Croissant is back, 20% off next visit"; Expat: "We miss you — free coffee with any pastry").

- **Right panel — Campaign Preview** (updates when a row is clicked):
  Shows: customer summary (cohort, lifetime value Rp, top 3 products), then a **generated email** (subject + body, ~80 words, personalized with name + favorite product + offer + location), then channel routing (Email + Push — toggleable). Footer: "Awaiting approval" + Approve / Edit / Reject buttons.

The "wow": clicking different cohorts shows the **offer and tone change**. Demonstrates the platform actually uses cohort intelligence, not a one-size-fits-all template.

### Scene 4 — M3 Financial Agent

**Purpose**: show the chat interface + anomaly alerts in one screen. This is the most visually striking module — lean into it.

Layout: chat (60% width) + anomaly sidebar (40%).

- **Chat panel**:
  - 3 suggested prompts as chips at the top:
    - "What was our margin at Seminyak last week?"
    - "Which product has the highest waste-to-revenue ratio?"
    - "Why did Ubud's food cost spike on Tuesday?"
  - Pre-populated conversation (so I can scroll through during demo) showing:
    1. User asks margin question → agent replies with a structured answer: a one-line headline ("Seminyak last week: 62% gross margin, down 4pts vs prior week"), a small table of contributing factors, and **citation chips** ("Source: P&L W21 Seminyak", "Source: Waste log W21").
    2. User asks waste-to-revenue → agent shows ranked list with bars, top offender highlighted.
    3. User asks "why did Ubud spike" → agent shows a brief causal explanation with 2-3 cited sources and a "View raw data" link.
  - Input box at the bottom (functional UI, doesn't need to actually call an LLM — typing a new message can append a hardcoded plausible response after a 1-second "thinking" animation).

- **Anomaly sidebar**:
  Header: "Active alerts (3)"
  3 alert cards:
  - 🔴 "Canggu — waste spiked to 18% (baseline 9%). Driven by overproduction of Matcha Cake on Mon-Wed." [Investigate]
  - 🟡 "Sanur — gross margin -3.2pts WoW. Cost of butter up 12%." [Investigate]
  - 🟡 "Jakarta SCBD — Iced Latte sales -22% vs forecast for 4 consecutive days." [Investigate]
  Each card has timestamp, severity, one-line cause hypothesis, and an action button.

The "wow": citations in the chat (proves it's grounded, not hallucinating) + anomaly cards that **propose a hypothesis**, not just flag a number.

### Scene 5 — Future Modules (closing pitch)

**Purpose**: the upsell setup. Visual only, no interaction.

A gallery of 6 "coming next" tiles, all in dashed/locked style:
- Wave 2: Staff Scheduling · Supplier Price Intelligence · Dynamic End-of-Day Pricing
- Wave 3: Loyalty Agent (multilingual) · POS Menu Personalization
- Wave 4: New Location Site Selection

Each tile: icon, name, one-line value prop, small badge ("Wave 2 — Q3 2026" etc., all indicative).

Bottom banner: "**Built on the same foundation. 30-50% lower cost per module after Wave 1.**"

---

## VISUAL DESIGN DIRECTION

This is for a **premium bakery-café client** that values polish. The demo needs to feel **calm, modern, and confident** — not flashy SaaS-startup.

- Palette: warm neutrals (cream, sand, charcoal) + one accent color (a muted orange/amber, evoking bakery + the Wave 1 highlight in the architecture diagram). Use a sparse, intentional palette — no rainbow dashboards.
- Typography: clean modern sans (Inter, Geist, or similar). Generous spacing. No emojis except where specified (cohort icons in M2, alert dots in M3).
- Layout: lots of whitespace. Cards with subtle borders, not heavy shadows.
- Charts: minimal, no chart-junk. Soft gridlines, clear labels.
- Avoid: gradient hero backgrounds, generic startup illustrations, stock icons everywhere.

The visual quality bar is **"this looks like a product that already exists"**, not "this looks like a prototype".

---

## TECHNICAL REQUIREMENTS

- **You pick the stack** — choose what gives the best polish-per-hour ratio. Modern React-based is expected. Use a component library only if it accelerates polish, not slows you down.
- **Single-page demo**: the 4 scenes + future-modules view are switched via sidebar nav, in-page state, no routing complexity needed (but you can add routes if it's cleaner).
- **Mock data, hardcoded**: all numbers, names, charts, and chat responses are static. No backend, no API calls, no real LLM. Inline the mock data in a `mockData.ts` (or similar) so I can tweak numbers before the demo.
- **Runs locally with one command** (e.g. `npm run dev`) and opens on a clean URL. Include a one-paragraph README with: how to run, where to edit mock data, where to swap the accent color.
- **English UI** throughout. Use IDR for currency. Indonesian location names spelled correctly (Seminyak, Ubud, Canggu, Sanur, Kuta, Uluwatu).
- Build for **desktop screen-share** (1440px+ width is the target). Doesn't need to be mobile-responsive.

---

## WHAT TO PRIORITIZE IF TIME RUNS SHORT

In order of importance (do not skip the earlier items to polish the later ones):

1. **Scene 1 architecture diagram** — this is the narrative spine. It must look credible.
2. **Scene 2 Panel A + Panel C** (forecast table + waste impact card) — the M1 hero.
3. **Scene 3 cohort tiles + campaign preview** — the M2 hero.
4. **Scene 4 chat with citations + anomaly cards** — the M3 hero.
5. **Scene 5 future modules gallery** — visual only, can be simple.
6. Chart interactivity in Scene 2 Panel B (nice-to-have, OK if static).
7. "Type a new message" interaction in Scene 4 (nice-to-have, OK if just suggested-prompts work).

---

## DELIVERABLES

When done, give me:
1. The full project, runnable with one command.
2. A short README (in the project root) covering: run instructions, the 4-scene demo flow with talking-point hints for each scene (1-2 lines each), and where to edit mock data.
3. A one-paragraph note flagging any decisions you made that I might want to revisit.

Start by sketching the file structure and the sidebar/scene component skeleton, then build Scene 1 (architecture diagram) first since everything else hangs off that narrative. Confirm the structure with me before going deep on the other scenes if you have any major doubts; otherwise, proceed and show me the result.
