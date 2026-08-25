import type { VercelRequest, VercelResponse } from "@vercel/node";
import { describe, expect, it, vi } from "vitest";

import { createApiHandler } from "./api";
import { RepositoryConflictError, type RepeaterRepository } from "./repository";

function repository(): RepeaterRepository {
  return {
    getState: vi.fn().mockResolvedValue({ version: 1, styles: [], activeStyleId: null, delaySeconds: 5 }),
    importState: vi.fn().mockImplementation(async (data) => data),
    createStyle: vi.fn().mockImplementation(async (style) => ({ ...style, moves: [] })),
    updateStyle: vi.fn(), deleteStyle: vi.fn(), createMove: vi.fn(), updateMove: vi.fn(),
    deleteMove: vi.fn(), reorderMoves: vi.fn(), updateSettings: vi.fn(),
  };
}

function response() {
  const result = {
    statusCode: 0,
    body: undefined as unknown,
    headers: new Map<string, string>(),
    status: vi.fn((code: number) => { result.statusCode = code; return result; }),
    json: vi.fn((body: unknown) => { result.body = body; return result; }),
    end: vi.fn(() => result),
    setHeader: vi.fn((name: string, value: string) => { result.headers.set(name, value); return result; }),
  };
  return result;
}

function request(method: string, route: string[], body?: unknown, secret?: string): VercelRequest {
  return {
    method,
    query: { route },
    body,
    headers: secret ? { "x-repeater-secret": secret } : {},
  } as unknown as VercelRequest;
}

describe("Repeater API", () => {
  it("rejects missing or incorrect secrets before touching the repository", async () => {
    const repo = repository();
    const handler = createApiHandler({ repository: repo, secret: "correct" });
    const missing = response();
    const wrong = response();

    await handler(request("GET", ["state"]), missing as unknown as VercelResponse);
    await handler(request("GET", ["state"], undefined, "wrong"), wrong as unknown as VercelResponse);

    expect(missing.statusCode).toBe(401);
    expect(wrong.statusCode).toBe(401);
    expect(missing.body).toMatchObject({ error: { code: "INVALID_SECRET" } });
    expect(repo.getState).not.toHaveBeenCalled();
  });

  it("loads state with no-store caching for an authenticated request", async () => {
    const repo = repository();
    const handler = createApiHandler({ repository: repo, secret: "correct" });
    const res = response();

    await handler(request("GET", ["state"], undefined, "correct"), res as unknown as VercelResponse);

    expect(res.statusCode).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(repo.getState).toHaveBeenCalledOnce();
  });

  it("strictly validates create payloads", async () => {
    const repo = repository();
    const handler = createApiHandler({ repository: repo, secret: "correct" });
    const res = response();

    await handler(request("POST", ["styles"], { id: "not-a-uuid", name: "Salsa", extra: true }, "correct"), res as unknown as VercelResponse);

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ error: { code: "INVALID_REQUEST" } });
    expect(repo.createStyle).not.toHaveBeenCalled();
  });

  it("maps an empty-only import conflict to 409", async () => {
    const repo = repository();
    vi.mocked(repo.importState).mockRejectedValue(new RepositoryConflictError("exists"));
    const handler = createApiHandler({ repository: repo, secret: "correct" });
    const res = response();

    await handler(request("POST", ["state", "import"], {
      version: 1, styles: [], activeStyleId: null, delaySeconds: 5,
    }, "correct"), res as unknown as VercelResponse);

    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({ error: { code: "BACKEND_NOT_EMPTY" } });
  });

  it("validates and dispatches complete move ordering", async () => {
    const repo = repository();
    vi.mocked(repo.reorderMoves).mockResolvedValue(true);
    const handler = createApiHandler({ repository: repo, secret: "correct" });
    const res = response();
    const styleId = "00000000-0000-4000-8000-000000000001";
    const moveId = "00000000-0000-4000-8000-000000000101";

    await handler(request("PUT", ["styles", styleId, "move-order"], { moveIds: [moveId] }, "correct"), res as unknown as VercelResponse);

    expect(res.statusCode).toBe(204);
    expect(repo.reorderMoves).toHaveBeenCalledWith(styleId, [moveId]);
  });
});
