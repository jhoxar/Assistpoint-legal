"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUTES, copy, navMain, navTop, topMeta, type PageId } from "@/content/site";

/**
 * Header, About dropdown and mobile drawer.
 *
 * What changed from the artifact: which nav is shown used to be a JavaScript
 * decision (`w < 1000`), which meant the server rendered the desktop nav and
 * a phone corrected it after hydration. Both navs are now always in the DOM
 * and CSS picks one, so the first paint is already right.
 *
 * The artifact had no keyboard support at all here — no Escape, no outside
 * click, no aria-expanded on the dropdown. Those are added; nothing visual
 * changes until a key is pressed.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  /* Pointer users get mouseenter before click. Without remembering that the
     hover already opened the menu, the click toggles it straight back shut —
     hover, click, and it vanishes. The artifact had exactly this bug. */
  const openedByHover = useRef(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const isActive = (id: PageId) =>
    id === "home" ? pathname === "/" : pathname.startsWith(ROUTES[id]);

  /* Only the CTA's wording depends on width (the artifact shortened it below
     1100px). Everything else is CSS. Starting false and correcting in an
     effect keeps the server and client markup identical. */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1099.98px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Publish the real header height so the drawer's max-height is derived
     rather than hardcoded to the artifact's wrong 70px. */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Close both on navigation. */
  useEffect(() => {
    setMenuOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDrawerOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen, drawerOpen]);

  const aboutActive = navTop.some(([id]) => isActive(id));

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-inner">
        <Link href="/" className="logo" aria-label={copy.brand}>
          <span className="logo-mark" aria-hidden="true">{copy.mark}</span>
          <span className="logo-text">{copy.brand}</span>
        </Link>

        {/* Desktop nav — hidden by CSS below 1000px */}
        <nav className="nav-main only-desktop-nav" aria-label="Main">
          {navMain.map(([id, label]) => (
            <Link
              key={id}
              href={ROUTES[id]}
              className="nav-pill"
              aria-current={isActive(id) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}

          <div
            className="nav-group"
            ref={groupRef}
            onMouseEnter={() => {
              window.clearTimeout(closeTimer.current);
              setMenuOpen((wasOpen) => {
                if (!wasOpen) openedByHover.current = true;
                return true;
              });
            }}
            onMouseLeave={() => {
              closeTimer.current = window.setTimeout(() => {
                openedByHover.current = false;
                setMenuOpen(false);
              }, 180);
            }}
          >
            <button
              type="button"
              className={`nav-pill${aboutActive || menuOpen ? " is-active" : ""}`}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={() => {
                // First click after a hover-open keeps it open; a second one
                // closes. Keyboard users never hover, so for them it is a
                // plain toggle.
                if (openedByHover.current) {
                  openedByHover.current = false;
                  setMenuOpen(true);
                } else {
                  setMenuOpen((v) => !v);
                }
              }}
            >
              About{" "}
              <span
                className="chev-caret"
                style={{ transform: `rotate(${menuOpen ? 180 : 0}deg)` }}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>

            {menuOpen && (
              <div className="nav-menu">
                <div className="nav-menu-card">
                  {navTop.map(([id, label]) => (
                    <Link key={id} href={ROUTES[id]} className="nav-menu-row">
                      <span className="tile" aria-hidden="true">{topMeta[id][0]}</span>
                      <span>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{label}</span>
                        <span className="hint" style={{ display: "block", marginTop: 2 }}>
                          {topMeta[id][1]}
                        </span>
                      </span>
                      <span className="chev" aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <Link href={ROUTES.contact} className="header-cta only-desktop-nav">
          {narrow ? copy.ctaShort : copy.ctaFull}
        </Link>

        {/* Mobile trigger — shown by CSS below 1000px */}
        <button
          type="button"
          className="burger only-mobile-nav"
          aria-label="Menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d={drawerOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {drawerOpen && (
        <div className="drawer" id="mobile-drawer">
          <nav aria-label="Mobile">
            {[...navMain, ...navTop].map(([id, label]) => (
              <Link key={id} href={ROUTES[id]} className="drawer-link">
                {label}
              </Link>
            ))}
          </nav>
          <Link href={ROUTES.contact} className="drawer-cta">
            {copy.ctaFull}
          </Link>
        </div>
      )}
    </header>
  );
}
