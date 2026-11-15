import { Suspense } from "react";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Numbers } from "@/components/sections/Numbers";
import { Recognition } from "@/components/sections/Recognition";
import { Stack } from "@/components/sections/Stack";
import { Testimonials } from "@/components/sections/Testimonials";
import { Work } from "@/components/sections/Work";
import { profile, socials } from "@/content/profile";
import { site, siteUrl } from "@/content/site";

/** Structured data so search engines understand who the site is about. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.fullName,
  alternateName: [profile.name, profile.nickname],
  jobTitle: profile.role,
  description: site.description,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tokyo",
    addressCountry: "JP",
  },
  sameAs: socials
    .filter((social) => social.href.startsWith("http"))
    .map((social) => social.href),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so the JSON can never close the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />

      <Hero />

      {/* Everything after the hero sits above it and slides over it.

          Each section is its own Suspense boundary. Nothing here ever
          suspends; the boundaries let React hydrate the page one section at a
          time instead of in a single long task, which keeps it responsive
          while it loads. */}
      <div className="relative z-10">
        <Suspense>
          <About />
        </Suspense>
        <Suspense>
          <Numbers />
        </Suspense>
        <Suspense>
          <Work />
        </Suspense>
        <Suspense>
          <Experience />
        </Suspense>
        <Suspense>
          <Stack />
        </Suspense>
        <Suspense>
          <Recognition />
        </Suspense>
        <Suspense>
          <Testimonials />
        </Suspense>
        <Suspense>
          <Contact />
        </Suspense>
      </div>
    </>
  );
}
