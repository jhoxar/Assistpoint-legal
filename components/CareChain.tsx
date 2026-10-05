"use client";

import { careChainLabels } from "@/content/site";
import { useAutoplay } from "./Autoplay";

/** PATIENT → CARE TEAM → CARE PLAN → ONGOING SUPPORT, cycling with careStep. */
export default function CareChain() {
  const { careStep } = useAutoplay();
  return (
    <div className="care-chain">
      {careChainLabels.map((label, i) => (
        <span key={label} className={`chain-pill${careStep % 4 === i ? " is-on" : ""}`}>
          <span className="chain-dot" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}
