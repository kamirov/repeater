import { ChevronDown, ExternalLink, FileText, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isValidReferenceUrl } from "@/lib/referenceUrl";
import { cn } from "@/lib/utils";
import type { Move } from "@/types/repeater";

type MoveCardProps = {
  move: Move;
  expanded: boolean;
  active?: boolean;
  dragHandle: ReactNode;
  onExpandedChange: (expanded: boolean) => void;
  onChange: (move: Move) => void;
  onDelete: () => void;
};

/** Shows a compact sortable move summary and an immediately persisted editor. */
export function MoveCard({
  move,
  expanded,
  active = false,
  dragHandle,
  onExpandedChange,
  onChange,
  onDelete,
}: MoveCardProps) {
  const displayName = move.name.trim() || "Untitled move";
  const validReference = isValidReferenceUrl(move.referenceUrl);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm transition-all",
        active ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-stretch">
        <div className="flex shrink-0 items-center border-r border-border/70 px-1.5 text-muted-foreground">
          {dragHandle}
        </div>
        <button
          type="button"
          aria-label={`${expanded ? "Collapse" : "Edit"} ${displayName}`}
          aria-expanded={expanded}
          className="min-w-0 flex-1 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          onClick={() => onExpandedChange(!expanded)}
        >
          <span className={cn("block truncate font-semibold", !move.name.trim() && "italic text-muted-foreground")}>{displayName}</span>
          {!expanded ? (
            <span className="mt-1 block truncate text-sm text-muted-foreground">
              {move.description.trim() || "Add notes, cues, or a reference video"}
            </span>
          ) : null}
        </button>
        <div className="flex shrink-0 items-center gap-0.5 px-2">
          {move.referenceUrl && validReference ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon-sm">
                  <a href={move.referenceUrl} target="_blank" rel="noreferrer" aria-label={`Open reference for ${displayName}`}>
                    <ExternalLink />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open reference</TooltipContent>
            </Tooltip>
          ) : null}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete ${displayName}`}>
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete move</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {displayName}?</AlertDialogTitle>
                <AlertDialogDescription>This removes the move from this style and from future practice rounds.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete move</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ChevronDown className={cn("ml-1 size-4 text-muted-foreground transition-transform", expanded && "rotate-180")} aria-hidden="true" />
        </div>
      </div>
      {expanded ? (
        <div className="grid gap-5 border-t border-border/70 bg-muted/25 px-5 py-5">
          <div className="space-y-2">
            <Label htmlFor={`move-name-${move.id}`}>Move name</Label>
            <Input
              id={`move-name-${move.id}`}
              autoFocus={!move.name}
              autoComplete="off"
              placeholder="e.g. Cross-body lead"
              value={move.name}
              onChange={(event) => onChange({ ...move, name: event.target.value })}
            />
            {!move.name.trim() ? <p className="text-xs text-muted-foreground">Name this move before including it in practice.</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`move-url-${move.id}`}>Reference URL</Label>
            <Input
              id={`move-url-${move.id}`}
              type="url"
              inputMode="url"
              placeholder="https://youtube.com/..."
              value={move.referenceUrl}
              aria-invalid={!validReference}
              aria-describedby={!validReference ? `move-url-error-${move.id}` : undefined}
              onChange={(event) => onChange({ ...move, referenceUrl: event.target.value })}
            />
            {!validReference ? (
              <p id={`move-url-error-${move.id}`} className="text-xs font-medium text-destructive">
                Enter a complete http:// or https:// URL.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`move-description-${move.id}`} className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" /> Description
            </Label>
            <Textarea
              id={`move-description-${move.id}`}
              placeholder="Add a cue, technique note, or reminder…"
              value={move.description}
              onChange={(event) => onChange({ ...move, description: event.target.value })}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
