"use client";

import { m } from "framer-motion";
import { inViewOnce, maskRise, stagger, staggerParent } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  /** The text to animate. Use "\n" to force a line break. */
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Optional id, e.g. so a section can point `aria-labelledby` at it. */
  id?: string;
  delay?: number;
  /** Seconds between words. */
  gap?: number;
};

/**
 * Heading whose words rise out of a mask, one after another, when it scrolls
 * into view.
 *
 * Screen readers get the plain sentence; the animated word spans are hidden
 * from them so the text is never read out in fragments.
 */
export function TextReveal({
  text,
  as = "h2",
  className,
  id,
  delay = 0,
  gap = stagger.tight,
}: TextRevealProps) {
  const Tag = m[as];
  const lines = text.split("\n");

  return (
    <Tag
      id={id}
      className={className}
      variants={staggerParent(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
    >
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className={cn(lines.length > 1 && "block")}>
            {line.split(" ").map((word, wordIndex) => (
              // The extra padding keeps descenders from being clipped by the mask.
              <span
                key={wordIndex}
                className="-mt-[0.06em] -mb-[0.14em] inline-block overflow-hidden pt-[0.06em] pb-[0.14em] align-bottom"
              >
                <m.span className="inline-block" variants={maskRise}>
                  {word}
                  {wordIndex < line.split(" ").length - 1 ? " " : ""}
                </m.span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
