import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { PageMasthead } from "@/components/layout/PageMasthead";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Chip } from "@/components/ui/Chip";
import { getProject, projects } from "@/content/projects";
import { padIndex } from "@/lib/utils";

/** Build one static page per project. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      url: `/work/${project.slug}`,
      images: [
        {
          url: project.image.src,
          width: project.image.width,
          height: project.image.height,
          alt: project.image.alt,
        },
      ],
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <article>
      <PageMasthead
        eyebrow={`Case study ${padIndex(index)} / ${padIndex(projects.length - 1)}`}
        caption={project.kind}
        title={project.title}
        compact
      >
        <p className="max-w-[44ch] text-lead text-muted">{project.summary}</p>
      </PageMasthead>

      <div data-band="base" className="band">
        <div className="shell pt-6 md:pt-8">
          {/* Largest element on the page: it fades in with CSS at first paint
              instead of waiting for a scroll-triggered reveal. */}
          <div
            className="hero-fade overflow-hidden rounded-2xl border border-line bg-raised"
            style={{ "--hero-delay": "420ms" } as CSSProperties}
          >
            <Image
              src={project.image.src}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              sizes="(min-width: 1792px) 1696px, 94vw"
              loading="eager"
              fetchPriority="high"
              className="max-h-[85svh] w-full object-cover object-top"
            />
          </div>
        </div>

        <div className="shell grid gap-x-8 gap-y-14 section-y md:grid-cols-12">
          <section aria-labelledby="about-project" className="md:col-span-7">
            <Reveal>
              <h2 id="about-project" className="eyebrow text-muted">
                About
              </h2>
            </Reveal>
            <RevealGroup className="mt-6 flex flex-col gap-6" gap={0.1}>
              {project.description.map((paragraph, paragraphIndex) => (
                <RevealItem
                  as="p"
                  key={paragraph}
                  className={paragraphIndex === 0 ? "text-lead" : "text-body text-muted"}
                >
                  {paragraph}
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal className="mt-10 flex flex-wrap gap-3">
              {project.links.map((link, linkIndex) => (
                <ArrowLink
                  key={link.href}
                  href={link.href}
                  variant={linkIndex === 0 ? "solid" : "outline"}
                >
                  {link.label}
                </ArrowLink>
              ))}
            </Reveal>
          </section>

          <section
            aria-labelledby="project-tech"
            className="md:col-span-4 md:col-start-9"
          >
            <Reveal>
              <h2 id="project-tech" className="eyebrow text-muted">
                Technologies
              </h2>
            </Reveal>
            <RevealGroup as="ul" gap={0.03} className="mt-6 flex flex-wrap gap-2.5">
              {project.technologies.map((technology) => (
                <RevealItem as="li" key={technology}>
                  <Chip name={technology} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        </div>
      </div>

      <nav aria-label="More work" data-band="invert" className="band tone-invert">
        <Link href={`/work/${next.slug}`} className="group shell block py-16 md:py-24">
          <span className="flex items-baseline justify-between border-t border-line pt-4 eyebrow text-muted">
            <span>Next project</span>
            <span>
              {padIndex(projects.indexOf(next))} / {padIndex(projects.length - 1)}
            </span>
          </span>
          <span className="mt-8 flex items-end justify-between gap-8 md:mt-12">
            <span className="max-w-[16ch] text-h2 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4">
              {next.title}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="mb-2 size-9 shrink-0 transition-transform duration-500 ease-out group-hover:translate-x-2 md:size-14"
            />
          </span>
        </Link>
      </nav>
    </article>
  );
}
