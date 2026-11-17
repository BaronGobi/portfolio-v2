# Architecture

A map of the codebase for anyone picking it up: what lives where, and the few ideas that are not obvious from reading a single file.

For visual rules (color, type, motion), see [`design-system/baron-portfolio/MASTER.md`](../design-system/baron-portfolio/MASTER.md).

## Stack

| Layer     | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | Next.js 16, App Router, Turbopack, Cache Components |
| UI        | React 19, TypeScript (strict)                       |
| Styling   | Tailwind CSS 4, tokens as CSS variables             |
| Motion    | framer-motion, Lenis                                |
| 3D        | three.js, React Three Fiber, drei                   |
| Icons     | Simple Icons (brands), Lucide (interface)           |

## Folders

```
src/
  app/                    Routes and metadata files
    layout.tsx            Fonts, theme script, header, footer
    page.tsx              Home page
    resume/page.tsx       Full resume
    work/[slug]/page.tsx  One page per project
    not-found.tsx         404
    opengraph-image.tsx   Social card (generated at build)
    tech-icons.svg/       SVG sprite of technology logos
    apple-icon.tsx, icon.svg, sitemap.ts, robots.ts
    globals.css           Design tokens and utilities
  components/
    hero/                 Hero wrapper, 3D scene, CSS fallback
    layout/               Header, Footer, PageMasthead, SmoothScroll, ...
    motion/               Animation building blocks
    sections/             Home page sections, in page order
    ui/                   Chip, ArrowLink, Accordion, TechIcon, ...
  content/                All copy and data (see docs/content-guide.md)
  lib/                    motion tokens, hooks, band helper, utilities
public/                   Images and the resume PDF
design-system/            Design rules
docs/                     These guides
```

## Routes

