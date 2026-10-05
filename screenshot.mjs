import { chromium } from 'playwright';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const url = process.argv[2];
const label = process.argv[3];
if (!url) {
  console.error('usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}
if (url.startsWith('file://')) {
  console.error('refusing a file:// url — serve the site on localhost first');
  process.exit(1);
}

const outDir = path.join(process.cwd(), 'temporary screenshots');
await mkdir(outDir, { recursive: true });

const existing = await readdir(outDir);
const next = existing
  .map((f) => Number(/^screenshot-(\d+)/.exec(f)?.[1]))
  .filter((n) => Number.isFinite(n))
  .reduce((max, n) => Math.max(max, n), 0) + 1;

const name = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const file = path.join(outDir, name);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(600);
await page.screenshot({ path: file, fullPage: true });
await browser.close();

console.log(file);
