import type { Social } from "./types";

export const profile = {
  name: "Baron Gobi",
  firstName: "Baron",
  lastName: "Gobi",
  fullName: "Baron Gobi Ramadhan Natanegara",
  nickname: "Rons",
  role: "Full-Stack Web Developer",
  location: "Tokyo, Japan",
  email: "barongobirn@gmail.com",

  /** Hero headline. */
  tagline: "Turn imagination into reality on your website.",

  /** Opening paragraph of the About section. */
  intro:
    "Heyyo! Call me Baron or Rons, a certified Professional Magento 2 Developer with a huge amount of experience developing both back end and front end using PHP and JS (React).",

  introDetail:
    "Building PHP-based websites and React interfaces is my main weapon. Understanding what users want through requirements elicitation, documenting their needs, planning, designing software system requirements, and meeting their expectations is all in a day's work.",

  /** Longer About copy, one string per paragraph. */
  about: [
    "I'm currently working in Shibuya, Tokyo, which is known as the Silicon Valley of Japan.",
    "I hold a B.Cs. in Software Engineering from the University Technology of Malaysia. I previously worked remotely from Indonesia for a company in Latvia as an e-commerce web developer. My tasks were mostly about integrating third-party apps, slicing interfaces, and improving website performance. So dealing with APIs for integration, front-end tasks, and paying attention to the details are my daily activities.",
    "Outside of coding, I was actively involved in the community during my undergraduate studies, which made me realize how important broad and diverse connections abroad are as an asset for the future. I also play badminton two to three times a week to stay healthy, and surprisingly managed to secure a runner-up position in one of my university's competitions.",
    "Craving something new and achieving more than expected are my big punches. That is what I am always trying to be. As evidence, although maintaining a GPA above 3.5 was hard, I still made the dean's list every semester while being involved in a non-profit organization. On top of that, I secured an award from the faculty as their best international student of 2022. That was a remarkable journey for me.",
  ],

  portrait: {
    src: "/images/profile/rons.webp",
    alt: "Baron Gobi standing in an event hall, wearing a maroon sweater",
    width: 1600,
    height: 1600,
  },

  resume: {
    href: "/Baron-Resume.pdf",
    label: "View Resume (PDF)",
    note: "If you wish to have a copy of my resume, please click below.",
  },

  contact: {
    heading: "Let's chat!",
    prompt: "Are you ready to unlock your dream website?",
  },
} as const;

export const socials: Social[] = [
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    handle: profile.email,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/barongobirn/",
    handle: "/in/barongobirn",
  },
  {
    label: "GitHub",
    href: "https://github.com/Barongobber",
    handle: "@Barongobber",
  },
];
