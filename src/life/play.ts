/**
 * "Live it": Atharv's day as a small game. You walk the villa, ride the
 * scooter, take the jet ski out, and stop at stations from the story. An
 * arcade model, not a simulation: each mode has its own speeds and its own
 * idea of where you can go. Coordinates are three.js world units (metres).
 */

export type Mode = "walk" | "scooter" | "jetski";

export interface Parked {
  x: number;
  z: number;
  yaw: number;
}

export interface PlayState {
  mode: Mode;
  x: number;
  z: number;
  y: number;
  yaw: number;
  speed: number;
  steer: number;
  lean: number;
  /** Wheel spin, or the stride phase on foot. */
  wheel: number;
  /** A station's moment in progress (a story zone), and its timer. */
  action: string | null;
  actionT: number;
  scooter: Parked;
  jetski: Parked;
  /** Waist-deep in the pool. */
  wading: boolean;
}

export interface PlayInput {
  throttle: number; // -1..1
  steer: number; // -1..1, positive turns left
  run: boolean;
  /** On foot: where to walk, in world space, already turned by the camera. Length 0..1. */
  moveX?: number;
  moveZ?: number;
}

export interface Station {
  id: string;
  label: string;
  verb: string;
  x: number;
  z: number;
  reach: number;
  /** Which modes can use it. */
  on: Mode[];
  /** A story moment to act out, or a line, or a dialogue. */
  act?: string;
  seconds?: number;
  note?: string;
  talk?: { who: string; line: string }[];
  /** Mount a vehicle. */
  mount?: "scooter" | "jetski";
  /** Open the laptop (the portfolio). */
  laptop?: boolean;
  /** Open the client work, framed on the villa's west wall. */
  work?: boolean;
  /** Open Atharv's booking page. */
  book?: boolean;
}

export const STATIONS: Station[] = [
  {
    id: "pool", label: "Pool mastermind", verb: "Join the mastermind", x: 6.3, z: 8.3, reach: 2.4, on: ["walk"],
    talk: [
      { who: "Luca", line: "Bro, we just crossed 40k MRR. The AI support agent is doing the work of four people." },
      { who: "Mateo", line: "Same story here. Our leads used to sit for two days. Now they get a reply in a minute." },
      { who: "Atharv", line: "That's what we build at VelyxLabs: agents that close the loop, not chatbots." },
      { who: "Luca", line: "Then you're building ours next. Let's scope it this week." },
    ],
  },
  { id: "gym", label: "Gym bale", verb: "Do a HIIT set", x: 11.6, z: 0.4, reach: 2.2, on: ["walk"], act: "hiit", seconds: 7, note: "20 jumping jacks done. Heart rate 168." },
  { id: "ice", label: "Ice bath", verb: "Take the plunge", x: 12.0, z: -6.7, reach: 2.2, on: ["walk"], act: "recovery", seconds: 7, note: "Three minutes at 4°C. Cold, clear, ready." },
  { id: "kitchen", label: "Kitchen", verb: "Cook breakfast", x: -3.0, z: -1.7, reach: 1.8, on: ["walk"], act: "cook", seconds: 6, note: "Eggs, avocado, rice. 52 g protein." },
  { id: "sofa", label: "Sofa", verb: "Post on X", x: 2.6, z: -0.9, reach: 1.6, on: ["walk"], act: "post", seconds: 6, note: "Posted. 1.2K likes and three DMs from founders." },
  { id: "studio", label: "Up to the studio", verb: "Open my laptop", x: 5.9, z: -2.3, reach: 1.6, on: ["walk"], laptop: true },
  { id: "book", label: "Villa gate", verb: "Book a call with Atharv", x: 5.3, z: 12.9, reach: 1.6, on: ["walk"], book: true },
  { id: "work", label: "Work wall", verb: "Look at the work", x: -7.6, z: -1.6, reach: 2.4, on: ["walk"], work: true },
  { id: "kopi", label: "Kopi", verb: "Order a coffee", x: 4.5, z: 17.4, reach: 2.4, on: ["walk", "scooter"], note: "Iced oat latte, the usual. Back to work." },
  { id: "warung", label: "Warung", verb: "Grab lunch", x: -6.5, z: 17.4, reach: 2.4, on: ["walk", "scooter"], note: "Nasi campur and a fresh coconut, 40k rupiah." },
];

