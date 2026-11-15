"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { duration, ease } from "@/lib/motion";
import { formatNumber } from "@/lib/utils";

type CounterProps = {
  value: number;
  decimals?: number;
  className?: string;
};

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * The final number is what gets server-rendered, so it is correct without
 * JavaScript and for visitors who prefer reduced motion.
 */
export function Counter({ value, decimals = 0, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduced) return;

    const controls = animate(0, value, {
      duration: duration.slower * 1.4,
      ease: ease.out,
      onUpdate: (latest) => {
        node.textContent = formatNumber(latest, decimals);
      },
    });

    return () => {
      controls.stop();
      node.textContent = formatNumber(value, decimals);
    };
  }, [inView, reduced, value, decimals]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(value, decimals)}
    </span>
  );
}
