"use client";

import { m, useMotionValue, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";
import { followSpring } from "@/lib/motion";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** 0 to 1: how strongly the element is pulled toward the cursor. */
  strength?: number;
};

/**
 * Pulls its child a little toward the cursor while hovered. Used sparingly, on
 * one or two focal actions per screen. Does nothing on touch devices or with
 * reduced motion.
 */
export function Magnetic({ children, className, strength = 0.28 }: MagneticProps) {
  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const x = useSpring(useMotionValue(0), followSpring);
  const y = useSpring(useMotionValue(0), followSpring);

  const enabled = finePointer && !reduced;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.div
      className={className}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </m.div>
  );
}
