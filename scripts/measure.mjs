/**
 * Geometry probes for the three reported layout defects.
 *
 * verify.mjs answers "does the page look broken" (overflow, dead images,
 * console errors). This answers "are the boxes where they should be", in
 * numbers, so a fix can be proven rather than eyeballed.
 *
 *   node scripts/measure.mjs 1440,1280,980,904,880,390
 *   node scripts/measure.mjs --find-breakpoint
 *
 * Exits non-zero if any probe fails.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3001";
const args = process.argv.slice(2);
const findBp = args.includes("--find-breakpoint");
const widths = (args.find((a) => !a.startsWith("--")) ?? "1440")
  .split(",").map(Number);

const browser = await chromium.launch();
let failures = 0;

const ok = (b) => (b ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m");
const near = (xs, tol = 1) => Math.max(...xs) - Math.min(...xs) <= tol;

/** Settle the page: force every image to decode, then return to the top. */
async function settle(page) {
  await page.evaluate(() => {
    for (const i of document.querySelectorAll("img")) {
      i.loading = "eager";
      if (!i.complete) i.src = i.src;
    }
  });
  await page
    .waitForFunction(
      () => [...document.querySelectorAll("img")].every((i) => i.naturalWidth > 0),
      { timeout: 20_000 },
    )
    .catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
}

/* --- Probe 1: the three specialty tiles share one row rhythm --------------- */
async function probeTiles(page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll(".tile-card")];
    if (!cards.length) return null;
    const grid = cards[0].parentElement;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    const rows = cards.map((c) => {
      const base = c.getBoundingClientRect();
      const q = (sel) => {
        const el = c.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top - base.top), bottom: Math.round(r.bottom - base.top), h: Math.round(r.height) };
      };
      return {
        title: c.querySelector(".t")?.textContent?.slice(0, 22) ?? "?",
        // Cards that wrap onto a second row are a different band and are not
        // expected to match the first one; only same-band cards must agree.
        band: Math.round(base.top + window.scrollY),
        cardH: Math.round(base.height),
        media: q(".media-frame"),
        t: q(".t"),
        d: q(".d"),
        lnk: q(".lnk"),
      };
    });
    return { cols, rows };
  });
}

/* --- Probe 2: the sticky heading never sits on top of its sibling column --- */
async function probeSticky(page) {
  return page.evaluate(async () => {
    const head = document.querySelector(".sticky-head");
    if (!head) return null;
    const grid = head.parentElement;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    const sibling = [...grid.children].find((c) => c !== head);
    const position = getComputedStyle(head).position;

    // html has `scroll-behavior: smooth`, which turns every scrollTo into an
    // animation. Without this the probe samples positions the page has not
    // reached yet and reports pure noise.
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    let worst = 0;
    let worstAt = 0;
    const step = 180;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (Math.abs(window.scrollY - y) > 2 && y < document.body.scrollHeight - innerHeight - 2) continue;
      const a = head.getBoundingClientRect();
      const b = sibling.getBoundingClientRect();
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 1 && oy > 1 && ox * oy > worst) { worst = ox * oy; worstAt = y; }
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = prev;
    return { cols, position, overlapArea: Math.round(worst), overlapAt: worstAt };
  });
}

/* --- Probe 3: portraits show the whole head ------------------------------- */
async function probeFaces(page) {
  return page.evaluate(() => {
    const out = [];
    for (const sel of [".lead-photo", ".team-photo"]) {
      for (const frame of document.querySelectorAll(sel)) {
        const img = frame.querySelector("img");
        const r = frame.getBoundingClientRect();
        const nw = img?.naturalWidth || 0;
        const nh = img?.naturalHeight || 0;
        if (!nw || !nh || !r.width) continue;
        // object-fit: cover scales to the larger ratio; the visible slice of the
        // source is however much of it survives that scale.
        const scale = Math.max(r.width / nw, r.height / nh);
        out.push({
          sel,
          name: img.getAttribute("alt")?.slice(0, 18) ?? "?",
          box: `${Math.round(r.width)}x${Math.round(r.height)}`,
          ratio: +(r.width / r.height).toFixed(3),
          source: `${nw}x${nh}`,
          visibleH: +(r.height / (nh * scale)).toFixed(3),
        });
      }
    }
    return out;
  });
}

/* --- Find the exact width where .g-400 drops to one column ---------------- */
if (findBp) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const tracks = async (w) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(60);
    return page.evaluate(
      () => getComputedStyle(document.querySelector(".sticky-head").parentElement)
        .gridTemplateColumns.split(" ").filter(Boolean).length,
    );
  };
  let lo = 400, hi = 1400;
  if ((await tracks(hi)) < 2) { console.log("never two columns"); }
  else {
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if ((await tracks(mid)) >= 2) hi = mid; else lo = mid;
    }
    console.log(`\n.g-400 collapses to one column below ${hi}px (two columns from ${hi}px up)\n`);
  }
  await page.close();
  await browser.close();
  process.exit(0);
}

