import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/rcm", "/care", "/ops", "/hospital", "/serve", "/team", "/contact"];

test.describe("structure", () => {
  for (const route of ROUTES) {
    test(`${route} renders, has one h1, and never scrolls sideways`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("header.site-header")).toBeVisible();
      await expect(page.locator("footer.site-footer")).toBeVisible();

      // The defect this whole rebuild exists to prevent.
      const { scrollW, clientW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      expect(scrollW, `horizontal overflow on ${route}`).toBeLessThanOrEqual(clientW + 1);
    });
  }

  test("every page has a unique title and a description", async ({ page }) => {
    const seen = new Set<string>();
    for (const route of ROUTES) {
      await page.goto(route);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(seen.has(title), `duplicate title: ${title}`).toBe(false);
      seen.add(title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content", /.{50,}/,
      );
    }
  });
});

test.describe("navigation", () => {
  test("desktop nav moves between pages and marks the current one", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "desktop nav only");
    await page.goto("/");
    await page.getByRole("link", { name: "RCM", exact: true }).first().click();
    await expect(page).toHaveURL(/\/rcm/);
    await expect(page.locator('.nav-pill[aria-current="page"]')).toHaveText("RCM");
  });

  test("About dropdown opens, closes on Escape, and reaches its pages", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "dropdown is desktop-only");
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /About/ });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".nav-menu-card")).toBeVisible();
    // The artifact had no keyboard escape at all.
    await page.keyboard.press("Escape");
    await expect(page.locator(".nav-menu-card")).toHaveCount(0);
    await trigger.click();
    await page.locator(".nav-menu-row", { hasText: "Who We Are" }).click();
    await expect(page).toHaveURL(/\/team/);
  });

  test("mobile drawer toggles and navigates", async ({ page }, info) => {
    test.skip(info.project.name === "desktop", "drawer appears below 1000px");
    await page.goto("/");
    const burger = page.getByRole("button", { name: "Menu" });
    await expect(burger).toBeVisible();
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await burger.click();
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await page.locator(".drawer-link", { hasText: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact/);
    // Navigating must close it.
    await expect(page.locator(".drawer")).toHaveCount(0);
  });
});

test.describe("hero video", () => {
  test("loads the plate matching the viewport orientation", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3500);
    const v = await page.evaluate(() => {
      const el = document.querySelector("video")!;
      return {
        w: el.videoWidth,
        h: el.videoHeight,
        src: (el.currentSrc || "").split("/").pop(),
        // The switch is driven by the viewport's own aspect ratio, not by a
        // device label: an 820x1100 tablet is portrait and wants the vertical
        // plate just as much as a phone does.
        portrait: window.matchMedia("(max-aspect-ratio: 1/1)").matches,
      };
    });
    // A horizontal plate in a portrait box scales ~3.2x under object-fit:cover.
    if (v.portrait) {
      expect(v.h, `portrait viewport should load the vertical plate, got ${v.src}`).toBeGreaterThan(v.w);
    } else {
      expect(v.w, `landscape viewport should load the horizontal plate, got ${v.src}`).toBeGreaterThan(v.h);
    }
  });

  test("the mobile plate always frames the whole machine", async ({ page }, info) => {
    test.skip(info.project.name === "desktop", "the stacked band is a sub-760 layout");
    await page.goto("/");
    await page.waitForTimeout(2500);

    const seen = await page.evaluate(() => {
      const v = document.querySelector(".hero-media") as HTMLVideoElement;
      const box = v.getBoundingClientRect();
      const pw = v.videoWidth || 1080;
      const ph = v.videoHeight || 1920;
      // object-fit: cover scales to the larger ratio; object-position bottom
      // keeps the bottom slice. Return where that slice starts in the plate.
      const scale = Math.max(box.width / pw, box.height / ph);
      return 1 - box.height / (ph * scale);
    });

    // The assembled monitor occupies roughly 48%-97% of the plate's height.
    // Tying the band to a viewport height instead of its own width made this
    // drift with viewport width — at 626px the window opened at 66%, cutting
    // the monitor's head off entirely.
    expect(seen, `crop window opens at ${(seen * 100).toFixed(1)}% of the plate, inside the machine`)
      .toBeLessThan(0.46);
  });

  test("the reveal ladder completes and the copy ends visible", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator(".hero-h1");
    await expect(h1).toHaveAttribute("data-on", "1", { timeout: 9000 });
    await expect(h1).toBeVisible();
    await expect(page.locator("video")).toHaveCSS("opacity", "1");
  });
});

