import { profile } from "@/content/site";

/**
 * One day, in the order it happens. Scrolling moves through these: the camera
 * flies between `cam` shots, the clock and the light follow `hour`, and
 * `zone` decides which version of Atharv is on stage.
 */

export type Zone = "ride" | "intro" | "run" | "hiit" | "recovery" | "cook" | "build" | "clients" | "post" | "network" | "outro" | "os";

export interface Chapter {
  zone: Zone;
  hour: number;
  place: string;
  pill: string;
  title: string;
  text: string;
  cta?: { label: string; href: string };
  /** The day's quest this moment completes, for the game HUD. */
  quest?: { label: string; xp: number };
  /** Camera position and look-at target, world units. */
  cam: [number, number, number];
  look: [number, number, number];
}

export const CHAPTERS: Chapter[] = [
  {
    zone: "intro",
    quest: { label: "Wake up in Bali", xp: 50 },
    hour: 6,
    place: "Villa",
    pill: "Morning",
    title: "Good morning, Bali.",
    text: "This is one day in my life, from the first run to the last conversation. Scroll to spend it with me.",
    cam: [17, 12.5, 19],
    look: [0, 3.4, 0],
  },
  {
    zone: "run",
    quest: { label: "Sunrise run, 5 km", xp: 120 },
    hour: 6.5,
    place: "Beach",
    pill: "Run",
    title: "The run comes first",
    text: "Sunrise on the black sand, before any inbox opens. Most of my best product ideas show up somewhere around the third kilometre.",
    cam: [171.5, 0.35, 14],
    look: [174.5, -0.4, -4],
  },
  {
    zone: "hiit",
    quest: { label: "HIIT with Kwame", xp: 150 },
    hour: 7.5,
    place: "Gym bale",
    pill: "HIIT",
    title: "Then the hard part",
    text: "A short HIIT session in the open-air gym by the pool. Thirty minutes that make the other sixteen hours feel easy.",
    cam: [6.6, 2.5, 7.4],
    look: [11.6, 0.9, 0.2],
  },
  {
    zone: "recovery",
    quest: { label: "3 minutes in the ice", xp: 100 },
    hour: 8.25,
    place: "Wellness deck",
    pill: "Ice",
    title: "Ice, then fire",
    text: "Three minutes in the ice bath, fifteen in the sauna. The cold makes the rest of the day feel easy.",
    cam: [15.2, 1.8, -3.5],
    look: [12.4, 0.65, -7.3],
  },
  {
    zone: "cook",
    quest: { label: "Cook a clean breakfast", xp: 80 },
    hour: 9,
    place: "Kitchen",
    pill: "Cook",
    title: "Fuel, cooked at home",
    text: "I cook my own food: high protein, simple, done in twenty minutes. Building a company is a long game, and so is eating well.",
    cam: [-0.55, 2.5, 5.7],
    look: [-3.2, 1.3, -1.1],
  },
  {
    zone: "build",
    quest: { label: "Ship a feature", xp: 250 },
    hour: 11.5,
    place: "Studio",
    pill: "Build",
    title: "Deep work at VelyxLabs",
    text: "This is where VelyxLabs happens, looking out over the rice fields: AI agents, SaaS products and websites for founders. 50+ products shipped, 30+ agents in production.",
    cta: { label: "See my work", href: "https://www.velyxlabs.in/work" },
    cam: [1.6, 5.55, 5.8],
    look: [-3.1, 4.75, -1.9],
  },
  {
    zone: "clients",
    quest: { label: "Pool mastermind", xp: 300 },
    hour: 14.5,
    place: "Pool",
    pill: "Mastermind",
    title: "Deals happen in the pool",
    text: "Afternoon masterminds with founders: what we're building, what's breaking, who needs an intro. Half the deals here start waist-deep.",
    cta: { label: "Book a call", href: profile.booking },
    cam: [2.6, 2.3, 12.9],
    look: [6.5, -0.35, 8.3],
  },
  {
    zone: "post",
    quest: { label: "Post on X", xp: 120 },
    hour: 18,
    place: "Living room",
    pill: "Post",
    title: "Building in public",
    text: "I write about what I build on X, every day: what worked, what broke, and what I'd do differently.",
    cta: { label: "Follow on X", href: "https://x.com/Atharv_Golait" },
    cam: [3.3, 1.75, 8.6],
    look: [3.2, 2.35, -1.5],
  },
  {
    zone: "network",
    quest: { label: "Meet three founders", xp: 200 },
    hour: 20.5,
    place: "Rooftop",
    pill: "People",
    title: "Then, people",
    text: "Evenings are for meeting people up on the roof: founders, builders, anyone working on something they care about.",
    cam: [7.0, 9.7, 8.4],
    look: [3.2, 8.0, -0.4],
  },
  {
    zone: "outro",
    quest: { label: "Close the day", xp: 150 },
    hour: 23,
    place: "Villa",
    pill: "Night",
    title: "Same again tomorrow.",
    text: "If you're building something and want a partner who ships, let's talk.",
    cta: { label: "Book a call", href: profile.booking },
    cam: [17, 13, 19],
    look: [0, 3.4, 0],
  },
  {
    zone: "os",
    hour: 23.5,
    place: "Studio",
    pill: "Laptop",
    title: "Open my laptop",
    text: "Everything else lives in here: my story, the work, and a way to reach me.",
    cam: [-3, 4.72, -3.5],
    look: [-3, 4.48, -2.36],
  },
];

/** "06:30" style clock text for a fractional hour. */
export function clock(hour: number) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour - Math.floor(hour)) * 60);
  const h12 = h % 12 || 12;
  return { time: `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}`, ampm: h < 12 ? "AM" : "PM" };
}
