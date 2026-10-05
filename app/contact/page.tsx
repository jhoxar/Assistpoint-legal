import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { contact, copy } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a no-obligation conversation about revenue cycle, operations, care management, financial performance or leadership support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="hero-pale">
        <div className="grid-tex-light" aria-hidden="true" />
        <div className="wrap wrap-narrow" style={{ textAlign: "center" }}>
          <h1 className="h1">
            {copy.contact.h1a}
            <br />
            <em className="accent">{copy.contact.h1em}</em>
          </h1>
          <p className="lede" style={{ marginInline: "auto" }}>{copy.contact.lede}</p>
        </div>
      </section>

      <section style={{ padding: "clamp(40px,6vw,60px) var(--gutter) clamp(64px,12vw,120px)" }}>
        <div className="wrap grid g-440 contact-grid" style={{ alignItems: "start" }}>
          <div className="contact-panel">
            <div className="grid-tex" aria-hidden="true" />
            <p className="eyebrow on-dark">
              <span className="rule" aria-hidden="true" />
              {copy.contact.panelEyebrow}
            </p>
            <h2 className="h2" style={{ color: "#fff", fontSize: "var(--fs-h2-sm)" }}>
              {copy.contact.panelH2}
            </h2>
            <p className="lede on-dark" style={{ marginTop: 18 }}>{copy.contact.panelLede}</p>

            <a className="contact-row" href={`mailto:${contact.email}`}>
              <span className="contact-ico" aria-hidden="true">✉</span>
              <span>
                <span className="k">{copy.contact.emailLabel}</span>
                <span className="v">{contact.email}</span>
              </span>
            </a>
            <a className="contact-row" href={contact.phoneHref}>
              <span className="contact-ico" aria-hidden="true">☏</span>
              <span>
                <span className="k">{copy.contact.phoneLabel}</span>
                <span className="v">{contact.phoneLabel}</span>
              </span>
            </a>

            <div className="chip-row">
              {copy.contact.chips.map((c) => (
                <span className="chip" key={c}>{c}</span>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
