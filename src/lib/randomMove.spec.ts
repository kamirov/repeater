import { describe, expect, it } from "vitest";

import { selectRandomMove } from "@/lib/randomMove";
import type { Move } from "@/types/repeater";

const move = (id: string, name: string): Move => ({
  id,
  name,
  referenceUrl: "",
  description: "",
});

describe("selectRandomMove", () => {
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

  it("uses the provided random source deterministically", () => {
    const moves = [move("a", "Alpha"), move("b", "Beta"), move("c", "Gamma")];

    expect(selectRandomMove(moves, null, () => 0)?.id).toBe("a");
    expect(selectRandomMove(moves, null, () => 0.99)?.id).toBe("c");
  });
});
