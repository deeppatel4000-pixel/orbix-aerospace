"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** True while the user's system asks for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

export interface ScrubberOptions {
  /** Real time a full run from 0 to 1 takes when played, milliseconds. */
  readonly durationMs: number;
  /** When true, `play` does nothing and a running play stops. */
  readonly reducedMotion: boolean;
  /** Starting progress, 0 to 1. Default 0. */
  readonly initialProgress?: number;
}

export interface Scrubber {
  /** 0 to 1. */
  readonly progress: number;
  readonly playing: boolean;
  setProgress(progress: number): void;
  /** Starts from the current position, or from 0 when at the end. */
  play(): void;
  pause(): void;
}

export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * A 0-to-1 position that the user can drag, or play forward with
 * requestAnimationFrame. Nothing moves until `play` is called, and reduced
 * motion turns play off entirely (design v3 section 10, v4 amendment).
 */
export function useScrubber({
  durationMs,
  initialProgress = 0,
  reducedMotion,
}: ScrubberOptions): Scrubber {
  const [progress, setProgressState] = useState(() =>
    clampProgress(initialProgress),
  );
  const [playing, setPlaying] = useState(false);
  const progressRef = useRef(progress);
  const frameRef = useRef<number | null>(null);

  // Read by the running frame loop, so a switch to reduced motion
  // mid-play stops the craft where it is on the next frame.
  const reducedMotionRef = useRef(reducedMotion);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const setProgress = useCallback((value: number) => {
    const next = clampProgress(value);
    progressRef.current = next;
    setProgressState(next);
  }, []);

  const pause = useCallback(() => {
    stopFrame();
    setPlaying(false);
  }, [stopFrame]);

  const play = useCallback(() => {
    if (reducedMotion || !(durationMs > 0)) return;
    stopFrame();
    if (progressRef.current >= 1) setProgress(0);
    setPlaying(true);

    let last: number | null = null;
    const step = (now: number) => {
      if (reducedMotionRef.current) {
        frameRef.current = null;
        setPlaying(false);
        return;
      }
      const elapsed = last === null ? 0 : now - last;
      last = now;
      const next = clampProgress(progressRef.current + elapsed / durationMs);
      setProgress(next);
      if (next >= 1) {
        frameRef.current = null;
        setPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }, [durationMs, reducedMotion, setProgress, stopFrame]);

  // Never leave a frame running after unmount.
  useEffect(() => stopFrame, [stopFrame]);

  return { pause, play, playing, progress, setProgress };
}
