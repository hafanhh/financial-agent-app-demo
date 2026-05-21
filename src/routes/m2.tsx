import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Smartphone, Check, X, Edit3, Send } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { COHORTS, DORMANT_CUSTOMERS, type DormantCustomer, type CohortId } from "@/lib/data/customers";
import { IDR } from "@/lib/data/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/m2")({ component: M2CustomerIntelligence });

const COHORT_COLORS: Record<CohortId, string> = {
  tourist: "text-blue-600",
  expat: "text-emerald-600",
  local: "text-walnut",
  jakarta: "text-purple-600",
};

const COHORT_BG: Record<CohortId, string> = {
  tourist: "bg-blue-50 border-blue-200/60",
  expat: "bg-emerald-50 border-emerald-200/60",
  local: "bg-secondary border-border/70",
  jakarta: "bg-purple-50 border-purple-200/60",
};

const SCORE_COLOR = (score: number) =>
  score >= 85 ? "var(--color-success)" : score >= 70 ? "var(--color-warning)" : "var(--color-destructive)";

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-border/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: SCORE_COLOR(score) }}
        />
      </div>
      <span className="num text-xs tabular-nums" style={{ color: SCORE_COLOR(score) }}>
        {score}
      </span>
    </div>
  );
}

function CampaignPreview({ customer }: { customer: DormantCustomer | null }) {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [sentState, setSentState] = useState<"idle" | "approved" | "rejected">("idle");

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="size-10 rounded-full bg-secondary grid place-items-center mb-3">
          <Send className="size-5 text-muted-foreground/50" />
        </div>
        <div className="text-sm text-muted-foreground">
          Select a customer from the table to preview their campaign
        </div>
      </div>
    );
  }

  const cohort = COHORTS.find((c) => c.id === customer.cohort)!;

  return (
    <div className="flex flex-col h-full p-5 gap-4">
      {/* Customer summary */}
      <div className="rounded-sm bg-secondary/40 border border-border/60 p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="font-serif text-lg text-ink">{customer.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span>{cohort.icon}</span>
              <span className={cn("font-medium", COHORT_COLORS[customer.cohort])}>
                {cohort.label}
              </span>
              <span>·</span>
              <span>{customer.lastVisit}</span>
            </div>
          </div>
          <ScoreBar score={customer.reactivationScore} />
        </div>
        <div className="flex items-center gap-4 text-[11px] mt-2">
          <div>
            <span className="text-muted-foreground">LTV </span>
            <span className="num text-ink font-medium">{IDR(customer.lifetimeValueIDR)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Location </span>
            <span className="text-ink">{customer.location}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {customer.topProducts.map((p) => (
            <span
              key={p}
              className="text-[10px] bg-background border border-border/70 rounded-sm px-1.5 py-0.5 text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Generated email */}
      <div className="flex-1 flex flex-col">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-gold" />
          AI-generated campaign
        </div>
        <div className="flex-1 rounded-sm border border-border/70 bg-card p-3.5 text-[13px] overflow-y-auto">
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
            Subject
          </div>
          <div className="font-medium text-ink mb-3 leading-snug">{customer.emailSubject}</div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
            Body
          </div>
          <div className="text-foreground leading-relaxed text-xs">{customer.emailBody}</div>
        </div>
      </div>

      {/* Channel toggles */}
      <div className="flex items-center gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
          Send via
        </div>
        <button
          type="button"
          onClick={() => setEmailEnabled((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-sm border transition-colors",
            emailEnabled
              ? "bg-ink text-cream border-ink"
              : "bg-card text-muted-foreground border-border/70 hover:text-foreground",
          )}
        >
          <Mail className="size-3" /> Email
        </button>
        <button
          type="button"
          onClick={() => setPushEnabled((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-sm border transition-colors",
            pushEnabled
              ? "bg-ink text-cream border-ink"
              : "bg-card text-muted-foreground border-border/70 hover:text-foreground",
          )}
        >
          <Smartphone className="size-3" /> Push
        </button>
      </div>

      {/* Approval footer */}
      <div className="border-t border-border/70 pt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground italic">
          {sentState === "approved"
            ? "Campaign queued for delivery."
            : sentState === "rejected"
              ? "Campaign rejected."
              : "Awaiting approval"}
        </span>
        {sentState === "idle" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSentState("rejected")}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-sm border border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              <X className="size-3" /> Reject
            </button>
            <button
              type="button"
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-sm border border-border/70 text-muted-foreground hover:text-foreground hover:border-walnut/40 transition-colors"
            >
              <Edit3 className="size-3" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setSentState("approved")}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-sm bg-ink text-cream border border-ink hover:bg-ink/90 transition-colors"
            >
              <Check className="size-3" /> Approve
            </button>
          </div>
        )}
        {sentState !== "idle" && (
          <button
            type="button"
            onClick={() => setSentState("idle")}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function M2CustomerIntelligence() {
  const [selectedCustomer, setSelectedCustomer] = useState<DormantCustomer | null>(null);
  const [activeCohort, setActiveCohort] = useState<CohortId | "all">("all");

  const filtered =
    activeCohort === "all"
      ? DORMANT_CUSTOMERS
      : DORMANT_CUSTOMERS.filter((c) => c.cohort === activeCohort);

  return (
    <AppShell>
      <PageHeader
        eyebrow="M2 · Customer Intelligence"
        title="Dormant customer reactivation"
        description="CRM segmented by cohort — tourist, expat, local, Jakarta visitor — each with its own dormancy threshold and campaign tone. AI generates personalised messages; a human approves before send."
      />

      {/* Cohort strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {COHORTS.map((cohort) => (
          <button
            key={cohort.id}
            type="button"
            onClick={() => setActiveCohort(activeCohort === cohort.id ? "all" : cohort.id)}
            className={cn(
              "rounded-sm border p-4 text-left transition-all",
              activeCohort === cohort.id ? COHORT_BG[cohort.id] : "bg-card border-border/70",
              "hover:border-walnut/40",
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg">{cohort.icon}</span>
              <span className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70 border border-dashed border-border rounded-sm px-1.5 py-0.5">
                &gt;{cohort.dormantDays}d
              </span>
            </div>
            <div className={cn("font-serif text-[15px] font-medium mt-1", COHORT_COLORS[cohort.id])}>
              {cohort.label}
            </div>
            <div className="num text-xl text-ink mt-0.5">
              {cohort.totalCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">total customers</div>
            <div className="mt-2 pt-2 border-t border-border/40 text-[10px]">
              <span className="text-warning font-medium">+{cohort.newDormantThisWeek}</span>
              <span className="text-muted-foreground ml-1">newly dormant this week</span>
            </div>
            {cohort.note && (
              <div className="mt-1.5 text-[9px] text-muted-foreground/70 leading-snug italic">
                {cohort.note}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Two-panel split */}
      <div className="grid grid-cols-[1fr_400px] gap-5 items-start">
        {/* Left — Dormant customers table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="font-serif text-lg text-ink">
              Dormant customers ready for reactivation
            </div>
            <div className="text-[11px] text-muted-foreground">
              {filtered.length} customers
              {activeCohort !== "all" ? ` · ${COHORTS.find((c) => c.id === activeCohort)?.label}` : ""}
            </div>
          </div>
          <div className="rounded-sm border border-border/70 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/30">
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                    Customer
                  </th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                    Cohort
                  </th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                    Last visit
                  </th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                    Score
                  </th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-normal">
                    Suggested offer
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const cohort = COHORTS.find((co) => co.id === c.cohort)!;
                  const isSelected = selectedCustomer?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={cn(
                        "border-b border-border/40 cursor-pointer transition-colors",
                        isSelected
                          ? "bg-gold/8"
                          : "hover:bg-secondary/30",
                      )}
                      style={isSelected ? { outline: "1px solid var(--color-gold)", outlineOffset: "-1px" } : {}}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-ink">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground">{c.location}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs",
                            COHORT_COLORS[c.cohort],
                          )}
                        >
                          {cohort.icon} {cohort.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {c.lastVisit}
                      </td>
                      <td className="px-4 py-2.5">
                        <ScoreBar score={c.reactivationScore} />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[180px] truncate">
                        {c.suggestedOffer}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Campaign preview */}
        <div className="rounded-sm border border-border/70 bg-card min-h-[520px] flex flex-col sticky top-6">
          <div className="px-5 py-3 border-b border-border/70 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Campaign preview
            </div>
            {selectedCustomer && (
              <div className="text-[10px] text-muted-foreground">
                {COHORTS.find((c) => c.id === selectedCustomer.cohort)?.icon}{" "}
                {selectedCustomer.cohort} tone
              </div>
            )}
          </div>
          <div className="flex-1">
            <CampaignPreview customer={selectedCustomer} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
