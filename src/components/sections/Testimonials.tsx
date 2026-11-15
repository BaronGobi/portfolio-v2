import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollWords } from "@/components/motion/ScrollWords";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { testimonials } from "@/content/highlights";
import { padIndex } from "@/lib/utils";

/**
 * Testimonials. Each quote lights up word by word as it is scrolled through.
 * Add more entries in `src/content/highlights.ts` and they stack here.
 */
export function Testimonials() {
  return (
    <section
      id="testimonials"
      data-band="base"
      aria-labelledby="testimonials-title"
      className="band section-y"
    >
      <div className="shell">
        <SectionHeader
          label="Testimonials"
          caption={`${padIndex(testimonials.length - 1)} / kind words`}
        />
        <h2 id="testimonials-title" className="sr-only">
          Testimonials
        </h2>

        <div className="mt-10 flex flex-col gap-20 md:mt-16 md:gap-28">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="grid gap-x-8 gap-y-8 md:grid-cols-12"
            >
              <span
                aria-hidden="true"
                className="-mb-6 block font-serif text-[7rem] leading-[0.7] text-accent md:col-span-2 md:mb-0 md:text-[11rem]"
              >
                &ldquo;
              </span>

              <div className="md:col-span-10">
                <blockquote>
                  <ScrollWords
                    text={testimonial.quote}
                    className="text-[clamp(1.4rem,2.75vw,2.9rem)] leading-[1.2] font-medium tracking-[-0.03em]"
                  />
                </blockquote>

                <Reveal as="div" className="mt-10 md:mt-14">
                  <figcaption className="flex items-center gap-4">
                    <Image
                      src={testimonial.image.src}
                      alt={testimonial.image.alt}
                      width={128}
                      height={128}
                      className="size-14 rounded-full object-cover md:size-16"
                    />
                    <span>
                      <span className="block font-medium">{testimonial.name}</span>
                      <span className="block text-sm text-muted">
                        {testimonial.title}
                      </span>
                    </span>
                  </figcaption>
                </Reveal>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
