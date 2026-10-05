import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/rcm", "/care", "/ops", "/hospital", "/serve", "/team", "/contact"];

/* The artifact had one dynamic aria attribute on the whole site and no
   keyboard handling at all, so this is a floor being established, not
   a regression guard. */
for (const route of ROUTES) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForTimeout(1200);

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
