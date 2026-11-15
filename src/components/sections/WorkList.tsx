"use client";

import { AnimatePresence, m, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";
import { duration, ease, followSpring } from "@/lib/motion";
import { cn, padIndex } from "@/lib/utils";

/** The few project fields the list displays. */
export type WorkListItem = {
  slug: string;
  title: string;
  kind: string;
  /** Path of the preview image. */
  image: string;
};

type WorkListProps = {
  items: WorkListItem[];
};

/**
 * Project list.
 *
 * With a mouse: rows are text only, and a preview image follows the cursor
 * over the hovered row. On touch screens and narrow layouts each row shows its
 * image inline instead, because there is no hover.
 */
export function WorkList({ items }: WorkListProps) {
  const list = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();

  const x = useSpring(useMotionValue(0), followSpring);
  const y = useSpring(useMotionValue(0), followSpring);

  function moveTo(clientX: number, clientY: number, immediate = false) {
    const bounds = list.current?.getBoundingClientRect();
    if (!bounds) return;
    const nextX = clientX - bounds.left;
    const nextY = clientY - bounds.top;
    if (immediate || reduced) {
      x.jump(nextX);
      y.jump(nextY);
    } else {
      x.set(nextX);
      y.set(nextY);
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!finePointer) return;
    moveTo(event.clientX, event.clientY, active === null);
  }

  // Keyboard users get the same preview, parked at the right of the focused row.
  function handleFocus(event: FocusEvent<HTMLAnchorElement>, index: number) {
    if (!finePointer) return;
    const row = event.currentTarget.getBoundingClientRect();
    moveTo(row.right - row.width * 0.24, row.top + row.height / 2, true);
    setActive(index);
  }

  const preview = active !== null ? items[active] : null;

  return (
    <div className="shell mt-10 md:mt-16">
      <div
        ref={list}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActive(null)}
        className="relative"
      >
        <ul className="border-t border-line">
          {items.map((project, index) => (
            <li key={project.slug} className="border-b border-line">
              <Reveal delay={index * 0.06}>
                <Link
                  href={`/work/${project.slug}`}
                  onPointerEnter={() => finePointer && setActive(index)}
                  onFocus={(event) => handleFocus(event, index)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    "group grid gap-x-8 gap-y-5 py-8 transition-opacity duration-500 md:grid-cols-12 md:items-baseline md:py-10",
                    active !== null && active !== index && "md:opacity-35",
                  )}
                >
                  {/* Inline image: touch screens and narrow layouts only. */}
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-raised md:col-span-12 [@media(hover:hover)_and_(pointer:fine)]:md:hidden">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 90vw, 100vw"
                      className="object-cover object-top"
                    />
                  </span>

                  <span className="eyebrow text-muted md:col-span-1">
                    {padIndex(index)}
                  </span>

                  <span className="md:col-span-7">
                    <span className="block text-[clamp(1.75rem,3.9vw,4rem)] leading-[1.02] font-medium tracking-[-0.04em] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:translate-x-4 md:group-focus-visible:translate-x-4">
                      {project.title}
                    </span>
                  </span>

                  <span className="eyebrow text-muted md:col-span-3">{project.kind}</span>

                  <span className="hidden justify-end md:col-span-1 md:flex">
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-7 transition-transform duration-500 ease-out group-hover:rotate-45"
                    />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Cursor-following preview. Decorative: the rows are the real links. */}
        <m.div
          aria-hidden="true"
          style={{ x, y }}
          className="pointer-events-none absolute top-0 left-0 z-10 hidden md:block"
        >
          <AnimatePresence>
            {preview && (
              <m.div
                key="frame"
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
                className="absolute top-0 left-0 aspect-[4/3] w-[min(30vw,26rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-raised shadow-2xl shadow-black/30"
              >
                <AnimatePresence initial={false}>
                  <m.div
                    key={preview.slug}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: { duration: duration.base, ease: ease.out },
                    }}
                    exit={{ opacity: 0, transition: { duration: duration.base } }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={preview.image}
                      alt=""
                      fill
                      sizes="30vw"
                      className="object-cover object-top"
                    />
                  </m.div>
                </AnimatePresence>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </div>
    </div>
  );
}
