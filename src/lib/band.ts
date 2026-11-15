/**
 * "Bands" are the full-width colored sections of a page. Each one declares its
 * tone with a `data-band` attribute. Floating UI (the header, the back-to-top
 * button) reads the band behind it and adopts a matching tone, so it stays
 * readable over dark, light and orange sections.
 */

export type Band = "base" | "invert" | "dark" | "accent";

/** CSS class that applies each band's palette. See `globals.css`. */
export const toneClass: Record<Band, string> = {
  base: "",
  invert: "tone-invert",
  dark: "tone-dark",
  accent: "tone-accent",
};

/**
 * Which band is on screen at `y` pixels from the top of the viewport?
 * The last match in document order wins, because later sections paint over
 * earlier ones (the fixed hero sits under everything else).
 */
export function bandAt(y: number): Band {
  let current: Band = "base";

  document.querySelectorAll<HTMLElement>("[data-band]").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top <= y && rect.bottom > y) {
      current = (element.dataset.band as Band | undefined) ?? "base";
    }
  });

  return current;
}
