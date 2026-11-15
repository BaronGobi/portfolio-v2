import type { Position, YearMonth } from "@/content/types";

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "2022-03" -> "Mar 2022". Uses a fixed table so server and browser agree. */
export function formatMonth(value: YearMonth): string {
  const [year, month] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** "Mar 2022 – Feb 2024", or "Apr 2024 – Present" for a current role. */
export function formatRange(start: YearMonth, end: YearMonth | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

/** Date range covering every position held at one company. */
export function positionsRange(positions: Position[]): string {
  const first = positions[positions.length - 1];
  const last = positions[0];
  return formatRange(first.start, last.end);
}

/** Format a number with thousands separators and fixed decimals. */
export function formatNumber(value: number, decimals = 0): string {
  const fixed = value.toFixed(decimals);
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${grouped}.${fraction}` : grouped;
}

/** Zero-padded index for numbered lists: 0 -> "01". */
export function padIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** True for links that leave the site. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
