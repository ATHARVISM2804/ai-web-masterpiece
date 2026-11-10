/**
 * Dynamic resolution. Below ~52 fps the image gets a little softer; holding
 * the display's rate (vsync caps a 60 Hz frame at 16.7 ms) it sharpens back,
 * but not past a step that just failed, until a long good spell lifts that
 * ceiling again. Times in milliseconds.
 */

const SLOW = 19; // average frame above this: step down
const FINE = 17.4; // below this: the display's rate is being held
const STALL = 100; // a gap this long is a hidden tab or a hitch, not the frame rate
const SETTLE = 2000; // between changes
const PROBE = 4000; // a drop this soon after a step up means that step was too much
const LIFT = 30000; // this long holding the rate lifts the ceiling a notch

export function createScaler(now: number) {
  let frameMs = 16;
  let last = now;
  let lastAdapt = now;
  let lastUp = -Infinity;
  let goodSince = now;
  const s = {
    scale: 1,
    ceil: 1,
    get frameMs() {
      return frameMs;
    },
    /** Call once per frame; returns true when `scale` changed. */
    frame(t: number) {
      const gap = t - last;
      last = t;
      if (gap > STALL) {
        goodSince = t;
        return false;
      }
      frameMs += (gap - frameMs) * 0.05;
      if (frameMs >= FINE) goodSince = t;
      if (t - lastAdapt < SETTLE) return false;
      let next = s.scale;
      if (frameMs > SLOW) {
        if (t - lastUp < PROBE) s.ceil = Math.max(0.6, s.scale - 0.05);
        next = Math.max(0.6, +(s.scale - 0.1).toFixed(2));
      } else if (frameMs < FINE) {
        if (s.ceil < 1 && t - goodSince > LIFT) {
          s.ceil = Math.min(1, +(s.ceil + 0.05).toFixed(2));
          goodSince = t;
        }
        if (s.scale < s.ceil) {
          next = Math.min(s.ceil, +(s.scale + 0.05).toFixed(2));
          lastUp = t;
        }
      }
      if (next === s.scale) return false;
      s.scale = next;
      lastAdapt = t;
      return true;
    },
  };
  return s;
}
