import type { Recognition, Stat, Testimonial } from "./types";

/** "In numbers" band. Every figure comes from the experience and education copy. */
export const stats: Stat[] = [
  {
    value: 90,
    suffix: "+",
    label: "PageSpeed score",
    detail: "Up from 65+ on a Magento 2 PWA, for mobile and desktop.",
  },
  {
    value: 8000,
    suffix: "+",
    label: "Registrants",
    detail: "Recorded by the PPI Edufest registration platform.",
  },
  {
    value: 100,
    suffix: "+",
    label: "Speakers hosted",
    detail: "Across 40+ agendas on a single event website.",
  },
  {
    value: 3.88,
    decimals: 2,
    suffix: "/4",
    label: "GPA",
    detail: "B.Cs. in Software Engineering, on the dean's list every semester.",
  },
];

export const recognition: Recognition[] = [
  {
    title: "Certified Professional Magento 2 Developer",
    detail: "Back end and front end, with PHP and JS (React)",
    tag: "Certification",
  },
  {
    title: "Best International Student 2022",
    detail: "Faculty award, University Technology of Malaysia",
    tag: "Award",
  },
  {
    title: "Dean's List, every semester",
    detail: "While maintaining a GPA above 3.5 and serving in a non-profit",
    tag: "Academic",
  },
  {
    title: "Runner-up, university badminton competition",
    detail: "Still on court two to three times a week",
    tag: "Sport",
  },
  {
    title: "Director of Event, Computing Test Preparation",
    detail: "International Student Society of Indonesia UTM, 2019–2020",
    tag: "Leadership",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Baron was an outstanding member of our team when he served as the project lead for our PPI Edufest website. His exceptional skills and dedication were noticeable when working in our team, especially in the creation of a very good website that exceeded our expectations. Baron is also known for his diligence as he consistently met the deadlines and ensured the success of our projects. His commitment is remarkable and his work ethic is the key factor that sets him apart from the other team members. Overall, Baron is a very good team player and a friend which would make him an invaluable asset wherever he works.",
    name: "Zafran Akhmadery Arif",
    title: "Secretary-General of PPI Se-Dunia",
    image: {
      src: "/images/testimonials/zafran.webp",
      alt: "Portrait of Zafran Akhmadery Arif",
    },
  },
];
