"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** How far the content drifts, in percent of its own height. */
  amount?: number;
};

/**
 * Moves its children slower than the page scroll. Wrap it in an
 * `overflow-hidden` frame and the content appears to sit behind a window.
 * Disabled when the visitor prefers reduced motion.
 */
export function Parallax({ children, className, amount = 8 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    <div ref={ref} className={className}>
      <m.div
        style={{ y: reduced ? 0 : y, scale: 1 + (amount * 2) / 100 }}
        className="size-full will-change-transform"
      >
        {children}
      </m.div>
    </div>
  );
}
