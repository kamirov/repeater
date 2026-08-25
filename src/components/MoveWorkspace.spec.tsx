import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MoveWorkspace } from "@/components/MoveWorkspace";
import type { PracticeLoopProps } from "@/components/PracticeCard";
import { TooltipProvider } from "@/components/ui/tooltip";

const style = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Salsa",
  moves: [{ id: "00000000-0000-4000-8000-000000000101", name: "Cross-body lead", referenceUrl: "", description: "Keep the slot." }],
};

const practice: PracticeLoopProps = {
  delaySeconds: 5,
  eligibleMoveCount: 1,
  isRunning: false,
  isSpeechSupported: true,
  onDelayChange: vi.fn(),
  onDelayBlur: vi.fn(),
  onStart: vi.fn(),
  onStop: vi.fn(),
};

describe("MoveWorkspace", () => {
  it("renders a pending move and exposes its editor callbacks", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const onAddMove = vi.fn();
    render(
      <TooltipProvider><MoveWorkspace
        style={style}
        practice={practice}
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

    expect(screen.getByText("Saving…")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /edit cross-body lead/i }));
    expect(onExpandedChange).toHaveBeenCalledWith(style.moves[0].id, true);
    await user.click(screen.getByRole("button", { name: "Add move" }));
    expect(onAddMove).toHaveBeenCalledOnce();
  });

  it("renders the empty move state", () => {
    render(
      <TooltipProvider><MoveWorkspace
        style={{ ...style, moves: [] }}
        practice={practice}
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
