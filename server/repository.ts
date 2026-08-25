import { neonConfig, Pool } from "@neondatabase/serverless";
import { and, asc, count, eq, max } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import type { DanceStyle, Move, RepeaterDataV1 } from "../src/types/repeater.js";
import { appSettings, danceStyles, moves } from "./db/schema.js";

export type SettingsPatch = Partial<Pick<RepeaterDataV1, "activeStyleId" | "delaySeconds">>;

export interface RepeaterRepository {
  close?(): Promise<void>;
  getState(): Promise<RepeaterDataV1>;
  importState(data: RepeaterDataV1): Promise<RepeaterDataV1>;
  createStyle(style: Pick<DanceStyle, "id" | "name">): Promise<DanceStyle>;
  updateStyle(styleId: string, name: string): Promise<DanceStyle | null>;
  deleteStyle(styleId: string): Promise<{ activeStyleId: string | null } | null>;
  createMove(styleId: string, moveId: string): Promise<Move | null>;
  updateMove(styleId: string, moveId: string, patch: Omit<Move, "id">): Promise<Move | null>;
  deleteMove(styleId: string, moveId: string): Promise<boolean>;
  reorderMoves(styleId: string, moveIds: string[]): Promise<boolean>;
  updateSettings(patch: SettingsPatch): Promise<Pick<RepeaterDataV1, "activeStyleId" | "delaySeconds"> | null>;
}

