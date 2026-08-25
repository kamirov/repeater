import { z } from "zod";

export const moveSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  referenceUrl: z.string(),
  description: z.string(),
});

export const danceStyleSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  moves: z.array(moveSchema),
});

export const repeaterDataSchema = z
  .object({
    version: z.literal(1),
    styles: z.array(danceStyleSchema),
    activeStyleId: z.uuid().nullable(),
    delaySeconds: z.number().int().min(1).max(300),
  })
  .refine(
    (data) =>
      data.activeStyleId === null ||
      data.styles.some((style) => style.id === data.activeStyleId),
    { message: "The active style does not exist." },
  );

export const createStyleSchema = z.object({ id: z.uuid(), name: z.string().trim().min(1) }).strict();
export const updateStyleSchema = z.object({ name: z.string().trim().min(1) }).strict();
export const createMoveSchema = z.object({ id: z.uuid() }).strict();
export const updateMoveSchema = z
  .object({ name: z.string(), referenceUrl: z.string(), description: z.string() })
  .strict();
export const moveOrderSchema = z.object({ moveIds: z.array(z.uuid()) }).strict();
export const settingsPatchSchema = z
  .object({
    activeStyleId: z.uuid().nullable().optional(),
    delaySeconds: z.number().int().min(1).max(300).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one setting is required.");

export const validateSecretWordSchema = z
  .object({ secretWord: z.string().trim().min(1) })
  .strict();
