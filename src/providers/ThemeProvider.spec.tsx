import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeProvider", () => {
  it("loads, applies, and persists a selected theme", () => {
    localStorage.setItem("repeater:theme", "dark");
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");

    act(() => result.current.setTheme("light"));
    expect(localStorage.getItem("repeater:theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("cycles light, dark, and system", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.setTheme("light"));
    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe("dark");
    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe("system");
    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe("light");
  });
});
