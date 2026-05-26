// Iter3 — CEO morning briefing card. Collapsible. Hardcoded date for demo determinism.

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sun,
} from "lucide-react";
import { useAppNav } from "@/lib/app-nav-context";
import {
  CEO_BRIEFING,
  type BriefingAction,
  type BriefingItem,
} from "@/lib/data/ceoBriefing";
import { cn } from "@/lib/utils";

export function MorningBriefing() {
  const [open, setOpen] = useState(true);

  const red = CEO_BRIEFING.items.filter((i) => i.severity === "red");
  const yellow = CEO_BRIEFING.items.filter((i) => i.severity === "yellow");
  const green = CEO_BRIEFING.items.filter((i) => i.severity === "green");

  return (
    <section
      aria-label="Morning briefing"
      className="rounded-sm border border-border/70 border-l-4 border-l-gold bg-card mb-4"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border/70">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-walnut flex items-center gap-1.5">
            <Sun className="size-3" />
            Briefing for {CEO_BRIEFING.forDate}
          </div>
          {open && (
            <p className="text-sm text-ink mt-1.5 font-serif">{CEO_BRIEFING.greeting}</p>
          )}
          {!open && (
            <p className="text-xs text-muted-foreground mt-1">
              {red.length} red · {yellow.length} yellow · {green.length} green
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Collapse briefing" : "Expand briefing"}
          className="shrink-0 text-muted-foreground hover:text-foreground p-1 -m-1"
        >
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </header>

      {open && (
        <>
          {red.length > 0 && (
            <BriefingSection title="Needs attention" tone="red" items={red} />
          )}
          {yellow.length > 0 && (
            <BriefingSection title="Worth knowing" tone="yellow" items={yellow} />
          )}
          {green.length > 0 && (
            <BriefingSection title="Going well" tone="green" items={green} />
          )}
          <footer className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border/70">
            {CEO_BRIEFING.updatedAt}
          </footer>
        </>
      )}
    </section>
  );
}

function BriefingSection({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "red" | "yellow" | "green";
  items: BriefingItem[];
}) {
  const Icon = tone === "red" ? AlertCircle : tone === "yellow" ? AlertTriangle : CheckCircle2;
  const cls =
    tone === "red"
      ? "text-destructive"
      : tone === "yellow"
        ? "text-warning"
        : "text-success";
  const dot = tone === "red" ? "🔴" : tone === "yellow" ? "🟡" : "🟢";

  return (
    <section className="px-4 py-3 border-b border-border/70 last:border-0">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={cn("size-3.5", cls)} />
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span aria-hidden="true" className="mr-1">
            {dot}
          </span>
          {title} ({items.length})
        </h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <BriefingRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function BriefingRow({ item }: { item: BriefingItem }) {
  return (
    <li>
      <div className="text-[13px] text-ink leading-snug font-medium">{item.headline}</div>
      <p className="text-xs text-foreground/85 leading-relaxed mt-1">{item.detail}</p>
      {item.actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {item.actions.map((a, i) => (
            <BriefingActionButton key={i} action={a} />
          ))}
        </div>
      )}
    </li>
  );
}

function BriefingActionButton({ action }: { action: BriefingAction }) {
  const { setPendingPrompt, openDocFromAnomaly, openCompareView, openWhatIfView } = useAppNav();

  const onClick = () => {
    if (action.kind === "insertPrompt") {
      setPendingPrompt(action.payload);
      return;
    }
    if (action.kind === "openWhatIf") {
      openWhatIfView();
      return;
    }
    if (action.kind === "openDoc") {
      openDocFromAnomaly({
        docId: action.payload.docId,
        page: action.payload.page,
        anchor: action.payload.anchor,
        sourceLabel: action.label,
      });
      return;
    }
    if (action.kind === "openCompare") {
      openCompareView({
        mode: action.payload.mode,
        leftId: action.payload.left,
        rightId: action.payload.right,
      });
      return;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] inline-flex items-center gap-1 rounded-sm border border-walnut/30 bg-secondary/40 hover:bg-secondary/70 hover:border-walnut/60 text-walnut hover:text-ink px-2 py-0.5 transition-colors"
    >
      {action.label} →
    </button>
  );
}
