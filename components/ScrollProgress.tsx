"use client";

import { useEffect, useState } from "react";

/**
 * The 2px reading-progress bar.
 *
 * Same maths as the artifact: round(scrollTop / (scrollHeight - clientHeight)
 * * 100), rAF-latched to one update per frame, passive listener. The artifact
 * also tracked a `scrolled` flag here and never read it — the header's
 * stickiness is pure CSS — so that is dropped.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const d = document.documentElement;
        const max = d.scrollHeight - d.clientHeight;
        setProgress(max > 0 ? Math.round((d.scrollTop / max) * 100) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="progress"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
