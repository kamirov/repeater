import { describe, expect, it, vi } from "vitest";

import { browserSpeech } from "@/lib/speech";

describe("browserSpeech", () => {
  it("speaks an English utterance and resolves when it ends", async () => {
    let utterance: MockUtterance | null = null;
    const cancel = vi.fn();
    const speak = vi.fn((nextUtterance: MockUtterance) => {
      utterance = nextUtterance;
    });
    installSpeechMocks({ cancel, speak });

    const completion = browserSpeech.speak("Inside turn");
    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalled();
    expect(utterance).toMatchObject({ text: "Inside turn", lang: "en-US" });
    (utterance as MockUtterance | null)?.onend?.();

    await expect(completion).resolves.toBeUndefined();
  });

  it("rejects speech errors and cancels active speech", async () => {
    let utterance: MockUtterance | null = null;
    const cancel = vi.fn();
    installSpeechMocks({
      cancel,
      speak: (nextUtterance) => {
        utterance = nextUtterance;
      },
    });

    const completion = browserSpeech.speak("Cross-body lead");
    (utterance as MockUtterance | null)?.onerror?.();
    await expect(completion).rejects.toThrow(/failed/i);

    browserSpeech.cancel();
    expect(cancel).toHaveBeenCalledTimes(2);
  });
});

type MockUtterance = {
  text: string;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function installSpeechMocks({
  cancel,
  speak,
}: {
  cancel: () => void;
  speak: (utterance: MockUtterance) => void;
}) {
  class SpeechSynthesisUtteranceMock implements MockUtterance {
    lang = "";
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(public text: string) {}
  }

  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { cancel, speak },
  });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: SpeechSynthesisUtteranceMock,
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    value: SpeechSynthesisUtteranceMock,
  });
}
