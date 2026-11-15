import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { profile, socials } from "@/content/profile";

/** (04) Contact: the closing call to action, on the solid orange band. */
export function Contact() {
  return (
    <section
      id="contact"
      data-band="accent"
      aria-labelledby="contact-title"
      className="band tone-accent section-y"
    >
      <div className="shell">
        <SectionHeader index="04" label="Contact" caption={profile.location} />

        <Reveal className="mt-10 md:mt-16">
          <p className="max-w-[22ch] text-lead font-medium">{profile.contact.prompt}</p>
        </Reveal>

        <TextReveal
          as="h2"
          id="contact-title"
          text={profile.contact.heading}
          gap={0.08}
          className="mt-4 text-display md:mt-6"
        />

        <div className="mt-12 grid gap-x-8 gap-y-12 md:mt-20 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-6">
            <Magnetic className="inline-block">
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex min-h-16 items-center gap-4 rounded-full bg-fg px-7 text-base font-medium text-bg transition-colors duration-300 hover:bg-white hover:text-black sm:px-9 sm:text-xl"
              >
                {profile.email}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-6"
                />
              </a>
            </Magnetic>
          </Reveal>

          <RevealGroup
            as="ul"
            gap={0.08}
            className="border-t border-line md:col-span-5 md:col-start-8"
          >
            {socials
              .filter((social) => !social.href.startsWith("mailto:"))
              .map((social) => (
                <RevealItem as="li" key={social.label} className="border-b border-line">
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-16 items-center justify-between gap-6 py-4"
                  >
                    <span className="text-xl font-medium tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-2 md:text-2xl">
                      {social.label}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="eyebrow text-muted">{social.handle}</span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-5 transition-transform duration-500 ease-out group-hover:rotate-45"
                      />
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </RevealItem>
              ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
