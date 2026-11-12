/**
 * Everything that comes in or goes out by URL: a post on X with your beach
 * run or postcard, the booking link with a note on it, and `?at=` links (on
 * business cards, in posts) that drop you into Live it at a named spot.
 */

export const SITE = "https://www.atharvgolait.dev";

/** X's compose window with the text and link filled in. */
export const xPost = (text: string, url: string) => `https://x.com/intent/post?${new URLSearchParams({ text, url })}`;

/** The booking page with a note prefilled, so Atharv knows where the call came from. */
export function bookWith(booking: string, note: string) {
  const u = new URL(booking);
  u.searchParams.set("notes", note);
  return u.toString();
}

export interface Spawn {
  x: number;
  z: number;
  yaw: number;
}

/** Spots a link can start you at: `?at=studio`. */
export const SPAWNS: Record<string, Spawn> = {
  studio: { x: 5.9, z: -0.9, yaw: Math.PI },
  gym: { x: 10.6, z: 1.6, yaw: Math.PI },
  pool: { x: 6.0, z: 11.6, yaw: Math.PI },
  lane: { x: 8.5, z: 16.3, yaw: Math.PI / 2 },
  beach: { x: 168, z: 4, yaw: Math.PI / 2 },
};

export function spawnFrom(search: string): Spawn | null {
  const at = new URLSearchParams(search).get("at")?.toLowerCase();
  return at && Object.prototype.hasOwnProperty.call(SPAWNS, at) ? SPAWNS[at] : null;
}
