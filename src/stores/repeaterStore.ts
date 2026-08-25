import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

import { createRepeaterApi, RepeaterApiError, type RepeaterApi } from "@/lib/repeaterApi";
import type { Move, RepeaterDataV1 } from "@/types/repeater";
import { repeaterDataSchema } from "../../server/contracts";

export const REPEATER_STORAGE_KEY = "repeater:app-data:v1";
export const REPEATER_SECRET_KEY = "repeater:secret-word:v1";

type LoadStatus = "locked" | "loading" | "ready" | "error";
type SaveStatus = "saving" | "error";
type MovePatch = Pick<Move, "name" | "referenceUrl" | "description">;

const emptyData: RepeaterDataV1 = { version: 1, styles: [], activeStyleId: null, delaySeconds: 5 };

export type RepeaterStoreState = RepeaterDataV1 & {
  loadStatus: LoadStatus;
  authError: string | null;
  loadError: string | null;
  legacyImport: RepeaterDataV1 | null;
  importingLegacy: boolean;
  pendingStyleIds: Set<string>;
  pendingMoveIds: Set<string>;
  moveSaveErrors: Record<string, string>;
  reorderingStyleIds: Set<string>;
  delaySaveStatus: SaveStatus | null;
  initialize: () => Promise<void>;
  submitSecret: (secret: string) => Promise<boolean>;
  retryLoad: () => Promise<void>;
  dismissLegacyImport: () => void;
  importLegacyData: () => Promise<void>;
  addStyle: (name: string) => Promise<string>;
  renameStyle: (styleId: string, name: string) => Promise<void>;
  deleteStyle: (styleId: string) => Promise<void>;
  setActiveStyle: (styleId: string) => Promise<void>;
  addMove: (styleId: string) => Promise<string>;
  updateMove: (styleId: string, moveId: string, patch: MovePatch) => void;
  flushMove: (styleId: string, moveId: string) => Promise<void>;
  retryMove: (styleId: string, moveId: string) => Promise<void>;
  deleteMove: (styleId: string, moveId: string) => Promise<void>;
  reorderMoves: (styleId: string, orderedMoveIds: string[]) => Promise<void>;
  setDelaySeconds: (seconds: number) => void;
  flushDelay: () => Promise<void>;
};

function getLegacyData(storage?: Storage): { data: RepeaterDataV1 | null; warning: string | null } {
  const raw = storage?.getItem(REPEATER_STORAGE_KEY);
  if (!raw) return { data: null, warning: null };
  try {
    const parsed = repeaterDataSchema.safeParse(JSON.parse(raw) as unknown);
    return parsed.success
      ? { data: parsed.data, warning: null }
      : { data: null, warning: "Saved browser data could not be imported because it is invalid." };
  } catch {
    return { data: null, warning: "Saved browser data could not be imported because it is invalid." };
  }
}

function toggleId(ids: Set<string>, id: string, add: boolean): Set<string> {
  const next = new Set(ids);
  if (add) next.add(id);
  else next.delete(id);
  return next;
}

