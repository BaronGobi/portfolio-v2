/** Key used in localStorage to remember the chosen theme. */
export const THEME_STORAGE_KEY = "theme";

/**
 * Inline script for the document `<head>`.
 *
 * It runs before the first paint and sets `data-theme` on `<html>` from the
 * saved choice, falling back to the system preference, so the page never
 * flashes the wrong theme.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
