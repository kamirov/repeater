import { Plus } from "lucide-react";

import { PracticeCard, type PracticeLoopProps } from "@/components/PracticeCard";
import { SortableMoveList } from "@/components/SortableMoveList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DanceStyle, Move } from "@/types/repeater";

type MoveWorkspaceProps = {
  style: DanceStyle;
  practice: PracticeLoopProps;
  expandedMoveId: string | null;
  activeMoveId?: string;
  onAddMove: () => void;
  onExpandedChange: (moveId: string, expanded: boolean) => void;
  onChangeMove: (move: Move) => void;
  onDeleteMove: (moveId: string) => void;
  onReorderMoves: (moveIds: string[]) => void;
  pendingMoveIds: Set<string>;
  moveSaveErrors: Record<string, string>;
  reordering: boolean;
  onFlushMove: (moveId: string) => Promise<void>;
  onRetryMove: (moveId: string) => Promise<void>;
};

/** Hosts the active style's heading, empty state, and sortable move editor. */
export function MoveWorkspace({
  style,
  practice,
  expandedMoveId,
  activeMoveId,
  onAddMove,
  onExpandedChange,
  onChangeMove,
  onDeleteMove,
  onReorderMoves,
  pendingMoveIds,
  moveSaveErrors,
  reordering,
  onFlushMove,
  onRetryMove,
}: MoveWorkspaceProps) {
  return (
    <section aria-labelledby="style-heading" className="min-w-0">
      <div className="mb-7">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-primary">Move library</p>
          <h1 id="style-heading" className="font-display text-4xl font-medium tracking-tight sm:text-5xl">{style.name}</h1>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <PracticeCard {...practice} />
          {style.moves.length ? (
            <Button onClick={onAddMove}>
              <Plus /> Add move
            </Button>
          ) : null}
        </div>
      </div>
      {style.moves.length ? (
        <SortableMoveList
          moves={style.moves}
          expandedMoveId={expandedMoveId}
          activeMoveId={activeMoveId}
          onExpandedChange={onExpandedChange}
          onChange={onChangeMove}
          onDelete={onDeleteMove}
          onReorder={onReorderMoves}
          pendingMoveIds={pendingMoveIds}
          moveSaveErrors={moveSaveErrors}
          reordering={reordering}
          onFlush={onFlushMove}
          onRetry={onRetryMove}
        />
      ) : (
        <Card className="border-dashed bg-card/60">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <Plus className="size-5" />
            </div>
            <h2 className="font-display text-2xl font-medium">Add the first move</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Start with one move you want in your body. You can add notes and a reference video after naming it.</p>
            <Button className="mt-6" onClick={onAddMove}>Add first move</Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