| Route                                                                               | Rendering                                                            |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `/`                                                                                 | Static                                                               |
| `/resume`                                                                           | Static                                                               |
| `/work/[slug]`                                                                      | Static, one page per entry in `projects.ts` (`generateStaticParams`) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/apple-icon`, `/tech-icons.svg` | Static, generated at build                                           |

There is no database, API or server-side data fetching. Content is imported from `src/content/`.

## Ideas worth knowing

### Server components by default

Pages and sections are server components. Only the pieces that need the browser are client components (`"use client"`): the motion building blocks, the header, the hero, the About portrait panel and the accordion. Server-rendered content is passed into them as `children`, so the text stays in the HTML.

### Tones and bands

Colors are semantic tokens (`bg`, `fg`, `muted`, `line`, `accent`). A tone class (`tone-dark`, `tone-invert`, `tone-accent`) re-points those tokens for everything inside it, so a component looks right on any background without knowing which one it is on.

Every full-width section also carries `data-band`. The header and the back-to-top button call `bandAt(y)` from `src/lib/band.ts` to find the section behind them, and take its tone. A band can sit inside another one: the About portrait panel is a dark band inside the About section, which is why the header turns light while the photo is behind it, even in the light theme.

### Theme

`<html>` carries `data-theme="dark" | "light"`. A small inline script in the layout sets it before first paint from the saved choice, or the system setting. The toggle only changes that attribute and saves it; no React state is involved, so there is nothing to mismatch during hydration.

### The hero

`Hero.tsx` renders a fixed, full-screen section and, in normal flow, an empty "track" of the same height. The rest of the page sits above the hero and slides over it. Scroll progress through the track drives the text parallax and the 3D scene.

`HeroScene.tsx` (three.js) is loaded with `next/dynamic` and `ssr: false`, once the page has loaded and the browser is idle. `HeroFallback.tsx` is a CSS drawing of the same artwork, sent by the server; it shows first and remains when 3D is skipped.

The live scene is skipped for reduced motion, data-saver mode, devices that report 2 GB of memory or less, and when WebGL 2 is missing or software-rendered. Phone-sized screens get a lighter version (`lite`: lower pixel density, no dispersion, less geometry). A frame-rate guard inside the scene lowers the pixel density if it runs below 24 fps, then hands back to the fallback if that is not enough. Add `?3d=force` to the URL to bypass the device checks while debugging.

#### Interaction

The canvas sits under the hero text, so it never receives events itself. `sceneInput.ts` listens on the window instead, with passive listeners only, so scrolling is never blocked. Each frame the scene reads the latest position and takes the flicks and taps gathered since the frame before.

- What it looks at: the mouse or finger when there is one; else a point set by the phone's tilt; else a slow drift around its centre. It turns toward that point on springs (`TURN_SPRING`), with the rings on looser springs so they lag and swing.
- Mouse and pen use pointer events. Fingers use touch events, because browsers cancel pointer events once a touch starts scrolling the page. Taps and touches count only inside the hero (`data-hero-area`), so the menu and the rest of the page are unaffected.
- Flicks: only fast movement spins the scene. With a mouse it must also cross the cluster, so a quick move toward the menu does nothing.
- Tilt: measured against a resting position that slowly follows the way the phone is held, so any grip counts as level. `tilt.ts` decides whether it may be used. Android reports orientation without asking. iPhones need a tap on "Turn on tilt" and the system prompt. Newer Chrome also has iPhone-style `requestPermission()` but keeps reporting without it, so the button only appears when no readings arrive. The button is left out on screens under 620 px tall, where it would run into the header. The sensor is switched off while the hero is out of view.
- Most of the feel is set by the constants at the top of the `Cluster` section of `HeroScene.tsx` (`TURN_SIDEWAYS`, `FLICK_SPIN`, `PULL` and so on).

### The liquid portrait

`AboutPortrait.tsx` is the photo panel in the About section. The photo itself is `LiquidImage` (`src/components/motion`): an ordinary `next/image`, with a WebGL canvas on top that is only visible while the surface is moving.

`liquid.ts` holds the WebGL code. It is plain WebGL 1 with no library, so it works on every phone and adds under 4 kB (compressed), loaded on demand shortly before the photo scrolls into view. A small texture stores how fast the surface is moving at each point; the pointer writes its velocity into it, and each frame the flow carries itself along, blurs slightly and fades. A second pass draws the photo displaced by that flow. The loop stops about two seconds after the last input, and the canvas hides again.

- Mouse: movement over the panel stirs the photo. Text laid over the photo counts too, because the panel carries `data-liquid-area`.
- Touch: the photo follows the finger and ripples on a tap. Touch events are used instead of pointer events, because browsers cancel pointer events once a touch starts scrolling. Since there is no hover on a phone, one gentle stroke plays by itself the first time the photo is on screen.
- Reduced motion, or no WebGL: the plain image stays and nothing else loads.
- The flow uses half-float textures where the device can draw into them and 8-bit textures otherwise. If the first frames are slow, the canvas resolution is halved once.

### framer-motion: use `m`, not `motion`

`Providers.tsx` wraps the app in `LazyMotion` with the `domAnimation` feature set, which leaves drag and layout animation out of the bundle. Components therefore use `m.div`, `m.span` and so on. `LazyMotion` is in `strict` mode, so a stray `motion.div` throws an error instead of quietly pulling the full library back in.

### Smooth scrolling

`SmoothScroll.tsx` imports and starts Lenis only after the page has loaded and the browser is idle. Until then, and for visitors who prefer reduced motion, the page scrolls natively. Use `scrollToTarget()` and `setScrollLocked()` from that file instead of calling Lenis directly; they work in both cases.

### Hydration in sections

On the home page each section is wrapped in its own `<Suspense>` boundary. Nothing in them suspends. The boundaries let React hydrate the page section by section instead of in one long task.

### Technology icons

Brand logos are not inlined in the HTML. `src/components/ui/tech-icons.ts` builds one SVG sprite, served by `app/tech-icons.svg/route.ts`, and `TechIcon` references it with `<use>`. The URL carries a content hash, so the sprite is cached until the icon set changes.

### Reduced motion

Three layers:

1. `MotionConfig reducedMotion="user"` (in `Providers.tsx`) makes framer-motion skip movement and keep fades.
2. Scroll-linked effects check `usePrefersReducedMotion()` themselves, because they are not animations framer can switch off.
3. CSS animations are neutralised by a media query in `globals.css`.

Hooks that read browser state (`useMediaQuery`, `useHydrated`) use `useSyncExternalStore` with a server value, so server and client render the same markup first.

### Cache Components

`next.config.ts` enables Cache Components. Two consequences in this codebase:

- Server components must not read the clock. The copyright year is a small client component (`CopyrightYear`).
- A missing project calls `notFound()` after streaming has started, so it returns HTTP 200 with `noindex` (see `docs/deployment.md`).

## Conventions

- Import with the `@/` alias (`@/components/...`, `@/content/...`).
- One component per file; the file name matches the component.
- Use tokens and the type utilities (`text-h2`, `eyebrow`, `shell`, `section-y`) instead of one-off values.
- New motion goes through `src/lib/motion.ts` tokens.
- Before writing Next.js code, check the docs that ship with the installed version in `node_modules/next/dist/docs/` (see `AGENTS.md`).
