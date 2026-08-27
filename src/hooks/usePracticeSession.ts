import { useCallback, useEffect, useRef, useState } from "react";

import { selectRandomMove } from "@/lib/randomMove";
import { browserSpeech, type SpeechAdapter } from "@/lib/speech";
import type { Move } from "@/types/repeater";

type UsePracticeSessionOptions = {
  styleId: string | null;
  moves: Move[];
  delaySeconds: number;
  comboDelaySeconds: number;
  speech?: SpeechAdapter;
  random?: () => number;
  onError?: (message: string) => void;
};

type PracticeSession = {
  isRunning: boolean;
  currentMove: Move | null;
  countdownSeconds: number | null;
  progress: number | null;
  isSpeechSupported: boolean;
  start: () => void;
  stop: () => void;
};

/** Coordinates random move selection, speech completion, countdowns, and cancellation. */
export function usePracticeSession({
  styleId,
  moves,
  delaySeconds,
  comboDelaySeconds,
  speech = browserSpeech,
  random = Math.random,
  onError,
}: UsePracticeSessionOptions): PracticeSession {
  const [isRunning, setIsRunning] = useState(false);
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const sessionIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const movesRef = useRef(moves);
  const delayRef = useRef(delaySeconds);
  const comboDelayRef = useRef(comboDelaySeconds);
  const runNextRef = useRef<(sessionId: number, previousMoveId: string | null) => void>(
    () => undefined,
  );

  useEffect(() => {
    movesRef.current = moves;
  }, [moves]);

  useEffect(() => {
    delayRef.current = delaySeconds;
  }, [delaySeconds]);

  useEffect(() => {
    comboDelayRef.current = comboDelaySeconds;
  }, [comboDelaySeconds]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
    progressIntervalRef.current = null;
  }, []);

  const stop = useCallback(() => {
    sessionIdRef.current += 1;
    clearTimers();
    speech.cancel();
    setIsRunning(false);
    setCurrentMove(null);
    setCountdownSeconds(null);
    setProgress(null);
  }, [clearTimers, speech]);

  const runNext = useCallback(
    async (sessionId: number, previousMoveId: string | null) => {
      if (sessionId !== sessionIdRef.current) return;
      const selectedMove = selectRandomMove(movesRef.current, previousMoveId, random);
      if (!selectedMove) {
        stop();
        onError?.("Add at least one named move to keep practicing.");
        return;
      }

      setCurrentMove(selectedMove);
      setCountdownSeconds(null);
      setProgress(0);
      try {
        await speech.speak(selectedMove.name.trim());
      } catch {
        if (sessionId !== sessionIdRef.current) return;
        stop();
        onError?.("The move could not be spoken.");
        return;
      }

      if (sessionId !== sessionIdRef.current) return;
      const delay = selectedMove.isCombo ? comboDelayRef.current : delayRef.current;
      setCountdownSeconds(delay);
      const countdownStartedAt = Date.now();
      setProgress(0);
      let remaining = delay;
      intervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdownSeconds(Math.max(0, remaining));
      }, 1_000);
      progressIntervalRef.current = setInterval(() => {
        setProgress(Math.min(1, (Date.now() - countdownStartedAt) / (delay * 1_000)));
      }, 50);
      timeoutRef.current = setTimeout(() => {
        clearTimers();
        runNextRef.current(sessionId, selectedMove.id);
      }, delay * 1_000);
    },
    [clearTimers, onError, random, speech, stop],
  );

  useEffect(() => {
    runNextRef.current = (sessionId, previousMoveId) => {
      void runNext(sessionId, previousMoveId);
    };
  }, [runNext]);

  const start = useCallback(() => {
    if (isRunning) return;
    if (!speech.isSupported()) {
      onError?.("Speech is not supported in this browser.");
      return;
    }
    if (!selectRandomMove(movesRef.current, null, random)) {
      onError?.("Add at least one named move to start practicing.");
      return;
    }
    clearTimers();
    const sessionId = sessionIdRef.current + 1;
    sessionIdRef.current = sessionId;
    setIsRunning(true);
    runNextRef.current(sessionId, null);
  }, [clearTimers, isRunning, onError, random, speech]);

  const previousStyleIdRef = useRef(styleId);
  useEffect(() => {
    if (previousStyleIdRef.current !== styleId) stop();
    previousStyleIdRef.current = styleId;
  }, [stop, styleId]);

  useEffect(
    () => () => {
      sessionIdRef.current += 1;
      clearTimers();
      speech.cancel();
    },
    [clearTimers, speech],
  );

  return {
    isRunning,
    currentMove,
    countdownSeconds,
    progress,
    isSpeechSupported: speech.isSupported(),
    start,
    stop,
  };
}
