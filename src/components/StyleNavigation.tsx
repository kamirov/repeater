import { Loader2, Monitor, Moon, MoreHorizontal, Pencil, Plus, Sun, Trash2 } from "lucide-react";
import { useState } from "react";

import { StyleDialog } from "@/components/StyleDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import type { DanceStyle } from "@/types/repeater";

type StyleNavigationProps = {
  styles: DanceStyle[];
  activeStyleId: string | null;
  pendingStyleIds?: Set<string>;
  onCreate: (name: string) => void;
  onRename: (styleId: string, name: string) => void;
  onDelete: (styleId: string) => void;
  onSelect: (styleId: string) => void;
  onNavigate?: () => void;
  className?: string;
};

/** Renders the style library, style actions, and persisted theme control. */
export function StyleNavigation({
  styles,
  activeStyleId,
  pendingStyleIds = new Set(),
  onCreate,
  onRename,
  onDelete,
  onSelect,
  onNavigate,
  className,
}: StyleNavigationProps) {
  const { theme, cycleTheme } = useTheme();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b border-sidebar-border px-5 py-6">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Dance styles
          </p>
          <StyleDialog mode="create" onSubmit={onCreate}>
            <Button size="icon-sm" variant="ghost" aria-label="Add dance style">
              <Plus />
            </Button>
          </StyleDialog>
        </div>
        {styles.length ? (
          <nav aria-label="Dance styles" className="space-y-1.5">
            {styles.map((style) => (
              <StyleNavigationItem
                key={style.id}
                style={style}
                active={style.id === activeStyleId}
                pending={pendingStyleIds.has(style.id)}
                onSelect={() => {
                  onSelect(style.id);
                  onNavigate?.();
                }}
                onRename={(name) => onRename(style.id, name)}
                onDelete={() => onDelete(style.id)}
              />
            ))}
          </nav>
        ) : (
          <div className="rounded-2xl border border-dashed border-sidebar-border px-4 py-7 text-center">
            <p className="font-display text-lg">Your floor is open</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Add a style to begin your repertoire.
            </p>
          </div>
        )}
      </div>
      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" className="w-full justify-start" onClick={cycleTheme}>
          {theme === "light" ? <Sun /> : theme === "dark" ? <Moon /> : <Monitor />}
          {theme === "light" ? "Light theme" : theme === "dark" ? "Dark theme" : "System theme"}
        </Button>
      </div>
    </div>
  );
}

function StyleNavigationItem({
  style,
  active,
  pending,
  onSelect,
  onRename,
  onDelete,
}: {
  style: DanceStyle;
  active: boolean;
  pending: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div
      className={cn(
        "group flex items-center rounded-xl border border-transparent transition",
        active
          ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60",
      )}
    >
      <button
        type="button"
        aria-label={style.name}
        className="min-w-0 flex-1 px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        aria-current={active ? "page" : undefined}
        onClick={onSelect}
      >
        <span className="block truncate text-sm font-semibold">{style.name}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {pending ? <span className="flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Saving…</span> : <>{style.moves.length} {style.moves.length === 1 ? "move" : "moves"}</>}
        </span>
      </button>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="mr-1 opacity-65 group-hover:opacity-100"
                aria-label={`Manage ${style.name}`}
                disabled={pending}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Style actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <StyleDialog
        mode="rename"
        initialName={style.name}
        open={renameOpen}
        onOpenChange={setRenameOpen}
        onSubmit={onRename}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {style.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the style and all {style.moves.length} of its moves from the shared library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete style</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <span className="font-display text-xl italic">R</span>
      </div>
      <div>
        <p className="font-display text-xl font-medium leading-none">Repeater</p>
        <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Dance practice
        </p>
      </div>
    </div>
  );
}