export function createDatabaseRepository(databaseUrl = process.env.DATABASE_URL): RepeaterRepository {
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool });

  const ensureSettings = async () => {
    await db.insert(appSettings).values({ id: 1 }).onConflictDoNothing();
  };

  const getState = async (): Promise<RepeaterDataV1> => {
    await ensureSettings();
    const [styleRows, moveRows, settingsRows] = await Promise.all([
      db.select().from(danceStyles).orderBy(asc(danceStyles.position)),
      db.select().from(moves).orderBy(asc(moves.styleId), asc(moves.position)),
      db.select().from(appSettings).where(eq(appSettings.id, 1)).limit(1),
    ]);
    const movesByStyle = new Map<string, Move[]>();
    for (const move of moveRows) {
      const current = movesByStyle.get(move.styleId) ?? [];
      current.push({
        id: move.id,
        name: move.name,
        referenceUrl: move.referenceUrl,
        description: move.description,
      });
      movesByStyle.set(move.styleId, current);
    }
    const settings = settingsRows[0];
    return {
      version: 1,
      styles: styleRows.map((style) => ({
        id: style.id,
        name: style.name,
        moves: movesByStyle.get(style.id) ?? [],
      })),
      activeStyleId: settings?.activeStyleId ?? null,
      delaySeconds: settings?.delaySeconds ?? 5,
    };
  };

  return {
    close: () => pool.end(),
    getState,
    async importState(data) {
      await db.transaction(async (tx) => {
        const [existing] = await tx.select({ value: count() }).from(danceStyles);
        if (existing.value > 0) throw new RepositoryConflictError("Backend data already exists.");
        if (data.styles.length) {
          await tx.insert(danceStyles).values(
            data.styles.map((style, position) => ({ id: style.id, name: style.name, position })),
          );
          const moveValues = data.styles.flatMap((style) =>
            style.moves.map((move, position) => ({ ...move, styleId: style.id, position })),
          );
          if (moveValues.length) await tx.insert(moves).values(moveValues);
        }
        await tx
          .insert(appSettings)
          .values({ id: 1, activeStyleId: data.activeStyleId, delaySeconds: data.delaySeconds })
          .onConflictDoUpdate({
            target: appSettings.id,
            set: {
              activeStyleId: data.activeStyleId,
              delaySeconds: data.delaySeconds,
              updatedAt: new Date(),
            },
          });
      });
      return getState();
    },
    async createStyle(style) {
      return db.transaction(async (tx) => {
        const [existing] = await tx.select().from(danceStyles).where(eq(danceStyles.id, style.id)).limit(1);
        if (existing) return { id: existing.id, name: existing.name, moves: [] };
        const [position] = await tx.select({ value: max(danceStyles.position) }).from(danceStyles);
        const [created] = await tx.insert(danceStyles).values({ ...style, position: (position.value ?? -1) + 1 }).returning();
        await tx
          .insert(appSettings)
          .values({ id: 1, activeStyleId: created.id })
          .onConflictDoUpdate({ target: appSettings.id, set: { activeStyleId: created.id, updatedAt: new Date() } });
        return { id: created.id, name: created.name, moves: [] };
      });
    },
    async updateStyle(styleId, name) {
      const [updated] = await db
        .update(danceStyles)
        .set({ name, updatedAt: new Date() })
        .where(eq(danceStyles.id, styleId))
        .returning();
      if (!updated) return null;
      const styleMoves = await db.select().from(moves).where(eq(moves.styleId, styleId)).orderBy(asc(moves.position));
      return {
        id: updated.id,
        name: updated.name,
        moves: styleMoves.map(({ id, name: moveName, referenceUrl, description }) => ({
          id,
          name: moveName,
          referenceUrl,
          description,
        })),
      };
    },
    async deleteStyle(styleId) {
      return db.transaction(async (tx) => {
        const ordered = await tx.select({ id: danceStyles.id }).from(danceStyles).orderBy(asc(danceStyles.position));
        const removedIndex = ordered.findIndex((style) => style.id === styleId);
        if (removedIndex < 0) return null;
        const [settings] = await tx.select().from(appSettings).where(eq(appSettings.id, 1)).limit(1);
        const fallback = ordered[removedIndex + 1]?.id ?? ordered[removedIndex - 1]?.id ?? null;
        await tx.delete(danceStyles).where(eq(danceStyles.id, styleId));
        const activeStyleId = settings?.activeStyleId === styleId ? fallback : (settings?.activeStyleId ?? null);
        await tx
          .insert(appSettings)
          .values({ id: 1, activeStyleId })
          .onConflictDoUpdate({ target: appSettings.id, set: { activeStyleId, updatedAt: new Date() } });
        for (const [position, style] of ordered.filter((item) => item.id !== styleId).entries()) {
          await tx.update(danceStyles).set({ position }).where(eq(danceStyles.id, style.id));
        }
        return { activeStyleId };
      });
    },
    async createMove(styleId, moveId) {
      return db.transaction(async (tx) => {
        const [style] = await tx.select({ id: danceStyles.id }).from(danceStyles).where(eq(danceStyles.id, styleId)).limit(1);
        if (!style) return null;
        const [existing] = await tx.select().from(moves).where(eq(moves.id, moveId)).limit(1);
        if (existing) {
          return existing.styleId === styleId
            ? { id: existing.id, name: existing.name, referenceUrl: existing.referenceUrl, description: existing.description }
            : null;
        }
        const existingMoves = await tx
          .select({ id: moves.id })
          .from(moves)
          .where(eq(moves.styleId, styleId))
          .orderBy(asc(moves.position));
        for (const [index, move] of existingMoves.entries()) {
          await tx.update(moves).set({ position: -index - 1 }).where(eq(moves.id, move.id));
        }
        const [created] = await tx.insert(moves).values({ id: moveId, styleId, position: 0 }).returning();
        for (const [index, move] of existingMoves.entries()) {
          await tx.update(moves).set({ position: index + 1, updatedAt: new Date() }).where(eq(moves.id, move.id));
        }
        return { id: created.id, name: created.name, referenceUrl: created.referenceUrl, description: created.description };
      });
    },
    async updateMove(styleId, moveId, patch) {
      const [updated] = await db
        .update(moves)
        .set({ ...patch, updatedAt: new Date() })
        .where(and(eq(moves.id, moveId), eq(moves.styleId, styleId)))
        .returning();
      return updated
        ? { id: updated.id, name: updated.name, referenceUrl: updated.referenceUrl, description: updated.description }
        : null;
    },
    async deleteMove(styleId, moveId) {
      return db.transaction(async (tx) => {
        const deleted = await tx.delete(moves).where(and(eq(moves.id, moveId), eq(moves.styleId, styleId))).returning({ id: moves.id });
        if (!deleted.length) return false;
        const remaining = await tx.select({ id: moves.id }).from(moves).where(eq(moves.styleId, styleId)).orderBy(asc(moves.position));
        for (const [position, move] of remaining.entries()) {
          await tx.update(moves).set({ position }).where(eq(moves.id, move.id));
        }
        return true;
      });
    },
    async reorderMoves(styleId, moveIds) {
      return db.transaction(async (tx) => {
        const existing = await tx.select({ id: moves.id }).from(moves).where(eq(moves.styleId, styleId));
        if (
          existing.length !== moveIds.length ||
          new Set(moveIds).size !== moveIds.length ||
          moveIds.some((id) => !existing.some((move) => move.id === id))
        ) return false;
        for (const [index, id] of moveIds.entries()) {
          await tx.update(moves).set({ position: -index - 1 }).where(eq(moves.id, id));
        }
        for (const [position, id] of moveIds.entries()) {
          await tx.update(moves).set({ position, updatedAt: new Date() }).where(eq(moves.id, id));
        }
        return true;
      });
    },
    async updateSettings(patch) {
      if (patch.activeStyleId) {
        const [style] = await db.select({ id: danceStyles.id }).from(danceStyles).where(eq(danceStyles.id, patch.activeStyleId)).limit(1);
        if (!style) return null;
      }
      await ensureSettings();
      const [updated] = await db
        .update(appSettings)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(appSettings.id, 1))
        .returning();
      return { activeStyleId: updated.activeStyleId, delaySeconds: updated.delaySeconds };
    },
  };
}

export class RepositoryConflictError extends Error {}
