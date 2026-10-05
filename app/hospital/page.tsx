import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES, copy, hospitalCards, hospitalFeatures, img } from "@/content/site";

export const metadata: Metadata = {
  title: "Hospital & Rural Health Support",
  description:
    "Operational leadership, financial performance, revenue cycle and analytics support for hospitals, rural health organizations and community providers.",
  alternates: { canonical: "/hospital" },
};

export default function HospitalPage() {
  return (
    <>
      <section className="hosp-hero">
        <picture className="hosp-img">
          <source media="(max-width: 759.98px)" srcSet={img.hospitalTall} />
          <img src={img.hospital} alt="Hospital environment" />
        </picture>
        <div className="hosp-veil" aria-hidden="true" />
        <div className="wrap hosp-copy">
          <p className="eyebrow on-dark wide">
            <span className="rule" aria-hidden="true" />
            {copy.hospital.eyebrow}
          </p>
          <h1 className="h1" style={{ color: "#fff" }}>{copy.hospital.h1}</h1>
          <p className="lede on-dark">{copy.hospital.lede}</p>
          <div className="btn-row">
            <Link href={ROUTES.contact} className="btn btn-inverted">{copy.hospital.cta}</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid g-400" style={{ gap: "clamp(32px,6vw,64px)", alignItems: "start" }}>
          <div className="sticky-head lower">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.hospital.helpEyebrow}
            </p>
            <h2 className="h2" style={{ fontSize: "var(--fs-h2-lg)" }}>{copy.hospital.helpH2}</h2>
          </div>
          <div className="grid g-260">
            {hospitalCards.map(([icon, title, desc]) => (
              <article className="card" key={title} style={{ cursor: "default", padding: 28 }}>
                <span className="tile44" aria-hidden="true">{icon}</span>
                <h3 className="h3 t" style={{ fontSize: 19 }}>{title}</h3>
                <p className="d">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap grid g-440" style={{ alignItems: "center" }}>
          <div>
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.hospital.execEyebrow}
            </p>
            <h2 className="h2" style={{ fontSize: "var(--fs-h2-wide)" }}>
              {copy.hospital.execH2a}
              <em className="accent">{copy.hospital.execH2em}</em>
            </h2>
            <p className="lede" style={{ marginTop: 20 }}>{copy.hospital.execLede}</p>
            <ul className="feature-list simple">
              {hospitalFeatures.map((t) => (
                <li key={t}><span className="check" aria-hidden="true">✓</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="media-frame" style={{ aspectRatio: "5 / 4", boxShadow: "var(--sh-frame)" }}>
            <img src={img.leadership} alt="Healthcare leadership team meeting" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="cta-panel">
            <div className="grid-tex" aria-hidden="true" />
            <h2 className="h2" style={{ color: "#fff", fontSize: "var(--fs-h2-md)", marginTop: 0 }}>
              {copy.hospital.ctaH2}
            </h2>
            <p className="lede on-dark" style={{ marginTop: 18 }}>{copy.hospital.ctaLede}</p>
            <div className="btn-row">
              <Link href={ROUTES.contact} className="btn btn-inverted">{copy.ctaFull}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
