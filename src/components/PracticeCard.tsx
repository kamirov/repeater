import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type PracticeLoopProps = {
  delaySeconds: number;
  eligibleMoveCount: number;
  isRunning: boolean;
  isSpeechSupported: boolean;
  onDelayChange: (seconds: number) => void;
  onDelayBlur?: () => Promise<void>;
  delaySaveStatus?: "saving" | "error" | null;
  onStart: () => void;
  onStop: () => void;
};

/** Presents the compact practice delay and play/pause controls. */
export function PracticeCard({
  delaySeconds,
  eligibleMoveCount,
  isRunning,
  isSpeechSupported,
  onDelayChange,
  onDelayBlur,
  delaySaveStatus,
  onStart,
  onStop,
}: PracticeLoopProps) {
  const disabledReason = !isSpeechSupported
    ? "Speech is unavailable in this browser."
    : eligibleMoveCount === 0
      ? "Name at least one move to begin."
      : null;

  return (
    <Card className="inline-flex rounded-xl border-primary/20 bg-card shadow-sm" title={disabledReason ?? undefined}>
      <CardContent className="flex items-center gap-1 p-1">
        <Input
          id="practice-delay"
          type="number"
          min={1}
          max={300}
          step={1}
          inputMode="numeric"
          aria-label="Practice delay in seconds"
          aria-busy={delaySaveStatus === "saving"}
          className="h-8 w-10 border-0 bg-transparent p-0 text-center text-sm font-semibold shadow-none focus-visible:ring-1"
          defaultValue={delaySeconds}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value) && event.target.value !== "") onDelayChange(value);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.value) {
              event.currentTarget.value = String(delaySeconds);
            }
            void onDelayBlur?.();
          }}
        />
        {isRunning ? (
          <Button variant="secondary" size="icon-sm" onClick={onStop} aria-label="Stop practice">
            <Pause className="fill-current" />
          </Button>
        ) : (
          <Button size="icon-sm" onClick={onStart} disabled={Boolean(disabledReason)} aria-label="Start practice">
            <Play className="fill-current" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
