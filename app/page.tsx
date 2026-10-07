import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import { AutoplayProvider } from "@/components/Autoplay";
import Stepper from "@/components/Stepper";
import CareTabs from "@/components/CareTabs";
import {
  ROUTES, copy, difference, flowDefs, img, pillars, serveTiles, services,
} from "@/content/site";

export default function HomePage() {
  return (
    <AutoplayProvider>
      <HomeHero />

      {/* Pillars ---------------------------------------------------------- */}
      <section className="pillars-sec">
        <div className="pillars">
          {pillars.map(([icon, title, sub, page]) => (
            <Link key={title} href={ROUTES[page]} className="pillar">
              <span className="tile" aria-hidden="true">{icon}</span>
              <span>
                <span className="k">{title}</span>
                <span className="t" style={{ display: "block" }}>{sub}</span>
              </span>
              <span aria-hidden="true" style={{ color: "var(--muted)" }}>↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* What we do ------------------------------------------------------- */}
      <section className="section section-alt">
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.home.whatEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2">{copy.home.whatH2}</h2>
            <p className="lede" style={{ marginTop: 20, marginBottom: 0 }}>
              {copy.home.whatLede}
            </p>
          </header>

          <div className="grid g-420">
            {services.map((s) => (
              <Link key={s.title} href={ROUTES[s.page]} className="card">
                <span className="tile44" aria-hidden="true">{s.icon}</span>
                <span className="t" style={{ display: "block" }}>{s.title}</span>
                <span className="d" style={{ display: "block" }}>{s.desc}</span>
                <span className="lnk">{s.link} <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Care beyond the visit -------------------------------------------- */}
      <section className="section">
        <div className="wrap grid g-440" style={{ alignItems: "center" }}>
          <div className="media-frame" style={{ aspectRatio: "1 / 1.04", boxShadow: "var(--sh-frame)" }}>
            <img src={img.rpm} alt="Remote patient monitoring at home" loading="lazy" width={1920} height={1072} />
          </div>
          <div>
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.home.careEyebrow}
            </p>
            <h2 className="h2">{copy.home.careH2}</h2>
            <p className="lede" style={{ marginTop: 20 }}>{copy.home.careLede}</p>
            <CareTabs variant="rows" />
            <Link href={ROUTES.care} className="card-link">{copy.home.careLink}</Link>
          </div>
        </div>
      </section>

      {/* How AssistPoint works -------------------------------------------- */}
      <section
        className="section panel-dark"
        style={{
          background:
            "radial-gradient(900px 500px at 100% 100%, var(--grad-origin) 0, var(--mid) 45%, var(--deep) 100%)",
        }}
      >
        <div className="grid-tex" aria-hidden="true" />
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow on-dark">
              <span className="rule" aria-hidden="true" />
              {copy.home.flowEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2" style={{ color: "#fff" }}>{copy.home.flowH2}</h2>
          </header>
          <div className="glass">
            <Stepper
              cycle="flowStep"
              items={flowDefs.map(([label, sub]) => ({ label, sub }))}
            />
          </div>
        </div>
      </section>

      {/* Specialty expertise ---------------------------------------------- */}
      <section className="section section-alt">
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.home.specEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2">{copy.home.specH2}</h2>
            <p className="lede" style={{ marginTop: 20, marginBottom: 0 }}>{copy.home.specLede}</p>
          </header>

          <div className="grid g-380 tile-grid">
            <Link href={ROUTES.rcm} className="card tile-card">
              <span className="media-frame media-strip">
                <img src={img.infusion} alt="Infusion center" loading="lazy" width={1920} height={1072} />
              </span>
              <span className="t" style={{ display: "block", marginTop: 22 }}>{copy.home.tileInfusion}</span>
              <span className="d" style={{ display: "block" }}>{copy.home.tileInfusionDesc}</span>
              <span className="lnk">{copy.home.tileInfusionLink}</span>
            </Link>

            <Link href={ROUTES.hospital} className="card tile-card">
              <span className="media-frame media-strip">
                <img src={img.hospital} alt="Hospital corridor" loading="lazy" width={1920} height={1072} />
              </span>
              <span className="t" style={{ display: "block", marginTop: 22 }}>{copy.home.tileHospital}</span>
              <span className="lnk">{copy.home.tileHospitalLink}</span>
            </Link>

            <Link href={ROUTES.serve} className="card tile-card">
              <span className="media-frame media-strip">
                <img src={img.practice} alt="Physician practice" loading="lazy" width={1920} height={1072} />
              </span>
              <span className="t" style={{ display: "block", marginTop: 22 }}>{copy.home.tilePractice}</span>
              <span className="d" style={{ display: "block" }}>{copy.home.tilePracticeDesc}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The AssistPoint difference ---------------------------------------- */}
      <section className="section">
        <div className="wrap grid g-400" style={{ gap: "clamp(32px,6vw,64px)", alignItems: "start" }}>
          <div className="sticky-head">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.home.diffEyebrow}
            </p>
            <h2 className="h2" style={{ fontSize: "var(--fs-h2-lg)" }}>{copy.home.diffH2}</h2>
          </div>
          <div>
            {difference.map(([icon, title, desc]) => (
              <div key={title} className="diff-row">
                <span className="tile44" aria-hidden="true">{icon}</span>
                <div>
                  <h3 className="h3" style={{ fontSize: 20 }}>{title}</h3>
                  <p className="d" style={{ marginTop: 10, color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve ------------------------------------------------------ */}
      <section className="section section-alt">
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.home.serveEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2">{copy.home.serveH2}</h2>
          </header>

          <div className="grid g-340">
            {serveTiles.map((t) => (
              <Link key={t.title} href={ROUTES.serve} className="serve-tile">
                <span className="media-frame serve-thumb">
                  <img src={t.img} alt={t.title} loading="lazy" width={1920} height={1072} />
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>{t.title}</span>
                <span aria-hidden="true" style={{ color: "var(--muted)" }}>→</span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href={ROUTES.serve} className="btn btn-ghost">{copy.home.serveBtn}</Link>
          </div>
        </div>
      </section>

      {/* Closing CTA -------------------------------------------------------- */}
      <section className="section-tight">
        <div className="wrap">
          <div className="cta-panel">
            <div className="grid-tex" aria-hidden="true" />
            <p className="eyebrow on-dark">
              <span className="rule" aria-hidden="true" />
              {copy.home.ctaEyebrow}
            </p>
            <h2 className="h2" style={{ color: "#fff", fontSize: "var(--fs-h2-md)" }}>{copy.home.ctaH2}</h2>
            <p className="lede on-dark" style={{ marginTop: 18 }}>{copy.home.ctaLede}</p>
            <div className="btn-row">
              <Link href={ROUTES.contact} className="btn btn-inverted">{copy.home.cta1}</Link>
            </div>
          </div>
        </div>
      </section>
    </AutoplayProvider>
  );
}
