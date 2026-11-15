import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { recognition } from "@/content/highlights";
import { padIndex } from "@/lib/utils";

/** Recognition: certification, awards and leadership, as a ruled list. */
export function Recognition() {
  return (
    <section
      id="recognition"
      data-band="invert"
      aria-labelledby="recognition-title"
      className="band tone-invert section-y"
    >
      <div className="shell">
        <SectionHeader label="Recognition" caption="Certification, awards, leadership" />

        <div className="mt-10 grid gap-x-8 gap-y-10 md:mt-16 md:grid-cols-12">
          <TextReveal
            as="h2"
            id="recognition-title"
            text={"Achieving more\nthan expected."}
            className="text-h2 md:col-span-5"
          />

          <RevealGroup as="ul" gap={0.07} className="border-t border-line md:col-span-7">
            {recognition.map((item, index) => (
              <RevealItem
                as="li"
                key={item.title}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 border-b border-line py-6 sm:grid-cols-[auto_1fr_auto] md:py-7"
              >
                <span className="eyebrow text-muted transition-colors duration-500 group-hover:text-accent">
                  {padIndex(index)}
                </span>
                <span className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                  <span className="block text-xl leading-tight font-medium tracking-tight md:text-2xl">
                    {item.title}
                  </span>
                  <span className="mt-1.5 block text-sm text-muted">{item.detail}</span>
                </span>
                <span className="col-start-2 eyebrow text-accent sm:col-start-3">
                  {item.tag}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