type Rect = [number, number, number, number]; // x0, x1, z0, z1
const inside = (x: number, z: number, [x0, x1, z0, z1]: Rect) => x > x0 && x < x1 && z > z0 && z < z1;

/* ---------------- where you can be ---------------- */

const PLOT: Rect = [-11.7, 16.7, -10.7, 13.8];
const LANE: Rect = [-60, 150, 14.5, 18.2];
const GATE: Rect = [2.25, 3.75, 13.4, 14.8];
const BEACH: Rect = [140, 189, -200, 200];
const SEA: Rect = [186, 900, -500, 500];
const POOL: Rect = [-6.0, 8.6, 6.0, 10.4];
const LOUNGE: Rect = [-10.6, -7.0, 6.4, 10.0];
const GYM: Rect = [8.8, 14.4, -3.9, 2.9];

// things you walk round
const SOLID: Rect[] = [
  [-6.2, 6.2, -4.4, -3.9], // back wall
  [-6.4, -5.9, -4.4, 4.2], // left wall
  [-4.6, -1.8, -1.35, -0.15], // kitchen island
  [-5.85, -0.55, -3.9, -3.05], // kitchen counter
  [-5.9, -4.95, -2.7, -0.8], // fridge and tall unit
  [1.35, 5.25, -2.45, -1.3], // sofa
  [0.35, 1.55, -1.3, 1.7], // second sofa
  [2.05, 4.65, -0.8, 0.8], // teak beams
  [0.85, 5.6, -3.9, -2.85], // stair garden
  [-0.12, 0.12, -3.9, -0.2], // the teak screen
  [-0.12, 0.12, 1.6, 4.2],
  [8.9, 12.9, 6.3, 10.1], // swim-up bar
  [9.0, 11.4, -9.8, -7.6], // sauna
  [12.4, 14.4, -9.7, -6.1], // ice baths
  [15.5, 16.2, -10.0, -9.2], // shower wall
  [-11.2, -9.6, -10.2, -8.4], // shrine
  [-8.9, -4.1, 18.6, 22.0], // warung
  [1.4, 7.6, 18.7, 23.4], // kopi
  [9.4, 10.6, -3.7, -0.9], // rack
];

export function walkable(x: number, z: number) {
  const where = inside(x, z, PLOT) || inside(x, z, LANE) || inside(x, z, GATE) || inside(x, z, BEACH);
  return where && !SOLID.some((r) => inside(x, z, r));
}

// a scooter keeps to roads, the garden and the sand: never indoors or in the pool
const RIDE_BLOCKS: Rect[] = [[-6.4, 6.4, -4.4, 4.4], [-6.2, 8.8, 5.85, 10.6], LOUNGE, GYM, [8.5, 16.7, -10.7, -4.3], ...SOLID];

export function rideable(x: number, z: number) {
  const where = inside(x, z, PLOT) || inside(x, z, LANE) || inside(x, z, GATE) || inside(x, z, [140, 186, -200, 200]);
  return where && !RIDE_BLOCKS.some((r) => inside(x, z, r));
}

const DECKS: Rect[] = [[-11, 13, 4.2, 12.5]];

export function groundY(x: number, z: number) {
  if (x > 140) return -0.65 - Math.max(0, x - 150) * 0.024; // the beach shelves into the sea
  if (z > 14.2) return -0.32; // the lane
  if (inside(x, z, POOL)) return -1.1; // standing on the pool floor
  if (inside(x, z, LOUNGE)) return -0.45;
  if (inside(x, z, GYM)) return 0.18;
  if (inside(x, z, [-6.2, 6.2, -4.2, 4.2])) return 0; // indoors
  if (inside(x, z, [8.6, 16.6, -10.6, -4.4])) return 0; // wellness deck
  if (DECKS.some((r) => inside(x, z, r))) return 0;
  return -0.3; // lawn
}

