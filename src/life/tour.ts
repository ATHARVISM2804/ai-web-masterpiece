/**
 * The Canggu tour: a scooter ride from the villa gate past the places of the
 * day, lane to beach, with a line from Atharv at each stop. Ride to the next
 * stop and its card comes up. Pure rules, no DOM: Life.tsx draws it.
 */

export interface Stop {
  id: string;
  title: string;
  line: string;
  x: number;
  z: number;
  /** How close counts as there, in metres. */
  r: number;
}

export const STOPS: Stop[] = [
  { id: "warung", title: "The warung", line: "Lunch, most days. Nasi campur and a fresh coconut for about 40k rupiah.", x: -6.5, z: 16.6, r: 3.2 },
  { id: "kopi", title: "Kopi", line: "Iced oat latte and an hour of deep work before the calls start.", x: 4.5, z: 16.6, r: 3.2 },
  { id: "rice", title: "The rice terraces", line: "Water reaches them through subak: farmers' cooperatives that have shared out the canals, field by field, for about a thousand years.", x: 62, z: 17.2, r: 4 },
  { id: "surf", title: "The board rack", line: "Out for a surf at six, back at the laptop by eight.", x: 160, z: -6, r: 4 },
  { id: "club", title: "The beach club", line: "Sunsets, bean bags, and more good conversations than any office I've worked in.", x: 158, z: -21, r: 4.5 },
  { id: "jukung", title: "The jukungs", line: "Outrigger fishing boats. The fishermen are out before the surfers are.", x: 172, z: -40, r: 5 },
];

export function createTour() {
  let state: "idle" | "running" | "done" = "idle";
  let next = 0;
  return {
    start() {
      state = "running";
      next = 0;
    },
    /** Reaching the next stop: its index, or null. */
    arrive(x: number, z: number) {
      if (state !== "running") return null;
      const s = STOPS[next];
      if (Math.hypot(x - s.x, z - s.z) > s.r) return null;
      const at = next++;
      if (next === STOPS.length) state = "done";
      return at;
    },
    /** The stop to ride to, or null when no tour is on. */
    next: () => (state === "running" ? next : null),
    cancel() {
      state = "idle";
    },
    get state() {
      return state;
    },
  };
}

export type Tour = ReturnType<typeof createTour>;