/* --- Run ------------------------------------------------------------------ */
for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: width < 760 ? 844 : 900 },
    deviceScaleFactor: 1,
    isMobile: width < 760,
    hasTouch: width < 760,
  });

  console.log(`\n\x1b[1m══ ${width}px ═══════════════════════════════════════════\x1b[0m`);

  // --- home: tiles + difference section
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60_000 });
  await settle(page);

  const tiles = await probeTiles(page);
  if (tiles) {
    // Group by row band: at 2 columns the third card wraps and legitimately
    // stands alone, so comparing it against the pair above is meaningless.
    const bands = new Map();
    for (const r of tiles.rows) {
      const key = [...bands.keys()].find((k) => Math.abs(k - r.band) <= 4) ?? r.band;
      bands.set(key, [...(bands.get(key) ?? []), r]);
    }
    const groups = [...bands.values()].filter((g) => g.length > 1);
    const checks = groups.map((g) => ({
      media: near(g.map((r) => r.media?.h ?? 0)),
      title: near(g.map((r) => r.t?.top ?? 0)),
      link: near(g.filter((r) => r.lnk).map((r) => r.lnk.bottom), 2),
      card: near(g.map((r) => r.cardH)),
    }));
    const pass = checks.every((c) => c.media && c.title && c.link && c.card);
    if (!pass) failures++;
    console.log(
      `\n  TILES  ${ok(pass)}  ${tiles.cols} column(s), ` +
      `${groups.length} shared band(s) of ${groups.map((g) => g.length).join("+") || "—"}`,
    );
    for (const r of tiles.rows)
      console.log(
        `    ${r.title.padEnd(23)} card ${String(r.cardH).padStart(4)}  ` +
        `media h ${String(r.media?.h ?? "-").padStart(4)}  ` +
        `title y ${String(r.t?.top ?? "-").padStart(4)}  ` +
        `desc y ${String(r.d?.top ?? "—").padStart(4)}  ` +
        `link bottom ${String(r.lnk?.bottom ?? "—").padStart(4)}`,
      );
    checks.forEach((c, i) =>
      console.log(
        `    band ${i + 1} equal: media ${ok(c.media)}  title ${ok(c.title)}  ` +
        `link ${ok(c.link)}  card ${ok(c.card)}`,
      ),
    );
  }

  const homeSticky = await probeSticky(page);
  if (homeSticky) {
    const pass = homeSticky.overlapArea === 0;
    if (!pass) failures++;
    console.log(
      `\n  DIFFERENCE (/)  ${ok(pass)}  ${homeSticky.cols} column(s), position:${homeSticky.position}` +
      (pass ? ", no overlap" : `, OVERLAP ${homeSticky.overlapArea}px² at scrollY ${homeSticky.overlapAt}`),
    );
  }

  // --- hospital: same pattern
  await page.goto(BASE + "/hospital", { waitUntil: "networkidle", timeout: 60_000 });
  await settle(page);
  const hosp = await probeSticky(page);
  if (hosp) {
    const pass = hosp.overlapArea === 0;
    if (!pass) failures++;
    console.log(
      `  HELP (/hospital) ${ok(pass)}  ${hosp.cols} column(s), position:${hosp.position}` +
      (pass ? ", no overlap" : `, OVERLAP ${hosp.overlapArea}px² at scrollY ${hosp.overlapAt}`),
    );
  }

  // --- team: portraits
  await page.goto(BASE + "/team", { waitUntil: "networkidle", timeout: 60_000 });
  await settle(page);
  const faces = await probeFaces(page);
  if (faces.length) {
    const pass = faces.every((f) => f.visibleH >= 0.83);
    if (!pass) failures++;
    console.log(`\n  PORTRAITS  ${ok(pass)}`);
    for (const f of faces)
      console.log(
        `    ${f.sel.padEnd(12)} ${f.name.padEnd(19)} box ${f.box.padEnd(10)} ` +
        `ratio ${String(f.ratio).padEnd(6)} source ${f.source}  ` +
        `shows ${(f.visibleH * 100).toFixed(1)}% of height ${ok(f.visibleH >= 0.83)}`,
      );
  }

  await page.close();
}

await browser.close();
console.log(`\n${failures ? `\x1b[31m${failures} probe(s) failed\x1b[0m` : "\x1b[32mall probes passed\x1b[0m"}\n`);
process.exit(failures ? 1 : 0);
