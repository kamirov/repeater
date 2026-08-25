import type { IncomingMessage, ServerResponse } from "node:http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { createApiHandler } from "./api.js";

type Next = (error?: unknown) => void;

async function readBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (!chunks.length) return undefined;
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

/** Serves the same API handler inside Vite so `pnpm dev` runs the full app. */
export function createDevApiMiddleware() {
  const handler = createApiHandler();

  return async (request: IncomingMessage, response: ServerResponse, next: Next) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (!url.pathname.startsWith("/api/")) {
      next();
      return;
    }

    const route = url.pathname.slice("/api/".length).split("/").filter(Boolean);
    const apiRequest = {
      method: request.method,
      headers: request.headers,
      query: { route },
      body: await readBody(request),
    } as unknown as VercelRequest;

    const adapter = {
      setHeader(name: string, value: string | number | readonly string[]) {
        response.setHeader(name, value);
        return adapter;
      },
      status(code: number) {
        response.statusCode = code;
        return adapter;
      },
      json(body: unknown) {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(body));
        return adapter;
      },
      end(body?: unknown) {
        response.end(body === undefined ? undefined : String(body));
        return adapter;
      },
    } as unknown as VercelResponse;

    await handler(apiRequest, adapter);
  };
}
