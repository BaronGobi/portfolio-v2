import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { profile, socials } from "@/content/profile";
import { navItems } from "@/content/site";
import { CopyrightYear } from "./CopyrightYear";

/** Site footer: sitemap, contact links and the copyright line. */
export function Footer() {
  return (
    <footer data-band="dark" className="band tone-dark print-hidden relative z-10">
      <div className="shell pt-16 pb-8 md:pt-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="max-w-[16ch] text-h3">
              {profile.role}, based in {profile.location}.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="mb-4 eyebrow text-muted">Sitemap</h2>
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li key={item.hash}>
                  <Link
                    href={`/#${item.hash}`}
                    className="flex min-h-11 items-center gap-3 transition-colors duration-300 hover:text-accent"
                  >
                    <span className="eyebrow text-muted">{item.index}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/resume"
                  className="flex min-h-11 items-center gap-3 transition-colors duration-300 hover:text-accent"
                >
                  <span className="eyebrow text-muted">05</span>
                  Resume
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="mb-4 eyebrow text-muted">Connect</h2>
            <ul className="flex flex-col">
              {socials.map((social) => {
                const isMail = social.href.startsWith("mailto:");
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target={isMail ? undefined : "_blank"}
                      rel={isMail ? undefined : "noopener noreferrer"}
                      className="group flex min-h-11 items-center gap-2 transition-colors duration-300 hover:text-accent"
                    >
                      {social.label}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                      {!isMail && <span className="sr-only">(opens in a new tab)</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 pr-16 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:pr-20">
          <p>
            &copy; <CopyrightYear /> {profile.name}. All rights reserved.
          </p>
          <p>Built with Next.js, Tailwind CSS and Framer Motion.</p>
        </div>
      </div>
    </footer>
  );
}
