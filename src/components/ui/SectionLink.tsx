"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { scrollToTarget } from "@/components/layout/SmoothScroll";

type SectionLinkProps = {
  /** Id of a section on the home page, without the "#". */
  hash: string;
  children: ReactNode;
  className?: string;
};

/**
 * Link to a section of the home page.
 *
 * On the home page it scrolls smoothly to the section. On any other page it is
 * a normal link to `/#section`.
 */
export function SectionLink({ hash, children, className }: SectionLinkProps) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    event.preventDefault();
    scrollToTarget(hash);
  }

  return (
    <Link href={`/#${hash}`} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
