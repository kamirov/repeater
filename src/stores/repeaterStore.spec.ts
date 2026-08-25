import { describe, expect, it, vi } from "vitest";

import { RepeaterApiError, type RepeaterApi } from "@/lib/repeaterApi";
import { REPEATER_SECRET_KEY, REPEATER_STORAGE_KEY, createRepeaterStore } from "@/stores/repeaterStore";
import type { Move, RepeaterDataV1 } from "@/types/repeater";

const styleId = "00000000-0000-4000-8000-000000000001";
const moveId = "00000000-0000-4000-8000-000000000101";
const styleTwoId = "00000000-0000-4000-8000-000000000002";
const moveTwoId = "00000000-0000-4000-8000-000000000102";
const empty: RepeaterDataV1 = { version: 1, styles: [], activeStyleId: null, delaySeconds: 5 };

function fakeApi(state: RepeaterDataV1 = empty): RepeaterApi {
  return {
    validateSecretWord: vi.fn().mockResolvedValue(true),
    getState: vi.fn().mockResolvedValue(state),
    importState: vi.fn().mockImplementation(async (_secret, data) => data),
    createStyle: vi.fn().mockImplementation(async (_secret, style) => ({ ...style, moves: [] })),
    updateStyle: vi.fn().mockImplementation(async (_secret, id, name) => ({ id, name, moves: [] })),
    deleteStyle: vi.fn().mockResolvedValue({ activeStyleId: null }),
    createMove: vi.fn().mockImplementation(async (_secret, _styleId, id) => ({ id, name: "", referenceUrl: "", description: "" })),
    updateMove: vi.fn().mockImplementation(async (_secret, _styleId, move) => move),
    deleteMove: vi.fn().mockResolvedValue(undefined),
    reorderMoves: vi.fn().mockResolvedValue(undefined),
    updateSettings: vi.fn().mockImplementation(async (_secret, patch) => ({ activeStyleId: null, delaySeconds: 5, ...patch })),
  };
}

