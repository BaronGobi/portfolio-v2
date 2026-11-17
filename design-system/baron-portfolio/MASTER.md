# Design System: Baron Portfolio

The single source of truth for how the site looks and moves. If a page needs to break a rule, add a file under `pages/` that says how and why; otherwise these rules apply everywhere.

Tokens are implemented in `src/app/globals.css`. Motion tokens are in `src/lib/motion.ts`.

## How this was put together

Two inputs were combined:

1. **UI/UX Pro Max skill** (v2.15.0). Queries: a `--design-system` run for a dark, editorial, 3D developer portfolio (variance 8, motion 8, density 3), then targeted `style`, `typography`, `color`, `ux`, `landing` and `nextjs` searches.
2. **Three reference sites** chosen by the site owner: Elena Voss (portfolio template), Kora (3D agency template) and Morrow (agency template).

Where the two disagreed, the references won. The skill's first pass proposed a blue accent and a handwritten font pairing, which fit neither the references nor the owner's choice of orange. What was kept from the skill:

| From the skill                                                                         | Used for                                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Pattern: Scroll-Triggered Storytelling                                                 | Page structure: a hook, chapters, and a closing call to action; content stays readable with motion off |
| Style: Kinetic Typography                                                              | Oversized type as the main visual, masked word reveals, scroll-linked text                             |
| Palette: orange on dark (`#EA580C` family, black text on orange)                       | Basis for the accent and its on-accent color                                                           |
| UX rules: reduced motion, motion sensitivity, excessive motion, duration timing        | The motion rules below                                                                                 |
| Next.js rules: `next/font`, `next/image`, dynamic imports, push client components down | Implementation choices                                                                                 |
| Pre-delivery checklist                                                                 | The checklist at the end of this file                                                                  |

## Dials

| Dial     | Value  | Meaning                                                        |
| -------- | ------ | -------------------------------------------------------------- |
| Variance | 8 / 10 | Bold, asymmetric layouts; display type bleeds toward the edges |
| Motion   | 8 / 10 | Scroll-linked and staggered motion, one 3D focal point         |
| Density  | 3 / 10 | Spacious; sections breathe                                     |

## Color

Components never use raw colors. They use semantic tokens, and a **tone** class decides which palette the tokens resolve to.

| Token            | Dark        | Light       | Role                                |
| ---------------- | ----------- | ----------- | ----------------------------------- |
| `--bg`           | `#0a0a0a`   | `#f4efe9`   | Page and band background            |
| `--bg-raised`    | `#151514`   | `#e9e3da`   | Image placeholders, raised surfaces |
| `--fg`           | `#f4efe9`   | `#0c0c0b`   | Primary text                        |
| `--fg-muted`     | `#a8a39b`   | `#57534c`   | Secondary text, labels              |
| `--line`         | `fg` at 16% | `fg` at 16% | Hairlines and borders               |
| `--accent`       | `#ff5f1f`   | `#b03a0a`   | Accent text and small marks         |
| `--accent-solid` | `#ff5f1f`   | `#ff5f1f`   | Filled accent surfaces (buttons)    |
| `--on-accent`    | `#0a0a0a`   | `#0a0a0a`   | Text on `--accent-solid`            |

Orange is darkened for text on light surfaces, because `#ff5f1f` on cream is only 2.8:1.

### Tones and bands

| Class          | Palette                                    |
| -------------- | ------------------------------------------ |
| _(none)_       | Follows the active theme                   |
| `.tone-invert` | The opposite of the active theme           |
| `.tone-dark`   | Always dark (hero, page mastheads, footer) |
| `.tone-accent` | Solid orange, near-black text (contact)    |

Add `.band` to paint an element with its tone's background and text color. Every full-width section also sets `data-band="base | invert | dark | accent"`, which the header and the back-to-top button read to pick a matching tone.

Home page rhythm: dark hero → base (About, numbers) → inverted (Work) → base (Experience, Stack) → inverted (Recognition) → base (Testimonials) → accent (Contact) → dark footer.

### Contrast (WCAG 2.1)

Measured ratios for text pairs in use. All pass AA for normal text (4.5:1).

| Pair                              | Ratio |
| --------------------------------- | ----- |
| Dark: text on background          | 17.3  |
| Dark: muted on background         | 7.9   |
| Dark: accent on background        | 6.5   |
| Near-black on solid orange        | 6.5   |
| Light: text on background         | 17.1  |
| Light: muted on background        | 6.7   |
| Light: accent on background       | 5.3   |
| Light: accent on raised surface   | 4.8   |
| Accent band: muted text on orange | 5.1   |

## Typography

| Role                    | Font                  | Notes                                                          |
| ----------------------- | --------------------- | -------------------------------------------------------------- |
| Display, headings, body | Geist Sans (variable) | Loaded with `next/font`; weight 500 for headings, 400 for body |
| Labels, numbers, dates  | Geist Mono            | Uppercase, 12px, tracked +0.08em (`eyebrow`)                   |

Fluid scale (utilities in `globals.css`):

| Utility        | Size                               | Line height | Tracking |
| -------------- | ---------------------------------- | ----------- | -------- |
| `text-display` | `clamp(4.5rem, 13.4vw, 17rem)`     | 0.84        | -0.055em |
| `text-h1`      | `clamp(2.75rem, 7.6vw, 8.5rem)`    | 0.92        | -0.045em |
| `text-h2`      | `clamp(2.25rem, 5.4vw, 5.75rem)`   | 0.96        | -0.04em  |
| `text-h3`      | `clamp(1.5rem, 2.5vw, 2.5rem)`     | 1.08        | -0.03em  |
| `text-lead`    | `clamp(1.25rem, 1.85vw, 1.875rem)` | 1.32        | -0.02em  |
| `text-body`    | `clamp(1rem, 1.05vw, 1.125rem)`    | 1.6         | 0        |

