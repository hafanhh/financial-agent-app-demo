import { Briefcase, Store, ChevronDown } from "lucide-react";
import { useAppNav } from "@/lib/app-nav-context";
import { STORE_LOCATIONS, PERSONA_SUBTITLE, type Persona } from "@/lib/data/m3Chat";
import { cn } from "@/lib/utils";

export function PersonaSwitcher() {
  const { m3, setPersona, setSmLocation } = useAppNav();
  const persona = m3.persona;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-5 border-b border-border/70">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex rounded-sm border border-border/70 bg-card p-0.5">
          <SegButton
            active={persona === "CEO"}
            onClick={() => setPersona("CEO")}
            Icon={Briefcase}
            label="CEO View"
          />
          <SegButton
            active={persona === "StoreManager"}
            onClick={() => setPersona("StoreManager")}
            Icon={Store}
            label="Store Manager View"
          />
        </div>
        {persona === "StoreManager" && (
          <div className="relative">
            <select
              value={m3.smLocation}
              onChange={(e) => setSmLocation(e.target.value as (typeof STORE_LOCATIONS)[number])}
              className="appearance-none text-xs bg-card border border-border/70 rounded-sm pl-3 pr-7 py-1.5 text-foreground hover:border-walnut/40 transition-colors focus:outline-none focus:ring-1 focus:ring-walnut/40"
            >
              {STORE_LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {PERSONA_SUBTITLE[persona](m3.smLocation)}
      </p>
    </div>
  );
}

function SegButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-colors",
        active
          ? "bg-gold/15 text-ink border border-gold/30"
          : "text-muted-foreground hover:text-foreground border border-transparent",
      )}
    >
      <Icon className={cn("size-3.5", active ? "text-gold" : "text-muted-foreground/70")} />
      {label}
    </button>
  );
}
