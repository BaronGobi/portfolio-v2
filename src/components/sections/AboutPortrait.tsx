"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { LiquidImage } from "@/components/motion/LiquidImage";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { profile } from "@/content/profile";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { duration, ease, maskRise, staggerParent } from "@/lib/motion";

const { portrait } = profile;

/**
 * The large photo panel of the About section: the portrait fills the frame,
 * short notes and an oversized wordmark sit on top of it, and the photo itself
 * behaves like a liquid under the pointer (see `LiquidImage`).
 *
 * The panel is always dark, whatever the theme, because its text sits on a
 * photo. `data-band` tells the floating header to switch to light text while
 * the panel is behind it. Its height leaves room for that header, so the
 * whole panel can be on screen at once.
 */
export function AboutPortrait() {
  const frame = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  // 0 when the panel's top edge enters the screen, 1 when its bottom edge leaves.
  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start end", "end start"],
  });
  // The photo slowly pulls back and drifts while the panel travels up the screen.
  const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1.06]);
  const drift = useTransform(scrollYProgress, [0, 1], ["-2.5%", "2.5%"]);
  const wordDrift = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);

  return (
    <m.figure
      ref={frame}
      data-band="dark"
      data-liquid-area=""
      className="tone-dark @container relative isolate flex h-[min(100svh_-_6.5rem,42rem)] min-h-[30rem] flex-col justify-between overflow-hidden rounded-[1.25rem] bg-raised p-5 text-fg md:h-[min(100svh_-_7.5rem,62rem)] md:p-8"
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: duration.slower, ease: ease.out }}
    >
      <m.div
        className="absolute inset-0 -z-20 will-change-transform"
        style={reduced ? undefined : { scale, y: drift }}
      >
        <LiquidImage
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width}
          height={portrait.height}
          focus={portrait.focus}
          // The photo is square and covers the frame, so on phones (a tall
          // frame) it is drawn as wide as the frame is high.
          sizes="(min-width: 112rem) 1700px, (min-width: 48rem) 94vw, 165vw"
        />
      </m.div>

      {/* Shading that keeps the text readable over a busy photo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(10_10_10/0.72)_0%,rgb(10_10_10/0.12)_38%,rgb(10_10_10/0.18)_52%,rgb(10_10_10/0.86)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgb(10_10_10/0.6)_0%,rgb(10_10_10/0)_42%)] md:block"
      />

      <RevealGroup
        className="flex max-w-[20rem] flex-col items-start gap-5 md:gap-7"
        gap={0.1}
      >
        <RevealItem
          as="p"
          className="text-[clamp(1.0625rem,1.35vw,1.375rem)] leading-[1.3] font-medium tracking-[-0.015em]"
        >
          {portrait.lead} <span className="text-fg/65">{portrait.trail}</span>
        </RevealItem>

        <RevealItem className="w-full max-w-[16.5rem]">
          <Link
            href="/resume"
            className="group flex flex-col gap-2.5 py-2 text-[clamp(1.0625rem,1.35vw,1.375rem)] leading-[1.3] font-medium tracking-[-0.015em]"
          >
            <span className="flex items-center justify-between gap-6">
              <span>Read the full resume</span>
              <ArrowRight
                aria-hidden="true"
                className="size-4.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
              />
            </span>
            {/* Underline that wipes away and draws itself again on hover. */}
            <span
              aria-hidden="true"
              className="relative block h-px w-full overflow-hidden"
            >
              <span className="absolute inset-0 origin-right bg-current transition-transform duration-500 ease-out-expo group-hover:scale-x-0 group-focus-visible:scale-x-0" />
              <span className="absolute inset-0 origin-left scale-x-0 bg-current transition-transform delay-200 duration-500 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            </span>
          </Link>
        </RevealItem>
      </RevealGroup>

      <div className="flex flex-col gap-5 md:gap-7">
        <RevealGroup
          as="ul"
          className="flex flex-col gap-1 text-[clamp(1.0625rem,1.35vw,1.375rem)] leading-[1.3] font-medium tracking-[-0.015em] md:pl-[17.5%]"
          gap={0.08}
          delay={0.15}
        >
          {portrait.focusAreas.map((area, index) => (
            <RevealItem as="li" key={area}>
              {index === 0 && (
                <span aria-hidden="true" className="text-fg/65">
                  01/{" "}
                </span>
              )}
              {area}
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
          {/* The photo's caption. On phones it sits under the wordmark. */}
          <figcaption className="order-2 text-[clamp(1.0625rem,1.35vw,1.375rem)] leading-[1.3] font-medium tracking-[-0.015em] md:order-1 md:pb-[0.35em]">
            {profile.location}
          </figcaption>

          {/* Decorative: the name is already announced by the page heading. */}
          <m.p
            aria-hidden="true"
            className="order-1 -mb-[0.04em] flex text-[28cqw] leading-[0.76] font-black tracking-[-0.045em] uppercase select-none md:order-2 md:text-[19.5cqw]"
            style={reduced ? undefined : { y: wordDrift }}
            variants={staggerParent(0.07, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
          >
            {Array.from(portrait.wordmark).map((letter, index) => (
              <span key={index} className="block overflow-hidden">
                <m.span className="block" variants={maskRise}>
                  {letter}
                </m.span>
              </span>
            ))}
          </m.p>
        </div>
      </div>
    </m.figure>
  );
}
