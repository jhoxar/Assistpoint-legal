import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES, copy, opsCards } from "@/content/site";

export const metadata: Metadata = {
  title: "Operations & Consulting",
  description:
    "Interim executive leadership, strategic planning, financial strength, access and compliance, population health and technology support for healthcare organizations.",
  alternates: { canonical: "/ops" },
};

export default function OpsPage() {
  return (
    <>
      <section className="hero-pale">
        <div className="grid-tex-light" aria-hidden="true" />
        <div className="wrap grid g-420 ops-hero" style={{ alignItems: "end" }}>
          <div>
            <p className="eyebrow wide">
              <span className="rule" aria-hidden="true" />
              {copy.ops.eyebrow}
            </p>
            <h1 className="h1">
              {copy.ops.h1a}
              <br />
              <em className="accent">{copy.ops.h1em}</em>
            </h1>
          </div>
          <div className="ops-aside">
            <p className="lede">{copy.ops.lede}</p>
            <div className="btn-row">
              <Link href={ROUTES.contact} className="btn btn-primary">{copy.ops.cta}</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(48px,8vw,80px) var(--gutter) clamp(64px,12vw,120px)" }}>
        <div className="wrap ops-grid">
          {opsCards.map(([icon, title, desc], i) => (
            <article className="ops-cell" key={title} style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}>
              <span className="tile44" aria-hidden="true">{icon}</span>
              <div>
                <h3 className="h3 ops-t">{title}</h3>
                <p className="d ops-d">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
