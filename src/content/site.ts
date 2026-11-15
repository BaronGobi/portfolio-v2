import { profile } from "./profile";

/**
 * Site-wide settings: SEO text and navigation.
 */

/**
 * Public URL of the deployed site, used for canonical links, the sitemap and
 * social cards. Set `NEXT_PUBLIC_SITE_URL` to override (see docs/deployment.md).
 * On Vercel the production domain is picked up automatically.
 */
export const siteUrl: string =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const site = {
  title: `${profile.name} · ${profile.role}`,
  description:
    "Portfolio of Baron Gobi (Rons), a full-stack web developer and certified Magento 2 developer based in Tokyo. PHP back ends, React front ends, and fast e-commerce.",
  keywords: [
    "Baron Gobi",
    "Rons",
    "Full-stack web developer",
    "Magento 2 developer",
    "ScandiPWA",
    "React",
    "PHP",
    "Laravel",
    "Tokyo",
    "Portfolio",
  ],
} as const;

export type NavItem = {
  /** Two-digit index shown next to the label. */
  index: string;
  label: string;
  /** Id of the section on the home page. */
  hash: string;
};

/** Numbered sections of the home page, in order. */
export const navItems: NavItem[] = [
  { index: "01", label: "About", hash: "about" },
  { index: "02", label: "Work", hash: "work" },
  { index: "03", label: "Experience", hash: "experience" },
  { index: "04", label: "Contact", hash: "contact" },
];
