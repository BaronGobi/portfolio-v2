import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { profile } from "@/content/profile";
import { AboutPortrait } from "./AboutPortrait";

/**
 * (01) About: an opening statement, the portrait panel, then the longer story
 * as labelled rows.
 */
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

        {/* The first line is indented; the reset keeps each animated word
            (an inline block of its own) from inheriting the indent. */}
        <TextReveal
          as="p"
          text={profile.intro}
          gap={0.022}
          className="mt-10 indent-[14%] text-[clamp(1.75rem,4.55vw,5rem)] leading-[1.03] font-medium tracking-[-0.04em] md:mt-16 md:indent-[32%] [&_span]:indent-0"
        />

        <div className="mt-14 md:mt-24">
          <AboutPortrait />
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 md:mt-24 md:grid-cols-12">
          <Reveal className="md:sticky md:top-28 md:col-span-5 md:self-start">
            <p className="max-w-[30ch] text-lead">{profile.introDetail}</p>
          </Reveal>

          <RevealGroup
            as="dl"
            className="border-b border-line md:col-span-7 md:col-start-6"
            gap={0.1}
          >
            {profile.about.map((item) => (
              <RevealItem
                key={item.label}
                className="grid gap-x-8 gap-y-3 border-t border-line py-7 text-body md:grid-cols-[9rem_1fr] md:py-9"
              >
                <dt>({item.label})</dt>
                <dd className="text-muted">{item.text}</dd>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
