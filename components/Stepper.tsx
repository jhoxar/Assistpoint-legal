"use client";

import { useAutoplay, type CycleKey } from "./Autoplay";

interface Props {
  items: { label: string; sub?: string }[];
  cycle: Extract<CycleKey, "flowStep" | "careStep">;
  variant?: "flow" | "care";
  caption?: boolean;
}

/**
 * The process rails ("Assess → Optimize", "Identify Candidates → Bill & Report").
 *
 * The artifact drew the connector as one absolutely positioned bar inset by
 * 8.33% (half of one sixth) or 6.25% (half of one eighth) — numbers welded to
 * `repeat(6,1fr)` and `repeat(8,1fr)`. Changing the column count silently
 * detached the bar from the dots, which is exactly what responsive work has
 * to do. Here each step owns the connector to its right (CSS `.step::after`),
 * so it follows the grid at any column count and rotates to a vertical
 * timeline on a phone without any recalculation.
 *
 * These are genuinely ordered stages, so the numbering is information, not
 * decoration.
 */
export default function Stepper({ items, cycle, variant = "flow", caption = true }: Props) {
  const auto = useAutoplay();
  const current = auto[cycle];

  return (
    <>
      <ol className={`steps${variant === "care" ? " care" : ""}`} style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((it, i) => {
          const state = i === current ? "active" : i < current ? "done" : "todo";
          return (
            <li key={it.label} style={{ display: "contents" }}>
              <button
                type="button"
                className="step"
                data-state={state}
                aria-current={state === "active" ? "step" : undefined}
                onClick={() => auto.pick(cycle, i)}
                /* Desktop also selected on hover in the artifact. */
                onMouseEnter={() => auto.pick(cycle, i)}
                onFocus={() => auto.pick(cycle, i)}
              >
                <span className="dot">{String(i + 1).padStart(2, "0")}</span>
                <span className="lbl">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {caption && items[current]?.sub && (
        <p className="step-caption" key={current}>
          <span style={{ color: "var(--sky)", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>
            {String(current + 1).padStart(2, "0")}
          </span>{" "}
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>{items[current].sub}</span>
        </p>
      )}
    </>
  );
}
