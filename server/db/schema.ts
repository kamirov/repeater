import {
  check,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const danceStyles = pgTable(
  "dance_styles",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("dance_styles_position_idx").on(table.position)],
);

export const moves = pgTable(
  "moves",
  {
    id: uuid("id").primaryKey(),
    styleId: uuid("style_id")
      .notNull()
      .references(() => danceStyles.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    referenceUrl: text("reference_url").notNull().default(""),
    description: text("description").notNull().default(""),
    isCombo: boolean("is_combo").notNull().default(false),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("moves_style_position_idx").on(table.styleId, table.position)],
);

export const appSettings = pgTable(
  "app_settings",
  {
    id: integer("id").primaryKey().default(1),
    activeStyleId: uuid("active_style_id").references(() => danceStyles.id, {
      onDelete: "set null",
    }),
    delaySeconds: integer("delay_seconds").notNull().default(5),
    comboDelaySeconds: integer("combo_delay_seconds").notNull().default(5),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("app_settings_singleton", sql`${table.id} = 1`),
    check(
      "app_settings_delay_range",
      sql`${table.delaySeconds} between 1 and 300`,
    ),
    check(
      "app_settings_combo_delay_range",
      sql`${table.comboDelaySeconds} between 1 and 300`,
    ),
  ],
);
