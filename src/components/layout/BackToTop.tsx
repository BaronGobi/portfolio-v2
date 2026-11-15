"use client";

import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { bandAt, toneClass, type Band } from "@/lib/band";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { scrollToTarget } from "./SmoothScroll";

/**
 * Floating "back to top" button. Appears after the first screen of scrolling.
 *
 * It takes the tone of the section behind it and paints itself in that
 * section's text color, so it always contrasts with the background.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [band, setBand] = useState<Band>("base");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > window.innerHeight);
    setBand(bandAt(window.innerHeight - 44));
  });

  return (
    <AnimatePresence>
      {visible && (
        <m.button
          type="button"
          onClick={() => scrollToTarget(0)}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: duration.base, ease: ease.out },
          }}
          exit={{
            opacity: 0,
            scale: 0.6,
            transition: { duration: duration.fast, ease: ease.in },
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={cn(
            "print-hidden fixed right-5 bottom-5 z-40 flex size-12 items-center justify-center rounded-full bg-fg text-bg transition-colors duration-500 sm:right-8 sm:bottom-8",
            toneClass[band],
          )}
        >
          <ArrowUp aria-hidden="true" className="size-5" />
        </m.button>
      )}
    </AnimatePresence>
  );
}
