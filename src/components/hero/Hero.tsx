"use client";

import { m, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowDown, ArrowUpRight, Rotate3d } from "lucide-react";
import { SectionLink } from "@/components/ui/SectionLink";
import { profile } from "@/content/profile";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { duration } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { HeroFallback } from "./HeroFallback";
import { useTilt } from "./tilt";

// three.js is large, so the scene is its own chunk, fetched only in the
// browser and only after this component has hydrated.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

let webglSupport: boolean | null = null;

/**
 * Should this device get the live 3D scene?
 *
 * No for data-saver mode, for devices that report very little memory, and when
 * WebGL 2 is missing or software-rendered (virtual machines, remote desktops,
 * blocked GPU drivers), where the scene would run at a few frames per second.
 *
 * Phones are not excluded up front: they get a lighter version of the scene
 * (see `lite` in `HeroScene.tsx`). Any device that still renders it slowly is
 * caught by the frame-rate guard inside the scene and falls back to the
 * static artwork.
 *
 * Add `?3d=force` to the URL to skip these checks while debugging.
 */
function canRender3D(): boolean {
  if (webglSupport !== null) return webglSupport;

  try {
    if (new URLSearchParams(window.location.search).get("3d") === "force") {
      webglSupport = true;
      return webglSupport;
    }

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    // `deviceMemory` is only reported by Chromium browsers, in GB.
    const veryLowMemory = (nav.deviceMemory ?? 8) <= 2;

    if (nav.connection?.saveData || veryLowMemory) {
      webglSupport = false;
    } else {
      // `failIfMajorPerformanceCaveat` makes the browser refuse a context it
      // could only provide with a slow software renderer.
      const context = document
        .createElement("canvas")
        .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
      const info = context?.getExtension("WEBGL_debug_renderer_info");
      const renderer = info
        ? String(context?.getParameter(info.UNMASKED_RENDERER_WEBGL))
        : "";

      webglSupport = context !== null && !/swiftshader|llvmpipe|software/i.test(renderer);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webglSupport = false;
  }

  return webglSupport;
}

/**
 * True once the page has finished loading and the browser has a quiet moment.
 * The 3D scene waits for this, so it never competes with first paint or
 * hydration.
 */
function usePageIdle(): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let cancel = () => {};

    const whenIdle = () => {
      // Safari has no requestIdleCallback; a short timer is close enough.
      if (typeof window.requestIdleCallback === "function") {
        const handle = window.requestIdleCallback(() => setIdle(true), { timeout: 1500 });
        cancel = () => window.cancelIdleCallback(handle);
      } else {
        const handle = window.setTimeout(() => setIdle(true), 300);
        cancel = () => window.clearTimeout(handle);
      }
    };

    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });

    return () => {
      window.removeEventListener("load", whenIdle);
      cancel();
    };
  }, []);

  return idle;
}

/** If the 3D scene throws, keep the CSS artwork instead of breaking the page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** CSS custom property that staggers the entrance animations. */
function delay(ms: number): CSSProperties {
  return { "--hero-delay": `${ms}ms` } as CSSProperties;
}

/**
 * Full-screen opening of the home page.
 *
 * The hero is fixed to the viewport and the rest of the page slides up over
 * it. An empty "track" element of the same height stays in the normal flow;
 * scrolling through it drives the scroll-linked effects.
 */
