import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Two-digit section number, e.g. "02". Omit for unnumbered sections. */
  index?: string;
  label: string;
  /** Short note on the right, e.g. a date range. */
  caption?: string;
  className?: string;
};

/**
 * Thin label row that opens a section: "(02) Work ........ 2020 - 2024".
 */
export function SectionHeader({ index, label, caption, className }: SectionHeaderProps) {
  return (
    <Reveal
      y={12}
      className={cn(
        "flex items-baseline justify-between gap-6 border-t border-line pt-4 eyebrow text-muted",
        className,
      )}
    >
      <span className="flex items-baseline gap-3">
        {index && <span className="text-accent">({index})</span>}
        <span>{label}</span>
      </span>
      {caption && <span className="text-right">{caption}</span>}
    </Reveal>
  );
}
