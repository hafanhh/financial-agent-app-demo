// Iter3 — Confidence pill + click-to-expand panel.
// Inline with the headline of an agent message; expands a small panel below
// when clicked. Designed to feel like a thoughtful colleague's hedge,
// not a disclaimer footer.

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import type { Confidence } from "@/lib/data/finance";
import { cn } from "@/lib/utils";

type Props = { confidence: Confidence };

export function ConfidenceBadge({ confidence }: Props) {
  const [open, setOpen] = useState(false);

  const { tone, Icon, label } = (() => {
    switch (confidence.level) {
      case "high":
        return { tone: "high", Icon: ShieldCheck, label: "High confidence" };
      case "medium":
        return { tone: "medium", Icon: Shield, label: "Medium confidence" };
      case "low":
        return { tone: "low", Icon: ShieldAlert, label: "Low confidence" };
    }
  })();

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] rounded-full px-2 py-0.5 border transition-colors",
          tone === "high" && "bg-success/8 border-success/30 text-success hover:bg-success/15",
          tone === "medium" && "bg-warning/10 border-warning/40 text-warning hover:bg-warning/20",
          tone === "low" && "bg-destructive/8 border-destructive/30 text-destructive hover:bg-destructive/15",
        )}
      >
        <Icon className="size-3" />
        {label}
        <span className={cn("normal-case tracking-normal opacity-80")}>· {confidence.summary}</span>
      </button>

      {open && (
        <div
          className={cn(
            "mt-2 rounded-sm border bg-card px-3 py-2.5 text-xs space-y-2.5",
            tone === "high" && "border-success/30",
            tone === "medium" && "border-warning/40",
            tone === "low" && "border-destructive/30",
          )}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              Why {confidence.level}
            </div>
            <ul className="space-y-1">
              {confidence.whyDetails.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground leading-relaxed">
                  <span className="text-walnut mt-1 shrink-0">·</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          {confidence.toIncrease && confidence.toIncrease.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                To increase confidence
              </div>
              <ul className="space-y-1">
                {confidence.toIncrease.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground leading-relaxed">
                    <span className="text-gold mt-1 shrink-0">·</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