export const SEA_LEVEL = -1.53;

/** Waves on the open sea, for the jet ski to ride over. */
export function swell(x: number, z: number, t: number) {
  return Math.sin(x * 0.11 + t * 1.3) * 0.18 + Math.sin(z * 0.17 - t * 0.9) * 0.12 + Math.sin((x + z) * 0.31 + t * 2.1) * 0.05;
}

export function startState(): PlayState {
  return {
    mode: "walk", x: 0.5, z: 11.9, y: 0, yaw: Math.PI / 2, speed: 0, steer: 0, lean: 0, wheel: 0,
    action: null, actionT: 0,
    scooter: { x: 6.6, z: 15.9, yaw: Math.PI / 2 },
    jetski: { x: 189.5, z: 3.0, yaw: Math.PI / 2 },
    wading: false,
  };
}

/** Advance the game by dt seconds; t is the clock, for the swell. */
export function step(s: PlayState, input: PlayInput, dt: number, t: number) {
  dt = Math.min(dt, 1 / 20);
  if (s.action) {
    s.actionT -= dt;
    s.speed = 0;
    return;
  }
  if (s.mode === "walk") walk(s, input, dt);
  else if (s.mode === "scooter") ride(s, input, dt);
  else jet(s, input, dt, t);
}

// the shortest way round from one heading to another
const angleTo = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

function walk(s: PlayState, input: PlayInput, dt: number) {
  s.wading = inside(s.x, s.z, POOL);
  const top = (input.run ? 5.2 : 1.9) * (s.wading ? 0.45 : 1);
  let target: number;
  if (input.moveX !== undefined && input.moveZ !== undefined) {
    // the stick says where to go; he turns to face it, quickly but not instantly
    const mag = Math.min(1, Math.hypot(input.moveX, input.moveZ));
    if (mag > 0.05) {
      const d = angleTo(s.yaw, Math.atan2(input.moveX, input.moveZ));
      s.yaw += d * Math.min(1, dt * 11);
    }
    target = mag * top;
  } else {
    target = input.throttle * (input.throttle < 0 ? top * 0.5 : top);
    s.yaw += input.steer * 2.6 * dt;
  }
  // pick up speed briskly, stop a touch quicker
  s.speed += (target - s.speed) * Math.min(1, dt * (target > s.speed ? 7 : 11));
  const nx = s.x + Math.sin(s.yaw) * s.speed * dt;
  const nz = s.z + Math.cos(s.yaw) * s.speed * dt;
  if (walkable(nx, nz)) {
    s.x = nx;
    s.z = nz;
  } else if (walkable(nx, s.z)) s.x = nx;
  else if (walkable(s.x, nz)) s.z = nz;
  s.y += (groundY(s.x, s.z) - s.y) * Math.min(1, dt * 10);
  s.wheel += Math.abs(s.speed) * dt * (input.run ? 2.6 : 3.4);
  s.lean = 0;
}

function ride(s: PlayState, input: PlayInput, dt: number) {
  const MAX = 11;
  if (input.throttle > 0) s.speed += input.throttle * (s.speed < 0 ? 12 : 6) * dt;
  else if (input.throttle < 0) s.speed += input.throttle * (s.speed > 0 ? 14 : 4) * dt;
  else s.speed -= Math.sign(s.speed) * Math.min(Math.abs(s.speed), 2.2 * dt);
  s.speed = Math.max(-3, Math.min(MAX, s.speed));
  turn(s, input, dt, MAX, 1.9);
  const nx = s.x + Math.sin(s.yaw) * s.speed * dt;
  const nz = s.z + Math.cos(s.yaw) * s.speed * dt;
  if (rideable(nx, nz)) {
    s.x = nx;
    s.z = nz;
  } else if (rideable(nx, s.z)) {
    s.x = nx;
    s.speed *= 0.6;
  } else if (rideable(s.x, nz)) {
    s.z = nz;
    s.speed *= 0.6;
  } else s.speed *= -0.25;
  s.y += (groundY(s.x, s.z) - s.y) * Math.min(1, dt * 12);
  s.wheel += (s.speed * dt) / 0.24;
  Object.assign(s.scooter, { x: s.x, z: s.z, yaw: s.yaw });
}