test.describe("interactions", () => {
  test("picking a step pauses autoplay and selects it", async ({ page }) => {
    await page.goto("/");
    const steps = page.locator(".steps .step");
    await steps.nth(3).click();
    await expect(steps.nth(3)).toHaveAttribute("data-state", "active");
    // pause() holds every cycle for 9s, so it must still be active after 3.
    await page.waitForTimeout(3000);
    await expect(steps.nth(3)).toHaveAttribute("data-state", "active");
  });

  test("team bios open independently", async ({ page }) => {
    await page.goto("/team");
    const toggles = page.locator(".bio-toggle");
    await expect(toggles.first()).toHaveAttribute("aria-expanded", "false");
    await toggles.first().click();
    await expect(toggles.first()).toHaveAttribute("aria-expanded", "true");
    await expect(toggles.nth(1)).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".team-more")).toHaveCount(1);
  });

  test("the comparison table swaps to cards below 1000px", async ({ page }, info) => {
    await page.goto("/care");
    const table = page.locator(".cmp-table");
    const cards = page.locator(".cmp-cards");
    if (info.project.name === "desktop") {
      await expect(table).toBeVisible();
      await expect(cards).toBeHidden();
    } else {
      // At 820px the artifact still showed the 4-column table.
      await expect(table).toBeHidden();
      await expect(cards).toBeVisible();
    }
  });

  test("program cards collapse to one selectable card below 1000px", async ({ page }, info) => {
    await page.goto("/care");
    const visible = page.locator(".prog-card:visible");
    await expect(visible).toHaveCount(info.project.name === "desktop" ? 3 : 1);
  });
});

test.describe("contact form", () => {
  test("carries the markers Netlify needs to detect it", async ({ page }) => {
    await page.goto("/contact");
    const form = page.locator('form[name="consultation"]');
    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
    await expect(form.locator('input[name="form-name"]')).toHaveValue("consultation");
    for (const n of ["full_name", "email", "organization", "phone", "message"]) {
      await expect(form.locator(`[name="${n}"]`)).toHaveCount(1);
    }
  });

  test("refuses to submit without the required fields", async ({ page }) => {
    await page.goto("/contact");
    await page.locator(".form-submit").click();
    await expect(page.locator(".form-sent")).toHaveCount(0);
  });
});

test.describe("no page leaks internal notes", () => {
  test("the artifact's IT instructions are gone", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const body = await page.locator("body").innerText();
      expect(body).not.toContain("IT: connect this form");
      expect(body).not.toContain("ready for IT to connect");
      expect(body).not.toContain("The website should describe the opportunity");
    }
  });
});

/* The three defects the client reported on the live site. Each of them was a
   silent CSS fault that no existing test could see, so each gets a geometry
   assertion rather than a screenshot. */
