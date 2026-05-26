# BAKED. — System Architecture & Data Flow

Tài liệu này mô tả toàn bộ data flow của project. Đọc theo thứ tự từ trên xuống để hiểu big picture trước, chi tiết sau.

---

## 1. Big Picture — Hai process độc lập

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (User)                           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │           FRONTEND  (Vite + React)  :5173               │   │
│   │                                                         │   │
│   │   Routes: /  /m1  /m2  /m3  /data  /future-modules     │   │
│   │   State:  AppNavProvider (React Context)                │   │
│   │   UI:     Radix UI + Tailwind CSS                       │   │
│   └────────────────────────┬────────────────────────────────┘   │
│                            │  HTTP (fetch / FormData)           │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    localhost:3001
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              BACKEND  (Express.js)  :3001                       │
│                                                                 │
│   POST /api/analyze          → analyzeDocument() → Gemini API  │
│   POST /api/waste-log        → analyzeWaste()    → Gemini API  │
│   POST /api/waste-log/:id/confirm                              │
│   POST /api/save-message     → SQLite                          │
│   GET  /api/session/:id/stats← SQLite                          │
│   DELETE /api/session/:id    → SQLite                          │
│                                                                 │
│   Services: db.ts (SQLite)   claude.ts (Gemini wrapper)        │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
   ┌──────────▼──────────┐      ┌──────────▼──────────┐
   │   Google Gemini API │      │  SQLite (baked.db)  │
   │  gemini-3-flash-    │      │  server/data/       │
   │  preview            │      │  (gitignored)       │
   └─────────────────────┘      └─────────────────────┘
```

**Draw.io tip:** Dùng 3 swimlane ngang: Browser | Backend | External Services. Mỗi box là 1 process/service.

---

## 2. Frontend — Routing & Component Tree

```
src/routes/__root.tsx
└── QueryClientProvider         (React Query — data fetching cache)
    └── AppNavProvider          (global state — xem mục 4)
        ├── <Outlet />          (route hiện tại render vào đây)
        └── <Toaster />         (toast notifications toàn app)

Routes (file-based, TanStack Router):
  /                → src/routes/index.tsx
  /m1              → src/routes/m1.tsx          ← KHÔNG CHỈNH SỬA
  /m2              → src/routes/m2.tsx          ← KHÔNG CHỈNH SỬA
  /m3              → src/routes/m3.tsx          ← module chính
  /data            → src/routes/data.tsx
  /future-modules  → src/routes/future-modules.tsx
```

**Lưu ý quan trọng:** File `src/routeTree.gen.ts` được **tự động sinh** bởi TanStack Router plugin. Không sửa tay.

---

## 3. M3 Component Tree — module phức tạp nhất

```
M3FinancialAgent  (src/routes/m3.tsx)
│
├── State sở hữu:
│   ├── liveMessages[]       — tin nhắn được thêm trong phiên
│   ├── inputValue           — nội dung ô chat
│   ├── uploadedFile         — file đang chờ gửi
│   ├── uploadMode           — "doc" | "waste-log"
│   ├── thinking / isAnalyzing
│   └── sessionId            — UUID từ localStorage
│
├── PageHeader
│   ├── PersonaSwitcher      — CEO ↔ StoreManager
│   ├── MemoryBadge          — đếm messages trong SQLite, nút clear
│   └── [CEO only] ⚡ What-if button  →  openWhatIfView()
│
├── LEFT PANEL (briefing + checklist)
│   ├── [CEO]  MorningBriefing     — src/components/m3/morning-briefing.tsx
│   └── [SM]   StoreChecklist      — src/components/m3/store-checklist.tsx
│
├── CENTER PANEL (main content — 3 chế độ, chỉ 1 hiển thị)
│   ├── [whatIfMode=true]    WhatIfPanel     — src/components/m3/what-if-panel.tsx
│   ├── [compareMode≠'off']  ComparePanel    — src/components/m3/compare-panel.tsx
│   └── [default]            Chat Panel
│       ├── messages.map → ChatBubble | AgentBubble | WasteLogBubble
│       ├── [SM only] 🗑️ waste-log trigger
│       ├── 📎 doc upload trigger
│       └── Send button
│
└── RIGHT PANEL (sidebar)
    ├── AnomalySidebar       — danh sách ANOMALY_ALERTS
    └── TrendWatch           — src/components/m3/trend-watch.tsx
