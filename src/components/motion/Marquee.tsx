"use client";

import {
  m,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
  type MotionValue,
} from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  /** One full set of items. It is rendered twice to make the loop seamless. */
  children: ReactNode;
  /** Percent of the track travelled per second at rest. */
  speed?: number;
  className?: string;
  /** Name of the content for the pause button, e.g. "tech stack". */
  label: string;
};

/**
 * Endless horizontal ticker. It drifts on its own and speeds up with the page
 * scroll. It stops when off screen, when the pause button is pressed, and when
 * the visitor prefers reduced motion.
 */
export function Marquee({ children, speed = 2.2, className, label }: MarqueeProps) {
  const container = useRef<HTMLDivElement>(null);
  const inView = useInView(container, { margin: "100px 0px" });
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  const offset = useMotionValue(0);
  // Two copies sit side by side, so wrapping between -50% and 0 loops forever.
  const x = useTransform(offset, (value) => `${wrap(-50, 0, value)}%`);

  const running = inView && !paused && !reduced;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={container}
        aria-hidden="true"
        className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      >
        <m.div style={{ x }} className="flex w-max will-change-transform">
          <div className="flex shrink-0">{children}</div>
          <div className="flex shrink-0">{children}</div>
        </m.div>
      </div>

      {/* The frame loop exists only while the ticker should be moving. */}
      {running && <Ticker offset={offset} speed={speed} />}

      {!reduced && (
        <div className="shell mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            className="inline-flex min-h-11 items-center gap-2 eyebrow text-muted transition-colors duration-300 hover:text-fg"
          >
            {paused ? (
              <Play aria-hidden="true" className="size-3.5" />
            ) : (
              <Pause aria-hidden="true" className="size-3.5" />
            )}
            {paused ? `Play ${label} ticker` : `Pause ${label} ticker`}
          </button>
        </div>
      )}
    </div>
  );
}

type TickerProps = {
  offset: MotionValue<number>;
  speed: number;
};

/** Advances the marquee every frame, faster while the page is scrolling. */
function Ticker({ offset, speed }: TickerProps) {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smoothVelocity, [-2400, 0, 2400], [5, 0, 5]);

  useAnimationFrame((_, delta) => {
    // Ignore the long first frame after the ticker resumes.
    const seconds = Math.min(delta, 100) / 1000;
    offset.set(offset.get() - speed * (1 + boost.get()) * seconds);
  });

  return null;
}
