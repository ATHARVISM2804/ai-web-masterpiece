/**
 * The timed run: through a row of gates in order, against your best time.
 * Pure rules, no three.js: world.ts draws the gates, Life.tsx shows the clock.
 * Times are in seconds.
 */

export interface Gate {
  x: number;
  z: number;
  /** How close counts as through it, in metres. */
  r: number;
}

type Store = Pick<Storage, "getItem" | "setItem"> | null;

const KEY = "life.trial.best";
// one frame never counts for more than this: a tab that stalled or slept doesn't add its gap
const MAX_STEP = 0.25;

export function createTrial(store: Store, gates: Gate[]) {
  let best: number | null = null;
  try {
    const v = parseFloat(store?.getItem(KEY) ?? "");
    if (Number.isFinite(v) && v > 0) best = v;
  } catch {
    // private windows can refuse storage; the run still works, it just won't be remembered
  }
  let state: "idle" | "running" | "done" = "idle";
  let elapsed = 0;
  let last = 0;
  let next = 0;

  return {
    start(now: number) {
      state = "running";
      elapsed = 0;
      last = now;
      next = 0;
    },
    tick(now: number, x: number, z: number, hidden: boolean) {
      if (state !== "running") return state;
      const dt = Math.min(MAX_STEP, Math.max(0, now - last));
      last = now;
      if (hidden) return state;
      elapsed += dt;
      const g = gates[next];
      if (Math.hypot(x - g.x, z - g.z) < g.r) next++;
      if (next === gates.length) {
        state = "done";
        if (best === null || elapsed < best) {
          best = elapsed;
          try {
            store?.setItem(KEY, String(best));
          } catch {
            // kept for this visit only
          }
        }
      }
      return state;
    },
    time: () => elapsed,
    best: () => best,
    /** The gate to go through next. */
    next: () => next,
    get state() {
      return state;
    },
    cancel() {
      state = "idle";
    },
  };
}

export type Trial = ReturnType<typeof createTrial>;

/** The beach run: ride through the start arch by the villa gate, down the lane, onto the sand. */
export const TRIAL_START: Gate = { x: 10, z: 16.35, r: 2.6 };
export const TRIAL_GATES: Gate[] = [
  { x: 45, z: 16.35, r: 3 },
  { x: 85, z: 16.35, r: 3 },
  { x: 125, z: 16.35, r: 3 },
  { x: 152, z: 12, r: 4.5 },
];

/** "0:23.4" */
export const clockText = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
