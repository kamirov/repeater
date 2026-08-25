import { AlertTriangle, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";

import { EmptyOnboarding } from "@/components/EmptyOnboarding";
import { MobileNavigation } from "@/components/MobileNavigation";
import { MoveWorkspace } from "@/components/MoveWorkspace";
import { PracticeCard } from "@/components/PracticeCard";
import { StyleNavigation } from "@/components/StyleNavigation";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { ThemeProvider } from "@/providers/ThemeProvider";
import {
  repeaterStore,
  type RepeaterStoreState,
} from "@/stores/repeaterStore";
import type { Move } from "@/types/repeater";

export function RepeaterApp({
  store = repeaterStore,
}: {
  store?: StoreApi<RepeaterStoreState>;
}) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={350}>
        <Studio store={store} />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

function Studio({ store }: { store: StoreApi<RepeaterStoreState> }) {
  const state = useStore(store);
  const [expandedMoveIds, setExpandedMoveIds] = useState<Set<string>>(new Set());
  const activeStyle = state.styles.find((style) => style.id === state.activeStyleId) ?? null;
  const moves = activeStyle?.moves ?? [];
  const eligibleMoveCount = moves.filter((move) => move.name.trim()).length;
  const onPracticeError = useCallback((message: string) => toast.error(message), []);
  const practice = usePracticeSession({
    styleId: activeStyle?.id ?? null,
    moves,
    delaySeconds: state.delaySeconds,
    onError: onPracticeError,
  });

  const navigationProps = useMemo(
    () => ({
      styles: state.styles,
      activeStyleId: state.activeStyleId,
      onCreate: (name: string) => {
        state.addStyle(name);
        setExpandedMoveIds(new Set());
      },
      onRename: state.renameStyle,
      onDelete: (styleId: string) => {
        state.deleteStyle(styleId);
        setExpandedMoveIds(new Set());
      },
      onSelect: (styleId: string) => {
        if (styleId === state.activeStyleId) return;
        state.setActiveStyle(styleId);
        setExpandedMoveIds(new Set());
      },
    }),
    [state],
  );

  const addMove = () => {
    if (!activeStyle) return;
    const moveId = state.addMove(activeStyle.id);
    setExpandedMoveIds((current) => new Set([...current, moveId]));
  };

  const setMoveExpanded = (moveId: string, expanded: boolean) => {
    setExpandedMoveIds((current) => {
      const next = new Set(current);
      if (expanded) next.add(moveId);
      else next.delete(moveId);
      return next;
    });
  };

  const updateMove = (move: Move) => {
    if (!activeStyle) return;
    state.updateMove(activeStyle.id, move.id, move);
  };

  const deleteMove = (moveId: string) => {
    if (!activeStyle) return;
    state.deleteMove(activeStyle.id, moveId);
    setMoveExpanded(moveId, false);
  };

  return (
    <div className="app-canvas min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <StyleNavigation {...navigationProps} />
      </aside>
      <div className="min-w-0">
        <MobileNavigation {...navigationProps} />
        {state.storageWarning ? (
          <div className="mx-auto mt-5 flex max-w-[1480px] items-start gap-3 px-4 sm:px-6 lg:px-8">
            <div role="alert" className="flex w-full items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="flex-1 leading-relaxed">{state.storageWarning}</p>
              <Button size="icon-sm" variant="ghost" aria-label="Dismiss storage warning" onClick={state.dismissStorageWarning}>
                <X />
              </Button>
            </div>
          </div>
        ) : null}
        {!activeStyle ? (
          <EmptyOnboarding onCreate={navigationProps.onCreate} />
        ) : (
          <main className="mx-auto grid max-w-[1480px] gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <MoveWorkspace
              style={activeStyle}
              expandedMoveIds={expandedMoveIds}
              activeMoveId={practice.currentMove?.id}
              onAddMove={addMove}
              onExpandedChange={setMoveExpanded}
              onChangeMove={updateMove}
              onDeleteMove={deleteMove}
              onReorderMoves={(moveIds) => state.reorderMoves(activeStyle.id, moveIds)}
            />
            <PracticeCard
              delaySeconds={state.delaySeconds}
              eligibleMoveCount={eligibleMoveCount}
              isRunning={practice.isRunning}
              currentMove={practice.currentMove}
              countdownSeconds={practice.countdownSeconds}
              isSpeechSupported={practice.isSpeechSupported}
              onDelayChange={state.setDelaySeconds}
              onStart={practice.start}
              onStop={practice.stop}
            />
          </main>
        )}
      </div>
    </div>
  );
}

export default RepeaterApp;
