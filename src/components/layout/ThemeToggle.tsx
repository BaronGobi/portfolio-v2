"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

/**
 * Switches between the dark and light themes and remembers the choice.
 *
 * The icon is swapped with CSS based on the `data-theme` attribute, so the
 * button needs no React state and never mismatches during hydration.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private mode); the theme still switches.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      title="Switch theme"
      className={cn(
        "flex size-11 items-center justify-center rounded-full transition-colors duration-300 hover:text-accent",
        className,
      )}
    >
      <Sun aria-hidden="true" className="hidden size-[1.15rem] dark:block" />
      <Moon aria-hidden="true" className="size-[1.15rem] dark:hidden" />
    </button>
  );
}
