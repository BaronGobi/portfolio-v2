"use client";

import type Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Inertial "smooth" scrolling for the whole page (Lenis).
 *
 * Lenis still scrolls the real document, so native behaviour (keyboard,
 * find-in-page, anchor links, framer-motion scroll hooks) keeps working.
 *
 * The library is fetched and started only after the page has loaded and the
 * browser is idle: nobody needs smooth scrolling before they scroll, and this
 * keeps it out of the way of the first paint. It is never started for
 * visitors who prefer reduced motion.
 */

/** The running instance, shared with the helpers below. `null` until started. */
let lenis: Lenis | null = null;

export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    let cancelIdle = () => {};

    const start = async () => {
      const { default: LenisClass } = await import("lenis");
      if (cancelled) return;
      lenis = new LenisClass({ lerp: 0.11, autoRaf: true });
    };

    const whenIdle = () => {
      // Safari has no requestIdleCallback; a short timer is close enough.
      if (typeof window.requestIdleCallback === "function") {
        const handle = window.requestIdleCallback(() => void start(), { timeout: 2000 });
        cancelIdle = () => window.cancelIdleCallback(handle);
      } else {
        const handle = window.setTimeout(() => void start(), 300);
        cancelIdle = () => window.clearTimeout(handle);
      }
    };

    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });

    return () => {
      cancelled = true;
      cancelIdle();
      window.removeEventListener("load", whenIdle);
      lenis?.destroy();
      lenis = null;
    };
  }, [reduced]);

  return null;
}

/**
 * Scroll to an element id, or to the top of the page with `0`.
 * Animated when Lenis is running; an instant jump otherwise.
 */
export function scrollToTarget(target: string | 0) {
  const element = target === 0 ? null : document.getElementById(target.replace(/^#/, ""));

  if (target !== 0 && !element) return;

  if (lenis) {
    lenis.scrollTo(element ?? 0, { duration: 1.2 });
  } else if (element) {
    element.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }

  // Move keyboard focus with the scroll, so the next Tab starts from there.
  if (element) {
    if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
  }
}

/** Freeze or release page scrolling, e.g. while a full-screen menu is open. */
export function setScrollLocked(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) lenis?.stop();
  else lenis?.start();
}
