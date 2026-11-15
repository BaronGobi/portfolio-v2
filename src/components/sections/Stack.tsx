import { Marquee } from "@/components/motion/Marquee";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { AccordionItem } from "@/components/ui/Accordion";
import { Chip } from "@/components/ui/Chip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechIcon } from "@/components/ui/TechIcon";
import { marqueeStack, softSkills, techSkills } from "@/content/skills";
import { padIndex } from "@/lib/utils";

/** Stack: a logo ticker, technical skills by category, and soft skills. */
export function Stack() {
  return (
    <section
      id="stack"
      data-band="base"
      aria-labelledby="stack-title"
      className="band pb-[clamp(5rem,11vw,11rem)]"
    >
      <div className="shell">
        <SectionHeader label="Stack" caption="Technical and soft skills" />
        <TextReveal
          as="h2"
          id="stack-title"
          text="Technical skills."
          className="mt-10 text-h1 md:mt-16"
        />
      </div>

      {/* Decorative ticker. Every item also appears in the lists below. */}
      <Marquee label="tech stack" className="mt-12 md:mt-20">
        {marqueeStack.map((name) => (
          <span
            key={name}
            className="flex items-center gap-4 pr-10 text-[clamp(1.75rem,3.6vw,3.5rem)] leading-none font-medium tracking-[-0.04em] md:gap-5 md:pr-16"
          >
            <TechIcon name={name} className="size-[0.72em] text-accent" />
            {name}
          </span>
        ))}
      </Marquee>

      <div className="shell mt-10 md:mt-14">
        <div className="border-t border-line">
          {techSkills.map((group, index) => (
            <Reveal key={group.category} delay={index * 0.04}>
              <AccordionItem
                defaultOpen={index === 0}
                header={
                  <span className="grid gap-x-8 gap-y-1 md:grid-cols-12 md:items-baseline">
                    <span className="eyebrow text-muted md:col-span-3">
                      {padIndex(index)} / {padIndex(group.skills.length - 1)} skills
                    </span>
                    <span className="block text-h3 md:col-span-9">{group.category}</span>
                  </span>
                }
              >
                {/* Right padding matches the toggle button, so columns line up with the row above. */}
                <div className="grid gap-x-8 md:grid-cols-12 md:pr-[4.25rem]">
                  <ul className="flex flex-wrap gap-2.5 md:col-span-9 md:col-start-4">
                    {group.skills.map((skill) => (
                      <li key={skill}>
                        <Chip name={skill} />
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionItem>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-8 md:mt-24 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <h3 className="eyebrow text-muted">Soft skills</h3>
          </Reveal>
          <RevealGroup
            as="ul"
            gap={0.08}
            className="grid grid-cols-2 border-t border-l border-line md:col-span-9 lg:grid-cols-4"
          >
            {softSkills.map((skill) => (
              <RevealItem
                as="li"
                key={skill}
                className="flex aspect-[4/3] flex-col justify-between border-r border-b border-line p-5 md:p-6"
              >
                <TechIcon name={skill} className="size-7 text-accent" />
                <span className="text-lg leading-tight font-medium tracking-tight md:text-xl">
                  {skill}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
