import { describe, expect, it } from "vitest";

import { getMovePracticeChances, selectRandomMove } from "@/lib/randomMove";
import type { Move } from "@/types/repeater";

const move = (id: string, name: string): Move => ({
  id,
  name,
  referenceUrl: "",
  description: "",
  isCombo: false,
});

describe("selectRandomMove", () => {
  it("calculates linear baseline chances from named move order", () => {
    const moves = [move("a", "Alpha"), move("draft", "  "), move("b", "Beta"), move("c", "Gamma")];

    expect([...getMovePracticeChances(moves).entries()]).toEqual([
      ["a", 50],
      ["draft", 0],
      ["b", 33],
      ["c", 17],
    ]);
  });

  it("splits two named moves according to their linear weights", () => {
    expect(getMovePracticeChances([move("a", "Alpha"), move("b", "Beta")])).toEqual(
      new Map([
        ["a", 67],
        ["b", 33],
      ]),
    );
  });

  it("gives a sole named move all of the practice chance", () => {
    expect(getMovePracticeChances([move("draft", " "), move("a", "Alpha")])).toEqual(
      new Map([
        ["draft", 0],
        ["a", 100],
      ]),
    );
  });

  it("excludes unnamed drafts and avoids an immediate repeat", () => {
    const selected = selectRandomMove(
      [move("a", "Alpha"), move("draft", "  "), move("b", "Beta")],
      "a",
      () => 0,
    );

    expect(selected?.id).toBe("b");
  });

  it("allows the sole eligible move to repeat", () => {
    expect(selectRandomMove([move("a", "Alpha")], "a", () => 0)?.id).toBe("a");
  });

  it("returns null when there are no eligible moves", () => {
    expect(selectRandomMove([move("draft", "")], null, () => 0.5)).toBeNull();
  });

  it("uses weighted boundaries with the provided random source", () => {
    const moves = [move("a", "Alpha"), move("b", "Beta"), move("c", "Gamma")];

    expect(selectRandomMove(moves, null, () => 0)?.id).toBe("a");
    expect(selectRandomMove(moves, null, () => 0.49)?.id).toBe("a");
    expect(selectRandomMove(moves, null, () => 0.5)?.id).toBe("b");
    expect(selectRandomMove(moves, null, () => 0.99)?.id).toBe("c");
  });

  it("renormalizes remaining original weights after excluding the prior move", () => {
    const moves = [move("a", "Alpha"), move("b", "Beta"), move("c", "Gamma")];

    expect(selectRandomMove(moves, "a", () => 0)?.id).toBe("b");
    expect(selectRandomMove(moves, "a", () => 0.99)?.id).toBe("c");
  });
});