describe("createRepeaterStore", () => {
  it("stays locked until a valid secret hydrates backend state", async () => {
    const api = fakeApi({ ...empty, delaySeconds: 9 });
    const store = createRepeaterStore(localStorage, api);

    expect(store.getState().loadStatus).toBe("locked");
    expect(await store.getState().submitSecret(" open sesame ")).toBe(true);

    expect(store.getState().loadStatus).toBe("ready");
    expect(store.getState().delaySeconds).toBe(9);
    expect(localStorage.getItem(REPEATER_SECRET_KEY)).toBe("open sesame");
  });

  it("clears a rejected stored secret and returns to the access dialog", async () => {
    localStorage.setItem(REPEATER_SECRET_KEY, "old");
    const api = fakeApi();
    vi.mocked(api.getState).mockRejectedValue(new RepeaterApiError("wrong", 401, "INVALID_SECRET"));
    const store = createRepeaterStore(localStorage, api);

    await store.getState().initialize();

    expect(store.getState().loadStatus).toBe("locked");
    expect(store.getState().authError).toMatch(/not accepted/i);
    expect(localStorage.getItem(REPEATER_SECRET_KEY)).toBeNull();
  });

  it("offers and imports valid local data only after an empty backend load", async () => {
    const legacy: RepeaterDataV1 = {
      version: 1,
      styles: [{ id: styleId, name: "Salsa", moves: [] }],
      activeStyleId: styleId,
      delaySeconds: 8,
    };
    localStorage.setItem(REPEATER_STORAGE_KEY, JSON.stringify(legacy));
    const api = fakeApi();
    const store = createRepeaterStore(localStorage, api);

    await store.getState().submitSecret("secret");
    expect(store.getState().legacyImport).toEqual(legacy);
    await store.getState().importLegacyData();

    expect(api.importState).toHaveBeenCalledWith("secret", legacy);
    expect(store.getState().styles[0].name).toBe("Salsa");
    expect(localStorage.getItem(REPEATER_STORAGE_KEY)).toBeNull();
  });

  it("creates styles and moves optimistically through resource endpoints", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValueOnce(styleId).mockReturnValueOnce(moveId);
    const api = fakeApi();
    const store = createRepeaterStore(localStorage, api);
    await store.getState().submitSecret("secret");

    const createdStyleId = await store.getState().addStyle(" Salsa ");
    const createdMoveId = await store.getState().addMove(createdStyleId);

    expect(createdStyleId).toBe(styleId);
    expect(createdMoveId).toBe(moveId);
    expect(store.getState().styles[0]).toMatchObject({ name: "Salsa", moves: [{ id: moveId }] });
    expect(api.createStyle).toHaveBeenCalledWith("secret", { id: styleId, name: "Salsa" });
    expect(api.createMove).toHaveBeenCalledWith("secret", styleId, moveId);
  });

  it("adds new moves to the top of the active style", async () => {
    const state: RepeaterDataV1 = {
      version: 1,
      styles: [{
        id: styleId,
        name: "Salsa",
        moves: [
          { id: moveId, name: "One", referenceUrl: "", description: "" },
          { id: moveTwoId, name: "Two", referenceUrl: "", description: "" },
        ],
      }],
      activeStyleId: styleId,
      delaySeconds: 5,
    };
    const newMoveId = "00000000-0000-4000-8000-000000000103";
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValueOnce(newMoveId);
    const store = createRepeaterStore(localStorage, fakeApi(state));
    await store.getState().submitSecret("secret");

    await store.getState().addMove(styleId);

    expect(store.getState().styles[0].moves.map((move) => move.id)).toEqual([newMoveId, moveId, moveTwoId]);
  });

  it("debounces move edits and keeps the latest values", async () => {
    vi.useFakeTimers();
    const state: RepeaterDataV1 = {
      version: 1,
      styles: [{ id: styleId, name: "Salsa", moves: [{ id: moveId, name: "", referenceUrl: "", description: "" }] }],
      activeStyleId: styleId,
      delaySeconds: 5,
    };
    const api = fakeApi(state);
    let resolveUpdate: ((move: Move) => void) | undefined;
    vi.mocked(api.updateMove).mockImplementation(() => new Promise((resolve) => {
      resolveUpdate = resolve;
    }));
    const store = createRepeaterStore(localStorage, api);
    await store.getState().submitSecret("secret");

    store.getState().updateMove(styleId, moveId, { name: "Cross", referenceUrl: "", description: "" });
    store.getState().updateMove(styleId, moveId, { name: "Cross-body lead", referenceUrl: "", description: "" });
    expect(store.getState().pendingMoveIds.has(moveId)).toBe(false);
    await vi.advanceTimersByTimeAsync(500);

    expect(api.updateMove).toHaveBeenCalledTimes(1);
    expect(api.updateMove).toHaveBeenCalledWith("secret", styleId, expect.objectContaining({ name: "Cross-body lead" }));
    expect(store.getState().pendingMoveIds.has(moveId)).toBe(true);
    resolveUpdate?.({ id: moveId, name: "Cross-body lead", referenceUrl: "", description: "" });
    await vi.advanceTimersByTimeAsync(0);
    expect(store.getState().pendingMoveIds.has(moveId)).toBe(false);
    vi.useRealTimers();
  });

  it("persists rename, selection, ordering, deletion, and delay settings", async () => {
    const state: RepeaterDataV1 = {
      version: 1,
      styles: [
        { id: styleId, name: "Salsa", moves: [
          { id: moveId, name: "One", referenceUrl: "", description: "" },
          { id: moveTwoId, name: "Two", referenceUrl: "", description: "" },
        ] },
        { id: styleTwoId, name: "Bachata", moves: [] },
      ],
      activeStyleId: styleId,
      delaySeconds: 5,
    };
    const api = fakeApi(state);
    vi.mocked(api.deleteStyle).mockResolvedValue({ activeStyleId: styleTwoId });
    const store = createRepeaterStore(localStorage, api);
    await store.getState().submitSecret("secret");

    await store.getState().renameStyle(styleId, "Salsa on 2");
    await store.getState().setActiveStyle(styleTwoId);
    await store.getState().reorderMoves(styleId, [moveTwoId, moveId]);
    await store.getState().deleteMove(styleId, moveId);
    store.getState().setDelaySeconds(12);
    await store.getState().flushDelay();
    await store.getState().deleteStyle(styleId);

    expect(api.updateStyle).toHaveBeenCalledWith("secret", styleId, "Salsa on 2");
    expect(api.updateSettings).toHaveBeenCalledWith("secret", { activeStyleId: styleTwoId });
    expect(api.reorderMoves).toHaveBeenCalledWith("secret", styleId, [moveTwoId, moveId]);
    expect(api.deleteMove).toHaveBeenCalledWith("secret", styleId, moveId);
    expect(api.updateSettings).toHaveBeenCalledWith("secret", { delaySeconds: 12 });
    expect(store.getState().styles.map((style) => style.id)).toEqual([styleTwoId]);
  });

  it("rolls back a failed destructive mutation and retains failed move edits", async () => {
    const state: RepeaterDataV1 = {
      version: 1,
      styles: [{ id: styleId, name: "Salsa", moves: [{ id: moveId, name: "Old", referenceUrl: "", description: "" }] }],
      activeStyleId: styleId,
      delaySeconds: 5,
    };
    const api = fakeApi(state);
    vi.mocked(api.deleteMove).mockRejectedValue(new Error("offline"));
    vi.mocked(api.updateMove).mockRejectedValue(new Error("save failed"));
    const store = createRepeaterStore(localStorage, api);
    await store.getState().submitSecret("secret");

    await expect(store.getState().deleteMove(styleId, moveId)).rejects.toThrow("offline");
    expect(store.getState().styles[0].moves).toHaveLength(1);

    store.getState().updateMove(styleId, moveId, { name: "New", referenceUrl: "", description: "" });
    await store.getState().flushMove(styleId, moveId);
    expect(store.getState().styles[0].moves[0].name).toBe("New");
    expect(store.getState().moveSaveErrors[moveId]).toBe("save failed");
  });
});
