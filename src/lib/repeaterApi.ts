import type { DanceStyle, Move, RepeaterDataV1 } from "@/types/repeater";

export class RepeaterApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

export type RepeaterApi = ReturnType<typeof createRepeaterApi>;

export function createRepeaterApi(fetcher: typeof fetch = fetch) {
  async function request<T>(secret: string, path: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Repeater-Secret": secret } : {}),
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      throw new RepeaterApiError(
        payload?.error?.message ?? `Request failed with status ${response.status}.`,
        response.status,
        payload?.error?.code,
      );
    }
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("Content-Type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new RepeaterApiError(
        "The backend API is unavailable. Start Repeater with `pnpm dev` so the local Vercel Functions are included.",
        response.status,
        "INVALID_API_RESPONSE",
      );
    }
    return (await response.json()) as T;
  }

  return {
    validateSecretWord: async (secretWord: string) => {
      const result = await request<{ valid: boolean }>("", "/api/auth/secret-word/validate", {
        method: "POST",
        body: JSON.stringify({ secretWord }),
      });
      return result.valid === true;
    },
    getState: (secret: string) => request<RepeaterDataV1>(secret, "/api/state"),
    importState: (secret: string, data: RepeaterDataV1) => request<RepeaterDataV1>(secret, "/api/state/import", { method: "POST", body: JSON.stringify(data) }),
    createStyle: (secret: string, style: Pick<DanceStyle, "id" | "name">) => request<DanceStyle>(secret, "/api/styles", { method: "POST", body: JSON.stringify(style) }),
    updateStyle: (secret: string, styleId: string, name: string) => request<DanceStyle>(secret, `/api/styles/${styleId}`, { method: "PATCH", body: JSON.stringify({ name }) }),
    deleteStyle: (secret: string, styleId: string) => request<{ activeStyleId: string | null }>(secret, `/api/styles/${styleId}`, { method: "DELETE" }),
    createMove: (secret: string, styleId: string, id: string) => request<Move>(secret, `/api/styles/${styleId}/moves`, { method: "POST", body: JSON.stringify({ id }) }),
    updateMove: (secret: string, styleId: string, move: Move) => request<Move>(secret, `/api/styles/${styleId}/moves/${move.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: move.name, referenceUrl: move.referenceUrl, description: move.description, isCombo: move.isCombo }),
    }),
    deleteMove: (secret: string, styleId: string, moveId: string) => request<void>(secret, `/api/styles/${styleId}/moves/${moveId}`, { method: "DELETE" }),
    reorderMoves: (secret: string, styleId: string, moveIds: string[]) => request<void>(secret, `/api/styles/${styleId}/move-order`, { method: "PUT", body: JSON.stringify({ moveIds }) }),
    updateSettings: (secret: string, patch: Partial<Pick<RepeaterDataV1, "activeStyleId" | "delaySeconds" | "comboDelaySeconds">>) =>
      request<Pick<RepeaterDataV1, "activeStyleId" | "delaySeconds" | "comboDelaySeconds">>(secret, "/api/settings", { method: "PATCH", body: JSON.stringify(patch) }),
  };
}
