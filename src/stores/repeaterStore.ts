import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import { z } from "zod";

import type { Move, RepeaterDataV1 } from "@/types/repeater";

export const REPEATER_STORAGE_KEY = "repeater:app-data:v1";

const moveSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  referenceUrl: z.string(),
  description: z.string(),
});

const danceStyleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  moves: z.array(moveSchema),
});

const repeaterDataSchema = z
  .object({
    version: z.literal(1),
    styles: z.array(danceStyleSchema),
    activeStyleId: z.string().min(1).nullable(),
    delaySeconds: z.number().int().min(1).max(300),
  })
  .refine(
    (data) =>
      data.activeStyleId === null ||
      data.styles.some((style) => style.id === data.activeStyleId),
    { message: "The active style does not exist." },
  );

const emptyData: RepeaterDataV1 = {
  version: 1,
  styles: [],
  activeStyleId: null,
  delaySeconds: 5,
};

type MovePatch = Pick<Move, "name" | "referenceUrl" | "description">;

export type RepeaterStoreState = RepeaterDataV1 & {
  storageWarning: string | null;
  dismissStorageWarning: () => void;
  addStyle: (name: string) => string;
  renameStyle: (styleId: string, name: string) => void;
  deleteStyle: (styleId: string) => void;
  setActiveStyle: (styleId: string) => void;
  addMove: (styleId: string) => string;
  updateMove: (styleId: string, moveId: string, patch: MovePatch) => void;
  deleteMove: (styleId: string, moveId: string) => void;
  reorderMoves: (styleId: string, orderedMoveIds: string[]) => void;
  setDelaySeconds: (seconds: number) => void;
};

function toPersistedData(state: RepeaterStoreState): RepeaterDataV1 {
  return {
    version: 1,
    styles: state.styles,
    activeStyleId: state.activeStyleId,
    delaySeconds: state.delaySeconds,
  };
}

function loadPersistedData(storage?: Storage): {
  data: RepeaterDataV1;
  warning: string | null;
} {
  const raw = storage?.getItem(REPEATER_STORAGE_KEY);
  if (!raw) return { data: emptyData, warning: null };

  try {
    const parsed = repeaterDataSchema.safeParse(JSON.parse(raw) as unknown);
    if (parsed.success) return { data: parsed.data, warning: null };
  } catch {
    // The shared warning below is intentionally user-facing and non-destructive.
  }

  return {
    data: emptyData,
    warning: "Your saved Repeater data could not be loaded. A fresh workspace is ready.",
  };
}

/** Creates the canonical app store and persists every successful domain mutation. */
export function createRepeaterStore(storage?: Storage): StoreApi<RepeaterStoreState> {
  const initial = loadPersistedData(storage);

  return createStore<RepeaterStoreState>((set, get) => {
    const persist = () => {
      storage?.setItem(REPEATER_STORAGE_KEY, JSON.stringify(toPersistedData(get())));
    };

    const commit = (updater: (state: RepeaterStoreState) => Partial<RepeaterStoreState>) => {
      set((state) => updater(state));
      persist();
    };

    return {
      ...initial.data,
      storageWarning: initial.warning,
      dismissStorageWarning: () => set({ storageWarning: null }),
      addStyle: (name) => {
        const resolvedName = name.trim();
        if (!resolvedName) throw new Error("Style name is required.");
        const id = crypto.randomUUID();
        commit((state) => ({
          styles: [...state.styles, { id, name: resolvedName, moves: [] }],
          activeStyleId: id,
        }));
        return id;
      },
      renameStyle: (styleId, name) => {
        const resolvedName = name.trim();
        if (!resolvedName) throw new Error("Style name is required.");
        commit((state) => ({
          styles: state.styles.map((style) =>
            style.id === styleId ? { ...style, name: resolvedName } : style,
          ),
        }));
      },
      deleteStyle: (styleId) => {
        commit((state) => {
          const removedIndex = state.styles.findIndex((style) => style.id === styleId);
          if (removedIndex < 0) return {};
          const styles = state.styles.filter((style) => style.id !== styleId);
          const activeStyleId =
            state.activeStyleId === styleId
              ? (styles[removedIndex]?.id ?? styles[removedIndex - 1]?.id ?? null)
              : state.activeStyleId;
          return { styles, activeStyleId };
        });
      },
      setActiveStyle: (styleId) => {
        if (!get().styles.some((style) => style.id === styleId)) {
          throw new Error(`Dance style '${styleId}' does not exist.`);
        }
        commit(() => ({ activeStyleId: styleId }));
      },
      addMove: (styleId) => {
        if (!get().styles.some((style) => style.id === styleId)) {
          throw new Error(`Dance style '${styleId}' does not exist.`);
        }
        const id = crypto.randomUUID();
        const draft: Move = { id, name: "", referenceUrl: "", description: "" };
        commit((state) => ({
          styles: state.styles.map((style) =>
            style.id === styleId ? { ...style, moves: [...style.moves, draft] } : style,
          ),
        }));
        return id;
      },
      updateMove: (styleId, moveId, patch) => {
        commit((state) => ({
          styles: state.styles.map((style) =>
            style.id === styleId
              ? {
                  ...style,
                  moves: style.moves.map((move) =>
                    move.id === moveId ? { ...move, ...patch } : move,
                  ),
                }
              : style,
          ),
        }));
      },
      deleteMove: (styleId, moveId) => {
        commit((state) => ({
          styles: state.styles.map((style) =>
            style.id === styleId
              ? { ...style, moves: style.moves.filter((move) => move.id !== moveId) }
              : style,
          ),
        }));
      },
      reorderMoves: (styleId, orderedMoveIds) => {
        commit((state) => ({
          styles: state.styles.map((style) => {
            if (style.id !== styleId) return style;
            if (
              orderedMoveIds.length !== style.moves.length ||
              orderedMoveIds.some((id) => !style.moves.some((move) => move.id === id))
            ) {
              throw new Error("The reordered moves did not match the current list.");
            }
            const byId = new Map(style.moves.map((move) => [move.id, move]));
            return {
              ...style,
              moves: orderedMoveIds.map((id) => byId.get(id) as Move),
            };
          }),
        }));
      },
      setDelaySeconds: (seconds) => {
        const delaySeconds = Math.min(300, Math.max(1, Math.round(seconds)));
        commit(() => ({ delaySeconds }));
      },
    };
  });
}

export const repeaterStore = createRepeaterStore(
  typeof window === "undefined" ? undefined : window.localStorage,
);

export function useRepeaterStore<T>(selector: (state: RepeaterStoreState) => T): T {
  return useStore(repeaterStore, selector);
}
