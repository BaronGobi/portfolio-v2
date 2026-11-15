import { Counter } from "@/components/motion/Counter";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { stats } from "@/content/highlights";

/** "In numbers" band: four figures that count up when they scroll into view. */
export function Numbers() {
  return (
    <section
      data-band="base"
      aria-labelledby="numbers-title"
      className="band pb-[clamp(5rem,11vw,11rem)]"
    >
      <div className="shell">
        <SectionHeader label="In numbers" caption="Results so far" />
        <h2 id="numbers-title" className="sr-only">
          In numbers
        </h2>

        <RevealGroup
          as="dl"
          gap={0.1}
          className="mt-10 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <RevealItem key={stat.label} className="flex flex-col-reverse justify-end">
              <dt className="mt-5">
                <span className="block eyebrow text-fg">{stat.label}</span>
                <span className="mt-2 block max-w-[30ch] text-sm leading-relaxed text-muted">
                  {stat.detail}
                </span>
              </dt>
              <dd className="text-[clamp(3.25rem,6.1vw,6.75rem)] leading-[0.92] font-medium tracking-[-0.05em] tabular-nums">
                {stat.prefix}
                <Counter value={stat.value} decimals={stat.decimals} />
                <span className="text-accent">{stat.suffix}</span>
              </dd>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
