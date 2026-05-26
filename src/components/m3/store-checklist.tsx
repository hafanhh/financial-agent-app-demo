// F1 — Store Manager Daily Checklist
// Replaces SmBriefing when persona === 'StoreManager'.
// Checkbox state persists in localStorage, resets daily.

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Square, CheckSquare2, Sun } from "lucide-react";
import { CHECKLISTS, type ChecklistItem } from "@/lib/data/storeManagerChecklist";
import { cn } from "@/lib/utils";

function todayKey(location: string): string {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `baked_checklist_${location}_${iso}`;
}

function loadChecked(location: string): Set<string> {
  try {
    const raw = localStorage.getItem(todayKey(location));
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveChecked(location: string, ids: Set<string>) {
  try {
    localStorage.setItem(todayKey(location), JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function StoreChecklist({
  location,
  onInjectPrompt,
}: {
  location: string;
  onInjectPrompt: (prompt: string) => void;
}) {
  const items: ChecklistItem[] = CHECKLISTS[location] ?? [];
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked(location));

  // Reset when location changes
  useEffect(() => {
    setChecked(loadChecked(location));
  }, [location]);

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        saveChecked(location, next);
        return next;
      });
    },
    [location],
  );

  const doneCount = items.filter((i) => checked.has(i.id)).length;
  const total = items.length;

  return (
    <section
      aria-label="Today's action list"
      className="rounded-sm border border-border/70 border-l-4 border-l-gold bg-card mb-4"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border/70">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-walnut flex items-center gap-1.5">
            <Sun className="size-3" />
            Today's action list — {location} · {formatDate()}
          </div>
          {open ? (
            <p className="text-sm text-ink mt-1 font-serif">
              {total} things to action today
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Today's actions · {doneCount}/{total} done
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Collapse checklist" : "Expand checklist"}
          className="shrink-0 text-muted-foreground hover:text-foreground p-1 -m-1"
        >
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </header>

      {open && (
        <>
          <ul className="divide-y divide-border/40">
            {items.map((item) => {
              const done = checked.has(item.id);
              return (
                <li key={item.id} className={cn("px-4 py-3.5 flex gap-3", done && "opacity-60")}>
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-label={done ? "Mark undone" : "Mark done"}
                    className="shrink-0 mt-0.5 text-walnut hover:text-ink transition-colors"
                  >
                    {done ? (
                      <CheckSquare2 className="size-4 text-success" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium text-foreground uppercase tracking-wide",
                          done && "line-through text-muted-foreground",
                        )}
                      >
                        {item.priority}. {item.title}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-xs text-muted-foreground leading-relaxed",
                        done && "line-through",
                      )}
                    >
                      {item.detail}
                    </p>
                    {!done && (
                      <button
                        type="button"
                        onClick={() => onInjectPrompt(item.actionPrompt)}
                        className="text-[11px] inline-flex items-center gap-1 rounded-sm border border-walnut/30 bg-secondary/40 hover:bg-secondary/70 hover:border-walnut/60 text-walnut hover:text-ink px-2 py-0.5 transition-colors"
                      >
                        {item.actionLabel} →
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <footer className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border/70 flex items-center justify-between">
            <span>Updated 6:58am · based on W22 data + M1 forecast</span>
            <span className={cn("num font-medium", doneCount === total ? "text-success" : "text-muted-foreground")}>
              {doneCount}/{total} done
            </span>
          </footer>
        </>
      )}
    </section>
  );
}
