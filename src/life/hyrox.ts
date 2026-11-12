/**
 * The HYROX challenge in the gym bale: the eight stations of a real HYROX
 * race, in order, against the clock. Most are a grind (alternate left and
 * right as fast as you can); burpees and wall balls are about timing (press
 * as the needle crosses the zone; a miss costs a second). Pure rules, no
 * DOM: Life.tsx draws it. Times are in seconds.
 */

export interface HyroxStation {
  name: string;
  /** The real distance or reps, shown under the name. */
  what: string;
  kind: "alt" | "timing";
  reps: number;
}

export const HYROX: HyroxStation[] = [
  { name: "SkiErg", what: "1000 m", kind: "alt", reps: 24 },
  { name: "Sled push", what: "50 m", kind: "alt", reps: 20 },
  { name: "Sled pull", what: "50 m", kind: "alt", reps: 20 },
  { name: "Burpee broad jumps", what: "80 m", kind: "timing", reps: 6 },
  { name: "Rowing", what: "1000 m", kind: "alt", reps: 24 },
  { name: "Farmers carry", what: "200 m", kind: "alt", reps: 18 },
  { name: "Sandbag lunges", what: "100 m", kind: "alt", reps: 18 },
  { name: "Wall balls", what: "100 reps", kind: "timing", reps: 8 },
];

/** One sweep of the needle, there and back. */
export const NEEDLE_PERIOD = 1.2;
/** The zone the needle has to be in, as a share of its travel. */
export const ZONE = [0.38, 0.62] as const;
export const MISS_PENALTY = 1;

const KEY = "life.hyrox.best";
type Store = Pick<Storage, "getItem" | "setItem"> | null;

/** Where the needle is, 0..1, `since` seconds into a station. */
export const needleAt = (since: number) => {
  const k = (since / NEEDLE_PERIOD) % 1;
  return k < 0.5 ? k * 2 : 2 - k * 2;
};

export function createRace(store: Store) {
  let best: number | null = null;
  try {
    const v = parseFloat(store?.getItem(KEY) ?? "");
    if (Number.isFinite(v) && v > 0) best = v;
  } catch {
    // storage refused: the race still runs, the best just isn't kept
  }
  let state: "idle" | "running" | "done" = "idle";
  let start = 0;
  let end = 0;
  let penalty = 0;
  let station = 0;
  let reps = 0;
  let stationAt = 0;
  let side: "L" | "R" | null = null;

  const time = (now: number) => (state === "done" ? end : now) - start + penalty;

  return {
    start(now: number) {
      state = "running";
      start = stationAt = now;
      penalty = station = reps = 0;
      side = null;
    },
    /** A key or tap: "L"/"R" on a grind, "hit" on a timing station. */
    press(p: "L" | "R" | "hit", now: number): "rep" | "miss" | "station" | "done" | null {
      if (state !== "running") return null;
      const st = HYROX[station];
      if (st.kind === "alt") {
        if (p === "hit" || p === side) return null;
        side = p;
      } else {
        const n = needleAt(now - stationAt);
        if (n < ZONE[0] || n > ZONE[1]) {
          penalty += MISS_PENALTY;
          return "miss";
        }
      }
      if (++reps < st.reps) return "rep";
      reps = 0;
      side = null;
      stationAt = now;
      if (++station < HYROX.length) return "station";
      state = "done";
      end = now;
      const t = time(now);
      if (best === null || t < best) {
        best = t;
        try {
          store?.setItem(KEY, String(best));
        } catch {
          // kept for this visit only
        }
      }
      return "done";
    },
    time,
    best: () => best,
    station: () => Math.min(station, HYROX.length - 1),
    reps: () => reps,
    /** Seconds into the current station: the needle's clock. */
    since: (now: number) => now - stationAt,
    cancel() {
      state = "idle";
    },
    get state() {
      return state;
    },
  };
}

export type Race = ReturnType<typeof createRace>;
