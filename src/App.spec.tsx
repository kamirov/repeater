import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RepeaterApp } from "@/App";
import { createRepeaterStore } from "@/stores/repeaterStore";

const styleId = "00000000-0000-4000-8000-000000000001";
const moveId = "00000000-0000-4000-8000-000000000101";

describe("RepeaterApp", () => {
  it("onboards an empty browser into its first style and move", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(styleId)
      .mockReturnValueOnce(moveId);
    const store = createRepeaterStore(localStorage);
    render(<RepeaterApp store={store} />);

    expect(screen.getByRole("heading", { name: /build your dance repertoire/i })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Create your first style" }));
    await user.type(screen.getByLabelText("Style name"), "Salsa");
    await user.click(screen.getByRole("button", { name: "Create style" }));

    expect(screen.getByRole("heading", { name: "Salsa" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Add first move" }));
    expect(screen.getByLabelText("Move name")).toBeVisible();
    expect(store.getState().styles[0].moves[0].id).toBe(moveId);
  });

  it("shows a non-destructive warning for malformed stored data", () => {
    localStorage.setItem("repeater:app-data:v1", "bad-data");
    const store = createRepeaterStore(localStorage);

    render(<RepeaterApp store={store} />);

    expect(screen.getByText(/saved repeater data could not be loaded/i)).toBeVisible();
  });
});
