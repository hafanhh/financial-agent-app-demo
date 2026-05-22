// Iter4 — renders the structured response from a real Anthropic API call.
// Distinct from AgentBubble (which handles mock AgentMessageContent blocks).

import { FileText, Link2 } from "lucide-react";
import { ConfidenceBadge } from "@/components/m3/confidence-badge";
import type { Confidence } from "@/lib/data/finance";
import { cn } from "@/lib/utils";

interface Props {
  answer: string;
  extractedData: {
    documentType: string;
    summary: string;
    keyMetrics: { label: string; value: string; unit?: string }[];
  } | null;
  citations: { source: string; page?: number; excerpt: string }[];
  confidence: Confidence;
  crossReferenced: { module: string; dataPoint: string; insight: string }[];
}

const MODULE_COLOR: Record<string, string> = {
  M1: "bg-blue-50 text-blue-700 border-blue-200",
  M2: "bg-purple-50 text-purple-700 border-purple-200",
  M3: "bg-gold/10 text-walnut border-gold/30",
};

export function DocumentAnalysisBubble({
  answer,
  extractedData,
  citations,
  confidence,
  crossReferenced,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <FileText className="size-3.5 text-walnut" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Document Analysis
          </span>
        </div>
        {extractedData && (
          <span className="text-[9px] uppercase tracking-[0.14em] bg-secondary border border-border/70 rounded-sm px-1.5 py-0.5 text-muted-foreground">
            {extractedData.documentType}
          </span>
        )}
        <ConfidenceBadge confidence={confidence} />
      </div>

      {/* Main answer */}
      <p className="text-sm text-foreground leading-relaxed">{answer}</p>

      {/* Extracted metrics table */}
      {extractedData && extractedData.keyMetrics.length > 0 && (
        <div className="rounded-sm border border-border/70 overflow-hidden">
          <div className="px-3 py-1.5 bg-secondary/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border/70">
            Extracted from document
          </div>
          <table className="w-full text-xs">
            <tbody>
              {extractedData.keyMetrics.map((m, i) => (
                <tr key={i} className="border-t border-border/30 first:border-0">
                  <td className="px-3 py-1.5 text-muted-foreground">{m.label}</td>
                  <td className="px-3 py-1.5 text-ink font-medium num text-right">
                    {m.value}
                    {m.unit && <span className="text-muted-foreground font-normal ml-1">{m.unit}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cross-references */}
      {crossReferenced.length > 0 && (
        <div className="space-y-1.5">
          {crossReferenced.map((ref, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span
                className={cn(
                  "shrink-0 text-[9px] uppercase tracking-[0.12em] border rounded-sm px-1.5 py-0.5 mt-0.5",
                  MODULE_COLOR[ref.module] ?? "bg-secondary text-muted-foreground border-border/70",
                )}
              >
                {ref.module}
              </span>
              <span className="text-foreground leading-relaxed">
                <span className="text-muted-foreground">{ref.dataPoint} · </span>
                {ref.insight}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Citation row */}
      {citations.length > 0 && (
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <Link2 className="size-3 text-muted-foreground shrink-0" />
          {citations.slice(0, 2).map((c, i) => (
            <span
              key={i}
              className="text-[11px] inline-flex items-center gap-1 bg-secondary/60 border border-border/70 rounded-sm px-2 py-0.5 text-muted-foreground"
            >
              {c.source}
              {c.page ? ` · p.${c.page}` : ""}
              {c.excerpt && (
                <span className="text-[10px] text-muted-foreground/60 ml-1 max-w-[180px] truncate">
                  "{c.excerpt}"
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
