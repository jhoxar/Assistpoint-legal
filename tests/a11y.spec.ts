import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/rcm", "/care", "/ops", "/hospital", "/serve", "/team", "/contact"];

/**
 * Audit with reduced motion on.
 *
 * Not to dodge the problem — it makes the scan deterministic. The hero fades
 * its copy in over 1s per cue and then crossfades the whole section to dark
 * over 1.8s. Scanning mid-transition makes axe composite the partial opacity
 * and invent contrast failures that no one ever sees: #0877d1 at ~60% over
 * #f7fbff reads as #5ea7e2 (2.49:1). Under reduced motion the app jumps
 * straight to its settled end state, which is the state worth auditing, and
 * it is also a state real users browse in.
 */
test.use({ reducedMotion: "reduce" });

/* The artifact had one dynamic aria attribute on the whole site and no
   keyboard handling at all, so this is a floor being established, not
   a regression guard. */
for (const route of ROUTES) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForTimeout(1500);

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const bad = violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    const report = bad
      .map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}\n    ${v.nodes[0]?.html?.slice(0, 160)}`)
      .join("\n  ");
    expect(bad, `\n  ${report}`).toEqual([]);
  });
}