```

---

## 4. State Management — AppNavProvider

Không dùng Zustand. Tất cả cross-component state nằm trong 1 React Context.

```
AppNavProvider  (src/lib/app-nav-context.tsx)
│
├── M3State
│   ├── persona: "CEO" | "StoreManager"
│   ├── smLocation: StoreLocation          — vị trí SM đang xem
│   ├── compareMode: "off"|"pair"|"chain"  — so sánh 2 chi nhánh
│   ├── whatIfMode: boolean                — hiển thị What-if panel
│   ├── pendingPrompt: string | null       — prompt chờ inject vào chat input
│   ├── scrollToMessageId: string | null   — auto-scroll đến message
│   └── filterByCitedDoc: string | null    — lọc chat theo doc được cite
│
├── DataTabState
│   ├── activeSubTab: "kb" | "catalog"
│   ├── selectedDocId: string | null
│   ├── highlightRegion                    — highlight vùng trong PDF viewer
│   ├── floatingChip                       — chip nổi "View in context"
│   └── catalogFilter: string[] | null     — filter Data Catalog
│
└── Actions (functions)
    ├── openCompareView(mode, leftId, rightId)
    ├── closeCompareView()
    ├── openWhatIfView() / closeWhatIfView()
    ├── setPendingPrompt(text)             — M3 đọc + clear bằng consumePendingPrompt()
    ├── openDocFromCitation(...)           — M3 → /data tab
    └── openDocFromAnomaly(...)            — Sidebar → /data tab
```

**Cách dùng trong bất kỳ component nào:**
```ts
const { m3, setPersona, openWhatIfView } = useAppNav()
```

---

## 5. Chat Data Flow — 3 đường đi khác nhau

### Path A: Tin nhắn thông thường (mock / keyword matching)

```
User gõ → handleSend()
    │
    ├── Thêm userMsg vào liveMessages (hiển thị ngay)
    │
    ├── saveMessageToDb("user", content)     → POST /api/save-message → SQLite
    │
    ├── Tìm keyword match trong CANNED_RESPONSES (src/lib/data/finance.ts)
    │   ├── Tìm thấy  → dùng response có sẵn (hardcoded AgentMessageContent[])
    │   └── Không thấy → dùng fallback response mặc định
    │
    ├── Thêm agentMsg vào liveMessages
    │
    └── saveMessageToDb("agent", content)    → POST /api/save-message → SQLite
```

### Path B: Upload document (gọi Gemini thật)

```
User chọn file (PDF/image) + gõ câu hỏi → handleSend()
    │
    ├── Thêm userMsg vào liveMessages
    ├── setIsAnalyzing(true) → hiển thị ThinkingDotsAnalyzing spinner
    │
    ├── callAnalyzeApi({ file, question, persona, activeLocation, sessionId })
    │   └── src/services/analyzeApi.ts
    │       └── POST http://localhost:3001/api/analyze  (multipart/form-data)
    │           │
    │           └── server/routes/analyze.ts
    │               ├── multer → req.file.buffer (in-memory, không lưu disk)
    │               ├── analyzeDocument(params)
    │               │   └── server/services/claude.ts
    │               │       ├── buildSystemPrompt(persona, location)
    │               │       ├── Gửi base64 file + question → Gemini API
    │               │       └── Parse JSON response → AnalyzeResult
    │               ├── [nếu có sessionId] saveMessage() × 2 → SQLite
    │               └── res.json(result)
    │
    ├── Tạo agentMsg với type "document-analysis-result"
    ├── setLiveApiActive(true)  → hiển thị badge "Live API"
    └── Thêm agentMsg vào liveMessages
```

### Path C: Photo waste log (F3 — SM only)

```
SM click 🗑️ → chọn ảnh (images only) → handleSend()
    │
    ├── Thêm userMsg vào liveMessages
    ├── setIsAnalyzing(true)
    │
    ├── POST http://localhost:3001/api/waste-log  (multipart/form-data)
    │   │   Body: { file: imageFile, location, sessionId }
    │   │
    │   └── server/routes/waste-log.ts
    │       ├── multer (images only, in-memory)
    │       ├── analyzeWaste({ fileBuffer, mimeType, location })
    │       │   └── server/services/claude.ts
    │       │       ├── WASTE_SYSTEM_PROMPT (khác với analyze prompt)
    │       │       ├── Gửi ảnh → Gemini API
    │       │       └── Parse JSON → WasteLogResult
    │       ├── saveWasteLog() → SQLite (confirmed=0)
    │       └── res.json({ logId, wasteItems, totalCost, ... })
    │
    ├── Tạo agentMsg với type "waste-log-result"
    │   └── Render ra WasteLogBubble (bảng có thể edit số lượng)
    │
    └── User click "Confirm & Save"
        └── POST /api/waste-log/:id/confirm → confirmWasteLog() → SQLite (confirmed=1)
```

---

## 6. Session & Memory (F5 — SQLite)

```
localStorage["baked_session_id"] = "session_1748123456_abc1234"
        │
        │  (đọc 1 lần khi M3 mount, useMemo)
        ▼
