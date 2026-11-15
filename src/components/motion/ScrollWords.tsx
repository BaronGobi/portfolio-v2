"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";

type ScrollWordsProps = {
  text: string;
  className?: string;
};

/**
 * Paragraph whose words brighten one by one as the reader scrolls through it.
 *
 * One scroll value drives the whole paragraph: it is written to a CSS variable
 * (`--progress`) and each word works out its own opacity from that in CSS (see
 * the `scroll-word` utility in `globals.css`). That keeps a long quote cheap:
 * the words are plain text spans, not animated components.
 *
 * Unlit words stay at 60% opacity, which still passes contrast in both themes.
 * Without JavaScript, or with reduced motion, every word is fully lit.
 */
export function ScrollWords({ text, className }: ScrollWordsProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.5"],
  });

  const words = text.split(" ");

  function apply(progress: number) {
    ref.current?.style.setProperty("--progress", progress.toFixed(4));
  }

  useEffect(() => {
    apply(scrollYProgress.get());
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", apply);

  return (
    <p
      ref={ref}
      className={className}
      style={{ "--count": words.length } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span
            key={index}
            className="scroll-word"
            style={{ "--i": index } as CSSProperties}
          >
            {word}{" "}
          </span>
        ))}
      </span>
    </p>
  );
}
