/**
 * Lift the artifact's content arrays out of the decoded `dc-script.ts` and emit
 * them as a typed module.
 *
 * The copy must survive character-for-character — em-dashes, curly apostrophes,
 * the Unicode glyph icons. Retyping it by hand is how those get silently
 * normalised, so the arrays are *evaluated* from the original source instead.
 *
 * Only pure data literals are extracted. Anything referencing `this` (the
 * derived style maps: hover colours, shadows, active states) is deliberately
 * left behind — that logic is reimplemented in the components.
 *
 *   node scripts/extract-content.mjs <path-to-dc-script.ts>
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(process.argv[2], "utf8");

/* `window.__resources` is absent in this build, so every lookup of the form
   `(window.__resources||{}).x || '<url>'` resolves to its fallback URL. Keep
   that behaviour: the fallbacks are what the artifact actually renders. */
const sandboxWindow = { __resources: {} };

/**
 * Pull a self-contained literal bound to `name`. The artifact declares these
 * two ways: as `const pillars = [...]` and as an object property
 * `pillars: [...]` on the returned view-model. Several are immediately
 * followed by `.map(...)` that applies the hover/active styling — the bracket
 * walk stops at the literal, which is exactly the data we want.
 */
function grab(name) {
  let head = `const ${name} = `;
  let start = src.indexOf(head);
  if (start === -1) {
    head = `${name}: `;
    start = src.indexOf(head);
  }
  if (start === -1) throw new Error(`not found: ${name}`);
  let i = start + head.length;
  const open = src[i];
  const close = open === "[" ? "]" : "}";
  if (open !== "[" && open !== "{") throw new Error(`${name} is not a literal`);

  // Walk to the matching bracket, skipping over string contents so that a
  // bracket inside copy (there are several) does not end the scan early.
  let depth = 0,
    quote = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") quote = c;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  const literal = src.slice(start + head.length, i + 1);
  return new Function("window", `"use strict"; return (${literal});`)(sandboxWindow);
}

const NAMES = [
  "navDefs", "topMeta", "svcDefs", "careDefs", "flowDefs", "rcmDefs", "rcmChips",
  "chain", "team", "cmp", "programs", "pillars", "difference", "serveTiles",
  "rcmCards", "specialties", "infusionFeatures", "infusionFlow", "careSteps",
  "forPatients", "forPractices", "hospitalCards", "hospitalFeatures", "opsCards",
  "orgs", "careChainLabels",
];

const out = {};
const missing = [];
for (const n of NAMES) {
  try {
    out[n] = grab(n);
  } catch {
    missing.push(n);
  }
}

// `careChain` is built inline from its label list; recover the labels only.
if (!out.careChainLabels) {
  const m = src.match(/const careChain = (\[[^\]]*\])\.map/);
  if (m) out.careChainLabels = new Function(`return (${m[1]});`)();
}
delete out.careChainLabels_missing;

console.log("extracted:", Object.keys(out).length, "arrays");
for (const [k, v] of Object.entries(out)) {
  console.log(`  ${k}: ${Array.isArray(v) ? v.length + " items" : "object"}`);
}
if (missing.length) console.log("NOT FOUND (handled separately):", missing.join(", "));

writeFileSync(
  process.argv[3] ?? "content/_extracted.json",
  JSON.stringify(out, null, 2) + "\n",
  "utf8",
);
console.log("written:", process.argv[3]);
