"use client";

import { careDefs } from "@/content/site";
import { useAutoplay } from "./Autoplay";

/**
 * The CCM / RPM / PCM selector.
 *
 * Two presentations of one control:
 *  · "rows"  — the stacked list used beside the home page's care image
 *  · "seg"   — the segmented control used on the care page
 *
 * Desktop selects on hover as well as click, as the artifact did. Hover is
 * mirrored onto focus so the keyboard reaches the same states, which the
 * artifact did not support at all.
 */
export default function CareTabs({ variant }: { variant: "rows" | "seg" }) {
  const { careTab, pick } = useAutoplay();

  if (variant === "seg") {
    return (
      <div className="seg" role="tablist" aria-label="Care programs">
        {careDefs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={careTab === i}
            className={`seg-btn${careTab === i ? " is-on" : ""}`}
            onClick={() => pick("careTab", i)}
          >
            {t.key}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="care-rows" role="tablist" aria-label="Care programs">
      {careDefs.map((t, i) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={careTab === i}
          className={`care-row${careTab === i ? " is-on" : ""}`}
          onClick={() => pick("careTab", i)}
          onMouseEnter={() => pick("careTab", i)}
          onFocus={() => pick("careTab", i)}
        >
          <span className="badge" aria-hidden="true">{t.icon}</span>
          <span>
            <span className="k">{t.key}</span>
            <span className="s">{t.short}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
