import type { Education, Experience } from "./types";

/** Professional experience, newest first. */
export const workExperience: Experience[] = [
  {
    company: "Tomato Co., Ltd.",
    location: "Tokyo, Japan",
    positions: [{ title: "Website Developer", start: "2024-04", end: null }],
    tasks: ["Attending practical Angular training."],
  },
  {
    company: "Scandiweb",
    location: "Remote · Riga, Latvia",
    positions: [{ title: "Web Developer", start: "2022-03", end: "2024-02" }],
    tasks: [
      "Improved PWA utilization (using ScandiPWA, which is based on React.js) in a PHP Magento 2 application, which raised the Google PageSpeed Insights score from 65+ to 90+ for mobile and desktop.",
      "Established a new stuck-order reminder feature in PHP Magento 2 that emails the store's customer service so they can proceed with stuck orders manually in production.",
      "Worked with CMA (Create Magento App), which runs Docker containers for all prerequisites of the Magento 2 application (including Redis, Elasticsearch, Nginx, and MariaDB).",
      "Developed front-end PWA compatibility for third-party extension modules such as Amasty Shop by Brand, Amasty Product Labels, Amasty Advanced Review, and Mageplaza Free Gift, and published them on the marketplace.",
      "Maximized the use of the Fastly CDN to generate the desired photo size based on the user's device, resulting in a 5–10% improvement in loading time and data consumption efficiency.",
    ],
  },
  {
    company: "OISAA – Edufest",
    location: "Jakarta, Indonesia",
    positions: [
      {
        title: "Full-Stack Developer & Head of IT Division",
        start: "2020-12",
        end: "2022-06",
      },
    ],
    tasks: [
      "Initiated the procurement of the Education Festival registration website and integrated it with Google services such as Google Forms and Google Drive, which made the event known and accessible to residents in all regions of Indonesia.",
      "Designed the MySQL database using Navicat up to the external level and generated it using PHP Laravel Eloquent, so that different users see the database in different ways depending on their roles in the event.",
      "Launched an event registration website system built primarily with Bootstrap, jQuery, HTML, PHP Laravel, and MySQL that can hold 40+ agendas along with 100+ speakers, and recorded 8,000+ registrants.",
      "Created an artificial intelligence service using the Google API and a PHP library that generated the list of participants eligible for a certificate based on attendance at the online event, tested as 100% reliable.",
      "Supervised a team of 4 members to execute website development and produced the budgeting, resulting in 90% on-time deliverables using Jira Kanban boards and 80% cost savings using GitHub Student Developer Pack privileges.",
    ],
  },
];

/** Shown under "Organizations" on the resume page. */
export const organizations: Experience[] = [
  {
    company: "International Student Society of Indonesia UTM",
    location: "Johor Bahru, Malaysia",
    positions: [
      {
        title: "Director of Event of Computing Test Preparation",
        start: "2019-10",
        end: "2020-02",
      },
    ],
    tasks: [
      "Led the event committee and collaborated with final-year students to run mentoring sessions, with 90% of attendees passing the subject being taught.",
      "Spearheaded event information among Indonesian students on campus using Instagram and the wall magazine as the main platforms, resulting in 100+ registrants and 60+ attendees, all Indonesians.",
      "Mentored freshman and sophomore students in the digital logic and programming technique subjects, decreasing the number of Indonesian students repeating those subjects by 80%.",
    ],
  },
];

export const education: Education[] = [
  {
    degree: "B.Cs. in Software Engineering",
    school: "University Technology of Malaysia",
    location: "Johor Bahru, Malaysia",
    start: "2019-02",
    end: "2024-03",
    grade: "3.88/4",
  },
];
