import type { Move } from "@/types/repeater";

/** Selects uniformly from named moves while excluding the prior move when possible. */
export function selectRandomMove(
  moves: Move[],
  previousMoveId: string | null,
  random: () => number = Math.random,
): Move | null {
  const eligible = moves.filter((move) => move.name.trim().length > 0);
  if (!eligible.length) return null;

  const candidates =
    eligible.length > 1
      ? eligible.filter((move) => move.id !== previousMoveId)
      : eligible;
  const randomIndex = Math.min(
    candidates.length - 1,
    Math.max(0, Math.floor(random() * candidates.length)),
  );
  return candidates[randomIndex] ?? null;
}
