import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
  Send,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  Database,
  X,
  ArrowRight,
  Scale,
  Paperclip,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { DocumentAnalysisBubble } from "@/components/m3/document-analysis-bubble";
import { PersonaSwitcher } from "@/components/m3/persona-switcher";
import { CitationChip } from "@/components/m3/citation-chip";
import { ConfidenceBadge } from "@/components/m3/confidence-badge";
import { KpiStrip } from "@/components/m3/kpi-strip";
import { MorningBriefing } from "@/components/m3/morning-briefing";
import { SmBriefing } from "@/components/m3/sm-briefing";
import { ComparePanel } from "@/components/m3/compare-panel";
import {
  CHAT_HISTORY,
  ANOMALY_ALERTS,
  CANNED_RESPONSES,
  type ChatMessage,
  type AgentMessageContent,
  type AnomalyAlert,
  type Confidence,
} from "@/lib/data/finance";
import {
  PERSONA_CHAT_HISTORY,
  SUGGESTED_PROMPTS_CEO,
  SUGGESTED_PROMPTS_SM,
  type Persona,
  type StoreLocation,
} from "@/lib/data/m3Chat";
import { buildExplanationMessage, getLocation } from "@/lib/data/comparison";
import { useAppNav } from "@/lib/app-nav-context";
import { analyzeDocument as callAnalyzeApi } from "@/services/analyzeApi";
import { findDocument } from "@/lib/data/knowledgeBase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/m3")({ component: M3FinancialAgent });

// All messages — old CHAT_HISTORY (persona-tagged in finance.ts) + 5 new examples.
const ALL_HISTORY: ChatMessage[] = [...CHAT_HISTORY, ...PERSONA_CHAT_HISTORY];

function messageMatchesPersona(
  msg: ChatMessage,
  persona: Persona,
  smLocation: StoreLocation,
): boolean {
  // Messages without a persona tag are treated as legacy and shown to both.
  if (!msg.persona) return true;
  if (msg.persona !== persona) return false;
  if (persona === "StoreManager" && msg.storeManagerLocation && msg.storeManagerLocation !== smLocation) {
    return false;
  }
  return true;
}

function messageCitesDoc(msg: ChatMessage, docId: string): boolean {
  if (typeof msg.content === "string") return false;
  return msg.content.some(
    (b) => b.type === "citations" && b.chips.some((c) => c.docId === docId),
  );
}

// -----------------------------------------------------------------------------
// Agent message rendering
// -----------------------------------------------------------------------------

function CompactBarItem({ item, maxValue }: { item: { label: string; value: number; highlight?: boolean }; maxValue: number }) {
  const pct = (item.value / maxValue) * 100;
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-36 text-xs text-foreground truncate shrink-0">{item.label}</div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: item.highlight ? "var(--color-destructive)" : "var(--color-walnut)",
              opacity: item.highlight ? 1 : 0.7,
            }}
          />
        </div>
        <span className={cn("num text-xs w-10 text-right", item.highlight ? "text-destructive font-medium" : "text-muted-foreground")}>
          {item.value}%
        </span>
      </div>
    </div>
  );
}

function RankedBarItem({
  item,
  maxValue,
}: {
  item: {
    label: string;
    value: number;
    valueLabel: string;
    sublabel?: string;
    secondaryLabel?: string;
    highlight?: boolean;
  };
  maxValue: number;
}) {
  const pct = (item.value / maxValue) * 100;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="text-xs text-foreground truncate">
          <span className={cn(item.highlight && "font-medium text-ink")}>{item.label}</span>
          {item.sublabel && (
            <span className="text-muted-foreground"> · {item.sublabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.secondaryLabel && (
            <span className="text-[10px] text-muted-foreground bg-secondary/60 border border-border/60 rounded-sm px-1.5 py-0.5">
              {item.secondaryLabel}
            </span>
          )}
          <span className={cn("num text-xs", item.highlight ? "text-ink font-medium" : "text-muted-foreground")}>
            {item.valueLabel}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: item.highlight ? "var(--color-gold)" : "var(--color-walnut)",
            opacity: item.highlight ? 1 : 0.6,
          }}
        />
      </div>
    </div>
  );
}

