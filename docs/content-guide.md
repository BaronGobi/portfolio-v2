# Content guide

How to change what the site says, without touching layout code.

Everything the site displays lives in `src/content/`. Each file exports plain objects, and TypeScript checks their shape (see `types.ts`), so a missing field shows up as an error in your editor and in `npm run typecheck`.

After editing, run `npm run dev` and check the page.

## Where things are

| I want to change...               | Edit                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| Name, role, location, tagline     | `profile.ts` → `profile`                                           |
| The About text                    | `profile.ts` → `intro`, `introDetail`, `about` (label + paragraph) |
| Email, LinkedIn, GitHub links     | `profile.ts` → `socials`                                           |
| The portrait and the text on it   | `profile.ts` → `portrait` (see "The portrait panel" below)         |
| The resume PDF                    | Replace `public/Baron-Resume.pdf`                                  |
| Projects                          | `projects.ts`                                                      |
| Jobs, organizations, education    | `experience.ts`                                                    |
| Skills and the logo ticker        | `skills.ts`                                                        |
| The four big numbers              | `highlights.ts` → `stats`                                          |
| Awards and certification          | `highlights.ts` → `recognition`                                    |
| Testimonials                      | `highlights.ts` → `testimonials`                                   |
| Page title, meta description, nav | `site.ts`                                                          |

## The portrait panel

The large photo in the About section is described by `profile.portrait`:

| Field                    | What it does                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `src`, `width`, `height` | The photo. A square image of about 2400px keeps it sharp when it fills a large screen                                             |
| `alt`                    | Description for screen readers                                                                                                    |
| `focus`                  | The point that stays in view when the photo is cropped: `[x, y]`, each from 0 (left / top) to 1 (right / bottom). Aim at the face |
| `wordmark`               | The big word across the bottom. Its size is tuned for five letters                                                                |
| `lead`, `trail`          | The sentence in the top corner. `trail` is the dimmed ending                                                                      |
| `focusAreas`             | The short "01/" list. Three or four entries fit                                                                                   |

To swap the photo, replace `public/images/profile/rons.webp` (or add a new file and change `src`), then set `width`, `height` and `focus`. The panel crops the photo differently on phones (tall) and desktops (wide), so check both after changing `focus`.

If you change `wordmark` to a longer or shorter word, adjust its font size in `src/components/sections/AboutPortrait.tsx` (the `text-[28cqw]` and `md:text-[19.5cqw]` classes) so it still fits the panel.

## Add a project

1. Put a screenshot in `public/images/projects/`. WebP, about 1600px wide, is ideal.
2. Add an entry to the `projects` array in `projects.ts`:

```ts
{
  slug: "my-new-project",            // becomes /work/my-new-project
  title: "My New Project",
  shortTitle: "New Project",
  kind: "Web app · Next.js",          // one-line category
  summary: "One or two sentences for cards and search results.",
  description: [
    "First paragraph, shown large.",
    "Any further paragraphs.",
  ],
  image: {
    src: "/images/projects/my-new-project.webp",
    alt: "What the screenshot shows",
    width: 1600,                       // the image's real pixel size
    height: 1000,
  },
  technologies: ["React", "TypeScript"],
  links: [{ label: "Visit Website", href: "https://example.com" }],
},
```

The project appears in the Work list, gets its own page, and is added to the sitemap. Order in the array is the order on the site.

## Add a job

Add an entry to `workExperience` in `experience.ts`, newest first:

```ts
{
  company: "Company name",
  location: "City, Country",
  positions: [{ title: "Job title", start: "2025-01", end: null }],
  tasks: ["What you did, one sentence per item."],
},
```

- Dates are `"YYYY-MM"`. Use `end: null` for a current role; it prints as "Present".
- On the home page, the first job with more than one task starts expanded.

## Add a skill or technology

Add the name to a category in `skills.ts` (or to a project's `technologies`).

A name gets a logo if `src/components/ui/TechIcon.tsx` knows it. To add one:

1. Find the icon on [simpleicons.org](https://simpleicons.org) and note its export name, e.g. `siVuedotjs`.
2. Import it in `TechIcon.tsx` and add a line to `brandIcons`, keyed by the lowercase name:

```ts
"vue": siVuedotjs,
```

Names that aren't in the map still render, with a generic sparkle icon. A few brands (Magento, AWS, Navicat) are not in Simple Icons, so they use generic icons from `genericIcons`.

## Add a testimonial

Add an entry to `testimonials` in `highlights.ts`. Put a square photo (at least 128px) in `public/images/testimonials/`. Testimonials stack in the order listed.

## Things to keep in mind

- **The numbers band** (`stats`) is not calculated. If your figures change, update them by hand.
- **Image sizes** in content files must match the real file, or images will look stretched.
- **Alt text** describes what an image shows, for people who can't see it. Keep it factual.
- **Navigation** (`navItems` in `site.ts`) points at section ids on the home page. If you rename a section id in `src/components/sections/`, update it here too.
