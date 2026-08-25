import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StyleNavigation } from "@/components/StyleNavigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { DanceStyle } from "@/types/repeater";

const salsa: DanceStyle = {
  id: "salsa",
  name: "Salsa",
  moves: [
    { id: "move-1", name: "Inside turn", referenceUrl: "", description: "" },
  ],
};

function renderNavigation(overrides: Partial<React.ComponentProps<typeof StyleNavigation>> = {}) {
  const props = {
    styles: [salsa],
    activeStyleId: "salsa",
    onCreate: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
    onSelect: vi.fn(),
    ...overrides,
  };
  render(
    <ThemeProvider>
      <TooltipProvider>
        <StyleNavigation {...props} />
      </TooltipProvider>
    </ThemeProvider>,
  );
  return props;
}

describe("StyleNavigation", () => {
  it("creates and selects styles", async () => {
    const user = userEvent.setup();
    const props = renderNavigation();

    await user.click(screen.getByRole("button", { name: "Add dance style" }));
    await user.type(screen.getByLabelText("Style name"), "Bachata");
    await user.click(screen.getByRole("button", { name: "Create style" }));
    expect(props.onCreate).toHaveBeenCalledWith("Bachata");

    await user.click(screen.getByRole("button", { name: "Salsa" }));
    expect(props.onSelect).toHaveBeenCalledWith("salsa");
  });

  it("renames and confirms cascading style deletion", async () => {
    const user = userEvent.setup();
    const props = renderNavigation();

    await user.click(screen.getByRole("button", { name: "Manage Salsa" }));
    await user.click(screen.getByRole("menuitem", { name: /rename/i }));
    const name = screen.getByLabelText("Style name");
    await user.clear(name);
    await user.type(name, "Salsa on 2");
    await user.click(screen.getByRole("button", { name: "Save name" }));
    expect(props.onRename).toHaveBeenCalledWith("salsa", "Salsa on 2");

    await user.click(screen.getByRole("button", { name: "Manage Salsa" }));
    await user.click(screen.getByRole("menuitem", { name: /delete/i }));
    expect(screen.getByText(/all 1 of its moves/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Delete style" }));
    expect(props.onDelete).toHaveBeenCalledWith("salsa");
  });
});
