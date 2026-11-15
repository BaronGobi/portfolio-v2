import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "rareseeds-amasty-advanced-review",
    title: "Amasty Advanced Review Integration on Rareseeds",
    shortTitle: "Rareseeds Reviews",
    kind: "E-commerce · Magento 2 · ScandiPWA",
    summary:
      "Making the Amasty Advanced Review extension work with a React-based ScandiPWA storefront through new GraphQL endpoints.",
    description: [
      "Amasty Advanced Review did not support ScandiPWA (a React-based PWA) for its implementation on the Rareseeds project. My responsibility was to provide compatibility between Amasty Advanced Review and ScandiPWA via GraphQL, and to create new endpoints to support what the front-end implementation needed, such as queries.",
      "On top of that, I created components and containers via plugins to present the data from the back end, and implemented the compatibility features: filtering, voting up and down, writing a comment on a specific product review, uploading images on a review, and star summary calculation.",
    ],
    image: {
      src: "/images/projects/Rareseeds.webp",
      alt: "Screenshot of the Rareseeds product review section",
      width: 1529,
      height: 1279,
    },
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "Magento 2",
      "PHP",
      "MySQL",
      "React",
      "Docker",
      "Ubuntu Linux",
      "Elasticsearch",
      "SCSS",
      "API",
      "AWS",
    ],
    links: [
      {
        label: "Visit Website",
        href: "https://www.rareseeds.com/ageratum-leda",
      },
    ],
  },
  {
    slug: "vaping-image-optimization",
    title: "Image Optimization on vaping.com",
    shortTitle: "vaping.com Performance",
    kind: "Performance · Fastly CDN",
    summary:
      "Optimizing image loading with the Fastly CDN and lazy loading, reaching a 90+ Google PageSpeed score on desktop.",
    description: [
      "This project needed its image loading optimized. The Fastly CDN and lazy loading were put in place to do it.",
      "As a result of my contribution to optimizing image loading on desktop devices, the site reached a 90+ score on Google PageSpeed.",
    ],
    image: {
      src: "/images/projects/pagespeed.webp",
      alt: "Screenshot of the vaping.com PageSpeed Insights results",
      width: 1280,
      height: 1286,
    },
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "Magento 2",
      "PHP",
      "MySQL",
      "React",
      "Docker",
      "Ubuntu Linux",
      "Elasticsearch",
      "SCSS",
    ],
    links: [
      {
        label: "Visit Website",
        href: "https://vaping.com/",
      },
    ],
  },
  {
    slug: "ppi-edufest-2022",
    title: "PPI Edufest 2022",
    shortTitle: "PPI Edufest 2022",
    kind: "Event platform · Laravel · REST API",
    summary:
      "An event registration website integrated with Google Drive and Google Forms, with a REST API any front end can consume.",
    description: [
      "An event registration website designed using Bootstrap, HTML, PHP Laravel, JavaScript, and a hint of jQuery. The project involves the integration of Google APIs (Drive and Forms) and provides REST API endpoints that can be consumed by any front end.",
      "The project has since been dropped because the management was replaced. However, its documentation has been uploaded to YouTube, and the link is attached.",
    ],
    image: {
      src: "/images/projects/ppi-edufest-2022.webp",
      alt: "Screenshot of the PPI Edufest 2022 home page",
      width: 1242,
      height: 583,
    },
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "jQuery",
      "PHP",
      "Laravel",
      "MySQL",
      "Navicat",
      "Bootstrap",
      "Postman",
      "REST API",
    ],
    links: [
      {
        label: "Watch the Documentation",
        href: "https://youtu.be/dVHelEadSYQ?si=dHKC_o9tuZze2J24",
      },
      {
        label: "Visit GitHub Project",
        href: "https://github.com/Barongobber/ppi_edufest_2022",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
