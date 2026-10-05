"use client";

import { careDefs, programs } from "@/content/site";
import { useAutoplay } from "./Autoplay";
import CareTabs from "./CareTabs";

const ICONS = ["⌥", "⌁", "◎"];

/**
 * The artifact showed one card on a phone (picked by the segmented control)
 * and three on desktop — but the control was gated at 760px, so between 760
 * and 1000 you got three cards in a two-column grid with an orphan and no way
 * to choose. The control now covers everything below 1000px.
 */
export default function ProgramCards() {
  const { careTab } = useAutoplay();

  return (
    <>
      <div className="prog-seg">
        <CareTabs variant="seg" />
      </div>

      <div className="grid g-340 prog-grid">
        {programs.map((p, i) => (
          <article
            className="prog-card"
            key={p.key}
            data-active={careTab === i ? "1" : "0"}
          >
            <span className="tile44" aria-hidden="true">{ICONS[i]}</span>
            <p className="prog-tag">{p.tag}</p>
            <h3 className="prog-key">{p.key}</h3>
            <p className="prog-full">{careDefs[i].full}</p>
            <p className="prog-label">What it is:</p>
            <p className="d">{p.what}</p>
            <ul className="tick-list">
              {p.bullets.map((b) => (
                <li key={b}><span className="check" aria-hidden="true">✓</span>{b}</li>
              ))}
            </ul>
            <p className="prog-example">
              <strong>Example:</strong> {p.example}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
