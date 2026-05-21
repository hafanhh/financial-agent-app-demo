import { useMemo, useState } from "react";
import { Search, FileText, FileSpreadsheet, FileJson, FileBarChart, FileLock } from "lucide-react";
import {
  DOCUMENTS,
  DOCUMENT_GROUPS,
  findDocument,
  type DocGroup,
  type Document,
  type DocType,
} from "@/lib/data/knowledgeBase";
import { useAppNav } from "@/lib/app-nav-context";
import { DocumentViewer } from "./document-viewer";
import { cn } from "@/lib/utils";

function iconForType(type: DocType, group: DocGroup) {
  if (group === "policy") return FileLock;
  if (type === "pdf") return FileText;
  if (type === "xlsx") return FileSpreadsheet;
  if (type === "csv") return FileBarChart;
  if (type === "json") return FileJson;
  return FileText;
}

export function KnowledgeBaseView() {
  const { dataTab, setSelectedDoc, filterM3ByDoc } = useAppNav();
  const [query, setQuery] = useState("");

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOCUMENTS;
    return DOCUMENTS.filter(
      (d) =>
        d.filename.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = findDocument(dataTab.selectedDocId);

  return (
    <div className="grid grid-cols-[42%_1fr] gap-4" style={{ height: "calc(100vh - 280px)", minHeight: 600 }}>
      {/* Left — file list */}
      <div className="rounded-sm border border-border/70 bg-card flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border/70">
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename…"
              className="w-full bg-background border border-border/70 rounded-sm pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-walnut/40"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {DOCUMENT_GROUPS.map((g) => {
            const inGroup = filteredDocs.filter((d) => d.group === g.id);
            if (inGroup.length === 0) return null;
            return (
              <div key={g.id}>
                <div className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                  {g.label} ({inGroup.length})
                </div>
                <div className="flex flex-col gap-0.5">
                  {inGroup.map((doc) => {
                    const Icon = iconForType(doc.type, doc.group);
                    const isActive = doc.id === dataTab.selectedDocId;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoc(doc.id)}
                        className={cn(
                          "text-left rounded-sm px-2 py-2 transition-colors group flex items-start gap-2",
                          isActive
                            ? "bg-secondary border border-border/70"
                            : "border border-transparent hover:bg-secondary/50",
                        )}
                      >
                        <Icon className={cn("size-3.5 mt-0.5 shrink-0", isActive ? "text-walnut" : "text-muted-foreground/70")} />
                        <div className="min-w-0 flex-1">
                          <div className={cn("text-[12px] truncate", isActive ? "text-ink font-medium" : "text-foreground")}>
                            {doc.filename}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {doc.description} · Updated {doc.updatedAt}
                          </div>
                        </div>
                        <CitationBadge doc={doc} onClick={(e) => {
                          e.stopPropagation();
                          if (doc.citationCount > 0) {
                            filterM3ByDoc({ docId: doc.id, docLabel: doc.filename });
                          }
                        }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filteredDocs.length === 0 && (
            <div className="text-xs text-muted-foreground p-4 text-center">
              No documents match "{query}"
            </div>
          )}
        </div>
      </div>

      {/* Right — document viewer */}
      <div className="overflow-hidden">
        {selected ? (
          <DocumentViewer doc={selected} />
        ) : (
          <div className="h-full grid place-items-center rounded-sm border border-border/70 bg-card text-sm text-muted-foreground">
            Select a document to preview
          </div>
        )}
      </div>
    </div>
  );
}

function CitationBadge({
  doc,
  onClick,
}: {
  doc: Document;
  onClick: (e: React.MouseEvent) => void;
}) {
  const hasCitations = doc.citationCount > 0;
  return (
    <span
      role={hasCitations ? "button" : undefined}
      onClick={onClick}
      title={hasCitations ? `Filter M3 to messages citing ${doc.filename}` : undefined}
      className={cn(
        "shrink-0 text-[9px] rounded-full px-1.5 py-0.5 border self-start mt-0.5 transition-colors",
        hasCitations
          ? "bg-gold/10 border-gold/40 text-walnut hover:bg-gold/20 cursor-pointer"
          : "bg-secondary/40 border-border/40 text-muted-foreground/70",
      )}
    >
      {hasCitations ? `cited ${doc.citationCount}× this week` : "no citations this week"}
    </span>
  );
}
