import { defineConfig, devices } from "@playwright/test";

/* Tests run against the real static export — the thing that actually ships —
   not the dev server. */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4321", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1100 } } },
    // iPhone 13's descriptor selects WebKit, and this host is missing the
    // WebKit system libraries. Keep the phone's viewport, DPR, UA and touch
    // behaviour but drive them with Chromium.
    // NOTE: that means real Safari is NOT covered here, and Safari is exactly
    // where <source media> mis-selection bites. Check a device before launch.
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
  webServer: {
    // No -s. That is SPA-fallback mode: it serves index.html for every path,
    // which makes all eight routes answer with the home page and produces a
    // wall of failures that look like app bugs.
    command: "npx serve out -l 4321",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