Body text never goes below 16px. Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

## Layout

- `shell`: page gutter (20px, 32px from 640px, 48px from 1024px) with a 1792px maximum width.
- `section-y`: vertical padding of `clamp(5rem, 11vw, 11rem)`.
- 12-column grid from 768px. Labels sit in columns 1–3, content in 4–12.
- Each section opens with a `SectionHeader`: a hairline, a mono label with an optional `(01)` index, and a caption on the right.
- Corners: 12–20px on images, fully rounded on buttons and chips. No shadows except the floating work preview.
- Breakpoints checked: 375, 768, 1024, 1440.

## Motion

Library: framer-motion for all UI motion, Lenis for smooth scrolling, three.js for the hero.

| Token             | Value                            | Use                        |
| ----------------- | -------------------------------- | -------------------------- |
| `ease.out`        | `cubic-bezier(0.16, 1, 0.3, 1)`  | Anything entering          |
| `ease.inOut`      | `cubic-bezier(0.65, 0, 0.35, 1)` | Things that move on screen |
| `ease.in`         | `cubic-bezier(0.7, 0, 0.84, 0)`  | Exits                      |
| `duration.fast`   | 0.25s                            | Exits, hover feedback      |
| `duration.base`   | 0.6s                             | Standard transitions       |
| `duration.slow`   | 0.9s                             | Reveals                    |
| `duration.slower` | 1.2s                             | Large, slow moves          |
| `stagger`         | 0.04 / 0.08 / 0.14s              | Words / items / blocks     |

Rules:

1. **Motion has to mean something.** Reveals mark new content; scroll-linked effects show progress. At most one or two moving things per screen.
2. **Animate only `transform` and `opacity`.** The one exception is accordion height, because content below has to make room.
3. **Exits are faster than entrances.**
4. **Reduced motion is honored everywhere.** With `prefers-reduced-motion: reduce`: no smooth scrolling, no parallax, no 3D scene, no liquid portrait, no marquee; reveals become simple fades and content is shown in its final state.
5. **Nothing depends on hover.** Every hover effect has a focus or always-visible equivalent (the work preview becomes inline images on touch screens).
6. **Moving content can be paused.** The stack marquee has a pause button and stops off screen.
7. **The largest element paints first.** The hero name and inner-page titles use CSS animations that start at first paint, so they don't wait for JavaScript.

### Building blocks (`src/components/motion`)

| Component                             | Effect                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Reveal`, `RevealGroup`, `RevealItem` | Fade up on scroll, optionally staggered                                                                        |
| `TextReveal`                          | Words rise out of a mask                                                                                       |
| `ScrollWords`                         | Words brighten as you scroll through a paragraph. Unlit words stay at 60% opacity, so they still pass contrast |
| `Counter`                             | Number counts up when it enters view                                                                           |
| `Parallax`                            | Image drifts inside its frame                                                                                  |
| `LiquidImage`                         | Photo that smears behind the pointer or finger like a liquid, then settles. Used for the About portrait        |
| `Marquee`                             | Endless ticker that speeds up with scroll                                                                      |
| `Magnetic`                            | Element leans toward the cursor                                                                                |

## The 3D hero

An original scene: an orange core inside three glass gimbal rings, with small glass shapes in orbit.

- Turns to face the cursor or finger on springs, the rings swinging slightly behind; nearby orbiting pieces are drawn toward the pointer and the core glows as it gets close.
- A flick or sideways swipe spins it; a tap or click sends a pulse through it.
- Follows the phone's tilt. iPhones show a "Turn on tilt" button above the hero text (not on screens under 620 px tall, where it does not fit).
- Never blocks scrolling: all listeners are passive.
- Drifts apart as the page scrolls.
- Loaded lazily in the browser, once the page has loaded and is idle. The server sends a CSS drawing of the same artwork, which shows first and stays as the fallback.
- Phone-sized screens get a lighter version: lower pixel density, no rainbow fringe on the glass, less geometry.
- Skipped for: reduced motion, data-saver mode, devices reporting very little memory, missing or software-rendered WebGL 2.
- Watches its own frame rate: first lowers pixel density, then gives way to the CSS artwork if it is still slow.
- Stops rendering once the hero is scrolled out of view.

## Accessibility

- One `<h1>` per page; sections are labelled landmarks.
- Skip link to main content.
- Visible focus ring (2px accent outline) on every interactive element.
- Touch targets are at least 44×44px.
- Icons are decorative and always paired with text; external links announce that they open a new tab.
- The mobile menu traps the rest of the page with `inert`, closes on Escape and returns focus to its button.

## Avoid

- Raw hex colors in components. Use tokens.
- Emoji as icons. Use Lucide or Simple Icons.
- More than one accent color.
- Animating layout properties, or one duration for everything.
- Text over busy imagery without a tone-aware backdrop.

## Pre-delivery checklist

- [ ] No emoji used as icons
- [ ] `cursor: pointer` on everything clickable
- [ ] Hover states with smooth transitions
- [ ] Text contrast at least 4.5:1 in both themes
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375, 768, 1024 and 1440px
- [ ] No horizontal scroll at any width
- [ ] Images sized, lazy-loaded below the fold, served as AVIF or WebP
