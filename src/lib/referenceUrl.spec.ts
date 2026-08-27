import { describe, expect, it } from "vitest";

import { isValidReferenceUrl, normalizeReferenceUrl } from "@/lib/referenceUrl";

describe("reference URLs", () => {
  it("accepts protocol-less URLs as HTTPS", () => {
    expect(isValidReferenceUrl("youtube.com/watch?v=abc")).toBe(true);
    expect(normalizeReferenceUrl(" youtube.com/watch?v=abc ")).toBe("https://youtube.com/watch?v=abc");
  });

  it("preserves explicit HTTP and HTTPS URLs", () => {
    expect(normalizeReferenceUrl("http://example.com/video")).toBe("http://example.com/video");
    expect(normalizeReferenceUrl("https://example.com/video")).toBe("https://example.com/video");
  });

  it("rejects unsupported schemes and malformed URLs", () => {
    expect(isValidReferenceUrl("javascript:alert(1)")).toBe(false);
    expect(isValidReferenceUrl("https://")).toBe(false);
  });

  it("allows an empty reference", () => {
    expect(normalizeReferenceUrl("  ")).toBe("");
    expect(isValidReferenceUrl("  ")).toBe(true);
  });
});