export function Hero() {
  const track = useRef<HTMLDivElement>(null);
  const pageIdle = usePageIdle();
  const reduced = usePrefersReducedMotion();
  // Phone-sized screens get the lighter version of the scene.
  const smallScreen = useMediaQuery("(max-width: 599px), (max-height: 599px)");

  const [covered, setCovered] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneTooSlow, setSceneTooSlow] = useState(false);

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setCovered(latest >= 0.995);
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const veilOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  const show3D = pageIdle && !reduced && !sceneTooSlow && canRender3D();
  const sceneVisible = show3D && sceneReady;

  // Phones can turn the scene by tilting. Android allows it straight away;
  // iPhones need a tap on "Turn on tilt" and the system prompt that follows.
  const hoverless = useMediaQuery("(hover: none)");
  const tilt = useTilt(hoverless && show3D);
  const offerTilt = sceneVisible && tilt.offer;

  return (
    <>
      {/* Scroll track. It also carries the page's real <h1> and tells the
          header that the page starts on a dark band. */}
      <div ref={track} data-band="dark" className="h-svh print:h-auto">
        <h1 className="sr-only print:not-sr-only">
          {profile.name}, {profile.role}
        </h1>
      </div>

      <section
        aria-label="Introduction"
        // Once the page has scrolled over the hero, take it out of the tab
        // order and stop painting it.
        inert={covered}
        // Taps and touches here play with the 3D scene (see `sceneInput.ts`).
        data-hero-area=""
        className={cn(
          "band tone-dark print-hidden fixed inset-0 z-0 h-svh overflow-hidden",
          covered && "invisible",
        )}
      >
        <div aria-hidden="true" className="absolute inset-0">
          <HeroFallback className={sceneVisible ? "opacity-0" : "opacity-100"} />
          {show3D && (
            <SceneBoundary>
              <m.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: sceneVisible ? 1 : 0 }}
                transition={{ duration: duration.slower, ease: "easeOut" }}
              >
                <HeroScene
                  progress={scrollYProgress}
                  lite={smallScreen}
                  tilt={tilt.on}
                  active={!covered}
                  onReady={() => setSceneReady(true)}
                  onGiveUp={() => setSceneTooSlow(true)}
                />
              </m.div>
            </SceneBoundary>
          )}
        </div>

        {/* Soft shade behind the text so it stays readable over the artwork. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent"
        />

        <m.div
          style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
          className="relative shell flex h-full flex-col justify-end pt-24 pb-5 md:pb-7"
        >
          {/* Text sits on the left; the right side is left clear for the 3D scene. */}
          <div className="max-w-xl">
            {/* The column is anchored to the bottom, so this grows upward and
                moves nothing below it. On short screens (small phones, and
                any phone held sideways) there is no room for it above the
                text, so it is left out there. */}
            {offerTilt && (
              <m.button
                type="button"
                onClick={tilt.turnOn}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.base, ease: "easeOut" }}
                className="mb-6 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-white/5 px-4 text-sm font-medium backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-black [@media(max-height:619px)]:hidden"
              >
                <Rotate3d aria-hidden="true" className="size-4" />
                Turn on tilt
              </m.button>
            )}
            <p
              className="flex hero-fade flex-wrap items-center gap-x-3 gap-y-1 eyebrow text-muted"
              style={delay(450)}
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-accent-solid"
              />
              <span>{profile.role}</span>
              <span aria-hidden="true">/</span>
              <span>{profile.location}</span>
            </p>
            <p
              className="mt-4 max-w-[24ch] hero-fade text-lead font-medium md:mt-5"
              style={delay(560)}
            >
              {profile.tagline}
            </p>

            <div
              className="mt-6 flex hero-fade flex-wrap gap-3 md:mt-8"
              style={delay(680)}
            >
              <SectionLink
                hash="work"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-accent-solid px-6 text-sm font-medium text-on-accent transition-colors duration-300 hover:bg-white"
              >
                View my work
                <ArrowDown
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5"
                />
              </SectionLink>
              <SectionLink
                hash="contact"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-line px-6 text-sm font-medium transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
              >
                Let&apos;s chat
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </SectionLink>
            </div>
          </div>

          {/* The name, as large as the screen allows. Decorative: the real
              heading for assistive tech lives in the scroll track below. */}
          <p
            aria-hidden="true"
            className="mt-6 -ml-[0.04em] text-[25.5vw] leading-[0.8] font-medium tracking-[-0.06em] select-none md:mt-8 md:text-[min(17.4vw,20rem)] md:whitespace-nowrap"
          >
            <span className="-mx-[0.05em] inline-block overflow-hidden px-[0.05em] pt-[0.12em] pb-[0.06em] align-bottom max-md:block">
              <span className="inline-block hero-rise" style={delay(120)}>
                {profile.firstName}
              </span>
            </span>{" "}
            <span className="-mx-[0.05em] inline-block overflow-hidden px-[0.05em] pt-[0.12em] pb-[0.06em] align-bottom max-md:-mt-[0.1em] max-md:block">
              <span className="inline-block hero-rise" style={delay(220)}>
                {profile.lastName}
              </span>
            </span>
          </p>

          <div
            className="mt-4 flex hero-fade items-center justify-between border-t border-line pt-4 eyebrow text-muted"
            style={delay(900)}
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="relative block h-7 w-px overflow-hidden"
              >
                <span className="absolute inset-0 scroll-cue bg-current" />
              </span>
              Scroll to explore
            </span>
            <span>Call me {profile.nickname}</span>
          </div>
        </m.div>

        {/* Dims the hero as the next section slides over it. */}
        <m.div
          aria-hidden="true"
          style={{ opacity: veilOpacity }}
          className="pointer-events-none absolute inset-0 bg-black"
        />
      </section>
    </>
  );
}
