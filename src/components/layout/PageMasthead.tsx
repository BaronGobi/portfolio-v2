import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageMastheadProps = {
  /** Small label on the left of the top rule. */
  eyebrow: string;
  /** Small note on the right of the top rule. */
  caption?: string;
  title: string;
  /** Anything shown under the title: summary, meta, buttons. */
  children?: ReactNode;
  /** Slightly smaller title, for long headings. */
  compact?: boolean;
};

function delay(ms: number): CSSProperties {
  return { "--hero-delay": `${ms}ms` } as CSSProperties;
}

/**
 * Dark title block that opens every inner page (case studies, resume, 404).
 *
 * Its entrance uses the same CSS animations as the home hero, so the page
 * title paints without waiting for JavaScript.
 */
export function PageMasthead({
  eyebrow,
  caption,
  title,
  children,
  compact = false,
}: PageMastheadProps) {
  return (
    <header data-band="dark" className="band tone-dark pt-32 pb-14 md:pt-44 md:pb-20">
      <div className="shell">
        <div
          className="flex hero-fade items-baseline justify-between gap-6 border-t border-line pt-4 eyebrow text-muted"
          style={delay(100)}
        >
          <span>{eyebrow}</span>
          {caption && <span className="text-right">{caption}</span>}
        </div>

        <h1
          className={cn(
            "mt-10 max-w-[18ch] hero-fade md:mt-14",
            compact ? "text-h2" : "text-h1",
          )}
          style={delay(200)}
        >
          {title}
        </h1>

        {children && (
          <div className="mt-8 hero-fade md:mt-10" style={delay(340)}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
