import type { SkillCategory } from "./types";

/**
 * Technical skills by category.
 * A skill gets a logo when its name has an entry in
 * `src/components/ui/TechIcon.tsx`; otherwise it falls back to a generic icon.
 */
export const techSkills: SkillCategory[] = [
  {
    category: "Front-End Development",
    skills: [
      "HTML",
      "CSS",
      "Bootstrap",
      "JavaScript",
      "React",
      "jQuery",
      "Angular",
      "SCSS",
    ],
  },
  {
    category: "Back-End Development",
    skills: ["PHP", "Magento 2", "MySQL", "Laravel", "Elasticsearch"],
  },
  {
    category: "Programming Languages",
    skills: ["Java", "C++", "TypeScript", "JavaScript", "PHP"],
  },
  {
    category: "Content Management Systems",
    skills: ["WordPress", "Magento 2"],
  },
  {
    category: "Build Tools, Frameworks, and Versioning",
    skills: [
      "Git",
      "Docker",
      "GitHub",
      "Navicat",
      "Laravel",
      "Angular",
      "React",
      "Postman",
      "Linux Ubuntu",
      "Jira",
    ],
  },
  {
    category: "Design and Prototyping",
    skills: ["Responsive Design", "Figma", "Bootstrap Studio"],
  },
  {
    category: "Others",
    skills: ["APIs", "REST APIs"],
  },
];

export const softSkills: string[] = [
  "Creativity",
  "Teamwork",
  "Public Speaking",
  "Time Management",
];

/** Logos that scroll past in the Stack marquee (each tech once). */
export const marqueeStack: string[] = [
  "PHP",
  "Magento 2",
  "React",
  "JavaScript",
  "TypeScript",
  "Laravel",
  "MySQL",
  "Docker",
  "Elasticsearch",
  "Angular",
  "SCSS",
  "Git",
  "WordPress",
  "Figma",
  "Postman",
  "Jira",
];
