import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ArchitectureDiagram } from "@/components/scenes/architecture-diagram";

export const Route = createFileRoute("/")({ component: PlatformOverview });

const STAT_TILES = [
  {
    value: "30–50%",
    label: "lower cost per future module",
    desc: "Wave 2–4 modules build on the same data lake, feature store, and LLM gateway — avoiding the full greenfield cost each time.",
  },
  {
    value: "LLM-agnostic",
    label: "by design",
    desc: "The LLM gateway abstracts the model layer. Swap OpenAI for Anthropic or a local model with zero application changes.",
  },
  {
    value: "Human-in-the-loop",
    label: "by default",
    desc: "Every AI output — production recommendation, customer campaign, anomaly alert — requires a human approval step before action.",
  },
];

function PlatformOverview() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Platform Overview"
        title="One foundation. Three launch modules. A 5-year roadmap."
        description="We are not building three disconnected apps. We are building an AI Platform for F&B Operations that BAKED. can extend over a 3–5 year roadmap — with each successive wave costing 30–50% less than building from scratch."
      />

      {/* Architecture diagram */}
      <ArchitectureDiagram />

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-4 mt-5">
        {STAT_TILES.map((tile) => (
          <div
            key={tile.label}
            className="rounded-sm border border-border/70 bg-card p-5 flex flex-col gap-1"
          >
            <div className="font-serif text-3xl text-ink tracking-tight">{tile.value}</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-walnut">{tile.label}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tile.desc}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
