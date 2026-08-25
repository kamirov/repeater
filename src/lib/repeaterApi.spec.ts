import { describe, expect, it, vi } from "vitest";

import { createRepeaterApi, RepeaterApiError } from "@/lib/repeaterApi";

const styleId = "00000000-0000-4000-8000-000000000001";
const moveId = "00000000-0000-4000-8000-000000000101";

describe("createRepeaterApi", () => {
  it("sends the secret and dispatches every resource contract", async () => {
    const fetcher = vi.fn(async (_path: string | URL | Request, init?: RequestInit) => {
      const noContent = init?.method === "DELETE" || init?.method === "PUT";
      return new Response(noContent ? null : JSON.stringify({
        version: 1,
        styles: [],
        activeStyleId: null,
        delaySeconds: 5,
        id: moveId,
        name: "",
        referenceUrl: "",
        description: "",
        moves: [],
      }), { status: noContent ? 204 : 200, headers: { "Content-Type": "application/json" } });
    });
    const api = createRepeaterApi(fetcher as typeof fetch);
    const state = { version: 1 as const, styles: [], activeStyleId: null, delaySeconds: 5 };

    await api.getState("secret");
    await api.importState("secret", state);
    await api.createStyle("secret", { id: styleId, name: "Salsa" });
    await api.updateStyle("secret", styleId, "Salsa on 2");
    await api.deleteStyle("secret", styleId);
    await api.createMove("secret", styleId, moveId);
    await api.updateMove("secret", styleId, { id: moveId, name: "CBL", referenceUrl: "", description: "" });
    await api.deleteMove("secret", styleId, moveId);
    await api.reorderMoves("secret", styleId, [moveId]);
    await api.updateSettings("secret", { delaySeconds: 8 });

    expect(fetcher).toHaveBeenCalledTimes(10);
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ "X-Repeater-Secret": "secret" });
    expect(fetcher.mock.calls.some(([path]) => path === `/api/styles/${styleId}/move-order`)).toBe(true);
  });

  it("surfaces structured API failures", async () => {
    const api = createRepeaterApi(vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { code: "INVALID_SECRET", message: "Wrong secret" },
    }), { status: 401, headers: { "Content-Type": "application/json" } })));

    await expect(api.getState("wrong")).rejects.toEqual(
      expect.objectContaining<Partial<RepeaterApiError>>({ status: 401, code: "INVALID_SECRET", message: "Wrong secret" }),
    );
  });

  it("explains when Vite returns the HTML app for a missing API route", async () => {
    const api = createRepeaterApi(vi.fn().mockResolvedValue(new Response("<!doctype html>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    })));

    await expect(api.getState("secret")).rejects.toEqual(expect.objectContaining({
      code: "INVALID_API_RESPONSE",
      message: expect.stringMatching(/backend API is unavailable/i),
    }));
  });
});
