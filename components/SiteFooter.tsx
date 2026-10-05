import Link from "next/link";
import { ROUTES, contact, copy, navMain, navTop } from "@/content/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo" style={{ color: "#fff" }}>
            <span className="logo-mark" aria-hidden="true" style={{ background: "#ffffff14" }}>
              {copy.mark}
            </span>
            <span className="logo-text">{copy.brand}</span>
          </Link>
          <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
            <a className="footer-contact" href={`mailto:${contact.email}`}>
              <span aria-hidden="true">✉</span> {contact.email}
            </a>
            <a className="footer-contact" href={contact.phoneHref}>
              <span aria-hidden="true">☏</span> {contact.phoneLabel}
            </a>
          </div>
        </div>

        <nav aria-label="Services">
          {navMain.map(([id, label]) => (
            <Link key={id} href={ROUTES[id]} className="footer-link">
              {label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Company">
          {navTop.map(([id, label]) => (
            <Link key={id} href={ROUTES[id]} className="footer-link">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="footer-copy">{copy.footerCopyright}</p>
    </footer>
  );
}
