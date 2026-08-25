import { ArrowRight, Footprints, Sparkles } from "lucide-react";

import { StyleDialog } from "@/components/StyleDialog";
import { Button } from "@/components/ui/button";

/** Welcomes a new local workspace and starts the first style flow. */
export function EmptyOnboarding({ onCreate }: { onCreate: (name: string) => void }) {
  return (
    <div className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute left-[12%] top-[15%] size-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] right-[8%] size-52 rounded-full bg-accent/40 blur-3xl" />
      <div className="relative max-w-2xl text-center">
        <div className="mx-auto mb-8 grid size-16 place-items-center rounded-3xl border border-primary/20 bg-card text-primary shadow-xl shadow-primary/10">
          <Footprints className="size-7" />
        </div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-sm">
          <Sparkles className="size-3.5 text-primary" /> Your personal dance caller
        </div>
        <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-tight text-balance sm:text-7xl">Build your dance repertoire.</h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Collect the moves you are working on, arrange them your way, and let Repeater call the next one while you stay in motion.
        </p>
        <StyleDialog mode="create" onSubmit={onCreate}>
          <Button size="lg" className="mt-9" aria-label="Create your first style">
            Create your first style <ArrowRight />
          </Button>
        </StyleDialog>
        <p className="mt-4 text-xs text-muted-foreground">Saved privately in this browser. No account needed.</p>
      </div>
    </div>
  );
}
