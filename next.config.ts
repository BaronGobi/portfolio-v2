import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prerender every page into a static shell and cache it (Next.js 16 defaults).
  cacheComponents: true,
  partialPrefetching: true,

  env: {
    // Year printed in the footer until the browser replaces it with the live one.
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
  },

  images: {
    // Serve AVIF where supported, WebP otherwise.
    formats: ["image/avif", "image/webp"],
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
