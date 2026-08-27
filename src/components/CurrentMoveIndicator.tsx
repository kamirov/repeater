import type { Move } from "@/types/repeater";
import { cn } from "@/lib/utils";

type CurrentMoveIndicatorProps = {
  currentMove: Move | null;
  progress: number | null;
  active: boolean;
};

/** Keeps the current practice move centered while its transition progress fills. */
export function CurrentMoveIndicator({ currentMove, progress, active }: CurrentMoveIndicatorProps) {
  const displayName = currentMove?.name.trim() || "Untitled move";
  const progressValue = Math.round(Math.max(0, Math.min(1, progress ?? 0)) * 100);

  return (
    <div
      data-testid="current-move-indicator"
      aria-hidden={!active}
      className={cn(
        "relative flex h-11 min-w-0 w-full max-w-72 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/5 px-4 shadow-sm transition-opacity duration-300",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-primary/5" aria-hidden="true" />
      <div
        className="absolute inset-y-0 left-0 bg-primary/12 transition-[width] duration-100 ease-linear"
        style={{ width: `${progressValue}%` }}
        aria-hidden="true"
      />
      <span
        role="progressbar"
        aria-label={`Time until next move: ${displayName}`}
        aria-live="polite"
        aria-atomic="true"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressValue}
        className="relative z-10 min-w-0 truncate text-center text-sm font-semibold"
      >
        {displayName}
      </span>
    </div>
  );
}
