# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BAKED. AI Platform — a demo for a premium bakery-café chain (7 locations in Bali and Jakarta). The app has three demo modules (M1, M2, M3) plus a shared platform overview and data scene. All business data is hardcoded mock data for demo purposes.

## Commands

```bash
# Full-stack dev (frontend + Express server concurrently)
npm run dev

# Frontend only (Vite on default port 5173)
npm run dev:frontend

# Backend only (Express on port 3001, hot-reload via tsx watch)
npm run dev:server

# TypeScript check (no emit — run before committing)
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Build (production)
npm run build
```

**Required env vars** — create `.env` at project root:
```
GEMINI_API_KEY=...
SERVER_PORT=3001   # optional, defaults to 3001
```

## Architecture

### Two separate processes

**Frontend** (`src/`) — Vite + TanStack Start (SSR-capable but used as SPA). Runs on port 5173.

**Backend** (`server/`) — Express.js. Runs on port 3001. The frontend calls it at `http://localhost:3001`. Server files use `tsx` at runtime (no transpile step), so Node built-ins like `Buffer` and `process` work without explicit types in tsconfig.

The `tsconfig.json` only `include`s `src/` with `"types": ["vite/client"]` — server files rely on `tsx` for Node types. Pre-existing TS errors in server files about `Buffer`/`process` are expected and harmless.

### Routing

TanStack Router with file-based routes in `src/routes/`:
- `/` — Platform overview
- `/m1` — Demand Forecasting module
- `/m2` — Customer Intelligence module
- `/m3` — Financial Intelligence Agent (the primary interactive module)
- `/data` — Data & Knowledge scene (Knowledge Base + Data Catalog)
- `/future-modules` — Roadmap

Route definitions use `createFileRoute`. The generated route tree is at `src/routeTree.gen.ts`.

### State management

No Zustand. Cross-scene state lives in `AppNavProvider` (`src/lib/app-nav-context.tsx`) — a single React Context wrapping the whole app. It manages:
- **M3State**: persona (CEO | StoreManager), SM location, compare panel mode, what-if panel mode, pending prompt injection, scroll-to-message, doc citation filter
- **DataTabState**: active sub-tab, selected KB doc, highlight region, floating chip, catalog filter

Use `useAppNav()` to read/write this state from any component.

### M3 module structure

`src/routes/m3.tsx` is the main module (~1200 lines). Key functions:
- `M3FinancialAgent` — the page component; owns chat state, file upload state, session ID
- `AgentBubble` — renders structured `AgentMessageContent[]` (discriminated union)
- `WasteLogBubble` — editable waste confirmation table, calls `POST /api/waste-log/:id/confirm`
- `MemoryBadge` — polls `/api/session/:id/stats`, shows message count + clear button
- `AnomalySidebar` — renders `ANOMALY_ALERTS` from `finance.ts`

### Chat content type system

Agent messages use a discriminated union `AgentMessageContent` (in `src/lib/data/finance.ts`). When adding a new structured response type, add a new member to this union. The renderer in `AgentBubble` switches on `type`.

Current types: `text`, `headline`, `table`, `bullets`, `bar-list`, `citations`, `link`, `generic-table`, `ranked-bars`, `paragraphs`, `view-data-button`, `document-analysis-result`, `waste-log-result`.

### Backend services

`server/services/claude.ts` — wraps `@google/generative-ai` (Gemini). Model: `gemini-3-flash-preview`.
- `analyzeDocument()` — document upload + question → structured JSON response
- `analyzeWaste()` — waste photo → structured JSON of identified waste items

`server/services/db.ts` — `better-sqlite3` (synchronous), WAL mode. DB file at `server/data/baked.db` (gitignored). Tables: `sessions`, `messages`, `waste_logs`, `session_summaries`. Call `initDb()` once at startup.

`server/routes/analyze.ts` — `POST /api/analyze` (multipart), calls `analyzeDocument()`.

`server/routes/waste-log.ts` — `POST /api/waste-log` (multipart, images only, multer), calls `analyzeWaste()`, saves to DB. `POST /api/waste-log/:id/confirm` — marks confirmed.

### Mock data location

All hardcoded demo data lives in `src/lib/data/`. Key files:
- `finance.ts` — `CHAT_HISTORY`, `CANNED_RESPONSES`, `ANOMALY_ALERTS`, all content types
- `m3Chat.ts` — `PERSONA_CHAT_HISTORY`, `STORE_LOCATIONS`, persona types, suggested prompts
- `storeManagerChecklist.ts` — F1 checklist items (7 locations × 3 items)
- `trendAlerts.ts` — F4 trend alerts (5 trends, persona-filtered at render time)
- `whatIfScenarios.ts` — F2 what-if result builders
- `ceoBriefing.ts`, `comparison.ts`, `dataCatalog.ts`, `knowledgeBase.ts`, etc.

### Session persistence

`src/utils/session.ts` — `getSessionId()` reads/creates a UUID in `localStorage` (`baked_session_id`). All chat messages are fire-and-forget saved to SQLite via `POST /api/save-message`. Context injection (retrieving past messages to include in Gemini calls) is **not yet implemented** — save-only as of Iter 5.

### M3 persona system

Two personas: **CEO** (cross-location strategic view) and **StoreManager** (single-location operational view). Persona is toggled via `PersonaSwitcher` and stored in AppNav context. Most M3 components accept `persona` and `smLocation` props and render conditionally. Do not mix CEO-only features into SM view or vice versa.

- CEO-only: MorningBriefing, ComparePanel, WhatIfPanel, ⚡ What-if button
- SM-only: StoreChecklist, 🗑️ waste-log button
- Both: TrendWatch (filtered by location for SM), AnomalySidebar, chat panel, MemoryBadge

## Key constraints

**Do not touch M1 or M2 source files** when extending M3 or adding new features. Only extend M3 (`src/routes/m3.tsx`, `src/components/m3/`) and shared services (`src/lib/`, `server/`).

The Gemini system prompt (`server/prompts/system.ts`) hardcodes business context (locations, SKUs, margins, seasonal patterns). Update it when adding scenarios that require new grounding facts.

Checklist checkbox state persists in `localStorage` with key `baked_checklist_${location}_YYYY-MM-DD` and resets daily automatically (the date is part of the key).
