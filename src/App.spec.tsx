import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RepeaterApp } from "@/App";
import type { RepeaterApi } from "@/lib/repeaterApi";
import { REPEATER_SECRET_KEY, createRepeaterStore } from "@/stores/repeaterStore";
import type { RepeaterDataV1 } from "@/types/repeater";

const empty: RepeaterDataV1 = { version: 1, styles: [], activeStyleId: null, delaySeconds: 5, comboDelaySeconds: 8 };

function apiWithState(state = empty): RepeaterApi {
  return {
    validateSecretWord: vi.fn().mockResolvedValue(true),
    getState: vi.fn().mockResolvedValue(state),
    importState: vi.fn(), createStyle: vi.fn(), updateStyle: vi.fn(), deleteStyle: vi.fn(),
    createMove: vi.fn(), updateMove: vi.fn(), deleteMove: vi.fn(), reorderMoves: vi.fn(), updateSettings: vi.fn(),
  } as RepeaterApi;
}

describe("RepeaterApp startup", () => {
  it("requires the secret before showing application data", () => {
    render(<RepeaterApp store={createRepeaterStore(localStorage, apiWithState())} />);

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("heading", { name: /enter the secret word/i })).toBeVisible();
    expect(screen.queryByRole("heading", { name: /build your dance repertoire/i })).not.toBeInTheDocument();
  });

  it("shows onboarding only after a successful empty backend response", async () => {
    localStorage.setItem(REPEATER_SECRET_KEY, "secret");
    const api = apiWithState();
    render(<RepeaterApp store={createRepeaterStore(localStorage, api)} />);

    expect(screen.getByRole("status")).toHaveTextContent(/loading your dance library/i);
    expect(await screen.findByRole("heading", { name: /build your dance repertoire/i })).toBeVisible();
    expect(api.getState).toHaveBeenCalledWith("secret");
  });

  it("accepts a submitted secret and opens an existing library", async () => {
    const user = userEvent.setup();
    const state: RepeaterDataV1 = {
      version: 1,
      styles: [{ id: "00000000-0000-4000-8000-000000000001", name: "Salsa", moves: [] }],
      activeStyleId: "00000000-0000-4000-8000-000000000001",
      delaySeconds: 5,
      comboDelaySeconds: 8,
    };
    render(<RepeaterApp store={createRepeaterStore(localStorage, apiWithState(state))} />);

    await user.type(screen.getByLabelText("Secret word"), "secret");
    await user.click(screen.getByRole("button", { name: /unlock repeater/i }));

    expect(await screen.findByRole("heading", { name: "Salsa" })).toBeVisible();
    expect(screen.getByRole("button", { name: /add first move/i })).toBeVisible();
  });

  it("keeps only one move open and starts with a collapsed sidebar", async () => {
    const user = userEvent.setup();
    const state: RepeaterDataV1 = {
      version: 1,
      styles: [{
        id: "00000000-0000-4000-8000-000000000001",
        name: "Salsa",
        moves: [
          { id: "move-one", name: "One", referenceUrl: "", description: "", isCombo: false },
          { id: "move-two", name: "Two", referenceUrl: "", description: "", isCombo: true },
        ],
      }],
      activeStyleId: "00000000-0000-4000-8000-000000000001",
      delaySeconds: 5,
      comboDelaySeconds: 8,
    };
    localStorage.setItem(REPEATER_SECRET_KEY, "secret");
    render(<RepeaterApp store={createRepeaterStore(localStorage, apiWithState(state))} />);

    await user.click(await screen.findByRole("button", { name: /edit one/i }));
    await user.click(screen.getByRole("button", { name: /edit two/i }));

    expect(screen.getByRole("button", { name: /edit one/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /collapse two/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Expand style navigation" })).toBeVisible();
  });

  it("offers valid legacy data and allows starting fresh without deleting it", async () => {
    const user = userEvent.setup();
    localStorage.setItem(REPEATER_SECRET_KEY, "secret");
    localStorage.setItem("repeater:app-data:v1", JSON.stringify({
      version: 1,
      styles: [{ id: "00000000-0000-4000-8000-000000000001", name: "Salsa", moves: [] }],
      activeStyleId: "00000000-0000-4000-8000-000000000001",
      delaySeconds: 8,
      comboDelaySeconds: 8,
    }));
    render(<RepeaterApp store={createRepeaterStore(localStorage, apiWithState())} />);

    expect(await screen.findByRole("heading", { name: /import this browser’s library/i })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /start fresh/i }));

    expect(screen.queryByRole("heading", { name: /import this browser’s library/i })).not.toBeInTheDocument();
    expect(localStorage.getItem("repeater:app-data:v1")).not.toBeNull();
  });
});
