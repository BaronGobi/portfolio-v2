import type { Metadata } from "next";
import { PageMasthead } from "@/components/layout/PageMasthead";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Chip } from "@/components/ui/Chip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechIcon } from "@/components/ui/TechIcon";
import { education, organizations, workExperience } from "@/content/experience";
import { profile, socials } from "@/content/profile";
import { softSkills, techSkills } from "@/content/skills";
import type { Experience } from "@/content/types";
import { formatRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${profile.fullName}, ${profile.role} based in ${profile.location}: experience, skills, organizations and education.`,
  alternates: { canonical: "/resume" },
};

/** One employer or organization, with every role and responsibility listed. */
function ExperienceEntry({ entry }: { entry: Experience }) {
  return (
    <article className="grid gap-x-8 gap-y-4 border-b border-line py-10 md:grid-cols-12 md:py-14">
      <div className="md:col-span-4">
        <p className="eyebrow text-muted">
          {entry.positions.map((position) => (
            <span key={position.title} className="block">
              {formatRange(position.start, position.end)}
            </span>
          ))}
        </p>
        <p className="mt-3 font-medium">{entry.company}</p>
        <p className="text-sm text-muted">{entry.location}</p>
      </div>

      <div className="md:col-span-8">
        <h3 className="text-h3">
          {entry.positions.map((position) => position.title).join(" / ")}
        </h3>
        <h4 className="mt-8 mb-5 eyebrow text-muted">Roles and responsibilities</h4>
        <ul className="flex flex-col gap-4">
          {entry.tasks.map((task) => (
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
    </article>
  );
}

export default function ResumePage() {
  return (
    <>
      <PageMasthead eyebrow="Resume" caption={profile.location} title={profile.fullName}>
        <p className="text-lead">{profile.role}</p>

        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted">
          {socials.map((social) => {
            const isMail = social.href.startsWith("mailto:");
            return (
              <li key={social.label}>
                <a
                  href={social.href}
                  target={isMail ? undefined : "_blank"}
                  rel={isMail ? undefined : "noopener noreferrer"}
                  className="flex min-h-11 items-center gap-2 transition-colors duration-300 hover:text-fg"
                >
                  <span className="eyebrow">{social.label}</span>
                  <span className="link-underline">{social.handle}</span>
                  {!isMail && <span className="sr-only">(opens in a new tab)</span>}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="print-hidden mt-8">
          <p className="mb-4 text-sm text-muted">{profile.resume.note}</p>
          <ArrowLink href={profile.resume.href} variant="solid" download>
            {profile.resume.label}
          </ArrowLink>
        </div>
      </PageMasthead>

      <div data-band="base" className="band">
        <section
          aria-labelledby="resume-experience"
          className="shell pt-[clamp(4rem,8vw,8rem)]"
        >
          <SectionHeader index="01" label="Professional experience" />
          <h2 id="resume-experience" className="sr-only">
            Professional experience
          </h2>
          <div>
            {workExperience.map((entry) => (
              <Reveal key={entry.company}>
                <ExperienceEntry entry={entry} />
              </Reveal>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="resume-soft-skills"
          className="shell pt-[clamp(4rem,8vw,8rem)]"
        >
          <SectionHeader index="02" label="Soft skills" />
          <h2 id="resume-soft-skills" className="sr-only">
            Soft skills
          </h2>
          <RevealGroup
            as="ul"
            gap={0.08}
            className="mt-10 grid grid-cols-2 border-t border-l border-line lg:grid-cols-4"
          >
            {softSkills.map((skill) => (
              <RevealItem
                as="li"
                key={skill}
                className="flex aspect-[4/3] flex-col justify-between border-r border-b border-line p-5 md:p-6 print:aspect-auto print:gap-3"
              >
                <TechIcon name={skill} className="size-7 text-accent" />
                <span className="text-lg leading-tight font-medium tracking-tight md:text-xl">
                  {skill}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section
          aria-labelledby="resume-tech-skills"
          className="shell pt-[clamp(4rem,8vw,8rem)]"
        >
          <SectionHeader index="03" label="Technical skills" />
          <h2 id="resume-tech-skills" className="sr-only">
            Technical skills
          </h2>
          <div>
            {techSkills.map((group) => (
              <Reveal
                key={group.category}
                className="grid gap-x-8 gap-y-5 border-b border-line py-8 md:grid-cols-12 md:py-10"
              >
                <h3 className="text-xl leading-tight font-medium tracking-tight md:col-span-4 md:text-2xl">
                  {group.category}
                </h3>
                <ul className="flex flex-wrap gap-2.5 md:col-span-8">
                  {group.skills.map((skill) => (
                    <li key={skill}>
                      <Chip name={skill} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="resume-organizations"
          className="shell pt-[clamp(4rem,8vw,8rem)]"
        >
          <SectionHeader index="04" label="Organizations" />
          <h2 id="resume-organizations" className="sr-only">
            Organizations
          </h2>
          <div>
            {organizations.map((entry) => (
              <Reveal key={entry.company}>
                <ExperienceEntry entry={entry} />
              </Reveal>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="resume-education"
          className="shell pt-[clamp(4rem,8vw,8rem)] pb-[clamp(5rem,11vw,11rem)]"
        >
          <SectionHeader index="05" label="Education" />
          <h2 id="resume-education" className="sr-only">
            Education
          </h2>
          <div>
            {education.map((entry) => (
              <Reveal key={entry.degree}>
                <article className="grid gap-x-8 gap-y-4 border-b border-line py-10 md:grid-cols-12 md:py-14">
                  <div className="md:col-span-4">
                    <p className="eyebrow text-muted">
                      {formatRange(entry.start, entry.end)}
                    </p>
                    <p className="mt-3 font-medium">{entry.school}</p>
                    <p className="text-sm text-muted">{entry.location}</p>
                  </div>
                  <div className="md:col-span-8">
                    <h3 className="text-h3">{entry.degree}</h3>
                    <p className="mt-4 text-muted">
                      Grade: <span className="font-medium text-fg">{entry.grade}</span>
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
