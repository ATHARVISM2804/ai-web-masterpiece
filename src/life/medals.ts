/**
 * Six gold medals hidden round the world, one for each marathon Atharv has
 * run. Ride or walk close to one and it's yours; find all six and the free
 * audit call opens up. Pure rules, no three.js: world.ts draws them, Life.tsx
 * picks them up. Found medals are remembered across visits.
 */

export interface Medal {
  id: string;
  /** Said when you find it. */
  where: string;
  x: number;
  z: number;
  /** Out on the water: only the jet ski gets there. */
  sea?: boolean;
}

export const MEDALS: Medal[] = [
  { id: "shrine", where: "Medal 1, hidden by the shrine", x: -8.4, z: -6.8 },
  { id: "garden", where: "Medal 2, in the garden", x: -9.6, z: 3.2 },
  { id: "deck", where: "Medal 3, behind the gym", x: 15.4, z: -2.6 },
  { id: "lane", where: "Medal 4, down the lane", x: -42, z: 16.4 },
  { id: "dune", where: "Medal 5, up the beach", x: 166, z: -34 },
  { id: "reef", where: "Medal 6, out past the reef", x: 232, z: 28, sea: true },
];

/** How close counts as picking one up, in metres. */
const REACH = 1.6;
const SEA_REACH = 3.5;
const KEY = "life.medals";

type Store = Pick<Storage, "getItem" | "setItem"> | null;

export function createMedals(store: Store) {
  const ids = new Set(MEDALS.map((m) => m.id));
  const found = new Set<string>();
  try {
    const saved = JSON.parse(store?.getItem(KEY) ?? "[]");
    if (Array.isArray(saved)) saved.forEach((id) => ids.has(id) && found.add(id));
  } catch {
    // a broken value, or storage refused: start fresh
  }

  return {
    /** Pick up a medal you're standing at; its id, or null when there's none new. */
    near(x: number, z: number) {
      const m = MEDALS.find((m) => !found.has(m.id) && Math.hypot(x - m.x, z - m.z) < (m.sea ? SEA_REACH : REACH));
      if (!m) return null;
      found.add(m.id);
      try {
        store?.setItem(KEY, JSON.stringify([...found]));
      } catch {
        // kept for this visit only
      }
      return m.id;
    },
    has: (id: string) => found.has(id),
    found: () => [...found],
    count: () => found.size,
    complete: () => found.size === MEDALS.length,
  };
}

export type Medals = ReturnType<typeof createMedals>;
