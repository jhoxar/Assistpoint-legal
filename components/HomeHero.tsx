"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROUTES, copy, img } from "@/content/site";

/* The reveal ladder is driven by the video's own clock. These are the
   artifact's cue times; heroStep is how many of them have elapsed. */
const CUES = [0.4, 1.1, 1.9, 2.7, 3.5] as const;
const FALLBACK_MS = 7000;

const VERTICAL_MP4 = "/media/hero-9x16.mp4";
const VERTICAL_WEBM = "/media/hero-9x16.webm";
const HORIZONTAL_MP4 = "/media/hero-16x9.mp4";
const HORIZONTAL_WEBM = "/media/hero-16x9.webm";

export default function HomeHero() {
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 759.98px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /**
   * Everything the video drives lives in one effect so that setup and
   * teardown are symmetrical. An earlier version scheduled the rAF from a
   * callback ref and cancelled it in a separate effect's cleanup — under
   * Strict Mode's deliberate mount/unmount/remount that cleanup killed the
   * loop the ref had started and nothing ever restarted it, so the hero
   * stayed at step 0 with the video playing invisibly behind it.
   */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // The artifact let the video autoplay regardless and only suppressed
      // the transitions. Honour the preference properly: show the end state.
      el.pause();
      setStep(5);
      setReady(true);
      return;
    }

    let raf = 0;
    let cancelled = false;
    el.muted = true;
    el.playbackRate = 0.75;

    // `canplay` may already have fired before this effect ran, in which case
    // it never fires again and the fade-in would never start.
    if (el.readyState >= 3) setReady(true);
    const onCanPlay = () => setReady(true);
    const onEnded = () => setStep(5);

    /**
     * `<source media>` is evaluated once, at load, and never re-evaluated.
     * Safari can settle on the wrong plate, and because the box is
     * `object-fit: cover`, a horizontal plate in a portrait box scales ~3.2x
     * — which reads to a client as "the video is zoomed right in". Checking
     * the decoded dimensions and forcing `src` (which beats every child
     * <source>) is the only reliable correction.
     */
    const verifyOrientation = () => {
      if (!el.videoWidth || !el.videoHeight) return;
      const wantsVertical = window.matchMedia("(max-aspect-ratio: 1/1)").matches;
      const gotVertical = el.videoHeight > el.videoWidth;
      if (wantsVertical !== gotVertical) {
        el.src = wantsVertical ? VERTICAL_MP4 : HORIZONTAL_MP4;
        el.load();
        void el.play().catch(() => {});
      }
    };

    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("ended", onEnded);
    el.addEventListener("loadedmetadata", verifyOrientation);
    verifyOrientation();

    // Autoplay can be refused outright — iOS Low Power Mode never relents and
    // no attribute defeats it. Treat refusal as "show everything now".
    void el.play().catch(() => {
      if (cancelled) return;
      setStep(5);
      setReady(true);
    });

    const tick = () => {
      if (cancelled) return;
      const t = el.currentTime;
      if (t >= 3 && el.playbackRate !== 1) el.playbackRate = 1;
      const next = CUES.filter((c) => t >= c).length;
      setStep((prev) => (next > prev ? next : prev));
      if (next < 5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const fallback = window.setTimeout(() => {
      if (cancelled) return;
      setStep((s) => (s < 5 ? 5 : s));
      setReady(true);
    }, FALLBACK_MS);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("loadedmetadata", verifyOrientation);
    };
  }, []);

  const dark = !isMobile && step >= 2;
  const on = (i: number) => (step > i ? "1" : "0");

  const ink = dark ? "#fff" : "var(--navy)";
  const sub = dark ? "#eaf4fd" : "var(--text-2)";

  return (
    <section className="hero" style={{ color: ink }}>
      <video
        ref={videoRef}
        className="hero-media"
        style={{ opacity: ready ? 1 : 0 }}
        muted
        autoPlay
        playsInline
        preload="auto"
        poster={isMobile ? img.heroPoster9x16 : img.heroPoster16x9}
        aria-hidden="true"
        tabIndex={-1}
      >
        {/* Vertical sources first: the first matching <source> wins. */}
        <source src={VERTICAL_WEBM} type="video/webm" media="(max-aspect-ratio: 1/1)" />
        <source src={VERTICAL_MP4} type="video/mp4" media="(max-aspect-ratio: 1/1)" />
        <source src={HORIZONTAL_WEBM} type="video/webm" />
        <source src={HORIZONTAL_MP4} type="video/mp4" />
      </video>

      <div className="hero-veil-a" style={{ opacity: dark ? 1 : 0 }} aria-hidden="true" />
      <div className="hero-veil-b" style={{ opacity: dark ? 1 : 0 }} aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-copy">
          <div
            className="rv hero-pill"
            data-on={on(0)}
            style={{
              color: dark ? "#fff" : "var(--blue)",
              borderColor: dark ? "#ffffff55" : "var(--border-soft)",
              background: dark ? "#ffffff30" : "#fff",
            }}
          >
            <span className="hero-dot" aria-hidden="true" />
            {copy.home.eyebrow}
          </div>

          <h1
            className="rv hero-h1"
            data-on={on(1)}
            style={{ textShadow: dark ? "0 2px 24px #071d3f99" : "none" }}
          >
            {copy.home.h1a}
            <em style={{ color: dark ? "var(--sky)" : "var(--blue)" }}>{copy.home.h1em}</em>
          </h1>

          <p className="rv lede" data-on={on(2)} style={{ color: sub }}>
            {copy.home.lede}
          </p>

          <div className="rv btn-row" data-on={on(3)}>
            <Link href={ROUTES.contact} className="btn btn-primary">
              {copy.home.cta1}
            </Link>
            <Link
              href={ROUTES.rcm}
              className="btn btn-ghost"
              style={
                dark
                  ? { background: "#ffffff14", color: "#fff", borderColor: "#ffffff55" }
                  : undefined
              }
            >
              {copy.home.cta2}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
