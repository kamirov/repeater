import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePracticeSession } from "@/hooks/usePracticeSession";
import type { SpeechAdapter } from "@/lib/speech";
import type { Move } from "@/types/repeater";

const alpha: Move = {
  id: "alpha",
  name: "Alpha",
  referenceUrl: "",
  description: "",
  isCombo: false,
};
const beta: Move = {
  id: "beta",
  name: "Beta",
  referenceUrl: "",
  description: "",
  isCombo: true,
};

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe("usePracticeSession", () => {
  it("speaks immediately, then waits the delay after speech completes", async () => {
    vi.useFakeTimers();
    const firstSpeech = deferred();
    const speech: SpeechAdapter = {
      isSupported: () => true,
      speak: vi.fn().mockReturnValueOnce(firstSpeech.promise).mockResolvedValue(undefined),
      cancel: vi.fn(),
    };
    const { result } = renderHook(() =>
      usePracticeSession({
        styleId: "salsa",
        moves: [alpha, beta],
        delaySeconds: 3,
        comboDelaySeconds: 7,
        speech,
        random: () => 0,
      }),
    );

    act(() => result.current.start());
    expect(result.current.currentMove?.id).toBe("alpha");
    expect(result.current.progress).toBe(0);
    expect(speech.speak).toHaveBeenCalledWith("Alpha");

    await act(async () => firstSpeech.resolve());
    expect(result.current.countdownSeconds).toBe(3);
    expect(result.current.progress).toBe(0);

    await act(async () => vi.advanceTimersByTimeAsync(1_500));
    expect(result.current.progress).toBeCloseTo(0.5, 1);
    await act(async () => vi.advanceTimersByTimeAsync(1_499));
    expect(speech.speak).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(speech.speak).toHaveBeenCalledTimes(2);
    expect(result.current.currentMove?.id).toBe("beta");
    expect(result.current.progress).toBe(0);
  });

  it("uses the combo period for a selected combo move", async () => {
    vi.useFakeTimers();
    const speech: SpeechAdapter = {
      isSupported: () => true,
      speak: vi.fn().mockResolvedValue(undefined),
      cancel: vi.fn(),
    };
    const { result } = renderHook(() =>
      usePracticeSession({
        styleId: "salsa",
        moves: [beta],
        delaySeconds: 3,
        comboDelaySeconds: 7,
        speech,
      }),
    );

    act(() => result.current.start());
    await act(async () => Promise.resolve());

    expect(result.current.countdownSeconds).toBe(7);
    await act(async () => vi.advanceTimersByTimeAsync(6_999));
    expect(speech.speak).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(speech.speak).toHaveBeenCalledTimes(2);
  });

  it("stops speech and timers explicitly", async () => {
    vi.useFakeTimers();
    const speech: SpeechAdapter = {
      isSupported: () => true,
      speak: vi.fn().mockResolvedValue(undefined),
      cancel: vi.fn(),
    };
    const { result } = renderHook(() =>
      usePracticeSession({
        styleId: "salsa",
        moves: [alpha],
        delaySeconds: 2,
        comboDelaySeconds: 4,
        speech,
      }),
    );

    act(() => result.current.start());
    await act(async () => Promise.resolve());
    act(() => result.current.stop());
    await act(async () => vi.advanceTimersByTimeAsync(5_000));

    expect(result.current.isRunning).toBe(false);
    expect(result.current.currentMove).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(speech.cancel).toHaveBeenCalled();
    expect(speech.speak).toHaveBeenCalledTimes(1);
  });

  it("stops when the active style changes", () => {
    const speech: SpeechAdapter = {
      isSupported: () => true,
      speak: vi.fn().mockReturnValue(new Promise<void>(() => undefined)),
      cancel: vi.fn(),
    };
    const { result, rerender } = renderHook(
      ({ styleId }) =>
        usePracticeSession({ styleId, moves: [alpha], delaySeconds: 5, comboDelaySeconds: 5, speech }),
      { initialProps: { styleId: "salsa" as string | null } },
    );

    act(() => result.current.start());
    rerender({ styleId: "bachata" });

    expect(result.current.isRunning).toBe(false);
    expect(speech.cancel).toHaveBeenCalled();
  });

  it("reports unsupported speech and speech failures", async () => {
    const onError = vi.fn();
    const unsupported: SpeechAdapter = {
      isSupported: () => false,
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    const unsupportedHook = renderHook(() =>
      usePracticeSession({
        styleId: "salsa",
        moves: [alpha],
        delaySeconds: 5,
        comboDelaySeconds: 5,
        speech: unsupported,
        onError,
      }),
    );

    act(() => unsupportedHook.result.current.start());
    expect(onError).toHaveBeenCalledWith("Speech is not supported in this browser.");

    const failed: SpeechAdapter = {
      isSupported: () => true,
      speak: vi.fn().mockRejectedValue(new Error("voice failed")),
      cancel: vi.fn(),
    };
    const failedHook = renderHook(() =>
      usePracticeSession({
        styleId: "salsa",
        moves: [alpha],
        delaySeconds: 5,
        comboDelaySeconds: 5,
        speech: failed,
        onError,
      }),
    );
    act(() => failedHook.result.current.start());
    await act(async () => Promise.resolve());

    expect(failedHook.result.current.isRunning).toBe(false);
    expect(onError).toHaveBeenLastCalledWith("The move could not be spoken.");
  });
});
