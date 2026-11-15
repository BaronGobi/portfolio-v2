"use client";

import { useHydrated } from "@/lib/hooks";

/** Year the site was last built. Used until the browser takes over. */
const BUILD_YEAR = process.env.NEXT_PUBLIC_BUILD_YEAR ?? "2026";

/**
 * Current year for the copyright line.
 *
 * The page is prerendered, so the server prints the build year and the browser
 * swaps in the real year once it is running. The line stays correct on New
 * Year's Day without a redeploy.
 */
export function CopyrightYear() {
  const hydrated = useHydrated();

  return <span>{hydrated ? new Date().getFullYear() : BUILD_YEAR}</span>;
}