function toneClass(tone?: "negative" | "positive" | "muted" | "benchmark"): string {
  switch (tone) {
    case "negative":
      return "text-destructive num";
    case "positive":
      return "text-success num";
    case "muted":
      return "text-muted-foreground italic";
    default:
      return "text-foreground";
  }
}

function AgentBubble({
  content,
  messageId,
  messageLabel,
  confidence,
}: {
  content: AgentMessageContent[];
  messageId: string;
  messageLabel: string;
  confidence?: Confidence;
}) {
  const { openCatalogFiltered } = useAppNav();
  const firstHeadlineIdx = content.findIndex((b) => b.type === "headline");
  const hasHeadline = firstHeadlineIdx !== -1;

  const maxBarValue = useMemo(() => {
    const barList = content.find((c) => c.type === "bar-list");
    if (barList && barList.type === "bar-list") return Math.max(...barList.items.map((i) => i.value));
    return 100;
  }, [content]);

  const maxRanked = useMemo(() => {
    const rb = content.find((c) => c.type === "ranked-bars");
    if (rb && rb.type === "ranked-bars") return Math.max(...rb.items.map((i) => i.value));
    return 100;
  }, [content]);

  const citationCount = useMemo(() => {
    const c = content.find((b) => b.type === "citations");
    return c && c.type === "citations" ? c.chips.length : 0;
  }, [content]);

  return (
    <div className="space-y-3">
      {/* Confidence badge at the very top when there's no headline */}
      {!hasHeadline && confidence && <ConfidenceBadge confidence={confidence} />}
      {content.map((block, i) => {
        if (block.type === "text") {
          return <p key={i} className="text-sm text-foreground leading-relaxed">{block.text}</p>;
        }
        if (block.type === "headline") {
          return (
            <div key={i}>
              <div className="font-serif text-[17px] text-ink leading-snug">{block.text}</div>
              {block.badge && (
                <span className="inline-block mt-1 text-[9px] uppercase tracking-[0.16em] bg-secondary border border-border/70 rounded-sm px-1.5 py-0.5 text-muted-foreground">
                  {block.badge}
                </span>
              )}
              {confidence && i === firstHeadlineIdx && <ConfidenceBadge confidence={confidence} />}
            </div>
          );
        }
        if (block.type === "table") {
          return (
            <div key={i} className="overflow-x-auto -mx-0.5">
              <table className="text-xs w-full">
                <thead>
                  <tr className="border-b border-border/70">
                    <th className="text-left py-1.5 pr-4 text-muted-foreground font-normal">Metric</th>
                    <th className="text-right py-1.5 px-2 text-muted-foreground font-normal">W21</th>
                    <th className="text-right py-1.5 px-2 text-muted-foreground font-normal">W20</th>
                    <th className="text-right py-1.5 pl-2 text-muted-foreground font-normal">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-border/30 last:border-0">
                      <td className="py-1.5 pr-4 text-foreground font-medium">{row.metric}</td>
                      <td className="py-1.5 px-2 text-right num">{row.w21}</td>
                      <td className="py-1.5 px-2 text-right num text-muted-foreground">{row.w20}</td>
                      <td className={cn("py-1.5 pl-2 text-right num", row.negative ? "text-destructive" : "text-success")}>
                        {row.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "generic-table") {
          return (
            <div key={i} className="overflow-x-auto -mx-0.5">
              <table className="text-xs w-full">
                <thead>
                  <tr className="border-b border-border/70">
                    {block.headers.map((h, hi) => (
                      <th
                        key={hi}
                        className={cn(
                          "py-1.5 text-muted-foreground font-normal",
                          hi === 0 ? "text-left pr-4" : "text-left px-2",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-border/30 last:border-0">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={cn(
                            "py-1.5",
                            ci === 0 ? "pr-4 text-foreground font-medium" : "px-2",
                            toneClass(cell.tone),
                          )}
                        >
                          {cell.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "bullets") {
          return (
            <ul key={i} className="space-y-1">
              {block.items.map((item, bi) => (
                <li key={bi} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="text-gold mt-1 shrink-0">·</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "bar-list") {
          return (
            <div key={i} className="space-y-0.5">
              {block.items.map((item, bi) => (
                <CompactBarItem key={bi} item={item} maxValue={maxBarValue} />
              ))}
              {block.note && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50 leading-relaxed">
                  {block.note}
                </p>
              )}
            </div>
          );
        }
        if (block.type === "ranked-bars") {
          return (
            <div key={i} className="space-y-0.5">
              {block.items.map((item, bi) => (
                <RankedBarItem key={bi} item={item} maxValue={maxRanked} />
              ))}
              {block.note && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50 leading-relaxed">
                  {block.note}
                </p>
              )}
            </div>
          );
        }
        if (block.type === "paragraphs") {
          return (
            <div key={i} className="space-y-2.5">
              {block.items.map((p, pi) => (
                <div key={pi}>
                  {p.label && (
                    <div className="text-[10px] uppercase tracking-[0.18em] text-walnut mb-0.5">
                      {p.label}
                    </div>
                  )}
                  <p className="text-xs text-foreground leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          );
        }
        if (block.type === "citations") {
          return (
            <div key={i} className="flex flex-wrap gap-1.5 pt-1 items-center">
              {block.chips.map((chip) => (
                <CitationChip
                  key={chip.id}
                  chip={chip}
                  sourceMessageId={messageId}
                  sourceMessageLabel={messageLabel}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">
                · Cited from {citationCount} {citationCount === 1 ? "source" : "sources"} ·{" "}
                <span className="text-walnut">click any chip to view in Data tab</span>
              </span>
            </div>
          );
        }
        if (block.type === "view-data-button") {
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                openCatalogFiltered({
                  sourceIds: block.catalogFilter ?? [],
                  banner: block.bannerLabel ?? messageLabel,
                })
              }
              className="inline-flex items-center gap-1.5 text-xs text-walnut hover:text-ink border border-walnut/30 hover:border-walnut/60 bg-secondary/40 hover:bg-secondary/70 rounded-sm px-2.5 py-1 transition-colors"
            >
              <Database className="size-3" />
              {block.label}
              <ArrowRight className="size-3" />
            </button>
          );
        }
        if (block.type === "link") {
          return (
            <button key={i} type="button" className="inline-flex items-center gap-1 text-xs text-walnut hover:underline underline-offset-2">
              {block.label} <ExternalLink className="size-3" />
            </button>
          );
        }
        // Iter4 — real API response rendered as structured bubble
        if (block.type === "document-analysis-result" && confidence) {
          return (
            <DocumentAnalysisBubble
              key={i}
              answer={block.answer}
              extractedData={block.extractedData}
              citations={block.citations}
              confidence={confidence}
              crossReferenced={block.crossReferenced}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

function ChatBubble({
  message,
  highlight,
  registerRef,
}: {
  message: ChatMessage;
  highlight: boolean;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  const isUser = message.role === "user";
  const messageLabel =
    typeof message.content === "string"
      ? message.content
      : (() => {
          const headline = message.content.find((b) => b.type === "headline");
          if (headline && headline.type === "headline") return headline.text;
          return "agent answer";
        })();

  return (
    <div
      ref={(el) => registerRef(message.id, el)}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-sm transition-all",
          isUser
            ? "bg-secondary border border-border/70 text-sm text-foreground px-4 py-3"
            : "bg-card border-l-4 border-l-gold border border-border/70 px-4 py-3",
          highlight && "ring-2 ring-gold/60 ring-offset-2 ring-offset-background",
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="size-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Financial Agent
            </span>
            <span className="text-[9px] text-muted-foreground/50 ml-auto">{message.timestamp}</span>
          </div>
        )}
        {isUser ? (
          <div>{typeof message.content === "string" ? message.content : null}</div>
        ) : typeof message.content !== "string" ? (
          <AgentBubble
            content={message.content}
            messageId={message.id}
            messageLabel={messageLabel}
            confidence={message.confidence}
          />
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        {isUser && (
          <div className="text-[9px] text-muted-foreground mt-1 text-right">{message.timestamp}</div>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border/70 rounded-sm px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="size-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Financial Agent
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-1.5 rounded-full bg-muted-foreground/50 animate-pulse"
              style={{ animationDelay: `${i * 180}ms` }}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2 italic">Searching P&L data…</span>
        </div>
      </div>
    </div>
  );
}

// Iter4 — cycling phases shown during real API document analysis
const ANALYSIS_PHASES = ["Reading document…", "Extracting data…", "Cross-referencing platform metrics…"];

function ThinkingDotsAnalyzing() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => Math.min(p + 1, ANALYSIS_PHASES.length - 1)), 800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border/70 rounded-sm px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="size-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Financial Agent · Live API
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-1.5 rounded-full bg-gold/60 animate-pulse"
              style={{ animationDelay: `${i * 180}ms` }}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2 italic">{ANALYSIS_PHASES[phase]}</span>
        </div>
      </div>
    </div>
  );
}

function AnomalySidebar({
  alerts,
  onInvestigate,
}: {
  alerts: AnomalyAlert[];
  onInvestigate: (alert: AnomalyAlert) => void;
}) {
  const { openDocFromAnomaly } = useAppNav();
  return (
    <div className="rounded-sm border border-border/70 bg-card flex flex-col">
      <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between">
        <div className="font-serif text-base text-ink">Active alerts</div>
        <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-2 py-0.5 num">
          {alerts.length}
        </span>
      </div>
      <div className="flex flex-col gap-0 divide-y divide-border/50">
        {alerts.map((alert) => {
          const isRed = alert.severity === "red";
          const doc = alert.dataLink ? findDocument(alert.dataLink.docId) : undefined;
          return (
            <div key={alert.id} className="p-4 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className={cn("mt-0.5 shrink-0", isRed ? "text-destructive" : "text-warning")}>
                  {isRed ? <AlertCircle className="size-4" /> : <AlertTriangle className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[13px] text-ink">{alert.location}</span>
                    <span
                      className={cn(
                        "text-[9px] uppercase tracking-[0.14em] border rounded-sm px-1.5 py-0.5",
                        isRed
                          ? "text-destructive border-destructive/30 bg-destructive/8"
                          : "text-warning border-warning/30 bg-warning/8",
                      )}
                    >
                      {isRed ? "Critical" : "Warning"}
                    </span>
                  </div>
                  <div className="text-xs text-foreground mt-1 leading-snug">{alert.headline}</div>
                </div>
              </div>
              <div className="pl-6">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Hypothesis
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{alert.hypothesis}</p>
                <div className="flex items-center justify-between mt-2.5 flex-wrap gap-1.5">
                  <span className="text-[10px] text-muted-foreground/60">{alert.timestamp}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onInvestigate(alert)}
                      className="text-xs text-walnut hover:text-ink border border-walnut/30 hover:border-walnut/60 rounded-sm px-2 py-0.5 transition-colors"
                    >
                      Investigate →
                    </button>
                    {doc && alert.dataLink && (
                      <button
                        type="button"
                        onClick={() =>
                          openDocFromAnomaly({
                            docId: alert.dataLink!.docId,
                            page: alert.dataLink!.page,
                            anchor: alert.dataLink!.anchor,
                            sourceLabel: `${alert.location}: ${alert.headline}`,
                          })
                        }
                        className="text-xs text-walnut hover:text-ink border border-walnut/30 hover:border-walnut/60 rounded-sm px-2 py-0.5 transition-colors inline-flex items-center gap-1"
                      >
                        <Database className="size-3" />
                        Open in Data tab →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main scene
// -----------------------------------------------------------------------------

function M3FinancialAgent() {
  const {
    m3,
    consumeScrollToMessageId,
    consumePendingPrompt,
    clearM3DocFilter,
    openCompareView,
    closeCompareView,
  } = useAppNav();
  const persona = m3.persona;
  const smLocation = m3.smLocation;
  const compareActive = m3.compareMode !== "off";

  // Persona-filtered base messages + live appended messages.
  const baseMessages = useMemo(
    () => ALL_HISTORY.filter((m) => messageMatchesPersona(m, persona, smLocation)),
    [persona, smLocation],
  );

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [flashId, setFlashId] = useState<string | null>(null);

  // Iter4 — upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [liveApiActive, setLiveApiActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WEBP, and PDF files are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File too large — maximum 20 MB.");
      return;
    }
    setUploadedFile(file);
    setUploadError(null);
  }, []);

  const messages = useMemo(() => [...baseMessages, ...liveMessages], [baseMessages, liveMessages]);

  // "Filter by cited doc" — applied on top of persona filtering.
  const visibleMessages = useMemo(() => {
    if (!m3.filterByCitedDoc) return messages;
    // Show user + agent message pairs that reference the doc.
    const docId = m3.filterByCitedDoc;
    const result: ChatMessage[] = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "agent" && messageCitesDoc(m, docId)) {
        const prev = messages[i - 1];
        if (prev && prev.role === "user" && !result.includes(prev)) result.push(prev);
        result.push(m);
      }
    }
    return result;
  }, [messages, m3.filterByCitedDoc]);

  const suggestedPrompts =
    persona === "CEO" ? SUGGESTED_PROMPTS_CEO : SUGGESTED_PROMPTS_SM;

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    messageRefs.current.set(id, el);
  };

  // Handle scroll-to-message from Data → M3 jumpback.
  useEffect(() => {
    const id = consumeScrollToMessageId();
    if (id) {
      const el = messageRefs.current.get(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setFlashId(id);
        const t = setTimeout(() => setFlashId(null), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [consumeScrollToMessageId, visibleMessages]);

  // Handle pending prompt from Data tab "Open in M3" button.
  useEffect(() => {
    const p = consumePendingPrompt();
    if (p) setInputValue(p);
  }, [consumePendingPrompt]);

  // Auto-scroll to bottom when new messages arrive (but not when scrolling to specific message).
  useEffect(() => {
    if (m3.scrollToMessageId) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages.length, thinking, m3.scrollToMessageId]);

  const handleSend = async (text?: string) => {
    const query = (text ?? inputValue).trim();
    if (!query || thinking || isAnalyzing) return;

    const ts = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: uploadedFile ? `📄 ${uploadedFile.name}\n${query}` : query,
      timestamp: ts(),
      persona,
      storeManagerLocation: persona === "StoreManager" ? smLocation : undefined,
    };
    setLiveMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Iter4 — if a file is attached, call the real API
    if (uploadedFile) {
      const file = uploadedFile;
      setUploadedFile(null);
      setUploadError(null);
      setIsAnalyzing(true);
      try {
        const result = await callAnalyzeApi({
          file,
          question: query,
          persona,
          activeLocation: persona === "StoreManager" ? smLocation : "Chain-wide",
        });
        setLiveApiActive(true);
        const confidence = {
          level: result.confidence,
          summary: result.confidenceReason,
          whyDetails: [result.confidenceReason],
        };
        const agentMsg: ChatMessage = {
          id: `a-api-${Date.now()}`,
          role: "agent",
          persona,
          storeManagerLocation: persona === "StoreManager" ? smLocation : undefined,
          confidence,
          content: [
            {
              type: "document-analysis-result",
              answer: result.answer,
              extractedData: result.extractedData,
              citations: result.citations,
              confidenceReason: result.confidenceReason,
              crossReferenced: result.crossReferenced,
            },
          ],
          timestamp: ts(),
        };
        setLiveMessages((prev) => [...prev, agentMsg]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        setUploadError(message);
        const errMsg: ChatMessage = {
          id: `a-err-${Date.now()}`,
          role: "agent",
          persona,
          content: [
            { type: "text", text: `Could not analyze the document: ${message}` },
            { type: "bullets", items: ["Check that the backend server is running (port 3001)", "Ensure GEMINI_API_KEY is set in .env"] },
          ],
          timestamp: ts(),
        };
        setLiveMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Existing mock behavior
    setThinking(true);
    setTimeout(() => {
      const lower = query.toLowerCase();
      const match = CANNED_RESPONSES.find((r) => r.keywords.some((kw) => lower.includes(kw)));

      const agentMsgs: ChatMessage[] = match
        ? match.messages.map((m) => ({
            ...m,
            id: `a-${Date.now()}-${m.id}`,
            persona,
            storeManagerLocation: persona === "StoreManager" ? smLocation : undefined,
          }))
        : [
            {
              id: `a-${Date.now()}`,
              role: "agent",
              persona,
              storeManagerLocation: persona === "StoreManager" ? smLocation : undefined,
              content: [
                { type: "text" as const, text: `I've searched the P&L and operational data for "${query}". Here's the closest match I found:` },
                {
                  type: "bullets" as const,
                  items: [
                    "Data available for W18–W22 across all 7 locations",
                    "No direct match — try asking about margin, waste, or a specific location",
                    "Example: 'What was Canggu's waste rate last week?'",
                  ],
                },
                { type: "citations" as const, chips: [{ id: "fb1", label: "P&L_May2026_Chain.xlsx", docId: "pnl-may2026-chain" }] },
              ],
              timestamp: ts(),
            },
          ];

      setThinking(false);
      setLiveMessages((prev) => [...prev, ...agentMsgs]);
    }, 1200);
  };

  const handleInvestigate = (alert: AnomalyAlert) => {
    handleSend(`Investigate ${alert.location} alert: ${alert.headline}`);
  };

  // Compare panel "Generate explanation" — closes the panel, appends the
  // pre-written agent reply (with confidence marker) to the chat, scrolls there.
  const handleGenerateExplanation = (leftId: string, rightId: string) => {
    const left = getLocation(leftId);
    const right = getLocation(rightId);
    const built = buildExplanationMessage(leftId, rightId);
    const userMsg: ChatMessage = {
      id: `u-cmp-${Date.now()}`,
      role: "user",
      persona,
      content: `Why does ${left.label} differ from ${right.label}?`,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    const agentMsg: ChatMessage = {
      id: `a-cmp-${Date.now()}`,
      role: "agent",
      persona,
      content: built.content as AgentMessageContent[],
      confidence: built.confidence,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    setLiveMessages((prev) => [...prev, userMsg, agentMsg]);
    closeCompareView();
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="M3 · Financial Agent"
        title="Financial intelligence chat"
        description="Private RAG over P&L data. Ask questions in plain English — the agent retrieves relevant figures, shows its working, and cites every source. No data leaves your infrastructure."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {liveApiActive && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] border rounded-sm px-2 py-0.5 text-success border-success/30 bg-success/8">
                <span className="size-1.5 rounded-full bg-success animate-pulse inline-block" />
                Live API
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] border rounded-sm px-2 py-0.5 text-muted-foreground border-border/70 bg-secondary/40">
              Mock data
            </span>
          </div>
        }
      />

      <PersonaSwitcher />

      {persona === "CEO" && !compareActive && (
        <div className="flex justify-end mb-3 -mt-2">
          <button
            type="button"
            onClick={() => openCompareView({ mode: "pair" })}
            className="text-xs inline-flex items-center gap-1.5 rounded-sm border border-walnut/30 bg-card hover:bg-secondary/50 hover:border-walnut/60 text-walnut hover:text-ink px-2.5 py-1 transition-colors"
          >
            <Scale className="size-3.5" />
            Compare
          </button>
        </div>
      )}

      {!compareActive && (persona === "CEO" ? <MorningBriefing /> : <SmBriefing />)}
      {!compareActive && <KpiStrip />}

      {m3.filterByCitedDoc && (
        <div className="mb-3 rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 flex items-center gap-2 text-xs text-ink">
          <Database className="size-3.5 text-walnut shrink-0" />
          <span>
            Filtered to messages citing{" "}
            <span className="font-medium">{m3.filterByCitedDocLabel ?? m3.filterByCitedDoc}</span>
          </span>
          <button
            type="button"
            onClick={clearM3DocFilter}
            className="ml-auto inline-flex items-center gap-1 text-walnut hover:text-ink"
          >
            <X className="size-3" /> Show all messages
          </button>
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
        {/* Chat panel — replaced by ComparePanel when compare mode is active */}
        {compareActive ? (
          <ComparePanel onGenerateExplanation={handleGenerateExplanation} />
        ) : (
        <div
          className="rounded-sm border border-border/70 bg-background flex flex-col"
          style={{ height: "calc(100vh - 300px)", minHeight: 520 }}
        >
          {/* Suggested prompts */}
          <div className="px-4 pt-4 pb-3 border-b border-border/70 flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1 self-center">
              {persona === "CEO" ? "Strategic queries" : "Operational queries"}
            </span>
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSend(p)}
                className="text-xs bg-secondary/60 border border-border/70 rounded-sm px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-walnut/40 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {visibleMessages.length === 0 ? (
              <div className="h-full grid place-items-center text-xs text-muted-foreground">
                No messages match this view yet. Try the suggested prompts above.
              </div>
            ) : (
              visibleMessages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  highlight={flashId === msg.id}
                  registerRef={registerRef}
                />
              ))
            )}
            {isAnalyzing && <ThinkingDotsAnalyzing />}
            {thinking && <ThinkingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/70 p-3 space-y-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              aria-label="Upload document for analysis"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = "";
              }}
            />

            {/* File preview chip */}
            {uploadedFile && (
              <div className="flex items-center gap-2 rounded-sm border border-gold/40 bg-gold/8 px-3 py-1.5">
                {uploadedFile.type.startsWith("image/") ? (
                  <ImageIcon className="size-3.5 text-walnut shrink-0" />
                ) : (
                  <FileText className="size-3.5 text-walnut shrink-0" />
                )}
                <span className="text-xs text-ink truncate flex-1 min-w-0">{uploadedFile.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB · Ready to analyze
                </span>
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={() => { setUploadedFile(null); setUploadError(null); }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <p className="text-xs text-destructive px-1">{uploadError}</p>
            )}

            {/* Input row */}
            <div
              className="flex items-end gap-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelect(f);
              }}
            >
              <button
                type="button"
                aria-label="Attach file"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "shrink-0 flex items-center justify-center size-[38px] rounded-sm border transition-colors",
                  uploadedFile
                    ? "border-gold/60 text-walnut bg-gold/10"
                    : "border-border/70 text-muted-foreground hover:text-foreground hover:border-walnut/40 bg-card",
                )}
              >
                <Paperclip className="size-4" />
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={
                  uploadedFile
                    ? "Ask a question about this document…"
                    : persona === "CEO"
                      ? "Ask a chain-wide question…"
                      : `Ask about ${smLocation}…`
                }
                rows={1}
                className="flex-1 resize-none bg-card border border-border/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-walnut/40 placeholder:text-muted-foreground/50"
                style={{ minHeight: 38 }}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!inputValue.trim() || thinking || isAnalyzing}
                aria-label="Send message"
                className="shrink-0 flex items-center justify-center size-[38px] rounded-sm bg-ink text-cream disabled:opacity-40 hover:bg-ink/90 transition-colors"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
        )}

        <AnomalySidebar alerts={ANOMALY_ALERTS} onInvestigate={handleInvestigate} />
      </div>
    </AppShell>
  );
}
