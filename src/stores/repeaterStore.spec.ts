import { describe, expect, it, vi } from "vitest";

import { REPEATER_STORAGE_KEY, createRepeaterStore } from "@/stores/repeaterStore";

const styleOneId = "00000000-0000-4000-8000-000000000001";
const styleTwoId = "00000000-0000-4000-8000-000000000002";
const moveOneId = "00000000-0000-4000-8000-000000000101";
const moveTwoId = "00000000-0000-4000-8000-000000000102";

describe("createRepeaterStore", () => {
  it("starts empty and ignores the legacy state key", () => {
    localStorage.setItem(
      "repeater-state",
      JSON.stringify({ style: { styles: [{ id: "legacy", name: "Salsa" }] } }),
    );

    const store = createRepeaterStore(localStorage);

    expect(store.getState().styles).toEqual([]);
    expect(store.getState().activeStyleId).toBeNull();
    expect(store.getState().delaySeconds).toBe(5);
    expect(localStorage.getItem("repeater-state")).not.toBeNull();
  });

  it("warns and falls back to empty data when persisted data is malformed", () => {
    localStorage.setItem(REPEATER_STORAGE_KEY, "not-json");

    const store = createRepeaterStore(localStorage);

    expect(store.getState().styles).toEqual([]);
    expect(store.getState().storageWarning).toMatch(/could not be loaded/i);
  });

  it("persists style CRUD and selects the adjacent style after deletion", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(styleOneId)
      .mockReturnValueOnce(styleTwoId);
    const store = createRepeaterStore(localStorage);

    const firstId = store.getState().addStyle(" Salsa ");
    const secondId = store.getState().addStyle("Bachata");
    store.getState().renameStyle(firstId, "Salsa on 2");
    store.getState().setActiveStyle(firstId);
    store.getState().deleteStyle(firstId);

    expect(secondId).toBe(styleTwoId);
    expect(store.getState().styles).toEqual([
      { id: styleTwoId, name: "Bachata", moves: [] },
    ]);
    expect(store.getState().activeStyleId).toBe(styleTwoId);
    expect(
      JSON.parse(localStorage.getItem(REPEATER_STORAGE_KEY) ?? "null"),
    ).toMatchObject({
      version: 1,
      activeStyleId: styleTwoId,
      styles: [{ id: styleTwoId, name: "Bachata" }],
    });
  });

  it("cascades moves when deleting the final style", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(styleOneId)
      .mockReturnValueOnce(moveOneId);
    const store = createRepeaterStore(localStorage);
    const styleId = store.getState().addStyle("Salsa");
    store.getState().addMove(styleId);

    store.getState().deleteStyle(styleId);

    expect(store.getState().styles).toEqual([]);
    expect(store.getState().activeStyleId).toBeNull();
  });

  it("persists move drafts, edits, deletion, and ordering", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(styleOneId)
      .mockReturnValueOnce(moveOneId)
      .mockReturnValueOnce(moveTwoId);
    const store = createRepeaterStore(localStorage);
    const styleId = store.getState().addStyle("Salsa");
    const firstMoveId = store.getState().addMove(styleId);
    const secondMoveId = store.getState().addMove(styleId);

    store.getState().updateMove(styleId, firstMoveId, {
      name: "Cross-body lead",
      referenceUrl: "https://example.com/cbl",
      description: "Keep the slot clear.",
    });
    store.getState().reorderMoves(styleId, [secondMoveId, firstMoveId]);

    expect(store.getState().styles[0].moves.map((move) => move.id)).toEqual([
      secondMoveId,
      firstMoveId,
    ]);
    expect(store.getState().styles[0].moves[1].name).toBe("Cross-body lead");

    store.getState().deleteMove(styleId, secondMoveId);
    expect(store.getState().styles[0].moves).toHaveLength(1);

    const rehydrated = createRepeaterStore(localStorage);
    expect(rehydrated.getState().styles[0].moves[0].id).toBe(firstMoveId);
  });

  it("clamps and persists the global integer delay", () => {
    const store = createRepeaterStore(localStorage);

    store.getState().setDelaySeconds(0);
    expect(store.getState().delaySeconds).toBe(1);
    store.getState().setDelaySeconds(999);
    expect(store.getState().delaySeconds).toBe(300);
    store.getState().setDelaySeconds(7.8);
    expect(store.getState().delaySeconds).toBe(8);
  });
});
