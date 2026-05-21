import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Database } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppNav } from "@/lib/app-nav-context";
import { KnowledgeBaseView } from "@/components/data/knowledge-base-view";
import { DataCatalogView } from "@/components/data/data-catalog-view";

export const Route = createFileRoute("/data")({ component: DataScene });

function DataScene() {
  const { dataTab, setActiveSubTab } = useAppNav();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Data & Knowledge"
        title="The platform's source layer"
        description="Every answer the agents give is grounded in real client data. Knowledge Base shows the documents the agents read; Data Catalog shows the structured pipelines that feed M1, M2, and M3."
      />

      <Tabs
        value={dataTab.activeSubTab}
        onValueChange={(v) => setActiveSubTab(v as "kb" | "catalog")}
        className="w-full"
      >
        <TabsList className="bg-card border border-border/70 rounded-sm h-9 mb-4">
          <TabsTrigger
            value="kb"
            className="data-[state=active]:bg-secondary data-[state=active]:text-ink rounded-sm px-3 py-1 text-xs inline-flex items-center gap-1.5"
          >
            <BookOpen className="size-3.5" /> Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="data-[state=active]:bg-secondary data-[state=active]:text-ink rounded-sm px-3 py-1 text-xs inline-flex items-center gap-1.5"
          >
            <Database className="size-3.5" /> Data Catalog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kb" className="mt-0">
          <KnowledgeBaseView />
        </TabsContent>
        <TabsContent value="catalog" className="mt-0">
          <DataCatalogView />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
