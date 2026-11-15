import { ArrowDownToLine, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn, isExternal } from "@/lib/utils";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  /** `solid` is the filled primary action; `outline` is the secondary one. */
  variant?: "solid" | "outline";
  /** Use for file links such as the resume PDF. */
  download?: boolean;
  className?: string;
};

const base =
  "group inline-flex min-h-12 items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300";

const variants = {
  solid: "bg-accent-solid text-on-accent hover:bg-fg hover:text-bg",
  outline: "border border-line text-fg hover:border-fg hover:bg-fg hover:text-bg",
} as const;

/**
 * Pill-shaped link with a trailing arrow. Picks the right arrow and link
 * behaviour for internal pages, external sites and files.
 */
export function ArrowLink({
  href,
  children,
  variant = "outline",
  download = false,
  className,
}: ArrowLinkProps) {
  const classes = cn(base, variants[variant], className);
  const external = isExternal(href);
  const Icon = download ? ArrowDownToLine : external ? ArrowUpRight : ArrowRight;

  const content = (
    <>
      <span>{children}</span>
      <Icon
        aria-hidden="true"
        className={cn(
          "size-4 transition-transform duration-300 ease-out",
          download
            ? "group-hover:translate-y-0.5"
            : external
              ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              : "group-hover:translate-x-1",
        )}
      />
    </>
  );

  if (external || download) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
