import { Link, useLocation } from "@tanstack/react-router";
import { Layers, TrendingUp, Users, MessageSquare, Lock, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  liveDot?: boolean;
};

const NAV_PRIMARY: readonly NavItem[] = [
  {
    to: "/",
    label: "Platform Overview",
    subtitle: "Architecture & roadmap",
    Icon: Layers,
  },
  {
    to: "/m1",
    label: "M1 · Demand Forecasting",
    subtitle: "Ops workspace",
    Icon: TrendingUp,
  },
  {
    to: "/m2",
    label: "M2 · Customer Intelligence",
    subtitle: "Marketing workspace",
    Icon: Users,
  },
  {
    to: "/m3",
    label: "M3 · Financial Agent",
    subtitle: "Finance workspace",
    Icon: MessageSquare,
  },
  {
    to: "/data",
    label: "Data & Knowledge",
    subtitle: "Source layer · live",
    Icon: Database,
    liveDot: true,
  },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-48 flex flex-col bg-card border-r border-border/70">
        {/* Brand mark */}
        <div className="px-5 pt-6 pb-5 border-b border-border/70">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-9 rounded-sm bg-ink text-cream grid place-items-center font-serif text-lg flex-shrink-0 select-none">
              B
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-serif text-[17px] tracking-tight text-ink">BAKED.</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                AI Platform
              </div>
            </div>
          </Link>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 flex flex-col px-3 py-4 gap-0.5 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 px-2.5 mb-2">
            Demo modules
          </div>
          {NAV_PRIMARY.map((n) => {
            const Icon = n.Icon;
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative flex items-start gap-2.5 px-2.5 py-2.5 rounded-sm transition-colors group",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gold rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "size-4 mt-0.5 shrink-0 transition-colors",
                    active ? "text-gold" : "text-muted-foreground/70 group-hover:text-walnut",
                  )}
                />
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-[13px] font-medium leading-snug flex items-center gap-1.5",
                      active ? "text-ink" : "",
                    )}
                  >
                    {n.label}
                    {n.liveDot && (
                      <span className="size-1.5 rounded-full bg-success animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{n.subtitle}</div>
                </div>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="mx-2.5 my-3 border-t border-border/70" />

          {/* Future Modules — locked/dashed */}
          <Link
            to="/future-modules"
            className={cn(
              "relative flex items-start gap-2.5 px-2.5 py-2.5 rounded-sm border border-dashed transition-colors group",
              pathname === "/future-modules"
                ? "border-walnut/50 bg-secondary/60 text-foreground"
                : "border-border/50 text-muted-foreground hover:border-walnut/30 hover:text-foreground hover:bg-secondary/30",
            )}
          >
            <Lock
              className={cn(
                "size-4 mt-0.5 shrink-0",
                pathname === "/future-modules" ? "text-walnut/70" : "text-muted-foreground/50",
              )}
            />
            <div className="min-w-0">
              <div className="text-[13px] font-medium leading-snug">Future Modules</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Wave 2–4 roadmap</div>
            </div>
          </Link>
        </nav>

        {/* Bottom status */}
        <div className="px-5 py-4 border-t border-border/70">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success animate-pulse flex-shrink-0" />
            <span>Mock data · v1.0 · demo</span>
          </div>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-48 min-h-screen">
        <div className="max-w-[1160px] mx-auto px-10 py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 mb-10 pb-6 border-b border-border/70">
      <div>
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.22em] text-walnut mb-3">{eyebrow}</div>
        )}
        <h1 className="font-serif text-4xl tracking-tight text-ink">{title}</h1>
        {description && (
          <p className="mt-3 text-muted-foreground max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  hint,
  badge,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        {badge}
      </div>
      <div className="font-serif text-2xl mt-3 num text-ink">{value}</div>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        {delta && (
          <span className={cn("num", delta.positive ? "text-success" : "text-destructive")}>
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-4">
      <h2 className="font-serif text-2xl tracking-tight text-ink">{children}</h2>
      {hint && <div className="text-xs text-muted-foreground flex items-center gap-3">{hint}</div>}
    </div>
  );
}
