import type { Metadata } from "next";
import Link from "next/link";
import { AutoplayProvider } from "@/components/Autoplay";
import Stepper from "@/components/Stepper";
import CompareTable from "@/components/CompareTable";
import ProgramCards from "@/components/ProgramCards";
import CareChain from "@/components/CareChain";
import {
  ROUTES, careSteps, copy, forPatients, forPractices,
} from "@/content/site";

export const metadata: Metadata = {
  title: "CCM, RPM & PCM Care Management",
  description:
    "Chronic Care Management, Remote Patient Monitoring and Principal Care Management programs that keep patients supported between office visits.",
  alternates: { canonical: "/care" },
};

export default function CarePage() {
  return (
    <AutoplayProvider>
      <section className="hero-pale">
        <div className="grid-tex-light" aria-hidden="true" />
        <div className="wrap grid g-460" style={{ alignItems: "center" }}>
          <div>
            <p className="eyebrow wide">
              <span className="rule" aria-hidden="true" />
              {copy.care.eyebrow}
            </p>
            <h1 className="h1">
              {copy.care.h1a}
              <br />
              <em className="accent">{copy.care.h1em}</em>
            </h1>
            <p className="lede">{copy.care.lede}</p>
            <div className="btn-row">
              <Link href={ROUTES.contact} className="btn btn-primary">{copy.care.cta}</Link>
            </div>
          </div>

          <div className="rcm-panel">
            <div className="grid-tex" aria-hidden="true" />
            <p className="eyebrow on-dark" style={{ letterSpacing: ".24em" }}>
              <span className="rule" aria-hidden="true" />
              {copy.care.chainEyebrow}
            </p>
            <CareChain />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.care.progEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2">{copy.care.progH2}</h2>
            <p className="lede" style={{ marginTop: 20, marginBottom: 0 }}>{copy.care.progLede}</p>
          </header>
          <ProgramCards />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow">
              <span className="rule" aria-hidden="true" />
              {copy.care.cmpEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2">{copy.care.cmpH2}</h2>
          </header>
          <CompareTable />
          <p className="disclaimer">
            <span aria-hidden="true">ⓘ</span> {copy.care.disclaimer}
          </p>
        </div>
      </section>

      <section
        className="section panel-dark"
        style={{
          background:
            "radial-gradient(900px 500px at 100% 0%, var(--grad-origin) 0, var(--mid) 45%, var(--deep) 100%)",
        }}
      >
        <div className="grid-tex" aria-hidden="true" />
        <div className="wrap">
          <header className="sec-head">
            <p className="eyebrow on-dark">
              <span className="rule" aria-hidden="true" />
              {copy.care.wfEyebrow}
              <span className="rule trail" aria-hidden="true" />
            </p>
            <h2 className="h2" style={{ color: "#fff" }}>{copy.care.wfH2}</h2>
          </header>

          <div className="glass">
            <Stepper
              cycle="careStep"
              variant="care"
              caption={false}
              items={careSteps.map((label) => ({ label }))}
            />
          </div>

          <div className="grid g-380" style={{ marginTop: 40 }}>
            <div className="glass-card">
              <h3 className="h3" style={{ fontSize: 24, color: "#fff" }}>
                <span aria-hidden="true">☺</span> {copy.care.forPatientsTitle}
              </h3>
              <ul className="tick-list">
                {forPatients.map((t) => (
                  <li key={t}><span className="check" aria-hidden="true">✓</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="glass-card">
              <h3 className="h3" style={{ fontSize: 24, color: "#fff" }}>
                <span aria-hidden="true">▣</span> {copy.care.forPracticesTitle}
              </h3>
              <ul className="tick-list">
                {forPractices.map((t) => (
                  <li key={t}><span className="check" aria-hidden="true">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </AutoplayProvider>
  );
}