export function createRepeaterStore(storage?: Storage, api: RepeaterApi = createRepeaterApi()): StoreApi<RepeaterStoreState> {
  const moveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  let delayTimer: ReturnType<typeof setTimeout> | null = null;
  let retryAfterAuth: (() => Promise<void>) | null = null;
  let lastCandidateSecret = "";

  return createStore<RepeaterStoreState>((set, get) => {
    const getSecret = () => storage?.getItem(REPEATER_SECRET_KEY) ?? "";
    const lockForAuth = (retry?: () => Promise<void>) => {
      if (retry) retryAfterAuth = retry;
      storage?.removeItem(REPEATER_SECRET_KEY);
      set({ loadStatus: "locked", authError: "The secret word was not accepted." });
    };
    const handleFailure = (error: unknown, retry?: () => Promise<void>) => {
      if (error instanceof RepeaterApiError && error.code === "INVALID_SECRET") {
        lockForAuth(retry);
        return "Enter the secret word again to finish saving.";
      }
      return error instanceof Error ? error.message : "The request could not be completed.";
    };
    const hydrate = async (candidateSecret: string) => {
      lastCandidateSecret = candidateSecret;
      set({ loadStatus: "loading", loadError: null });
      try {
        const data = await api.getState(candidateSecret);
        const legacy = data.styles.length ? { data: null, warning: null } : getLegacyData(storage);
        set({ ...data, loadStatus: "ready", authError: null, loadError: legacy.warning, legacyImport: legacy.data });
        return true;
      } catch (error) {
        if (error instanceof RepeaterApiError && error.code === "INVALID_SECRET") lockForAuth();
        else set({ loadStatus: "error", loadError: handleFailure(error) });
        return false;
      }
    };
    const validateAndHydrate = async (candidateSecret: string) => {
      lastCandidateSecret = candidateSecret;
      try {
        const valid = await api.validateSecretWord(candidateSecret);
        if (!valid) {
          storage?.removeItem(REPEATER_SECRET_KEY);
          set({ loadStatus: "locked", authError: "The secret word was not accepted." });
          return false;
        }
        storage?.setItem(REPEATER_SECRET_KEY, candidateSecret);
        return hydrate(candidateSecret);
      } catch {
        set({
          loadStatus: "locked",
          authError: "The secret word could not be validated. Check the backend and try again.",
        });
        return false;
      }
    };
    const saveMove = async (styleId: string, moveId: string) => {
      const timer = moveTimers.get(moveId);
      if (timer) clearTimeout(timer);
      moveTimers.delete(moveId);
      const move = get().styles.find((style) => style.id === styleId)?.moves.find((item) => item.id === moveId);
      if (!move) return;
      set((state) => ({
        pendingMoveIds: toggleId(state.pendingMoveIds, moveId, true),
        moveSaveErrors: Object.fromEntries(Object.entries(state.moveSaveErrors).filter(([id]) => id !== moveId)),
      }));
      try {
        await api.updateMove(getSecret(), styleId, move);
        set((state) => ({ pendingMoveIds: toggleId(state.pendingMoveIds, moveId, false) }));
      } catch (error) {
        const retry = async () => {
          set((state) => ({ styles: state.styles.map((style) => style.id === styleId ? {
            ...style,
            moves: style.moves.map((item) => item.id === moveId ? move : item),
          } : style) }));
          await saveMove(styleId, moveId);
        };
        const message = handleFailure(error, retry);
        set((state) => ({ pendingMoveIds: toggleId(state.pendingMoveIds, moveId, false), moveSaveErrors: { ...state.moveSaveErrors, [moveId]: message } }));
      }
    };

    return {
      ...emptyData,
      loadStatus: getSecret() ? "loading" : "locked",
      authError: null,
      loadError: null,
      legacyImport: null,
      importingLegacy: false,
      pendingStyleIds: new Set(),
      pendingMoveIds: new Set(),
      moveSaveErrors: {},
      reorderingStyleIds: new Set(),
      delaySaveStatus: null,
      initialize: async () => {
        const stored = getSecret();
        if (!stored) set({ loadStatus: "locked" });
        else await validateAndHydrate(stored);
      },
      submitSecret: async (candidate) => {
        const normalized = candidate.trim();
        if (!normalized) return false;
        const accepted = await validateAndHydrate(normalized);
        if (accepted && retryAfterAuth) {
          const retry = retryAfterAuth;
          retryAfterAuth = null;
          await retry();
        }
        return accepted;
      },
      retryLoad: async () => {
        const stored = getSecret() || lastCandidateSecret;
        if (stored) await validateAndHydrate(stored);
        else set({ loadStatus: "locked" });
      },
      dismissLegacyImport: () => set({ legacyImport: null }),
      importLegacyData: async () => {
        const legacy = get().legacyImport;
        if (!legacy) return;
        set({ importingLegacy: true });
        try {
          const data = await api.importState(getSecret(), legacy);
          storage?.removeItem(REPEATER_STORAGE_KEY);
          set({ ...data, importingLegacy: false, legacyImport: null });
        } catch (error) {
          set({ importingLegacy: false, loadError: handleFailure(error, () => get().importLegacyData()) });
        }
      },
      addStyle: async (name) => {
        const resolvedName = name.trim();
        if (!resolvedName) throw new Error("Style name is required.");
        const id = crypto.randomUUID();
        set((state) => ({ styles: [...state.styles, { id, name: resolvedName, moves: [] }], activeStyleId: id, pendingStyleIds: toggleId(state.pendingStyleIds, id, true) }));
        try {
          await api.createStyle(getSecret(), { id, name: resolvedName });
        } catch (error) {
          handleFailure(error, () => get().addStyle(resolvedName).then(() => undefined));
          set((state) => ({ styles: state.styles.filter((style) => style.id !== id), activeStyleId: state.styles.find((style) => style.id !== id)?.id ?? null }));
          throw error;
        } finally {
          set((state) => ({ pendingStyleIds: toggleId(state.pendingStyleIds, id, false) }));
        }
        return id;
      },
      renameStyle: async (styleId, name) => {
        const resolvedName = name.trim();
        const previous = get().styles.find((style) => style.id === styleId)?.name;
        if (!resolvedName || previous === undefined) return;
        set((state) => ({ styles: state.styles.map((style) => style.id === styleId ? { ...style, name: resolvedName } : style), pendingStyleIds: toggleId(state.pendingStyleIds, styleId, true) }));
        try {
          await api.updateStyle(getSecret(), styleId, resolvedName);
        } catch (error) {
          handleFailure(error, () => get().renameStyle(styleId, resolvedName));
          set((state) => ({ styles: state.styles.map((style) => style.id === styleId ? { ...style, name: previous } : style) }));
          throw error;
        } finally {
          set((state) => ({ pendingStyleIds: toggleId(state.pendingStyleIds, styleId, false) }));
        }
      },
      deleteStyle: async (styleId) => {
        const before = { styles: get().styles, activeStyleId: get().activeStyleId };
        const removedIndex = before.styles.findIndex((style) => style.id === styleId);
        if (removedIndex < 0) return;
        const styles = before.styles.filter((style) => style.id !== styleId);
        const activeStyleId = before.activeStyleId === styleId ? (styles[removedIndex]?.id ?? styles[removedIndex - 1]?.id ?? null) : before.activeStyleId;
        set((state) => ({ styles, activeStyleId, pendingStyleIds: toggleId(state.pendingStyleIds, styleId, true) }));
        try {
          const result = await api.deleteStyle(getSecret(), styleId);
          set({ activeStyleId: result.activeStyleId });
        } catch (error) {
          handleFailure(error, () => get().deleteStyle(styleId));
          set(before);
          throw error;
        } finally {
          set((state) => ({ pendingStyleIds: toggleId(state.pendingStyleIds, styleId, false) }));
        }
      },
      setActiveStyle: async (styleId) => {
        if (!get().styles.some((style) => style.id === styleId)) return;
        const previous = get().activeStyleId;
        set({ activeStyleId: styleId });
        try {
          await api.updateSettings(getSecret(), { activeStyleId: styleId });
        } catch (error) {
          handleFailure(error, () => get().setActiveStyle(styleId));
          set({ activeStyleId: previous });
        }
      },
      addMove: async (styleId) => {
        const id = crypto.randomUUID();
        const draft: Move = { id, name: "", referenceUrl: "", description: "" };
        set((state) => ({ styles: state.styles.map((style) => style.id === styleId ? { ...style, moves: [draft, ...style.moves] } : style), pendingMoveIds: toggleId(state.pendingMoveIds, id, true) }));
        try {
          await api.createMove(getSecret(), styleId, id);
        } catch (error) {
          handleFailure(error, () => get().addMove(styleId).then(() => undefined));
          set((state) => ({ styles: state.styles.map((style) => style.id === styleId ? { ...style, moves: style.moves.filter((move) => move.id !== id) } : style) }));
          throw error;
        } finally {
          set((state) => ({ pendingMoveIds: toggleId(state.pendingMoveIds, id, false) }));
        }
        return id;
      },
      updateMove: (styleId, moveId, patch) => {
        set((state) => ({
          styles: state.styles.map((style) => style.id === styleId ? { ...style, moves: style.moves.map((move) => move.id === moveId ? { ...move, ...patch } : move) } : style),
        }));
        const current = moveTimers.get(moveId);
        if (current) clearTimeout(current);
        moveTimers.set(moveId, setTimeout(() => void saveMove(styleId, moveId), 500));
      },
      flushMove: saveMove,
      retryMove: saveMove,
      deleteMove: async (styleId, moveId) => {
        const previous = get().styles;
        const timer = moveTimers.get(moveId);
        if (timer) clearTimeout(timer);
        moveTimers.delete(moveId);
        set((state) => ({ styles: state.styles.map((style) => style.id === styleId ? { ...style, moves: style.moves.filter((move) => move.id !== moveId) } : style), pendingMoveIds: toggleId(state.pendingMoveIds, moveId, true) }));
        try {
          await api.deleteMove(getSecret(), styleId, moveId);
        } catch (error) {
          handleFailure(error, () => get().deleteMove(styleId, moveId));
          set({ styles: previous });
          throw error;
        } finally {
          set((state) => ({ pendingMoveIds: toggleId(state.pendingMoveIds, moveId, false) }));
        }
      },
      reorderMoves: async (styleId, orderedMoveIds) => {
        const previous = get().styles;
        const style = previous.find((item) => item.id === styleId);
        const byId = new Map(style?.moves.map((move) => [move.id, move]) ?? []);
        if (!style || orderedMoveIds.length !== style.moves.length || new Set(orderedMoveIds).size !== orderedMoveIds.length || orderedMoveIds.some((id) => !byId.has(id))) return;
        set((state) => ({ styles: state.styles.map((item) => item.id === styleId ? { ...item, moves: orderedMoveIds.map((id) => byId.get(id)!) } : item), reorderingStyleIds: toggleId(state.reorderingStyleIds, styleId, true) }));
        try {
          await api.reorderMoves(getSecret(), styleId, orderedMoveIds);
        } catch (error) {
          handleFailure(error, () => get().reorderMoves(styleId, orderedMoveIds));
          set({ styles: previous });
          throw error;
        } finally {
          set((state) => ({ reorderingStyleIds: toggleId(state.reorderingStyleIds, styleId, false) }));
        }
      },
      setDelaySeconds: (seconds) => {
        set({ delaySeconds: Math.min(300, Math.max(1, Math.round(seconds))), delaySaveStatus: "saving" });
        if (delayTimer) clearTimeout(delayTimer);
        delayTimer = setTimeout(() => void get().flushDelay(), 500);
      },
      flushDelay: async () => {
        if (delayTimer) clearTimeout(delayTimer);
        delayTimer = null;
        const delaySeconds = get().delaySeconds;
        try {
          await api.updateSettings(getSecret(), { delaySeconds });
          set({ delaySaveStatus: null });
        } catch (error) {
          handleFailure(error, async () => {
            set({ delaySeconds, delaySaveStatus: "saving" });
            await get().flushDelay();
          });
          set({ delaySaveStatus: "error" });
        }
      },
    };
  });
}

export const repeaterStore = createRepeaterStore(typeof window === "undefined" ? undefined : window.localStorage);

export function useRepeaterStore<T>(selector: (state: RepeaterStoreState) => T): T {
  return useStore(repeaterStore, selector);
}
