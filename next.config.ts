import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is eight content routes with no server work: the contact form
  // posts to Netlify Forms, which reads the form out of the exported HTML.
  // So this is a static export and Netlify publishes `out/` directly — no
  // @netlify/plugin-nextjs, no functions.
  output: "export",

  // A static export has no image optimizer at request time. The images are
  // pre-sized webp/jpg in public/media, and the art-directed ones are served
  // through <picture><source media> rather than next/image (which cannot
  // express art direction), so nothing here needs a loader.
  images: { unoptimized: true },

  // Emit /rcm/index.html instead of /rcm.html so the paths work on any static
  // host without rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