test.describe("layout regressions", () => {
  test("the three specialty tiles share one frame and one row rhythm", async ({ page }) => {
    await page.goto("/");
    const cards = await page.evaluate(() =>
      [...document.querySelectorAll(".tile-card")].map((c) => {
        const base = c.getBoundingClientRect();
        const rel = (sel: string) => {
          const el = c.querySelector(sel);
          return el ? Math.round(el.getBoundingClientRect().top - base.top) : null;
        };
        const lnk = c.querySelector(".lnk");
        return {
          // Cards that wrap onto a second row are a separate band; only cards
          // sitting side by side are expected to agree.
          band: Math.round(base.top + window.scrollY),
          cardH: Math.round(base.height),
          mediaH: Math.round(c.querySelector(".media-frame")!.getBoundingClientRect().height),
          titleTop: rel(".t"),
          linkBottom: lnk ? Math.round(lnk.getBoundingClientRect().bottom - base.top) : null,
        };
      }),
    );
    expect(cards).toHaveLength(3);

    const bands = new Map<number, typeof cards>();
    for (const c of cards) {
      const key = [...bands.keys()].find((k) => Math.abs(k - c.band) <= 4) ?? c.band;
      bands.set(key, [...(bands.get(key) ?? []), c]);
    }
    const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
    for (const row of bands.values()) {
      if (row.length < 2) continue;
      expect(spread(row.map((c) => c.mediaH)), "image heights differ").toBeLessThanOrEqual(1);
      expect(spread(row.map((c) => c.cardH)), "card heights differ").toBeLessThanOrEqual(1);
      expect(spread(row.map((c) => c.titleTop!)), "titles sit on different lines").toBeLessThanOrEqual(1);
      const links = row.filter((c) => c.linkBottom !== null).map((c) => c.linkBottom!);
      if (links.length > 1)
        expect(spread(links), "links sit on different lines").toBeLessThanOrEqual(2);
    }
  });

  for (const route of ["/", "/hospital"]) {
    test(`${route} — the sticky heading never covers the rows it introduces`, async ({ page }) => {
      await page.goto(route);
      const worst = await page.evaluate(async () => {
        // html carries scroll-behavior: smooth, which turns scrollTo into an
        // animation and makes every sampled rect a position the page has not
        // reached yet.
        document.documentElement.style.scrollBehavior = "auto";
        const head = document.querySelector<HTMLElement>(".sticky-head")!;
        const grid = head.parentElement!;
        const sibling = [...grid.children].find((c) => c !== head)!;
        const targets = [...sibling.querySelectorAll(".diff-row, .card"), sibling];
        const gridTop = grid.getBoundingClientRect().top + window.scrollY;
        const gridH = grid.getBoundingClientRect().height;
        let worst = 0;
        for (let off = -300; off < gridH + 400; off += 60) {
          window.scrollTo(0, Math.max(0, gridTop + off));
          await new Promise((r) => setTimeout(r, 20));
          const a = head.getBoundingClientRect();
          for (const t of targets) {
            const s = t.getBoundingClientRect();
            const oy = Math.min(a.bottom, s.bottom) - Math.max(a.top, s.top);
            const ox = Math.min(a.right, s.right) - Math.max(a.left, s.left);
            if (oy > 1 && ox > 1) worst = Math.max(worst, Math.round(ox * oy));
          }
        }
        return worst;
      });
      expect(worst, `the sticky heading overlaps content on ${route}`).toBe(0);
    });
  }

  test("every portrait frame is tall enough to hold a whole head", async ({ page }) => {
    await page.goto("/team");
    const frames = await page.evaluate(() =>
      [...document.querySelectorAll(".team-photo, .lead-photo")].map((f) => {
        const img = f.querySelector("img")!;
        const r = f.getBoundingClientRect();
        // object-fit: cover scales to the larger ratio, so this is how much of
        // the source's height survives the crop. The sources are 400x600; a
        // frame wider than 2/3 throws the bottom of every face away.
        const scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
        return {
          name: img.alt,
          ratio: r.width / r.height,
          visible: img.naturalHeight ? r.height / (img.naturalHeight * scale) : null,
        };
      }),
    );
    expect(frames.length).toBeGreaterThan(0);
    for (const f of frames) {
      expect(f.ratio, `${f.name}'s frame is landscape`).toBeLessThan(1);
      expect(Math.abs(f.ratio - 0.8), `${f.name}'s frame is not 4/5`).toBeLessThan(0.02);
      // Only assertable when the hot-linked headshot actually reached us.
      if (f.visible !== null)
        expect(f.visible, `${f.name} is cropped to ${(f.visible * 100).toFixed(0)}%`)
          .toBeGreaterThanOrEqual(0.83);
    }
  });
});
