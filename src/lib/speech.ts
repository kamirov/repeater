export type SpeechAdapter = {
  isSupported: () => boolean;
  speak: (text: string) => Promise<void>;
  cancel: () => void;
};

/** Browser-native speech adapter with completion and error signals for practice timing. */
export const browserSpeech: SpeechAdapter = {
  isSupported: () =>
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window,
  speak: (text) =>
    new Promise<void>((resolve, reject) => {
      if (!browserSpeech.isSupported()) {
        reject(new Error("Speech synthesis is unavailable."));
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error("Speech synthesis failed."));
      window.speechSynthesis.speak(utterance);
    }),
  cancel: () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  },
};
