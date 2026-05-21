import { FileText } from "lucide-react";
import type { CitationChip as CitationChipType } from "@/lib/data/finance";
import { useAppNav } from "@/lib/app-nav-context";
import { cn } from "@/lib/utils";

type Props = {
  chip: CitationChipType;
  sourceMessageId: string;
  sourceMessageLabel: string;
};

export function CitationChip({ chip, sourceMessageId, sourceMessageLabel }: Props) {
  const { openDocFromCitation } = useAppNav();
  const clickable = Boolean(chip.docId);

  const handleClick = () => {
    if (!chip.docId) return;
    openDocFromCitation({
      docId: chip.docId,
      page: chip.page,
      anchor: chip.anchor,
      sourceMessageId,
      sourceMessageLabel,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!clickable}
      title={clickable ? "Open in Data tab" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] rounded-full px-2 py-0.5 border transition-colors select-none",
        clickable
          ? "bg-secondary/40 border-border/70 text-muted-foreground hover:bg-gold/10 hover:border-gold/40 hover:text-ink cursor-pointer"
          : "bg-secondary/30 border-border/40 text-muted-foreground/70 cursor-default",
      )}
    >
      <FileText className={cn("size-2.5", clickable ? "text-walnut" : "text-muted-foreground/50")} />
      {chip.label}
    </button>
  );
}
