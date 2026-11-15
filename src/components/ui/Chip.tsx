import { TechIcon } from "./TechIcon";

type ChipProps = {
  /** Technology or skill name. Also picks the icon. */
  name: string;
};

/** Pill with an icon and a label, used for technologies and skills. */
export function Chip({ name }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-2 text-sm text-fg">
      <TechIcon name={name} className="size-4 text-muted" />
      {name}
    </span>
  );
}
