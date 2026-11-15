/**
 * Shared content types.
 *
 * Everything the site displays lives in `src/content/*`. Components only read
 * these objects, so editing copy never requires touching layout code.
 */

/** A month in `YYYY-MM` form, or `null` for "Present". */
export type YearMonth = `${number}-${number}`;

export type Social = {
  /** Visible label, e.g. "LinkedIn". */
  label: string;
  /** Full URL (or `mailto:` link). */
  href: string;
  /** Short handle shown next to the label, e.g. "/in/barongobirn". */
  handle: string;
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  /** URL segment: `/work/<slug>`. */
  slug: string;
  title: string;
  /** Short name used in tight spaces (nav between case studies). */
  shortTitle: string;
  /** One-line category shown next to the title. */
  kind: string;
  /** One or two sentences for cards and meta descriptions. */
  summary: string;
  /** Full write-up, one string per paragraph. */
  description: string[];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  /** Names must match a key in `src/components/ui/TechIcon.tsx` to get an icon. */
  technologies: string[];
  links: ProjectLink[];
};

export type Position = {
  title: string;
  start: YearMonth;
  /** `null` means the role is current. */
  end: YearMonth | null;
};

export type Experience = {
  company: string;
  location: string;
  positions: Position[];
  tasks: string[];
};

export type Education = {
  degree: string;
  school: string;
  location: string;
  start: YearMonth;
  end: YearMonth;
  grade: string;
};

export type SkillCategory = {
  category: string;
  skills: string[];
};

export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  image: {
    src: string;
    alt: string;
  };
};

export type Recognition = {
  title: string;
  /** Who gave it / where it happened. */
  detail: string;
  /** Small tag on the right, e.g. "Award". */
  tag: string;
};

export type Stat = {
  value: number;
  /** Digits after the decimal point. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  detail: string;
};
