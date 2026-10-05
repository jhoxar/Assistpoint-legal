import type { Metadata } from "next";
import TeamBios from "@/components/TeamBios";
import { copy } from "@/content/site";

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "Experienced healthcare leaders with backgrounds spanning hospital operations, finance, revenue cycle and organizational performance.",
  alternates: { canonical: "/team" },
};

export default function TeamPage() {
  return (
    <>
      <section className="hero-pale">
        <div className="grid-tex-light" aria-hidden="true" />
        <div className="wrap wrap-narrow" style={{ textAlign: "center" }}>
          <h1 className="h1">
            {copy.team.h1a}
            <br />
            <em className="accent">{copy.team.h1em}</em>
          </h1>
          <p className="lede" style={{ marginInline: "auto" }}>{copy.team.lede}</p>
        </div>
      </section>

      <section style={{ padding: "clamp(40px,6vw,60px) var(--gutter) clamp(56px,10vw,100px)" }}>
        <div className="wrap">
          <div className="lead-panel">
            <div className="grid-tex" aria-hidden="true" />
            <div className="media-frame lead-photo">
              <img src={copy.team.leadImg} alt={copy.team.leadName} loading="lazy" />
            </div>
            <div>
              <p className="eyebrow on-dark">
                <span className="rule" aria-hidden="true" />
                {copy.team.leadEyebrow}
              </p>
              <h2 className="h2" style={{ color: "#fff", fontSize: "var(--fs-name)" }}>
                {copy.team.leadName}
              </h2>
              <p className="lede on-dark" style={{ marginTop: 16 }}>{copy.team.leadBio}</p>
              <div className="chip-row">
                {copy.team.leadChips.map((c) => (
                  <span className="chip" key={c}>{c}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <TeamBios />
          </div>
        </div>
      </section>
    </>
  );
}
