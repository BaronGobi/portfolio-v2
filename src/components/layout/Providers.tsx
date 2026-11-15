"use client";

import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { SmoothScroll } from "./SmoothScroll";

/**
 * Client-side wrappers shared by every page.
 *
 * - `LazyMotion` loads only the framer-motion features this site uses
 *   (animations, in-view, hover and tap), not drag or layout animation.
 *   Because of that, components must use `m.div`, not `motion.div`; `strict`
 *   makes a stray `motion.*` throw instead of silently loading everything.
 * - `reducedMotion="user"` makes framer-motion skip movement (but keep fades)
 *   for visitors who ask their system for less motion.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <SmoothScroll />
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
