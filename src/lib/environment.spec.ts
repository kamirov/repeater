import { describe, expect, it } from "vitest";

import { isLocalhost } from "@/lib/environment";

describe("isLocalhost", () => {
  it.each(["localhost", "127.0.0.1", "::1", "[::1]"])("accepts %s", (hostname) => {
    expect(isLocalhost(hostname)).toBe(true);
  });

  it.each(["repeater.example.com", "192.168.1.20"])("rejects %s", (hostname) => {
    expect(isLocalhost(hostname)).toBe(false);
  });
});
