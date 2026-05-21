import { useMemo, useState } from "react";
import {
  Database,
  Users as UsersIcon,
  Boxes,
  FileSpreadsheet,
  Cloud,
  Calendar,
  Mail,
  ClipboardList,
  Receipt,
  X,
  ChevronRight,
} from "lucide-react";
import {
  CATALOG_HEADER,
  CATALOG_SOURCES,
  type CatalogSource,
} from "@/lib/data/dataCatalog";
import { useAppNav } from "@/lib/app-nav-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "pos-square": Database,
  "crm-mailchimp-audience": UsersIcon,
  "wms-cloud-inventory": Boxes,
  "xero-pnl": FileSpreadsheet,
  "weather-openweather": Cloud,
  "events-bali-cal": Calendar,
  "email-mailchimp-campaigns": Mail,
  "hr-internal-sheet": ClipboardList,
  "supplier-invoices-email": Receipt,
};

export function DataCatalogView() {
  const { dataTab, clearCatalogFilter } = useAppNav();
  const [schemaSource, setSchemaSource] = useState<CatalogSource | null>(null);

  const visibleSources = useMemo(() => {
    if (!dataTab.catalogFilter || dataTab.catalogFilter.length === 0) return CATALOG_SOURCES;
    const set = new Set(dataTab.catalogFilter);
    return CATALOG_SOURCES.filter((s) => set.has(s.id));
  }, [dataTab.catalogFilter]);

  return (
    <div>
      <div className="rounded-sm border border-border/70 bg-card px-4 py-3 mb-4 flex items-center gap-6 flex-wrap text-xs">
        <Stat label="Total active sources" value={CATALOG_HEADER.totalSources} />
        <Stat
          label="Health"
          value={`${CATALOG_HEADER.liveCount} live, ${CATALOG_HEADER.manualCount} manual`}
        />
        <Stat label="Last full pipeline run" value={CATALOG_HEADER.lastPipelineRun} />
      </div>

      {dataTab.catalogBanner && (
        <div className="rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 mb-4 flex items-center gap-2 text-xs text-ink">
          <Database className="size-3.5 text-walnut shrink-0" />
          <span>
            Filtered to data behind:{" "}
            <span className="font-medium">{dataTab.catalogBanner}</span>
          </span>
          <button
            type="button"
            onClick={clearCatalogFilter}
            className="ml-auto inline-flex items-center gap-1 text-walnut hover:text-ink"
          >
            <X className="size-3" /> Clear filter
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {visibleSources.map((src) => (
          <SourceCard key={src.id} source={src} onSchema={() => setSchemaSource(src)} />
        ))}
      </div>

      <Sheet open={!!schemaSource} onOpenChange={(o) => !o && setSchemaSource(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] sm:max-w-none overflow-y-auto">
          {schemaSource && (
            <>
              <SheetHeader>
                <SheetTitle>{schemaSource.category} — {schemaSource.name}</SheetTitle>
                <SheetDescription>Schema · {schemaSource.schema.length} columns</SheetDescription>
              </SheetHeader>
              <div className="mt-5 border border-border/70 rounded-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/40">
                    <tr>
                      <th className="text-left px-3 py-2 border-b border-border/70 text-muted-foreground font-medium">Column</th>
                      <th className="text-left px-3 py-2 border-b border-border/70 text-muted-foreground font-medium">Type</th>
                      <th className="text-left px-3 py-2 border-b border-border/70 text-muted-foreground font-medium">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemaSource.schema.map((c) => (
                      <tr key={c.name} className="border-b border-border/30">
                        <td className="px-3 py-1.5 text-foreground font-medium">{c.name}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{c.type}</td>
                        <td className="px-3 py-1.5 num text-foreground">{c.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="text-sm text-ink font-medium num">{value}</div>
    </div>
  );
}

function SourceCard({
  source,
  onSchema,
}: {
  source: CatalogSource;
  onSchema: () => void;
}) {
  const Icon = ICON[source.id] ?? Database;
  const isLive = source.status === "live";
  return (
    <div className="rounded-sm border border-border/70 bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <Icon className="size-5 text-walnut mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {source.category}
            </div>
            <div className="text-sm text-ink font-medium truncate">{source.name}</div>
          </div>
        </div>
        <span
          className={cn(
            "text-[9px] rounded-full px-2 py-0.5 border whitespace-nowrap inline-flex items-center gap-1",
            isLive
              ? "bg-success/10 border-success/30 text-success"
              : "bg-warning/10 border-warning/30 text-warning",
          )}
        >
          <span className={cn("size-1.5 rounded-full", isLive ? "bg-success animate-pulse" : "bg-warning")} />
          {isLive ? "Connected" : "Manual"}
        </span>
      </div>

      <div className="text-[10px] text-muted-foreground">{source.syncCadence}</div>

      <div className="space-y-1 text-xs">
        <StatLine label="Last record" value={source.lastRecord} />
        <StatLine label="Records today" value={source.recordsToday} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Used by</span>
          <div className="flex gap-1">
            {source.usedBy.map((m) => (
              <span
                key={m}
                className="text-[9px] rounded-sm border border-border/70 bg-secondary/40 px-1.5 py-0.5 text-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSchema}
        className="mt-1 self-start text-xs text-walnut hover:text-ink inline-flex items-center gap-1 transition-colors"
      >
        View schema <ChevronRight className="size-3" />
      </button>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground num truncate">{value}</span>
    </div>
  );
}
