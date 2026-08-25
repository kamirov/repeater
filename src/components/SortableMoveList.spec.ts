import { describe, expect, it } from "vitest";

import { getReorderedMoveIds } from "@/components/SortableMoveList";

describe("getReorderedMoveIds", () => {
  it("moves an item to the drop target", () => {
    expect(getReorderedMoveIds(["a", "b", "c"], "a", "c")).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("preserves order for missing or identical targets", () => {
    expect(getReorderedMoveIds(["a", "b"], "a", "a")).toEqual(["a", "b"]);
    expect(getReorderedMoveIds(["a", "b"], "missing", "b")).toEqual(["a", "b"]);
  });
});
