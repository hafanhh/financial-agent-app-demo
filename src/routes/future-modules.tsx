import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  ShoppingCart,
  Tag,
  Gift,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/future-modules")({ component: FutureModules });

type Wave = 2 | 3 | 4;

type FutureModule = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  valueProp: string;
  wave: Wave;
  badge: string;
};

const WAVE_COLORS: Record<Wave, string> = {
  2: "text-amber-700 border-amber-300/60 bg-amber-50/60",
  3: "text-blue-700 border-blue-300/60 bg-blue-50/60",
  4: "text-purple-700 border-purple-300/60 bg-purple-50/60",
};

const FUTURE_MODULES: FutureModule[] = [
  {
    id: "scheduling",
    icon: Calendar,
    name: "Staff Scheduling",
    valueProp: "AI-optimised shift planning aligned to demand forecast. Reduces over-staffing by ~15% during quiet periods.",
    wave: 2,
    badge: "Wave 2 — Q3 2026",
  },
  {
    id: "supplier",
    icon: ShoppingCart,
    name: "Supplier Price Intelligence",
    valueProp: "Benchmarks ingredient costs against market rates and flags when switching supplier saves ≥5% on a line item.",
    wave: 2,
    badge: "Wave 2 — Q3 2026",
  },
  {
    id: "pricing",
    icon: Tag,
    name: "Dynamic End-of-Day Pricing",
    valueProp: "Automatically suggests markdown prices for slow-moving items 2 hours before close to maximise sell-through.",
    wave: 2,
    badge: "Wave 2 — Q4 2026",
  },
  {
    id: "loyalty",
    icon: Gift,
    name: "Loyalty Agent (multilingual)",
    valueProp: "Conversational loyalty programme in Bahasa, English, and Mandarin — handling points, redemptions, and tier nudges.",
    wave: 3,
    badge: "Wave 3 — Q1 2027",
  },
  {
    id: "menu-pers",
    icon: ShoppingBag,
    name: "POS Menu Personalisation",
    valueProp: "Shows personalised product recommendations at the counter based on a customer's purchase history and current weather.",
    wave: 3,
    badge: "Wave 3 — Q2 2027",
  },
  {
    id: "site",
    icon: MapPin,
    name: "New Location Site Selection",
    valueProp: "Scores candidate locations using footfall data, competitor density, local purchasing power, and tourism seasonality.",
    wave: 4,
    badge: "Wave 4 — Q3 2027",
  },
];

const WAVE_GROUPS: { wave: Wave; title: string; desc: string }[] = [
  {
    wave: 2,
    title: "Wave 2 — Operational efficiency",
    desc: "Optimise the running cost of existing locations.",
  },
  {
    wave: 3,
    title: "Wave 3 — Customer experience",
    desc: "Build deeper, more personalised relationships.",
  },
  {
    wave: 4,
    title: "Wave 4 — Expansion intelligence",
    desc: "Data-driven decisions for the next growth phase.",
  },
];

function FutureModules() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Future Modules · Wave 2–4"
        title="What comes after Wave 1"
        description="Each module uses the data lake, feature store, and LLM gateway built in Wave 1 — so the marginal cost of adding capabilities drops with every wave."
      />

      {/* Wave groups */}
      <div className="space-y-8">
        {WAVE_GROUPS.map(({ wave, title, desc }) => {
          const modules = FUTURE_MODULES.filter((m) => m.wave === wave);
          return (
            <div key={wave}>
              <div className="flex items-baseline gap-3 mb-3">
                <h2 className="font-serif text-xl text-ink">{title}</h2>
                <span className="text-sm text-muted-foreground">{desc}</span>
              </div>
              <div className={cn("grid gap-4", modules.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="rounded-sm border border-dashed border-walnut/30 bg-card p-5 flex flex-col gap-3 opacity-75 hover:opacity-90 transition-opacity"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="size-9 rounded-sm bg-secondary grid place-items-center flex-shrink-0">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>
                        <span
                          className={cn(
                            "text-[9px] uppercase tracking-[0.14em] border rounded-sm px-1.5 py-0.5 shrink-0",
                            WAVE_COLORS[mod.wave],
                          )}
                        >
                          {mod.badge}
                        </span>
                      </div>
                      <div>
                        <div className="font-serif text-base text-ink">{mod.name}</div>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {mod.valueProp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom banner */}
      <div className="mt-8 rounded-sm border border-dashed border-walnut/40 bg-secondary/30 p-6 flex items-center justify-between gap-6">
        <div>
          <div className="font-serif text-xl text-ink">
            Built on the same foundation.
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            30–50% lower cost per module after Wave 1 — because the data lake, AI/ML core, and governance layer are already in place.
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-serif text-3xl text-gold">30–50%</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-0.5">
            lower cost per module
          </div>
        </div>
      </div>
    </AppShell>
  );
}
