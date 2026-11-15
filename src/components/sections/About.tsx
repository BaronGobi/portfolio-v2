import Image from "next/image";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { profile } from "@/content/profile";

/** (01) About: intro statement, portrait and the longer story. */
export function About() {
  return (
    <section
      id="about"
      data-band="base"
      aria-labelledby="about-title"
      className="band section-y"
    >
      <div className="shell">
        <SectionHeader
          index="01"
          label="About"
          caption={`Call me ${profile.firstName} or ${profile.nickname}`}
        />

        <h2 id="about-title" className="sr-only">
          About {profile.nickname}
        </h2>

        <TextReveal
          as="p"
          text={profile.intro}
          gap={0.022}
          className="mt-10 max-w-[26ch] text-[clamp(1.75rem,4.1vw,4.25rem)] leading-[1.04] font-medium tracking-[-0.04em] md:mt-16"
        />

        <div className="mt-16 grid gap-x-8 gap-y-12 md:mt-24 md:grid-cols-12">
          <Reveal as="figure" className="md:col-span-5">
            <Parallax
              className="aspect-[4/5] overflow-hidden rounded-[1.25rem]"
              amount={6}
            >
              <Image
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                width={profile.portrait.width}
                height={profile.portrait.height}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="size-full object-cover"
              />
            </Parallax>
            <figcaption className="mt-4 flex justify-between gap-4 eyebrow text-muted">
              <span>{profile.name}</span>
              <span>{profile.location}</span>
            </figcaption>
          </Reveal>

          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <p className="text-lead">{profile.introDetail}</p>
            </Reveal>

            <RevealGroup
              className="mt-10 flex flex-col gap-6 text-body text-muted"
              gap={0.1}
            >
              {profile.about.map((paragraph) => (
                <RevealItem as="p" key={paragraph}>
                  {paragraph}
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal className="mt-10">
              <ArrowLink href="/resume">Read the full resume</ArrowLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
