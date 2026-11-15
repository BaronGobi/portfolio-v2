"use client";

import { m } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

type AccordionItemProps = {
  /** Always-visible row content. */
  header: ReactNode;
  /** Content revealed when the row is open. */
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  /** Heading level for the row, so it fits the page outline. */
  headingLevel?: "h3" | "h4";
};

/**
 * One expandable row. Rows are independent, so several can be open at once.
 *
 * The panel animates its height, the one place on the site where layout is
 * animated, because content below has to make room.
 */
export function AccordionItem({
  header,
  children,
  defaultOpen = false,
  className,
  headingLevel: Heading = "h3",
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;

  return (
    <div className={cn("border-b border-line", className)}>
      <Heading className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-8"
        >
          <span className="min-w-0 flex-1">{header}</span>
          <span
            aria-hidden="true"
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full border border-line transition-[background-color,color,border-color,transform] duration-500 ease-out",
              "group-hover:border-fg group-hover:bg-fg group-hover:text-bg",
              open && "rotate-45",
            )}
          >
            <Plus className="size-4" />
          </span>
        </button>
      </Heading>

      {/* The panel stays in the page when closed, so its text is still in the
          HTML for search engines; `inert` keeps it out of the tab order. */}
      <m.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={
          open
            ? { duration: duration.base, ease: ease.out }
            : { duration: duration.fast * 1.4, ease: ease.inOut }
        }
        className="overflow-hidden"
      >
        <div className="pb-8 md:pb-10">{children}</div>
      </m.div>
    </div>
  );
}
