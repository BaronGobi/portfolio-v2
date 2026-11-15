"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { duration, ease, fadeUp, inViewOnce, staggerParent } from "@/lib/motion";

const tags = {
  div: m.div,
  li: m.li,
  p: m.p,
  span: m.span,
  article: m.article,
  figure: m.figure,
} as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating. */
  delay?: number;
  /** Distance travelled, in pixels. */
  y?: number;
  as?: keyof typeof tags;
};

/** Fades its children up the first time they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: RevealProps) {
  const Tag = tags[as];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inViewOnce}
      transition={{ duration: duration.slow, ease: ease.out, delay }}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  /** Seconds between each child. */
  gap?: number;
  delay?: number;
  as?: "div" | "ul" | "ol" | "dl";
};

const groupTags = {
  div: m.div,
  ul: m.ul,
  ol: m.ol,
  dl: m.dl,
} as const;

/**
 * Staggers its `RevealItem` children when the group scrolls into view.
 */
export function RevealGroup({
  children,
  className,
  gap,
  delay,
  as = "div",
}: RevealGroupProps) {
  const Tag = groupTags[as];

  return (
    <Tag
      className={className}
      variants={staggerParent(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
    >
      {children}
    </Tag>
  );
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: keyof typeof tags;
};

/** One staggered child of a `RevealGroup`. */
export function RevealItem({ children, className, as = "div" }: RevealItemProps) {
  const Tag = tags[as];

  return (
    <Tag className={className} variants={fadeUp}>
      {children}
    </Tag>
  );
}
