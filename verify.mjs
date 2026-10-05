/**
 * Capture + audit a route at one or more widths.
 *
 * screenshot.mjs shoots after a fixed 600ms, which fires before lazy images
 * below the fold have decoded — they photograph as empty boxes and look like
 * layout bugs that aren't there. This scrolls the page first, waits for every
 * image to actually decode, then captures, and reports the things a
 * screenshot cannot show: horizontal overflow, broken images, console errors,
 * and which hero plate the browser chose.
 *
 *   node verify.mjs <path> <width>[,<width>...] [label]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const route = process.argv[2] ?? "/";
const widths = (process.argv[3] ?? "1440").split(",").map(Number);
const label = process.argv[4] ?? "";
const BASE = process.env.BASE ?? "http://localhost:3001";

const outDir = path.join(process.cwd(), "temporary screenshots");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
let failures = 0;

for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: width < 760 ? 844 : 900 },
    deviceScaleFactor: 2,
    isMobile: width < 760,
    hasTouch: width < 760,
  });

  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("requestfailed", (r) => errors.push(`REQ ${r.failure()?.errorText} ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`));

  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60_000 });

  // Force every image to load regardless of viewport. Racing the lazy loader
  // by scrolling is non-deterministic — the same page reported different
  // "broken" images at different widths purely on timing.
  await page.evaluate(() => {
    for (const i of document.querySelectorAll("img")) {
      i.loading = "eager";
      if (!i.complete) i.src = i.src;
    }
  });

  // Walk the page so anything viewport-triggered still fires.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  // `complete` flips true for a lazy image the moment it is skipped, so it is
  // not a load signal. naturalWidth is.
  await page
    .waitForFunction(
      () => [...document.querySelectorAll("img")].every((i) => i.naturalWidth > 0),
      { timeout: 25_000 },
    )
    .catch(() => {});
  // Let the hero reveal ladder finish (cues run to 3.5s at 0.75x).
  await page.waitForTimeout(5200);

  const audit = await page.evaluate(() => {
    const d = document.documentElement;
    const broken = [...document.querySelectorAll("img")]
      .filter((i) => !i.naturalWidth)
      .map((i) => i.getAttribute("src"));

    // Anything actually sticking out past the viewport.
    // An element wider than the viewport is only a bug if nothing clips it.
    // The marquee track and the hero plate are both intentionally oversized
    // inside an overflow:hidden parent.
    const clipped = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (o.overflowX === "hidden" || o.overflowX === "clip" ||
            o.overflow === "hidden" || o.overflow === "clip") return true;
      }
      return false;
    };
    const spill = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (clipped(el)) continue;
      if (r.right > d.clientWidth + 1.5 || r.left < -1.5) {
        spill.push(
          `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} ` +
            `L${Math.round(r.left)} R${Math.round(r.right)}`,
        );
      }
      if (spill.length > 6) break;
    }

    const v = document.querySelector("video");
    return {
      scrollW: d.scrollWidth,
      clientW: d.clientWidth,
      broken,
      spill,
      video: v
        ? {
            src: (v.currentSrc || "").split("/").pop(),
            vertical: v.videoHeight > v.videoWidth,
            dims: `${v.videoWidth}x${v.videoHeight}`,
            opacity: getComputedStyle(v).opacity,
          }
        : null,
      heroReveal: document.querySelector(".hero-h1")?.getAttribute("data-on") ?? null,
    };
  });

  const name = `screenshot-${label || "v"}-${width}.png`;
  await page.screenshot({ path: path.join(outDir, name), fullPage: true });

  const overflow = audit.scrollW > audit.clientW + 1;
  const bad = overflow || audit.broken.length || errors.length;
  if (bad) failures++;

  console.log(`\n── ${route} @ ${width}px ${bad ? "✗" : "✓"}`);
  console.log(`   ${name}`);
  console.log(`   overflow: ${audit.scrollW} vs ${audit.clientW}${overflow ? "  ✗ HORIZONTAL SCROLL" : "  ok"}`);
  if (audit.video)
    console.log(
      `   hero plate: ${audit.video.src} ${audit.video.dims} ` +
        `${audit.video.vertical ? "(vertical)" : "(horizontal)"} opacity=${audit.video.opacity} reveal=${audit.heroReveal}`,
    );
  if (audit.broken.length) console.log(`   ✗ broken images: ${audit.broken.join(", ")}`);
  if (audit.spill.length) console.log(`   ✗ spilling: ${audit.spill.join(" | ")}`);
  if (errors.length) console.log(`   ✗ errors: ${[...new Set(errors)].slice(0, 4).join(" | ")}`);

  await page.close();
}

await browser.close();
process.exit(failures ? 1 : 0);
