import type { Transition, Variants } from "framer-motion";

/**
 * Motion tokens. Every animation on the site draws its easing and timing from
 * here, so the whole page moves with one rhythm.
 */

/** Cubic-bezier curves. `out` is the default for anything entering the page. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.7, 0, 0.84, 0],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** Durations in seconds. Exits use `fast`, so leaving is quicker than entering. */
export const duration = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
  slower: 1.2,
} as const;

/** Delay between siblings in a staggered group, in seconds. */
export const stagger = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

/** Spring used for cursor-following elements. */
export const followSpring = {
  stiffness: 220,
  damping: 26,
  mass: 0.6,
} as const;

export const enter: Transition = {
  duration: duration.slow,
  ease: ease.out,
};

/** Parent that staggers its children when it scrolls into view. */
export const staggerParent = (gap: number = stagger.base, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

/** Child that rises out of a clipping mask. Pair with `overflow: hidden`. */
export const maskRise: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: enter },
};

/** Child that fades up a short distance. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: enter },
};

/** Shared viewport settings: animate once, when a third of the element is visible. */
export const inViewOnce = { once: true, amount: 0.3 } as const;
