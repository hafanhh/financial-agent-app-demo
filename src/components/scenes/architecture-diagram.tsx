import { useState } from "react";
import { cn } from "@/lib/utils";
import { ARCH_LAYERS, GOVERNANCE_ITEMS, type ArchItem } from "@/lib/data/architecture";

function Chip({
  item,
  variant = "neutral",
}: {
  item: ArchItem;
  variant?: "neutral" | "wave1" | "wave2plus" | "user" | "source";
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-sm text-xs cursor-default select-none transition-all",
          variant === "wave1" &&
            "bg-gold/20 border border-gold/60 text-ink font-medium hover:bg-gold/30",
          variant === "wave2plus" &&
            "border border-dashed border-walnut/35 text-muted-foreground hover:border-walnut/55 hover:text-foreground",
          variant === "user" && "bg-secondary border border-border/70 text-foreground font-medium",
          variant === "source" && "bg-secondary/50 border border-border/60 text-muted-foreground",
          variant === "neutral" && "bg-secondary/60 border border-border/70 text-foreground",
        )}
      >
        {item.label}
      </div>
      {hovered && item.desc && (
        <div className="absolute z-30 bottom-full left-0 mb-1.5 w-52 bg-popover border border-border rounded-sm shadow-md p-2.5 text-[11px] text-muted-foreground leading-relaxed pointer-events-none">
          {item.desc}
        </div>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center items-center py-1.5 relative">
      <div className="flex flex-col items-center gap-0">
        <div className="w-px h-3 bg-border/80" />
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "5px solid var(--color-border)",
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  );
}

function LayerRow({ layer }: { layer: (typeof ARCH_LAYERS)[number] }) {
  const isModules = layer.id === "modules";
  const isUsers = layer.id === "users";
  const isSources = layer.id === "sources";

  const wave1 = isModules ? layer.items.filter((i) => i.wave === 1) : [];
  const wave2plus = isModules ? layer.items.filter((i) => i.wave && i.wave > 1) : [];

  return (
    <div
      className={cn(
        "rounded-sm border p-4",
        isModules
          ? "border-gold/40 bg-gold/5"
          : isUsers
            ? "border-border/70 bg-card"
            : isSources
              ? "border-border/50 bg-secondary/20"
              : "border-border/70 bg-card",
      )}
    >
      <div className="flex items-start gap-5">
        {/* Layer label */}
        <div className="w-36 shrink-0 pt-0.5">
          <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {layer.sublabel}
          </div>
          <div
            className={cn(
              "font-serif text-[13px] leading-snug mt-0.5",
              isModules ? "text-walnut font-medium" : "text-ink",
            )}
          >
            {layer.label}
          </div>
        </div>

        {/* Items */}
        {isModules ? (
          <div className="flex-1 flex flex-col gap-2.5">
            {/* Wave 1 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] uppercase tracking-[0.16em] text-gold font-medium shrink-0">
                Wave 1 — RFP scope
              </span>
              {wave1.map((item) => (
                <Chip key={item.id} item={item} variant="wave1" />
              ))}
            </div>
            {/* Divider */}
            <div className="border-t border-dashed border-border/60" />
            {/* Wave 2-4 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/60 shrink-0">
                Wave 2-4 — indicative
              </span>
              {wave2plus.map((item) => (
                <Chip key={item.id} item={item} variant="wave2plus" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-wrap gap-1.5">
            {layer.items.map((item) => (
              <Chip
                key={item.id}
                item={item}
                variant={isUsers ? "user" : isSources ? "source" : "neutral"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="rounded-sm border border-border/70 bg-card p-6">
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-walnut mb-1.5">
          Platform architecture
        </div>
        <p className="text-sm text-muted-foreground max-w-xl">
          All three RFP modules share a single foundation. Future modules plug into the same data
          lake, feature store, and LLM gateway — at 30–50% the build cost of a greenfield project.
          Hover any block for details.
        </p>
      </div>

      <div className="flex gap-5">
        {/* Main layers column */}
        <div className="flex-1 flex flex-col min-w-0">
          {ARCH_LAYERS.map((layer, i) => (
            <div key={layer.id}>
              <LayerRow layer={layer} />
              {i < ARCH_LAYERS.length - 1 && <Connector />}
            </div>
          ))}
        </div>

        {/* Governance band */}
        <div className="w-36 shrink-0">
          <div className="h-full border border-dashed border-walnut/30 rounded-sm bg-secondary/20 flex flex-col p-3">
            <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-3 text-center">
              Governance
            </div>
            <div className="flex flex-col gap-3 flex-1 justify-around">
              {GOVERNANCE_ITEMS.map((g) => (
                <div key={g.id} className="flex items-start gap-1.5">
                  <span className="mt-1 size-1.5 rounded-full bg-walnut/50 shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground leading-snug">{g.label}</div>
                    <div className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">
                      {g.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
