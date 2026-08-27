import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MoveWorkspace } from "@/components/MoveWorkspace";
import type { PracticeLoopProps } from "@/components/PracticeCard";
import { TooltipProvider } from "@/components/ui/tooltip";

const style = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Salsa",
  moves: [{ id: "00000000-0000-4000-8000-000000000101", name: "Cross-body lead", referenceUrl: "", description: "Keep the slot.", isCombo: false }],
};

const practice: PracticeLoopProps = {
  delaySeconds: 5,
  comboDelaySeconds: 8,
  eligibleMoveCount: 1,
  isRunning: false,
  isSpeechSupported: true,
  onDelayChange: vi.fn(),
  onDelayBlur: vi.fn(),
  onComboDelayChange: vi.fn(),
  onComboDelayBlur: vi.fn(),
  onStart: vi.fn(),
  onStop: vi.fn(),
};

const activePractice: PracticeLoopProps = {
  ...practice,
  isRunning: true,
};

describe("MoveWorkspace", () => {
  it("renders a pending move and exposes its editor callbacks", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const onAddMove = vi.fn();
    render(
      <TooltipProvider><MoveWorkspace
        style={style}
        practice={activePractice}
        currentMove={style.moves[0]}
        progress={0.4}
        expandedMoveId={null}
        onAddMove={onAddMove}
        onExpandedChange={onExpandedChange}
        onChangeMove={vi.fn()}
        onDeleteMove={vi.fn()}
        onReorderMoves={vi.fn()}
        pendingMoveIds={new Set([style.moves[0].id])}
        moveSaveErrors={{}}
        reordering={false}
        onFlushMove={vi.fn()}
        onRetryMove={vi.fn()}
      /></TooltipProvider>,
    );

    expect(screen.getByRole("status", { name: "Saving move" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /edit cross-body lead/i }));
    expect(onExpandedChange).toHaveBeenCalledWith(style.moves[0].id, true);
    await user.click(screen.getByRole("button", { name: "Add move" }));
    expect(onAddMove).toHaveBeenCalledOnce();
  });

  it("renders the centered current move and progress value", () => {
    const onStop = vi.fn();
    render(
      <TooltipProvider><MoveWorkspace
        style={style}
        practice={{ ...activePractice, onStop }}
        currentMove={style.moves[0]}
        progress={0.4}
        expandedMoveId={null}
        onAddMove={vi.fn()}
        onExpandedChange={vi.fn()}
        onChangeMove={vi.fn()}
        onDeleteMove={vi.fn()}
        onReorderMoves={vi.fn()}
        pendingMoveIds={new Set()}
        moveSaveErrors={{}}
        reordering={false}
        onFlushMove={vi.fn()}
        onRetryMove={vi.fn()}
      /></TooltipProvider>,
    );

    const progressbar = screen.getByRole("progressbar", { name: /time until next move/i });
    expect(progressbar).toBeVisible();
    expect(progressbar).toHaveTextContent("Cross-body lead");
    expect(progressbar).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByTestId("current-move-overlay")).toHaveClass("opacity-100");
    expect(screen.getByTestId("current-move-overlay")).toHaveTextContent("Cross-body lead");
    expect(screen.getByRole("button", { name: "Back to move library" })).toBeVisible();

    screen.getByRole("button", { name: "Back to move library" }).click();
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("keeps the inactive indicator mounted while fading it out", () => {
    render(
      <TooltipProvider><MoveWorkspace
        style={style}
        practice={practice}
        currentMove={null}
        progress={null}
        expandedMoveId={null}
        onAddMove={vi.fn()}
        onExpandedChange={vi.fn()}
        onChangeMove={vi.fn()}
        onDeleteMove={vi.fn()}
        onReorderMoves={vi.fn()}
        pendingMoveIds={new Set()}
        moveSaveErrors={{}}
        reordering={false}
        onFlushMove={vi.fn()}
        onRetryMove={vi.fn()}
      /></TooltipProvider>,
    );

    const indicator = screen.getByTestId("current-move-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass("opacity-0");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("current-move-overlay")).toHaveClass("opacity-0");
    expect(screen.getByTestId("current-move-overlay")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the empty move state", () => {
    render(
      <TooltipProvider><MoveWorkspace
        style={{ ...style, moves: [] }}
        practice={practice}
        currentMove={null}
        progress={null}
        expandedMoveId={null}
        onAddMove={vi.fn()}
        onExpandedChange={vi.fn()}
        onChangeMove={vi.fn()}
        onDeleteMove={vi.fn()}
        onReorderMoves={vi.fn()}
        pendingMoveIds={new Set()}
        moveSaveErrors={{}}
        reordering={false}
        onFlushMove={vi.fn()}
        onRetryMove={vi.fn()}
      /></TooltipProvider>,
    );
    expect(screen.getByRole("heading", { name: /add the first move/i })).toBeVisible();
  });
});
