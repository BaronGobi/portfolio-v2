import {
  Braces,
  Cloud,
  Clock,
  Database,
  Lightbulb,
  MicVocal,
  MonitorSmartphone,
  Plug,
  ShoppingBag,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brandIcons, spriteHref } from "./tech-icons";

/**
 * Icons for names that are not in the brand set: a few brands Simple Icons
 * does not carry (Magento, AWS, Navicat) and skills that are not brands.
 */
const genericIcons: Record<string, LucideIcon> = {
  "magento 2": ShoppingBag,
  aws: Cloud,
  navicat: Database,
  api: Plug,
  apis: Plug,
  "rest api": Braces,
  "rest apis": Braces,
  "responsive design": MonitorSmartphone,
  creativity: Lightbulb,
  teamwork: Users,
  "public speaking": MicVocal,
  "time management": Clock,
};

type TechIconProps = {
  /** Technology or skill name, as written in `src/content`. */
  name: string;
  className?: string;
};

/**
 * Decorative icon for a technology or skill. Always paired with a text label.
 *
 * Brand logos are drawn from the shared sprite (`tech-icons.ts`). Anything
 * else gets a generic Lucide icon, and unknown names fall back to a sparkle.
 */
export function TechIcon({ name, className }: TechIconProps) {
  const key = name.toLowerCase();
  const brand = brandIcons[key];

  if (brand) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={cn("size-5 shrink-0", className)}
      >
        <use href={spriteHref(brand)} />
      </svg>
    );
  }

  const Generic = genericIcons[key] ?? Sparkles;

  return (
    <Generic
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn("size-5 shrink-0", className)}
    />
  );
}
