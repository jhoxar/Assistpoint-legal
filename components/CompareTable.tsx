"use client";

import { careDefs, cmp } from "@/content/site";
import { useAutoplay } from "./Autoplay";
import CareTabs from "./CareTabs";

/**
 * "How the Programs Differ".
 *
 * The artifact kept a 4-column grid (1fr 1.3fr 1.3fr 1.3fr) down to 760px,
 * where each data cell held about 107px of text and wrapped to six lines; the
 * single-column fallback existed but was gated behind the same 760 breakpoint
 * as everything else. The card view now takes over at 1000px, which is where
 * the table actually stops working.
 */
export default function CompareTable() {
  const { careTab } = useAutoplay();
  const active = careDefs[careTab];

  return (
    <>
      <div className="cmp-table">
        <div className="cmp-row cmp-head">
          <span />
          {careDefs.map((t, i) => (
            <span key={t.key} className={`cmp-h${careTab === i ? " is-on" : ""}`}>
              <span className="tile44" aria-hidden="true">{t.icon}</span>
              <span>{t.key}</span>
            </span>
          ))}
        </div>
        {cmp.map(([label, ...cells]) => (
          <div className="cmp-row" key={label}>
            <span className="cmp-label">{label}</span>
            {/* Two rows carry identical cell text, so the index is the key. */}
            {cells.map((c, i) => (
              <span key={i} className={`cmp-cell${careTab === i ? " is-on" : ""}`}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      <div className="cmp-cards">
        <CareTabs variant="seg" />
        <p className="cmp-active">
          <span aria-hidden="true">{active.icon}</span> {active.key} — {active.full}
        </p>
        <dl className="cmp-dl">
          {cmp.map(([label, ...cells]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{cells[careTab]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
