"use client";

import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { profile, socials } from "@/content/profile";
import { navItems } from "@/content/site";
import { bandAt, toneClass, type Band } from "@/lib/band";
import { duration, ease, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { scrollToTarget, setScrollLocked } from "./SmoothScroll";
import { ThemeToggle } from "./ThemeToggle";

/** Distance from the top of the viewport at which the header samples the page. */
const PROBE_Y = 36;

/**
 * Fixed site header.
 *
 * It has no background of its own at the top of a page. As the page scrolls it
 * adopts the tone of whichever section sits behind it (every section declares
 * `data-band`), so the text stays readable over dark, light and orange bands.
 */
export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const [band, setBand] = useState<Band>("dark");
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const sample = useCallback(() => {
    setBand(bandAt(PROBE_Y));
    setScrolled(window.scrollY > 24);

    // Which section is the reader in? Only numbered sections light up the nav.
    let current: string | null = null;
    const line = window.innerHeight * 0.4;
    document.querySelectorAll<HTMLElement>("main section[id]").forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.width > 0 && rect.top <= line) current = section.id;
    });
    setActiveHash(navItems.some((item) => item.hash === current) ? current : null);
  }, []);

  useMotionValueEvent(scrollY, "change", sample);

  useEffect(() => {
    // Wait a frame so the new page's sections are in the DOM.
    const frame = requestAnimationFrame(sample);
    window.addEventListener("resize", sample);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", sample);
    };
  }, [pathname, sample]);

  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false);
    setScrollLocked(false);
    if (restoreFocus) menuButton.current?.focus();
  }, []);

  function openMenu() {
    setMenuOpen(true);
    setScrollLocked(true);
  }

  // While the menu is open: Escape closes it and the rest of the page is inert.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const outside = document.querySelectorAll<HTMLElement>("main, footer");

    document.addEventListener("keydown", onKeyDown);
    outside.forEach((element) => element.setAttribute("inert", ""));
    menuPanel.current?.querySelector<HTMLElement>("a")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      outside.forEach((element) => element.removeAttribute("inert"));
    };
  }, [menuOpen, closeMenu]);

  // On the home page, section links scroll smoothly instead of navigating.
  function handleSectionClick(event: MouseEvent<HTMLAnchorElement>, hash: string) {
    if (menuOpen) closeMenu(false);
    if (!onHome) return;
    event.preventDefault();
    scrollToTarget(hash);
  }

  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (menuOpen) closeMenu(false);
    if (!onHome) return;
    event.preventDefault();
    scrollToTarget(0);
  }

  const tone = menuOpen ? "tone-dark" : toneClass[band];

  return (
    <header
      className={cn(
        "print-hidden fixed inset-x-0 top-0 z-50 text-fg transition-colors duration-500",
        tone,
      )}
    >
      <div
        className={cn(
          "transition-[background-color,backdrop-filter] duration-500",
          scrolled && !menuOpen
            ? "bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 md:h-20">
          <Link
            href="/"
            onClick={handleLogoClick}
            aria-label={`${profile.name}, home`}
            className="group flex min-h-11 items-center gap-2.5 text-[0.95rem] font-medium tracking-tight"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-accent-solid transition-transform duration-500 ease-out group-hover:scale-150"
            />
            {profile.name}
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.hash}>
                  <Link
                    href={`/#${item.hash}`}
                    onClick={(event) => handleSectionClick(event, item.hash)}
                    aria-current={
                      onHome && activeHash === item.hash ? "location" : undefined
                    }
                    className="group flex min-h-11 items-start gap-1 pt-3 text-sm transition-colors duration-300 hover:text-accent aria-[current]:text-accent"
                  >
                    {item.label}
                    <span className="font-mono text-[0.625rem] opacity-60">
                      {item.index}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/resume"
              aria-current={pathname === "/resume" ? "page" : undefined}
              className="flex min-h-11 items-center rounded-full border border-line px-5 text-sm transition-colors duration-300 hover:border-fg hover:bg-fg hover:text-bg aria-[current]:border-fg"
            >
              Resume
            </Link>
            <ThemeToggle className="-mr-3" />
          </nav>

          <div className="-mr-3 flex items-center md:hidden">
            <ThemeToggle />
            <button
              ref={menuButton}
              type="button"
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex min-h-11 items-center gap-2.5 px-3 text-sm"
            >
              <span>{menuOpen ? "Close" : "Menu"}</span>
              <span aria-hidden="true" className="relative block h-2.5 w-5">
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-out",
                    menuOpen && "translate-y-[5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-out",
                    menuOpen && "-translate-y-[4px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <m.div
            ref={menuPanel}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{
              clipPath: "inset(0 0 0% 0)",
              transition: { duration: duration.slow, ease: ease.out },
            }}
            exit={{
              clipPath: "inset(0 0 100% 0)",
              transition: { duration: duration.base, ease: ease.inOut },
            }}
            className="band fixed inset-0 -z-10 flex h-dvh flex-col justify-between overflow-y-auto pt-24 pb-8 md:hidden"
          >
            <nav aria-label="Mobile" className="shell">
              <m.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: { staggerChildren: stagger.base, delayChildren: 0.18 },
                  },
                }}
                className="border-t border-line"
              >
                {[
                  ...navItems.map((item) => ({
                    key: item.hash,
                    href: `/#${item.hash}`,
                    label: item.label,
                    index: item.index,
                    hash: item.hash as string | null,
                  })),
                  {
                    key: "resume",
                    href: "/resume",
                    label: "Resume",
                    index: "05",
                    hash: null,
                  },
                ].map((item) => (
                  <li key={item.key} className="overflow-hidden border-b border-line">
                    <m.div
                      variants={{
                        hidden: { y: "105%" },
                        show: {
                          y: "0%",
                          transition: { duration: duration.slow, ease: ease.out },
                        },
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={(event) =>
                          item.hash
                            ? handleSectionClick(event, item.hash)
                            : closeMenu(false)
                        }
                        className="flex items-baseline justify-between py-4 text-[clamp(2.25rem,11vw,3.5rem)] leading-none font-medium tracking-[-0.04em]"
                      >
                        {item.label}
                        <span className="eyebrow text-muted">{item.index}</span>
                      </Link>
                    </m.div>
                  </li>
                ))}
              </m.ul>
            </nav>

            <m.ul
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.5, duration: duration.base },
              }}
              className="shell mt-10 flex flex-col gap-1"
            >
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-between text-sm text-muted transition-colors hover:text-fg"
                  >
                    <span className="eyebrow">{social.label}</span>
                    <span>{social.handle}</span>
                  </a>
                </li>
              ))}
            </m.ul>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
