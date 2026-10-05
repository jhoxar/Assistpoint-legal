import type { Metadata } from "next";
import { copy, orgs } from "@/content/site";

export const metadata: Metadata = {
  title: "Who We Serve",
  description:
    "AssistPoint Clinical supports FQHCs, critical access and nonprofit hospitals, rural health clinics, behavioral health, primary and multi-specialty care, and value-based care organizations.",
  alternates: { canonical: "/serve" },
};

export default function ServePage() {
  return (
    <>
      <section className="hero-pale">
        <div className="grid-tex-light" aria-hidden="true" />
        <div className="wrap wrap-narrow" style={{ textAlign: "center" }}>
          <p className="eyebrow wide" style={{ justifyContent: "center" }}>
            <span className="rule" aria-hidden="true" />
            {copy.serve.eyebrow}
            <span className="rule trail" aria-hidden="true" />
          </p>
          <h1 className="h1">
            {copy.serve.h1a}
            <br />
            <em className="accent">{copy.serve.h1em}</em>
          </h1>
          <p className="lede" style={{ marginInline: "auto" }}>{copy.serve.lede}</p>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap grid g-260">
          {orgs.map(([icon, title], i) => (
            <article className="org-tile" key={title} style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}>
              <span className="org-ico" aria-hidden="true">{icon}</span>
              <span className="org-n">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="h3 org-t">{title}</h2>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
