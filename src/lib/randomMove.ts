import type { Move } from "@/types/repeater";

function getPracticeWeight(moveCount: number, moveIndex: number): number {
  if (moveCount <= 1) return 1;
  return 1 + 0.5 * ((moveCount - 1 - moveIndex) / (moveCount - 1));
}

/** Returns each move's rounded baseline chance based on its order among named moves. */
export function getMovePracticeChances(moves: Move[]): Map<string, number> {
  const eligible = moves.filter((move) => move.name.trim().length > 0);
  const weights = eligible.map((_, index) => getPracticeWeight(eligible.length, index));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  return new Map(
    moves.map((move) => {
      const eligibleIndex = eligible.indexOf(move);
      if (eligibleIndex < 0 || totalWeight === 0) return [move.id, 0];

      const weight = weights[eligibleIndex] ?? 0;
      return [move.id, Math.round((weight / totalWeight) * 100)];
    }),
  );
}

/** Selects from named moves using list-order weighting while excluding the prior move when possible. */
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
  const weightedCandidates = candidates.map((move) => ({
    move,
    weight: getPracticeWeight(eligible.length, eligible.indexOf(move)),
  }));
  const totalWeight = weightedCandidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  const target = Math.min(
    totalWeight - Number.EPSILON,
    Math.max(0, random()) * totalWeight,
  );

  let accumulatedWeight = 0;
  for (const candidate of weightedCandidates) {
    accumulatedWeight += candidate.weight;
    if (target < accumulatedWeight) return candidate.move;
  }

  return weightedCandidates.at(-1)?.move ?? null;
}
