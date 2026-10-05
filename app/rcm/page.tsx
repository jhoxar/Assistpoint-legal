import type { Metadata } from "next";
import Link from "next/link";
import { AutoplayProvider } from "@/components/Autoplay";
import RcmMatrix from "@/components/RcmMatrix";
import Ticker from "@/components/Ticker";
import {
  ROUTES, copy, img, infusionFeatures, infusionFlow, rcmCards, specialties,
} from "@/content/site";

export const metadata: Metadata = {
  title: "Revenue Cycle Management",
  description:
    "End-to-end revenue cycle management: eligibility, authorization, coding, claims, payment posting, denials, A/R and reporting — including infusion and specialty drug billing.",
  alternates: { canonical: "/rcm" },
};

export default function RcmPage() {
  return (
    <AutoplayProvider>
      <section className="hero-pale">
        <div className="grid-tex-light" aria-hidden="true" />
        <div className="wrap grid g-460" style={{ alignItems: "center" }}>
          <div>
            <p className="eyebrow wide">
              <span className="rule" aria-hidden="true" />
              {copy.rcm.eyebrow}
            </p>
            <h1 className="h1">
              {copy.rcm.h1a}
              <br />
              <em className="accent">{copy.rcm.h1em}</em>
            </h1>
            <p className="lede">{copy.rcm.lede}</p>
            <div className="btn-row">
              <Link href={ROUTES.contact} className="btn btn-primary">{copy.rcm.cta}</Link>
            </div>
          </div>

          <div className="rcm-panel">
            <div className="grid-tex" aria-hidden="true" />
            <p className="eyebrow on-dark" style={{ letterSpacing: ".24em" }}>
              <span className="rule" aria-hidden="true" />
              {copy.rcm.matrixEyebrow}
            </p>
            <RcmMatrix />
            <p className="rcm-hub">{copy.rcm.hub}</p>
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ paddingTop: "clamp(56px,8vw,80px)", paddingInline: 0 }}>
        <header className="sec-head" style={{ paddingInline: "var(--gutter)" }}>
          <p className="eyebrow">
            <span className="rule" aria-hidden="true" />
            {copy.rcm.flowEyebrow}
            <span className="rule trail" aria-hidden="true" />
          </p>
          <h2 className="h2" style={{ fontSize: "var(--fs-h2-connected)" }}>
            {copy.rcm.flowH2a}
            <em className="accent">{copy.rcm.flowH2em}</em>
          </h2>
        </header>
        <Ticker />
      </section>

      <section className="section">
        <div className="wrap grid g-320">
          {rcmCards.map(([icon, title, desc], i) => (
            <article className="card" key={title} style={{ cursor: "default" }}>
              <span className="card-num">
                <span aria-hidden="true">{icon}</span>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <h3 className="h3 t" style={{ fontSize: "var(--fs-card-md)" }}>{title}</h3>
              <p className="d">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta-panel" style={{ textAlign: "center" }}>
            <div className="grid-tex" aria-hidden="true" />
            <p className="eyebrow on-dark" style={{ letterSpacing: ".24em" }}>{copy.rcm.midEyebrow}</p>
            <h2 className="h2" style={{ color: "#fff", fontSize: "var(--fs-h2-focus)" }}>{copy.rcm.midH2}</h2>
            <p className="lede on-dark" style={{ marginInline: "auto", marginTop: 18 }}>{copy.rcm.midLede}</p>
            <Link href={ROUTES.contact} className="btn btn-inverted pill-cta">{copy.rcm.midCta}</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.rcm.specEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2" style={{ fontSize: "var(--fs-h2-wide)" }}>{copy.rcm.specH2}</h2>
            <p className="lede" style={{ marginTop: 20, marginBottom: 0 }}>{copy.rcm.specLede}</p>
          </header>
          <div className="hairline-grid">
            {specialties.map(([icon, title, desc]) => (
              <article className="hairline-cell" key={title}>
                <span className="spec-dot" aria-hidden="true">{icon}</span>
                <h3 className="h3" style={{ fontSize: "var(--fs-card-sm)", marginTop: 16 }}>{title}</h3>
                <p className="d">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid g-440" style={{ alignItems: "center" }}>
          <div>
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.rcm.infEyebrow}
            </p>
            <h2 className="h2" style={{ fontSize: "var(--fs-h2-wide)" }}>
              {copy.rcm.infH2a}
              <em className="accent">{copy.rcm.infH2em}</em>
            </h2>
            <p className="lede" style={{ marginTop: 20 }}>{copy.rcm.infLede}</p>
            <h3 className="h3" style={{ fontSize: "var(--fs-card-xl)", margin: "26px 0 18px" }}>
              {copy.rcm.infH3}
            </h3>
            <ul className="feature-list">
              {infusionFeatures.map(([title, desc]) => (
                <li key={title}>
                  <span className="check" aria-hidden="true">✓</span>
                  <span>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <picture className="media-frame" style={{ aspectRatio: "4 / 4.4", boxShadow: "var(--sh-frame)" }}>
            <source media="(max-width: 759.98px)" srcSet={img.infusionTall} />
            <img src={img.infusion} alt="Infusion center patient receiving therapy" loading="lazy" />
          </picture>
        </div>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap grid g-150">
          {infusionFlow.map(([icon, title, sub], i) => (
            <article className="flow-tile" key={title}>
              <span className="flow-ico" aria-hidden="true">{icon}</span>
              <span className="flow-n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="h3" style={{ fontSize: 16 }}>{title}</h3>
              <p className="flow-sub">{sub}</p>
            </article>
          ))}
        </div>
      </section>
    </AutoplayProvider>
  );
}
