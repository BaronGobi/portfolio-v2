import type { Metadata } from "next";
import { ArrowLink } from "@/components/ui/ArrowLink";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** Shown for any URL that doesn't match a page. */
export default function NotFound() {
  return (
    <section
      data-band="dark"
      aria-labelledby="not-found-title"
      className="band tone-dark relative flex min-h-svh items-end overflow-hidden"
    >
      {/* Same glow as the hero, so the 404 still feels like part of the site. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[38%] left-[70%] size-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_95_31/0.3),transparent)] md:size-[70svh]"
      />

      <div className="relative shell pt-32 pb-10 md:pb-14">
        <p
          aria-hidden="true"
          className="hero-fade text-[34vw] leading-[0.8] font-medium tracking-[-0.06em] text-accent md:text-[min(26vw,26rem)]"
        >
          404
        </p>
        <div className="mt-8 grid gap-x-8 gap-y-6 border-t border-line pt-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow text-muted">404! Page not found</p>
            <h1 id="not-found-title" className="mt-4 max-w-[16ch] text-h2">
              Oops! There seems to be an error.
            </h1>
            <p className="mt-5 text-lead text-muted">
              Sorry. The page you are looking for does not exist.
            </p>
          </div>
          <div className="md:col-span-4 md:flex md:justify-end">
            <ArrowLink href="/" variant="solid">
              Back to Home
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
