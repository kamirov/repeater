import { timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";

import {
  createMoveSchema,
  createStyleSchema,
  moveOrderSchema,
  repeaterDataSchema,
  settingsPatchSchema,
  updateMoveSchema,
  updateStyleSchema,
  validateSecretWordSchema,
} from "./contracts";
import {
  createDatabaseRepository,
  RepositoryConflictError,
  type RepeaterRepository,
} from "./repository";

type Dependencies = { repository?: RepeaterRepository; secret?: string };

function secretMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function routeParts(request: VercelRequest): string[] {
  const route = request.query.route;
  return Array.isArray(route) ? route : typeof route === "string" ? route.split("/").filter(Boolean) : [];
}

function bodyOf(request: VercelRequest): unknown {
  if (typeof request.body === "string") return JSON.parse(request.body) as unknown;
  return request.body;
}

export function createApiHandler(dependencies: Dependencies = {}) {
  return async (request: VercelRequest, response: VercelResponse) => {
    response.setHeader("Cache-Control", "no-store");
    const expectedSecret = dependencies.secret ?? process.env.REPEATER_SECRET_WORD;
    if (!expectedSecret) {
      return response.status(500).json({ error: { code: "SERVER_MISCONFIGURED", message: "Server authentication is not configured." } });
    }
    let ownedRepository: RepeaterRepository | undefined;
    try {
      const parts = routeParts(request);
      const method = request.method ?? "GET";

      if (method === "POST" && parts.join("/") === "auth/secret-word/validate") {
        const { secretWord } = validateSecretWordSchema.parse(bodyOf(request));
        return response.status(200).json({ valid: secretMatches(secretWord, expectedSecret) });
      }

      const providedSecret = request.headers["x-repeater-secret"];
      const normalizedSecret = Array.isArray(providedSecret) ? providedSecret[0] : providedSecret;
      if (!secretMatches(normalizedSecret, expectedSecret)) {
        return response.status(401).json({ error: { code: "INVALID_SECRET", message: "The secret word is incorrect." } });
      }

      const repository = dependencies.repository ?? (ownedRepository = createDatabaseRepository());

      if (method === "GET" && parts.length === 1 && parts[0] === "state") {
        return response.status(200).json(await repository.getState());
      }
      if (method === "POST" && parts.join("/") === "state/import") {
        return response.status(201).json(await repository.importState(repeaterDataSchema.parse(bodyOf(request))));
      }
      if (method === "POST" && parts.length === 1 && parts[0] === "styles") {
        return response.status(201).json(await repository.createStyle(createStyleSchema.parse(bodyOf(request))));
      }
      if (parts[0] === "styles" && parts.length === 2) {
        const styleId = parts[1];
        if (method === "PATCH") {
          const body = updateStyleSchema.parse(bodyOf(request));
          const result = await repository.updateStyle(styleId, body.name);
          return result ? response.status(200).json(result) : response.status(404).json({ error: { code: "NOT_FOUND" } });
        }
        if (method === "DELETE") {
          const result = await repository.deleteStyle(styleId);
          return result ? response.status(200).json(result) : response.status(404).json({ error: { code: "NOT_FOUND" } });
        }
      }
      if (method === "PUT" && parts[0] === "styles" && parts[2] === "move-order" && parts.length === 3) {
        const valid = await repository.reorderMoves(parts[1], moveOrderSchema.parse(bodyOf(request)).moveIds);
        return valid ? response.status(204).end() : response.status(400).json({ error: { code: "INVALID_MOVE_ORDER" } });
      }
      if (parts[0] === "styles" && parts[2] === "moves") {
        const styleId = parts[1];
        if (method === "POST" && parts.length === 3) {
          const result = await repository.createMove(styleId, createMoveSchema.parse(bodyOf(request)).id);
          return result ? response.status(201).json(result) : response.status(404).json({ error: { code: "NOT_FOUND" } });
        }
        if (parts.length === 4) {
          const moveId = parts[3];
          if (method === "PATCH") {
            const result = await repository.updateMove(styleId, moveId, updateMoveSchema.parse(bodyOf(request)));
            return result ? response.status(200).json(result) : response.status(404).json({ error: { code: "NOT_FOUND" } });
          }
          if (method === "DELETE") {
            const deleted = await repository.deleteMove(styleId, moveId);
            return deleted ? response.status(204).end() : response.status(404).json({ error: { code: "NOT_FOUND" } });
          }
        }
      }
      if (method === "PATCH" && parts.length === 1 && parts[0] === "settings") {
        const result = await repository.updateSettings(settingsPatchSchema.parse(bodyOf(request)));
        return result ? response.status(200).json(result) : response.status(400).json({ error: { code: "INVALID_ACTIVE_STYLE" } });
      }
      return response.status(404).json({ error: { code: "NOT_FOUND" } });
    } catch (error) {
      if (error instanceof ZodError || error instanceof SyntaxError) {
        return response.status(400).json({ error: { code: "INVALID_REQUEST", message: "The request body is invalid." } });
      }
      if (error instanceof RepositoryConflictError) {
        return response.status(409).json({ error: { code: "BACKEND_NOT_EMPTY", message: error.message } });
      }
      console.error("Repeater API request failed", error instanceof Error ? error.message : "Unknown error");
      return response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "The request could not be completed." } });
    } finally {
      if (ownedRepository?.close) {
        await ownedRepository.close().catch((error: unknown) => {
          console.error("Repeater database connection cleanup failed", error instanceof Error ? error.message : "Unknown error");
        });
      }
    }
  };
}
