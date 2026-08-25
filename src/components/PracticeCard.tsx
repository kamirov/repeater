import { Clock3, Loader2, Play, RotateCcw, Square, Volume2, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Move } from "@/types/repeater";

type PracticeCardProps = {
  delaySeconds: number;
  eligibleMoveCount: number;
  isRunning: boolean;
  currentMove: Move | null;
  countdownSeconds: number | null;
  isSpeechSupported: boolean;
  onDelayChange: (seconds: number) => void;
  onDelayBlur?: () => Promise<void>;
  delaySaveStatus?: "saving" | "error" | null;
  onStart: () => void;
  onStop: () => void;
};

/** Presents the global cadence setting and live spoken-practice session. */
export function PracticeCard({
  delaySeconds,
  eligibleMoveCount,
  isRunning,
  currentMove,
  countdownSeconds,
  isSpeechSupported,
  onDelayChange,
  onDelayBlur,
  delaySaveStatus,
  onStart,
  onStop,
}: PracticeCardProps) {
  const disabledReason = !isSpeechSupported
    ? "Speech is unavailable in this browser."
    : eligibleMoveCount === 0
      ? "Name at least one move to begin."
      : null;

  return (
    <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(145deg,var(--card),var(--practice-tint))] xl:sticky xl:top-8">
      <CardHeader className="border-b border-border/70">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Waves className="size-4" />
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em]">Practice loop</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="practice-delay" className="flex items-center gap-2">
            <Clock3 className="size-4 text-muted-foreground" /> Delay between moves
          </Label>
          <div className="relative">
            <Input
              id="practice-delay"
              type="number"
              min={1}
              max={300}
              step={1}
              inputMode="numeric"
              className="pr-20 text-base font-semibold"
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
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">seconds</span>
          </div>
          {delaySaveStatus === "saving" ? <p className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Saving delay…</p> : null}
          {delaySaveStatus === "error" ? <Button type="button" variant="ghost" size="sm" className="px-0 text-destructive" onClick={() => void onDelayBlur?.()}><RotateCcw /> Retry saving delay</Button> : null}
        </div>

        <div className="grid min-h-48 place-items-center rounded-2xl border border-primary/15 bg-background/55 p-5 text-center shadow-inner">
          {isRunning && currentMove ? (
            <div className="animate-in fade-in zoom-in-95">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Volume2 className="size-5" />
              </div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Now dancing</p>
              <p className="mt-2 font-display text-3xl font-medium leading-tight text-foreground">{currentMove.name}</p>
              {countdownSeconds !== null ? (
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  Next move in {countdownSeconds} {countdownSeconds === 1 ? "second" : "seconds"}
                </p>
              ) : (
                <p className="mt-4 text-sm font-medium text-primary">Calling your move…</p>
              )}
            </div>
          ) : (
            <div>
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <Volume2 className="size-5" />
              </div>
              <p className="font-display text-2xl font-medium">Ready when you are</p>
              <p className="mx-auto mt-2 max-w-48 text-sm leading-relaxed text-muted-foreground">
                {eligibleMoveCount} {eligibleMoveCount === 1 ? "move is" : "moves are"} in this round.
              </p>
            </div>
          )}
        </div>

        {isRunning ? (
          <Button variant="outline" size="lg" className="w-full border-primary/30" onClick={onStop} aria-label="Stop practice">
            <Square className="fill-current" /> Stop practice
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={onStart} disabled={Boolean(disabledReason)} aria-label="Start practice">
            <Play className="fill-current" /> Start practice
          </Button>
        )}
        {disabledReason ? <p className="text-center text-xs font-medium text-muted-foreground">{disabledReason}</p> : null}
      </CardContent>
    </Card>
  );
}
