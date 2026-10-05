"use client";

import { rcmChips, rcmDefs } from "@/content/site";
import { useAutoplay } from "./Autoplay";

/* The quadrants are laid out 1, 2, 4, 3 so they read clockwise around the
   hub rather than left-to-right. */
const CLOCKWISE = [1, 2, 4, 3];

export default function RcmMatrix() {
  const { rcmStage, pick } = useAutoplay();

  return (
    <div className="rcm-matrix">
      {rcmDefs.map(([icon, title], i) => {
        const on = rcmStage === i;
        return (
          <button
            key={title}
            type="button"
            className={`rcm-cell${on ? " is-on" : ""}`}
            style={{ order: CLOCKWISE[i] }}
            aria-pressed={on}
            onClick={() => pick("rcmStage", i)}
            onMouseEnter={() => pick("rcmStage", i)}
            onFocus={() => pick("rcmStage", i)}
          >
            <span className="rcm-top">
              <span className="rcm-dot" aria-hidden="true">{icon}</span>
              <span className="rcm-n">{String(i + 1).padStart(2, "0")}</span>
            </span>
            <span className="rcm-t">{title}</span>
            <span className="rcm-chips">
              {rcmChips[i].map((c) => (
                <span key={c} className="rcm-chip">{c}</span>
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
