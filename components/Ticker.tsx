import { tickerChain } from "@/content/site";

/**
 * The revenue-cycle marquee.
 *
 * It only loops seamlessly because the 10-stage chain is rendered twice
 * against a translateX(-50%) animation — the second half is what scrolls into
 * the gap the first half leaves. Rendering it once breaks the loop.
 */
export default function Ticker() {
  return (
    <div className="ticker-mask">
      <div className="ticker-track">
        {tickerChain.map((c, i) => (
          <span className="ticker-chip" key={`${c.label}-${i}`} aria-hidden={i >= 10}>
            <span className="n">{c.n}</span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
