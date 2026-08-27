import type { Move } from "@/types/repeater";

import { cn } from "@/lib/utils";

type CurrentMoveOverlayProps = {
  currentMove: Move | null;
  progress: number | null;
  active: boolean;
};

/** Shows the active move as a full-screen progress surface on small screens. */
export function CurrentMoveOverlay({ currentMove, progress, active }: CurrentMoveOverlayProps) {
  const displayName = currentMove?.name.trim() || "Untitled move";
  const progressValue = Math.round(Math.max(0, Math.min(1, progress ?? 0)) * 100);

  return (
    <div
      data-testid="current-move-overlay"
      aria-hidden={!active}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background px-8 text-center transition-opacity duration-300 sm:hidden",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-primary/5" aria-hidden="true" />
      <div
        className="absolute inset-y-0 left-0 bg-primary/12 transition-[width] duration-100 ease-linear"
        style={{ width: `${progressValue}%` }}
        aria-hidden="true"
      />
      <span className="relative z-10 max-w-full break-words font-display text-[clamp(2.75rem,14vw,6rem)] font-medium leading-none tracking-tight">
        {displayName}
      </span>
    </div>
  );
}
