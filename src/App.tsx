import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";

import { AccessDialog } from "@/components/AccessDialog";
import { EmptyOnboarding } from "@/components/EmptyOnboarding";
import { LegacyImportDialog } from "@/components/LegacyImportDialog";
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
  const [expandedMoveId, setExpandedMoveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  useEffect(() => {
    void store.getState().initialize();
  }, [store]);

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
      pendingStyleIds: state.pendingStyleIds,
      onCreate: (name: string) => {
        void state.addStyle(name).catch(() => toast.error("The dance style could not be created."));
        setExpandedMoveId(null);
      },
      onRename: (styleId: string, name: string) => {
        void state.renameStyle(styleId, name).catch(() => toast.error("The dance style could not be renamed."));
      },
      onDelete: (styleId: string) => {
        void state.deleteStyle(styleId).catch(() => toast.error("The dance style was restored because deletion failed."));
        setExpandedMoveId(null);
      },
      onSelect: (styleId: string) => {
        if (styleId === state.activeStyleId) return;
        void state.setActiveStyle(styleId);
        setExpandedMoveId(null);
      },
    }),
    [state],
  );

  if (state.loadStatus === "loading") return <LoadingScreen />;
  if (state.loadStatus === "error") {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-4 text-center">
        <div className="max-w-md">
          <AlertTriangle className="mx-auto mb-4 size-9 text-destructive" />
          <h1 className="font-display text-3xl font-medium">Repeater could not load</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{state.loadError}</p>
          <Button className="mt-6" onClick={() => void state.retryLoad()}><RefreshCw /> Try again</Button>
        </div>
      </div>
    );
  }
  if (state.loadStatus === "locked") return <AccessDialog open error={state.authError} onSubmit={state.submitSecret} />;

  const addMove = async () => {
    if (!activeStyle) return;
    try {
      const moveId = await state.addMove(activeStyle.id);
      setExpandedMoveId(moveId);
    } catch {
      toast.error("The move could not be added.");
    }
  };

  const setMoveExpanded = (moveId: string, expanded: boolean) => {
    setExpandedMoveId(expanded ? moveId : null);
  };

  const updateMove = (move: Move) => {
    if (!activeStyle) return;
    state.updateMove(activeStyle.id, move.id, move);
  };

  const deleteMove = (moveId: string) => {
    if (!activeStyle) return;
    void state.deleteMove(activeStyle.id, moveId).catch(() => toast.error("The move was restored because deletion failed."));
    setMoveExpanded(moveId, false);
  };

  return (
    <div className={`app-canvas min-h-svh bg-background text-foreground lg:grid ${sidebarCollapsed ? "lg:grid-cols-[64px_minmax(0,1fr)]" : "lg:grid-cols-[280px_minmax(0,1fr)]"}`}>
      <aside className="sticky top-0 hidden h-svh border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <StyleNavigation
          {...navigationProps}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
      </aside>
      <div className="min-w-0">
        <MobileNavigation {...navigationProps} />
        {state.loadError ? (
          <div className="mx-auto mt-5 flex max-w-[1480px] items-start gap-3 px-4 sm:px-6 lg:px-8">
            <div role="alert" className="flex w-full items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="flex-1 leading-relaxed">{state.loadError}</p>
            </div>
          </div>
        ) : null}
        {!activeStyle ? (
          <EmptyOnboarding onCreate={navigationProps.onCreate} />
        ) : (
          <main className="mx-auto grid max-w-[1480px] gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <MoveWorkspace
              style={activeStyle}
              expandedMoveId={expandedMoveId}
              activeMoveId={practice.currentMove?.id}
              onAddMove={addMove}
              onExpandedChange={setMoveExpanded}
              onChangeMove={updateMove}
              onDeleteMove={deleteMove}
              pendingMoveIds={state.pendingMoveIds}
              moveSaveErrors={state.moveSaveErrors}
              reordering={state.reorderingStyleIds.has(activeStyle.id)}
              onFlushMove={(moveId) => state.flushMove(activeStyle.id, moveId)}
              onRetryMove={(moveId) => state.retryMove(activeStyle.id, moveId)}
              onReorderMoves={(moveIds) => void state.reorderMoves(activeStyle.id, moveIds).catch(() => toast.error("The previous move order was restored."))}
            />
            <PracticeCard
              delaySeconds={state.delaySeconds}
              eligibleMoveCount={eligibleMoveCount}
              isRunning={practice.isRunning}
              currentMove={practice.currentMove}
              countdownSeconds={practice.countdownSeconds}
              isSpeechSupported={practice.isSpeechSupported}
              onDelayChange={state.setDelaySeconds}
              onDelayBlur={state.flushDelay}
              delaySaveStatus={state.delaySaveStatus}
              onStart={practice.start}
              onStop={practice.stop}
            />
          </main>
        )}
      </div>
      <LegacyImportDialog
        data={state.legacyImport}
        importing={state.importingLegacy}
        onImport={state.importLegacyData}
        onDismiss={state.dismissLegacyImport}
      />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-svh place-items-center bg-background text-center" role="status">
      <div><Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" /><p className="font-display text-2xl">Loading your dance library…</p></div>
    </div>
  );
}

export default RepeaterApp;
