import React from "react";

type Expert = {
  name: string;
  image: string;
  website: string | null;
  description: React.ReactNode;
  twitter: React.ReactNode;
  github: React.ReactNode;
  linkedin: React.ReactNode;
  email: React.ReactNode;
};

export const experts: Expert[] = [
  {
    name: "Marcus Stenbeck",
    image: "/img/freelancers/marcus.jpeg",
    twitter: "marcusstenbeck",
    github: "marcusstenbeck",
    linkedin: "in/mstenbeck/",
    email: "marcus.stenbeck+remotionexpert@gmail.com",
    description: (
      <div>
        <p>
          Creator of{" "}
          <a target={"_blank"} href="https://github.com/marcusstenbeck/remotion-template-audiogram">
            Remotion{"'"}s Audiogram template
          </a>
          <br />I make templates, libraries and educational content at {" "}
          <a
            target={"_blank"}
            href="https://remotionkit.com"
          >
            remotionkit.com
          </a>
          {"."}
        </p>
      </div>
    ),
    website: null,
  },
  {
    name: "Florent Pergoud",
    image: "/img/freelancers/florent.jpeg",
    website: null,
    twitter: "florentpergoud",
    github: "florentpergoud",
    linkedin: "in/florent-pergoud/",
    email: "florentpergoud@gmail.com",
    description: (
      <div>
        I made:{" "}
        <a
          target={"_blank"}
          href="https://florentpergoud.notion.site/Florent-Pergoud-s-Remotion-showcase-b0ef4299d389401aab21bbc62516cafe"
        >
          Hello Météo, HugoDécrypteSport, Crowdfunding VFB, Cinéma Le Vincennes
          and Piano MIDI visualizer
        </a>
        !
      </div>
    ),
  },
  {
    name: "Stephen Sullivan",
    image: "/img/freelancers/stephen.png",
    website: null,
    twitter: null,
    github: null,
    linkedin: "in/sterv/",
    email: "stephen@middy.com",
    description: (
      <div>
        I made:{" "}
        <a target={"_blank"} href="https://middy.com">
          https://middy.com
        </a>
        !
      </div>
    ),
  },
  {
    name: "Mohit Yadav",
    image: "/img/freelancers/mohit.jpeg",
    website: null,
    twitter: "Just_Moh_it",
    github: "Just-Moh-it",
    linkedin: "in/just-moh-it/",
    email: "yo@mohitya.dev",
    description: (
      <div>
        I made:{" "}
        <a target={"_blank"} href="https://mockoops.mohitya.dev">
          Mockoops
        </a>
        ! <br />
        My services: SaaS platform from scratch including SSR, creating
        individual videos and templates, and creating integrations for remotion
        with existing infrastructure <br />
        Availability: 4 to 5 hours/day on weekdays, 5 to 6 hours/day on weekends{" "}
      </div>
    ),
  },
  {
    name: "Karel Nagel",
    image: "/img/freelancers/karel.png",
    website: "https://karel.wtf",
    twitter: "KarelETH",
    github: "karelnagel",
    linkedin: "in/karelnagel/",
    email: "karel@karel.wtf",
    description: (
      <div>
        I made:{" "}
        <a target={"_blank"} href="https://www.karel.wtf">
          TikTok automation, ENS video
        </a>{" "}
        and many more!
      </div>
    ),
  },
];
