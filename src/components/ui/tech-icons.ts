import {
  siAngular,
  siBootstrap,
  siCplusplus,
  siCss,
  siDocker,
  siElasticsearch,
  siFigma,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siJira,
  siJquery,
  siLaravel,
  siMysql,
  siOpenjdk,
  siPhp,
  siPostman,
  siReact,
  siSass,
  siTypescript,
  siUbuntu,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

/**
 * Brand logos, keyed by the lowercase technology name used in `src/content`.
 *
 * To support a new technology, import its icon from `simple-icons` and add a
 * line here. Names without an entry fall back to a generic icon (see
 * `TechIcon.tsx`).
 */
export const brandIcons: Record<string, SimpleIcon> = {
  html: siHtml5,
  css: siCss,
  javascript: siJavascript,
  typescript: siTypescript,
  react: siReact,
  angular: siAngular,
  jquery: siJquery,
  bootstrap: siBootstrap,
  "bootstrap studio": siBootstrap,
  scss: siSass,
  php: siPhp,
  laravel: siLaravel,
  mysql: siMysql,
  elasticsearch: siElasticsearch,
  docker: siDocker,
  "ubuntu linux": siUbuntu,
  "linux ubuntu": siUbuntu,
  git: siGit,
  github: siGithub,
  postman: siPostman,
  jira: siJira,
  figma: siFigma,
  wordpress: siWordpress,
  java: siOpenjdk,
  "c++": siCplusplus,
};

/** Each logo once, even when several names share it. */
const uniqueIcons = [
  ...new Map(Object.values(brandIcons).map((icon) => [icon.slug, icon])).values(),
];

/**
 * All brand logos as one SVG sprite. It is served from `/tech-icons.svg` and
 * referenced with `<use>`, so each logo's path data is downloaded once and
 * cached, instead of being repeated in the HTML every time a logo appears.
 */
export const techSprite = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  ...uniqueIcons.map(
    (icon) =>
      `<symbol id="${icon.slug}" viewBox="0 0 24 24"><path d="${icon.path}"/></symbol>`,
  ),
  "</svg>",
].join("");

/** Short content hash, so browsers refetch the sprite only when it changes. */
function hash(text: string): string {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(36);
}

const spriteUrl = `/tech-icons.svg?v=${hash(techSprite)}`;

/** URL of one logo inside the sprite, for `<use href>`. */
export function spriteHref(icon: SimpleIcon): string {
  return `${spriteUrl}#${icon.slug}`;
}
