"use client";

import { useState } from "react";
import { copy, team } from "@/content/site";

/** Bios open independently — the artifact allowed several at once. */
export default function TeamBios() {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className="grid g-320">
      {team.map((m, i) => {
        const isOpen = !!open[i];
        return (
          <article className="team-card" key={m.name}>
            <div className="media-frame team-photo">
              <img src={m.img} alt={m.name} loading="lazy" />
            </div>
            <div className="team-body">
              <h3 className="h3" style={{ fontSize: 24 }}>{m.name}</h3>
              <p className="team-role">{m.role}</p>
              <p className="team-bio">{m.bio}</p>
              {isOpen && <p className="team-more">{m.more}</p>}
              <button
                type="button"
                className="bio-toggle"
                aria-expanded={isOpen}
                onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
              >
                <span
                  aria-hidden="true"
                  style={{ display: "inline-block", transition: "transform .3s", transform: `rotate(${isOpen ? 45 : 0}deg)` }}
                >
                  +
                </span>{" "}
                {isOpen ? copy.team.closeBio : copy.team.openBio}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
