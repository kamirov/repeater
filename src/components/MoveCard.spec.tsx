import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { MoveCard } from "@/components/MoveCard";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Move } from "@/types/repeater";

const move: Move = {
  id: "move-1",
  name: "Cross-body lead",
  referenceUrl: "https://example.com",
  description: "Clear the slot before leading across.",
  isCombo: false,
};

describe("MoveCard", () => {
  it("shows the compact summary and expands an auto-saving editor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <TooltipProvider>
        <MoveCard
          move={move}
          expanded={false}
          onExpandedChange={onExpandedChange}
          onChange={onChange}
          onDelete={vi.fn()}
          dragHandle={<button type="button">Drag</button>}
        />
      </TooltipProvider>,
    );

    expect(screen.getByText("Clear the slot before leading across.")).toBeVisible();
    expect(screen.getByRole("link", { name: /open reference/i })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    await user.click(screen.getByRole("button", { name: /edit cross-body lead/i }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.queryByLabelText("Move name")).not.toBeInTheDocument();
  });

  it("does not show filler copy when a move has no description", () => {
    render(
      <TooltipProvider>
        <MoveCard
          move={{ ...move, description: "" }}
          expanded={false}
          onExpandedChange={vi.fn()}
          onChange={vi.fn()}
          onDelete={vi.fn()}
          dragHandle={<button type="button">Drag</button>}
        />
      </TooltipProvider>,
    );

    expect(screen.queryByText("Add notes, cues, or a reference video")).not.toBeInTheDocument();
  });

  it("accepts protocol-less reference URLs and reports malformed URLs while expanded", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Harness() {
      const [currentMove, setCurrentMove] = useState(move);
      return (
        <TooltipProvider>
          <MoveCard
            move={currentMove}
            expanded
            onExpandedChange={vi.fn()}
            onChange={(nextMove) => {
              setCurrentMove(nextMove);
              onChange(nextMove);
            }}
            onDelete={vi.fn()}
            dragHandle={<button type="button">Drag</button>}
          />
        </TooltipProvider>
      );
    }
    render(<Harness />);

    const name = screen.getByLabelText("Move name");
    await user.clear(name);
    await user.type(name, "Inside turn");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Inside turn" }),
    );

    const reference = screen.getByLabelText("Reference URL");
    await user.clear(reference);
    await user.type(reference, "youtube.com/watch");
    expect(screen.queryByText(/enter a url like/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open reference/i })).toHaveAttribute(
      "href",
      "https://youtube.com/watch",
    );

    await user.clear(reference);
    await user.type(reference, "https://");
    expect(screen.getByText(/enter a url like/i)).toBeVisible();
    expect(screen.queryByRole("link", { name: /open reference/i })).not.toBeInTheDocument();
  });

  it("toggles the combo switch beside the move name", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TooltipProvider>
        <MoveCard
          move={move}
          expanded
          onExpandedChange={vi.fn()}
          onChange={onChange}
          onDelete={vi.fn()}
          dragHandle={<button type="button">Drag</button>}
        />
      </TooltipProvider>,
    );

    const combo = screen.getByRole("switch", { name: "Combo" });
    expect(combo).toHaveAttribute("aria-checked", "false");
    await user.click(combo);
    expect(onChange).toHaveBeenCalledWith({ ...move, isCombo: true });
  });

  it("shows the combo icon before the move name in the trigger", () => {
    render(
      <TooltipProvider>
        <MoveCard
          move={{ ...move, isCombo: true }}
          expanded={false}
          onExpandedChange={vi.fn()}
          onChange={vi.fn()}
          onDelete={vi.fn()}
          dragHandle={<button type="button">Drag</button>}
        />
      </TooltipProvider>,
    );

    expect(screen.getByRole("img", { name: "Combo move" })).toBeVisible();
    expect(screen.getByRole("button", { name: /edit cross-body lead/i })).toContainElement(
      screen.getByRole("img", { name: "Combo move" }),
    );
  });

  it("confirms destructive move deletion", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TooltipProvider>
        <MoveCard
          move={move}
          expanded={false}
          onExpandedChange={vi.fn()}
          onChange={vi.fn()}
          onDelete={onDelete}
          dragHandle={<button type="button">Drag</button>}
        />
      </TooltipProvider>,
    );

    await user.click(screen.getByRole("button", { name: /delete cross-body lead/i }));
    await user.click(screen.getByRole("button", { name: "Delete move" }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("shows saving beside the delete action", () => {
    render(
      <TooltipProvider>
        <MoveCard
          move={move}
          expanded={false}
          saving
          onExpandedChange={vi.fn()}
          onChange={vi.fn()}
          onDelete={vi.fn()}
          dragHandle={<button type="button">Drag</button>}
        />
      </TooltipProvider>,
    );

    expect(screen.getByRole("status", { name: "Saving move" })).toBeVisible();
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
  });
});