sessionId  ──────────────────────────────────────────────────────►
        │                                                          │
        │  (gửi kèm mọi API call)                                 │
        ▼                                                          ▼
POST /api/save-message                             POST /api/analyze
POST /api/waste-log                                (sessionId trong FormData)
        │
        ▼
   SQLite  baked.db
   ┌──────────────────────────────────────────────────────┐
   │  sessions         id | persona | location | created  │
   │  messages         id | session_id | role | content   │
   │                      | citations | confidence | type │
   │  waste_logs       id | session_id | location | items │
   │                      | total_cost | confirmed        │
   │  session_summaries  session_id | summary | msg_count │
   └──────────────────────────────────────────────────────┘
        │
        ▼
MemoryBadge  polls GET /api/session/:id/stats  mỗi 15 giây
→ hiển thị số message đã lưu
→ nút "Clear" → DELETE /api/session/:id → clearMessages()
```

**Lưu ý:** Context injection (đưa messages cũ vào Gemini call) **chưa implement**. Hiện tại chỉ save, không inject.

---

## 7. Cross-Scene Navigation (M3 ↔ /data tab)

Đây là flow phức tạp nhất — user click citation trong M3, app nhảy sang /data tab đúng trang.

```
[M3] User click citation chip
        │
        └── openDocFromCitation({ docId, page, anchor, sourceMessageId, ... })
                │   (function trong AppNavProvider)
                │
                ├── Lưu vào DataTabState:
                │   ├── selectedDocId = docId
                │   ├── highlightRegion = { page, anchor }
                │   └── floatingChip = { message: "Return to M3", returnToMessageId }
                │
                ├── Lưu vào M3State:
                │   └── filterByCitedDoc = docId   (lọc chat chỉ show messages cite doc này)
                │
                └── navigate("/data")   (TanStack Router)

[/data tab] mount
        ├── Đọc DataTabState.selectedDocId → mở đúng document
        ├── Đọc DataTabState.highlightRegion → scroll đến đúng trang/anchor
        └── Hiển thị FloatingChip "← Back to M3"

[/data tab] User click FloatingChip
        └── openM3AtMessage({ messageId: floatingChip.returnToMessageId })
                ├── navigate("/m3")
                └── M3State.scrollToMessageId = messageId
                    → useEffect trong M3 scroll + flash message
```

---

## 8. Mock Data vs Real Data

| Nguồn dữ liệu | Loại | File |
|---|---|---|
| Chat examples (5 conversations) | Hardcoded | `src/lib/data/m3Chat.ts` |
| Keyword-matched responses | Hardcoded | `src/lib/data/finance.ts` → `CANNED_RESPONSES` |
| Anomaly alerts | Hardcoded | `src/lib/data/finance.ts` → `ANOMALY_ALERTS` |
| Morning briefing (CEO) | Hardcoded | `src/lib/data/ceoBriefing.ts` |
| Trend alerts (F4) | Hardcoded | `src/lib/data/trendAlerts.ts` |
| What-if results (F2) | Hardcoded formulas | `src/lib/data/whatIfScenarios.ts` |
| Daily checklist (F1) | Hardcoded | `src/lib/data/storeManagerChecklist.ts` |
| Knowledge Base docs | Hardcoded | `src/lib/data/knowledgeBase.ts` |
| Document analysis | **Gemini API thật** | `server/services/claude.ts` |
| Waste photo analysis | **Gemini API thật** | `server/services/claude.ts` |
| Chat session history | **SQLite thật** | `server/services/db.ts` |

---

## 9. Hướng dẫn vẽ draw.io

Gợi ý layout để vẽ lại toàn bộ:

**Diagram 1 — System Overview (Big Picture)**
- 3 cột dọc: `Browser`, `Express Server`, `External`
- Dùng swimlane shape
- Mỗi service là 1 rectangle, arrows là HTTP calls

**Diagram 2 — Chat Flow (3 paths)**
- Dùng flowchart với decision diamond: "Has file?" → "waste-log mode?"
- Mỗi path có màu khác nhau (Path A: xanh lá, Path B: xanh dương, Path C: cam)

**Diagram 3 — State Management**
- 1 box trung tâm `AppNavProvider`
- Các component xung quanh với arrows chỉ hướng đọc/ghi
- Dùng dashed arrows cho "reads", solid arrows cho "writes"

**Diagram 4 — Cross-scene Navigation**
- 2 box lớn: `M3 Route` và `Data Route`
- `AppNavProvider` ở giữa làm cầu nối
- Arrows mô tả thứ tự bước (1. click → 2. update state → 3. navigate → 4. mount → 5. read state)
