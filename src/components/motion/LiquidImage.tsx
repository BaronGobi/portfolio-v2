"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { Liquid } from "./liquid";

type LiquidImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Same meaning as on `next/image`. */
  sizes: string;
  /**
   * Which part of the photo stays in view when the frame crops it: `[x, y]`,
   * each from 0 (left / top) to 1 (right / bottom).
   */
  focus?: readonly [number, number];
  className?: string;
};

/** Seconds the automatic stroke takes on touch screens. */
const SWEEP_SECONDS = 1.6;
/** How hard that stroke pushes at its peak, in frame heights per second. */
const SWEEP_SPEED = 0.6;

/**
 * A photo that behaves like a liquid surface: it smears behind the pointer and
 * settles again. On touch screens it follows the finger, ripples on a tap, and
 * plays one short stroke by itself when it scrolls into view, since there is
 * no hover to discover it with.
 *
 * It fills its parent, so give the parent a size. To let the pointer stir the
 * photo from a larger area (for example text laid over it), put
 * `data-liquid-area` on that ancestor.
 *
 * The plain image is always rendered and is what search engines, screen
 * readers and visitors who prefer reduced motion get. The WebGL layer is
 * loaded on demand and only shown while the surface is moving.
 */
export function LiquidImage({
  src,
  alt,
  width,
  height,
  sizes,
  focus = [0.5, 0.5],
  className,
}: LiquidImageProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [focusX, focusY] = focus;

  useEffect(() => {
    const media = root.current;
    const surface = canvas.current;
    const image = media?.querySelector("img");
    if (reduced || !media || !surface || !image) return;

    const area = media.closest<HTMLElement>("[data-liquid-area]") ?? media;

    let liquid: Liquid | null = null;
    let ready: Promise<void> | null = null;
    let disposed = false;
    let last: { x: number; y: number; time: number } | null = null;
    let pendingDrop: [number, number] | null = null;
    let sweep = 0;
    let idleHandle = 0;

    const whenLoaded = () =>
      new Promise<void>((resolve) => {
        if (image.complete && image.naturalWidth) resolve();
        else image.addEventListener("load", () => resolve(), { once: true });
      });

    const load = async () => {
      try {
        const [{ createLiquid }] = await Promise.all([import("./liquid"), whenLoaded()]);
        if (disposed) return;
        // `null` when WebGL is unavailable; the plain image then simply stays.
        liquid = createLiquid(surface, image, {
          focus: [focusX, focusY],
          onActive: (active) => {
            // Appears at once: fading in over the still photo would show a
            // double image. It fades out only after the surface has settled,
            // when both layers look the same.
            surface.style.transition = active ? "none" : "opacity 300ms ease-out";
            surface.style.opacity = active ? "1" : "0";
          },
        });
        if (liquid && pendingDrop) liquid.drop(...pendingDrop);
      } catch {
        liquid = null;
      }
      pendingDrop = null;
    };

    /** Loads the WebGL code and sets it up, once. Safe to call many times. */
    const start = () => (ready ??= load());

    /** Position inside the frame, from 0 to 1. */
    const locate = (clientX: number, clientY: number) => {
      const rect = surface.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
        height: rect.height,
      };
    };

    const track = (clientX: number, clientY: number, time: number) => {
      if (last && time > last.time && time - last.time < 120) {
        const seconds = Math.max((time - last.time) / 1000, 1 / 240);
        const point = locate(clientX, clientY);
        // Speed is measured on the screen, not inside the frame, so dragging
        // the page with a finger on the photo still stirs it.
        liquid?.stir(
          point.x,
          point.y,
          (clientX - last.x) / seconds / point.height,
          (clientY - last.y) / seconds / point.height,
        );
      }
      last = { x: clientX, y: clientY, time };
    };

    const release = () => {
      last = null;
    };

    // Mouse and pen.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      void start();
      track(event.clientX, event.clientY, event.timeStamp);
    };

    // Touch gets its own listeners: browsers cancel pointer events as soon as
    // a touch starts scrolling the page, but keep sending touch events.
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      cancelAnimationFrame(sweep);
      last = { x: touch.clientX, y: touch.clientY, time: event.timeStamp };
      const point = locate(touch.clientX, touch.clientY);
      if (liquid) liquid.drop(point.x, point.y);
      else pendingDrop = [point.x, point.y];
      void start();
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) track(touch.clientX, touch.clientY, event.timeStamp);
    };

    const passive = { passive: true } as const;
    area.addEventListener("pointermove", onPointerMove, passive);
    area.addEventListener("pointerleave", release, passive);
    area.addEventListener("touchstart", onTouchStart, passive);
    area.addEventListener("touchmove", onTouchMove, passive);
    area.addEventListener("touchend", release, passive);
    area.addEventListener("touchcancel", release, passive);

    /**
     * One slow curved stroke across the lower half of the photo, strongest in
     * the middle. It stays below the middle so it does not warp a face.
     */
    const playSweep = () => {
      if (!liquid) return;
      const began = performance.now();
      let before: { x: number; y: number } | null = null;

      const tick = (now: number) => {
        const progress = Math.min((now - began) / 1000 / SWEEP_SECONDS, 1);
        const eased = progress * progress * (3 - 2 * progress);
        const x = 0.18 + 0.64 * eased;
        const y = 0.7 - 0.1 * Math.sin(eased * Math.PI);

        if (before) {
          const rect = surface.getBoundingClientRect();
          // Direction on screen, then a fixed speed: the stroke is too slow
          // for its real speed to move the surface much.
          const dx = ((x - before.x) * rect.width) / rect.height;
          const dy = y - before.y;
          const length = Math.hypot(dx, dy);
          if (length > 0) {
            const speed = SWEEP_SPEED * Math.sin(progress * Math.PI);
            liquid?.stir(x, y, (dx / length) * speed, (dy / length) * speed);
          }
        }
        before = { x, y };
        if (progress < 1) sweep = requestAnimationFrame(tick);
      };
      sweep = requestAnimationFrame(tick);
    };

    const hoverless = !window.matchMedia("(hover: hover)").matches;

    // Get ready shortly before the photo scrolls into view, in a quiet moment,
    // so the first movement responds immediately.
    const nearby = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        nearby.disconnect();
        if ("requestIdleCallback" in window) {
          idleHandle = window.requestIdleCallback(() => void start(), { timeout: 1500 });
        } else {
          void start();
        }
      },
      { rootMargin: "25% 0px" },
    );
    nearby.observe(media);

    const inView = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        inView.disconnect();
        if (hoverless) void start().then(playSweep);
      },
      { threshold: 0.55 },
    );
    inView.observe(media);

    const resizes = new ResizeObserver(() => liquid?.resize());
    resizes.observe(surface);

    return () => {
      disposed = true;
      cancelAnimationFrame(sweep);
      if (idleHandle) window.cancelIdleCallback(idleHandle);
      nearby.disconnect();
      inView.disconnect();
      resizes.disconnect();
      area.removeEventListener("pointermove", onPointerMove);
      area.removeEventListener("pointerleave", release);
      area.removeEventListener("touchstart", onTouchStart);
      area.removeEventListener("touchmove", onTouchMove);
      area.removeEventListener("touchend", release);
      area.removeEventListener("touchcancel", release);
      liquid?.destroy();
      surface.style.transition = "none";
      surface.style.opacity = "0";
    };
  }, [reduced, focusX, focusY]);

  return (
    <div ref={root} className={cn("relative size-full", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className="size-full object-cover"
        style={{ objectPosition: `${focusX * 100}% ${focusY * 100}%` }}
      />
      {!reduced && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
      )}
    </div>
  );
}
