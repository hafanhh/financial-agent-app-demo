import { useEffect, useMemo, useRef } from "react";
import { ArrowRight, Clock, X, FileText } from "lucide-react";
import {
  type Document,
  type PdfBlock,
  type PdfPage,
  type SheetData,
} from "@/lib/data/knowledgeBase";
import { useAppNav } from "@/lib/app-nav-context";
import { cn } from "@/lib/utils";

type Props = { doc: Document };

export function DocumentViewer({ doc }: Props) {
  const { dataTab, openM3FromDoc, jumpBackToM3Message, clearHighlight, clearFloatingChip } =
    useAppNav();
  const highlight = dataTab.highlightRegion;
  const floating = dataTab.floatingChip;

  // Compute "last cited" — most recent timestamp from messages citing this doc.
  // For demo purposes we just show updatedAt as a stand-in.
  const lastCited = useMemo(() => doc.updatedAt, [doc.updatedAt]);

  const highlightedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (highlight && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlight, doc.id]);

  return (
    <div className="flex flex-col h-full rounded-sm border border-border/70 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/70 flex items-center gap-3 flex-wrap">
        <FileText className="size-4 text-walnut shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm text-ink font-medium truncate">{doc.filename}</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-2.5" /> Last cited: {lastCited}
          </div>
        </div>
        <button
          type="button"
          onClick={() => openM3FromDoc({ docId: doc.id, docLabel: doc.filename })}
          className="text-xs text-walnut hover:text-ink border border-walnut/30 hover:border-walnut/60 rounded-sm px-2 py-1 transition-colors inline-flex items-center gap-1"
        >
          Open in M3
          <ArrowRight className="size-3" />
        </button>
      </div>

      {/* Floating "cited in" chip */}
      {floating && (
        <div className="px-4 pt-3">
          <div className="rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 flex items-center gap-2 text-xs text-ink">
            <span className="text-walnut font-medium">Citation</span>
            <span className="text-muted-foreground">
              This passage is cited in:
            </span>
            <span className="font-medium truncate flex-1">"{floating.message}"</span>
            {floating.returnToMessageId ? (
              <button
                type="button"
                onClick={() => jumpBackToM3Message(floating.returnToMessageId)}
                className="text-walnut hover:text-ink inline-flex items-center gap-1"
              >
                Jump back <ArrowRight className="size-3" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                clearFloatingChip();
                clearHighlight();
              }}
              aria-label="Dismiss citation chip"
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {doc.body.kind === "pdf" && (
          <PdfBody pages={doc.body.pages} highlight={highlight} highlightedRef={highlightedRef} />
        )}
        {doc.body.kind === "spreadsheet" && (
          <SpreadsheetBody sheets={doc.body.sheets} highlight={highlight} highlightedRef={highlightedRef} />
        )}
        {doc.body.kind === "csv" && (
          <CsvBody
            headers={doc.body.headers}
            rows={doc.body.rows}
            highlight={highlight}
            highlightedRef={highlightedRef}
          />
        )}
        {doc.body.kind === "json" && <JsonBody preview={doc.body.preview} />}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------

function isHighlighted(
  highlight: { page?: number; anchor: string } | null,
  pageNumber: number | undefined,
  anchor: string,
): boolean {
  if (!highlight) return false;
  if (highlight.page && pageNumber && highlight.page !== pageNumber) return false;
  return highlight.anchor === anchor;
}

function PdfBody({
  pages,
  highlight,
  highlightedRef,
}: {
  pages: PdfPage[];
  highlight: { page?: number; anchor: string } | null;
  highlightedRef: React.MutableRefObject<HTMLElement | null>;
}) {
  return (
    <div className="p-6 space-y-8 mx-auto max-w-[760px]">
      {pages.map((p) => {
        const highlightOnPage = highlight && (!highlight.page || highlight.page === p.pageNumber);
        return (
          <div key={p.pageNumber} className="bg-background border border-border/70 rounded-sm shadow-sm">
            <div className="px-5 py-2 border-b border-border/70 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Page {p.pageNumber}
              </div>
              {p.title && <div className="text-[11px] text-muted-foreground truncate">{p.title}</div>}
            </div>
            <div className="px-6 py-5 space-y-4">
              {p.blocks.map((b, bi) => (
                <PdfBlockRenderer
                  key={bi}
                  block={b}
                  highlighted={Boolean(highlightOnPage) && blockMatchesAnchor(b, highlight?.anchor)}
                  highlightedRef={highlightedRef}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function blockMatchesAnchor(block: PdfBlock, anchor?: string): boolean {
  if (!anchor) return false;
  if (block.kind === "heading" && block.text.toLowerCase().includes(anchor.toLowerCase())) return true;
  if (block.kind === "callout") return true;
  if (block.kind === "table") {
    // Highlight a table if any row text loosely matches the anchor keyword.
    const flat = block.rows.flat().join(" ").toLowerCase();
    return flat.includes(anchor.toLowerCase().replace(/-/g, " "));
  }
  return false;
}

function PdfBlockRenderer({
  block,
  highlighted,
  highlightedRef,
}: {
  block: PdfBlock;
  highlighted: boolean;
  highlightedRef: React.MutableRefObject<HTMLElement | null>;
}) {
  const refCb = (el: HTMLElement | null) => {
    if (highlighted && el) highlightedRef.current = el;
  };
  const wrapCls = cn(
    "rounded-sm transition-colors",
    highlighted && "bg-gold/15 ring-1 ring-gold/40 px-2 -mx-2 py-1",
  );

  if (block.kind === "heading") {
    const Cls = block.level === 3 ? "text-sm font-medium text-ink" : "font-serif text-lg text-ink";
    return (
      <h3 ref={refCb} className={cn(Cls, wrapCls)}>
        {block.text}
      </h3>
    );
  }
  if (block.kind === "paragraph") {
    return (
      <p ref={refCb} className={cn("text-sm text-foreground leading-relaxed", wrapCls)}>
        {block.text}
      </p>
    );
  }
  if (block.kind === "callout") {
    const tone =
      block.tone === "warning"
        ? "border-warning/40 bg-warning/8 text-foreground"
        : "border-walnut/30 bg-secondary/40 text-foreground";
    return (
      <div
        ref={refCb}
        className={cn(
          "rounded-sm border px-3 py-2 text-xs leading-relaxed",
          tone,
          highlighted && "ring-1 ring-gold/40 bg-gold/15",
        )}
      >
        {block.text}
      </div>
    );
  }
  if (block.kind === "table") {
    return (
      <div ref={refCb} className={cn("overflow-x-auto", wrapCls)}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/70">
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "py-1.5 text-muted-foreground font-normal",
                    i === 0 ? "text-left pr-4" : "text-left px-2",
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
                      ci === 0 ? "pr-4 text-foreground font-medium" : "px-2 num text-foreground",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

// -----------------------------------------------------------------------------

function SpreadsheetBody({
  sheets,
  highlight,
  highlightedRef,
}: {
  sheets: SheetData[];
  highlight: { page?: number; anchor: string } | null;
  highlightedRef: React.MutableRefObject<HTMLElement | null>;
}) {
  // Pick the sheet matching the anchor; default to first sheet.
  const activeIdx = useMemo(() => {
    if (!highlight?.anchor) return 0;
    const i = sheets.findIndex((s) => s.name === highlight.anchor);
    return i === -1 ? 0 : i;
  }, [highlight, sheets]);

  const active = sheets[activeIdx];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-5">
        <div
          ref={(el) => {
            if (highlight?.anchor === active.name && el) highlightedRef.current = el;
          }}
          className={cn(
            "rounded-sm border border-border/70 bg-background overflow-hidden",
            isHighlighted(highlight, undefined, active.name) && "ring-2 ring-gold/40",
          )}
        >
          <table className="w-full text-xs">
            <thead className="bg-secondary/40">
              <tr>
                {active.headers.map((h, i) => (
                  <th key={i} className="text-left px-3 py-2 border-b border-border/70 text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/30 hover:bg-secondary/20">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "px-3 py-1.5",
                        ci === 0 ? "text-foreground font-medium" : "num text-foreground",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Sheet tabs */}
      <div className="border-t border-border/70 px-3 py-1.5 bg-secondary/30 flex gap-1">
        {sheets.map((s, i) => (
          <span
            key={s.name}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-sm border",
              i === activeIdx
                ? "bg-background border-border text-ink"
                : "border-transparent text-muted-foreground",
            )}
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------

function CsvBody({
  headers,
  rows,
  highlight,
  highlightedRef,
}: {
  headers: string[];
  rows: string[][];
  highlight: { page?: number; anchor: string } | null;
  highlightedRef: React.MutableRefObject<HTMLElement | null>;
}) {
  // Highlight rows whose text content matches the anchor keyword loosely.
  const matchKey = highlight?.anchor?.toLowerCase().replace(/-/g, " ");
  const matchesRow = (row: string[]): boolean => {
    if (!matchKey) return false;
    const text = row.join(" ").toLowerCase();
    if (matchKey.includes("matcha")) return text.includes("matcha");
    if (matchKey.includes("butter")) return text.includes("butter");
    if (matchKey.includes("tue")) return text.includes("tue");
    if (matchKey.includes("canggu")) return text.includes("canggu");
    if (matchKey.includes("sourdough")) return text.includes("sourdough");
    if (matchKey.includes("almond")) return text.includes("almond");
    return false;
  };

  return (
    <div className="p-5 overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-secondary/40">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 border-b border-border/70 text-muted-foreground font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const hit = matchesRow(row);
            return (
              <tr
                key={ri}
                ref={(el) => {
                  if (hit && el && !highlightedRef.current) highlightedRef.current = el;
                }}
                className={cn(
                  "border-b border-border/30",
                  hit ? "bg-gold/15 ring-1 ring-gold/30" : "hover:bg-secondary/20",
                )}
              >
                {row.map((cell, ci) => (
                  <td key={ci} className={cn("px-3 py-1.5", ci === 0 ? "text-foreground font-medium" : "num text-foreground")}>
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------------

function JsonBody({ preview }: { preview: string }) {
  return (
    <div className="p-5">
      <pre className="text-xs bg-secondary/40 border border-border/70 rounded-sm p-4 overflow-auto text-foreground font-mono leading-relaxed">
        {preview}
      </pre>
    </div>
  );
}
