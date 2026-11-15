import { TextReveal } from "@/components/motion/TextReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects } from "@/content/projects";
import { padIndex } from "@/lib/utils";
import { WorkList } from "./WorkList";

/** (02) Work: the project list. Each row opens a case-study page. */
export function Work() {
  return (
    <section
      id="work"
      data-band="invert"
      aria-labelledby="work-title"
      className="band tone-invert section-y"
    >
      <div className="shell">
        <SectionHeader
          index="02"
          label="Work"
          caption={`${padIndex(projects.length - 1)} projects`}
        />
        <TextReveal
          as="h2"
          id="work-title"
          text="My arts."
          className="mt-10 text-h1 md:mt-16"
        />
      </div>

      {/* Only the fields the list shows are sent to the browser, not the
          full write-ups. */}
      <WorkList
        items={projects.map((project) => ({
          slug: project.slug,
          title: project.title,
          kind: project.kind,
          image: project.image.src,
        }))}
      />
    </section>
  );
}
