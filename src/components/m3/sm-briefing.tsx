// Iter3 — Simpler one-line briefing for Store Manager view.

import { Sun } from "lucide-react";
import { useAppNav } from "@/lib/app-nav-context";
import { SM_BRIEFING } from "@/lib/data/ceoBriefing";

export function SmBriefing() {
  const { setPendingPrompt } = useAppNav();

  return (
    <section
      aria-label="Store manager briefing"
      className="rounded-sm border border-border/70 border-l-4 border-l-gold bg-card px-4 py-3 mb-4 flex items-center gap-3 flex-wrap"
    >
      <Sun className="size-4 text-walnut shrink-0" />
      <p className="text-sm text-ink flex-1 min-w-0">{SM_BRIEFING.text}</p>
      <button
        type="button"
        onClick={() => setPendingPrompt(SM_BRIEFING.followUpPrompt)}
        className="text-[11px] inline-flex items-center gap-1 rounded-sm border border-walnut/30 bg-secondary/40 hover:bg-secondary/70 hover:border-walnut/60 text-walnut hover:text-ink px-2 py-0.5 transition-colors"
      >
        Ask why →
      </button>
    </section>
  );
}
