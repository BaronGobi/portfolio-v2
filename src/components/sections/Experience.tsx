import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { AccordionItem } from "@/components/ui/Accordion";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { workExperience } from "@/content/experience";
import { formatMonth, positionsRange } from "@/lib/utils";

/** (03) Experience: one expandable row per employer. Full detail is on /resume. */
export function Experience() {
  const first = workExperience[workExperience.length - 1].positions.at(-1);
  const since = first ? formatMonth(first.start).split(" ")[1] : "";

  // Open the most recent role that has a real list of achievements.
  const openIndex = workExperience.findIndex((job) => job.tasks.length > 1);

  return (
    <section
      id="experience"
      data-band="base"
      aria-labelledby="experience-title"
      className="band section-y"
    >
      <div className="shell">
        <SectionHeader index="03" label="Experience" caption={`${since} to present`} />
        <TextReveal
          as="h2"
          id="experience-title"
          text="Professional experience."
          className="mt-10 max-w-[12ch] text-h1 md:mt-16"
        />

        <div className="mt-10 border-t border-line md:mt-16">
          {workExperience.map((job, index) => (
            <Reveal key={job.company} delay={index * 0.06}>
              <AccordionItem
                defaultOpen={index === openIndex}
                header={
                  <span className="grid gap-x-8 gap-y-2 md:grid-cols-12 md:items-baseline">
                    <span className="eyebrow text-muted md:col-span-3">
                      {positionsRange(job.positions)}
                    </span>
                    <span className="md:col-span-9">
                      <span className="block text-h3">
                        {job.positions.map((position) => position.title).join(" / ")}
                      </span>
                      <span className="mt-2 block text-muted">
                        {job.company} · {job.location}
                      </span>
                    </span>
                  </span>
                }
              >
                {/* Right padding matches the toggle button, so columns line up with the row above. */}
                <div className="grid gap-x-8 md:grid-cols-12 md:pr-[4.25rem]">
                  <div className="md:col-span-8 md:col-start-4">
                    <h4 className="mb-5 eyebrow text-muted">
                      Roles and responsibilities
                    </h4>
                    <ul className="flex flex-col gap-4">
                      {job.tasks.map((task) => (
                        <li key={task} className="flex gap-4 text-body">
                          <span
                            aria-hidden="true"
                            className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent-solid"
                          />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionItem>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 md:mt-14">
          <ArrowLink href="/resume">See the full resume</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