function jet(s: PlayState, input: PlayInput, dt: number, t: number) {
  const MAX = input.run ? 22 : 15;
  if (input.throttle > 0) s.speed += input.throttle * 7 * dt;
  else if (input.throttle < 0) s.speed += input.throttle * 9 * dt;
  else s.speed -= Math.sign(s.speed) * Math.min(Math.abs(s.speed), 3 * dt);
  s.speed = Math.max(-2.5, Math.min(MAX, s.speed));
  turn(s, input, dt, 15, 1.5);
  const nx = s.x + Math.sin(s.yaw) * s.speed * dt;
  const nz = s.z + Math.cos(s.yaw) * s.speed * dt;
  if (inside(nx, nz, SEA)) {
    s.x = nx;
    s.z = nz;
  } else s.speed *= -0.3;
  s.y = SEA_LEVEL + swell(s.x, s.z, t) * Math.min(1, Math.max(0, (s.x - 186) / 8));
  s.wheel += dt;
  Object.assign(s.jetski, { x: s.x, z: s.z, yaw: s.yaw });
}

function turn(s: PlayState, input: PlayInput, dt: number, max: number, rate: number) {
  s.steer += (input.steer - s.steer) * Math.min(1, dt * 6);
  const grip = Math.min(1, Math.abs(s.speed) / 3) * (1 - Math.min(0.45, (Math.abs(s.speed) / max) * 0.45));
  s.yaw += s.steer * grip * rate * dt * Math.sign(s.speed || 1);
  s.lean += (-s.steer * Math.min(1, Math.abs(s.speed) / max) * 0.42 - s.lean) * Math.min(1, dt * 5);
}

/** What you can do from where you are: hop on, hop off, or a station. */
export function options(s: PlayState): Station | null {
  if (s.action) return null;
  if (s.mode === "walk") {
    if (Math.hypot(s.scooter.x - s.x, s.scooter.z - s.z) < 2.2)
      return { id: "scooter", label: "Scooter", verb: "Ride the scooter", x: s.scooter.x, z: s.scooter.z, reach: 2.2, on: ["walk"], mount: "scooter" };
    if (Math.hypot(s.jetski.x - s.x, s.jetski.z - s.z) < 3.6)
      return { id: "jetski", label: "Jet ski", verb: "Take the jet ski out", x: s.jetski.x, z: s.jetski.z, reach: 3.6, on: ["walk"], mount: "jetski" };
  }
  if (s.mode === "scooter" && Math.abs(s.speed) < 1.5)
    return { id: "off", label: "Scooter", verb: "Hop off", x: s.x, z: s.z, reach: 1, on: ["scooter"] };
  if (s.mode === "jetski" && s.x < 194 && Math.abs(s.speed) < 3)
    return { id: "ashore", label: "Beach", verb: "Go ashore", x: s.x, z: s.z, reach: 1, on: ["jetski"] };
  let best: Station | null = null;
  let d = Infinity;
  for (const st of STATIONS) {
    if (!st.on.includes(s.mode)) continue;
    const k = Math.hypot(st.x - s.x, st.z - s.z);
    if (k < st.reach && k < d) {
      d = k;
      best = st;
    }
  }
  return best;
}

/** Change mode for a mount or a dismount. */
export function swap(s: PlayState, st: Station) {
  if (st.mount === "scooter") Object.assign(s, { mode: "scooter", x: s.scooter.x, z: s.scooter.z, yaw: s.scooter.yaw, speed: 0 });
  else if (st.mount === "jetski") Object.assign(s, { mode: "jetski", x: s.jetski.x, z: s.jetski.z, yaw: s.jetski.yaw, speed: 0 });
  else if (st.id === "off") {
    s.mode = "walk";
    s.x += Math.cos(s.yaw) * 0.9;
    s.z -= Math.sin(s.yaw) * 0.9;
    s.speed = 0;
  } else if (st.id === "ashore") Object.assign(s, { mode: "walk", x: 184.5, speed: 0, yaw: -Math.PI / 2 });
}
