/**
 * ESLint 9 flat config.
 *
 * `eslint-config-next` 16 is flat-config native: its entry points export arrays
 * that are spread directly. The FlatCompat/`extends: ["next/core-web-vitals"]`
 * shape belongs to Next 14-15 and does not apply here — see
 * node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md.
 */
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,

  {
    name: "assistpoint/static-export",
    rules: {
      // next.config.ts is `output: "export"` with `images: { unoptimized: true }`:
      // there is no optimizer to call at request time, and the art-directed
      // images are served through <picture><source media>, which next/image
      // cannot express. Plain <img> is the deliberate choice here, not an
      // oversight, so the rule only generates noise.
      "@next/next/no-img-element": "off",
    },
  },

  // globalIgnores replaces the config's own defaults rather than adding to
  // them, so the four Next ships with have to be repeated here.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Build and tooling output.
    ".netlify/**",
    "test-results/**",
    "playwright-report/**",
    "temporary screenshots/**",

    // `.kilo/worktrees/` holds a second full copy of this project; linting it
    // doubles every finding. `artefact/` is the 3.8MB decoded source artifact
    // and `assets-src/` the asset-generation scratch — none are shipped code.
    ".kilo/**",
    "artefact/**",
    "assets-src/**",
    "assistpoint-legal.html",
  ]),
]);
