"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";

/**
 * The four autoplay cycles, reproduced exactly.
 *
 * The one semantic that is easy to get wrong: picking any step pauses ALL
 * FOUR cycles, not just the one touched, and all four resume together 9s
 * later (debounced). Keeping them in one provider is what makes that true.
 *
 * `careTab` only cycles at >= 760px — on a phone it drives a segmented
 * control the visitor is expected to operate.
 */

const INTERVALS = {
  flowStep: { ms: 2600, mod: 6 },
  rcmStage: { ms: 2400, mod: 4 },
  careTab: { ms: 4200, mod: 3 },
  careStep: { ms: 2200, mod: 8 },
} as const;

export type CycleKey = keyof typeof INTERVALS;
const RESUME_MS = 9000;

interface Ctx {
  flowStep: number;
  rcmStage: number;
  careTab: number;
  careStep: number;
  pick: (key: CycleKey, value: number) => void;
}

const AutoplayCtx = createContext<Ctx | null>(null);

export function AutoplayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    flowStep: 0, rcmStage: 0, careTab: 0, careStep: 0,
  });
  const [paused, setPaused] = useState(false);
  const [wide, setWide] = useState(true);
  const resume = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 760px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ids = (Object.keys(INTERVALS) as CycleKey[])
      .filter((k) => (k === "careTab" ? wide : true))
      .map((k) => {
        const { ms, mod } = INTERVALS[k];
        return window.setInterval(
          () => setState((s) => ({ ...s, [k]: (s[k] + 1) % mod })),
          ms,
        );
      });
    return () => ids.forEach(window.clearInterval);
  }, [paused, wide]);

  useEffect(() => () => window.clearTimeout(resume.current), []);

  const pick = useCallback((key: CycleKey, value: number) => {
    setPaused(true);
    setState((s) => ({ ...s, [key]: value }));
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setPaused(false), RESUME_MS);
  }, []);

  const value = useMemo(() => ({ ...state, pick }), [state, pick]);
  return <AutoplayCtx.Provider value={value}>{children}</AutoplayCtx.Provider>;
}

export function useAutoplay(): Ctx {
  const ctx = useContext(AutoplayCtx);
  if (!ctx) throw new Error("useAutoplay must be used inside <AutoplayProvider>");
  return ctx;
}
