// node --test src/life/hyrox.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { HYROX, NEEDLE_PERIOD, MISS_PENALTY, createRace } from "./hyrox.ts";

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

// the needle sits mid-zone a quarter of the way through its sweep
const IN_ZONE = NEEDLE_PERIOD / 4;
const OUT_ZONE = 0;

// clear the current station, with `dt` seconds between presses
function clear(race, now, dt = 0.1) {
  const st = HYROX[race.station()];
  for (let i = 0; i < st.reps; i++) {
    if (st.kind === "alt") race.press(i % 2 ? "R" : "L", (now += dt));
    else {
      const since = race.since(now);
      now += NEEDLE_PERIOD - (since % NEEDLE_PERIOD) + IN_ZONE;
      race.press("hit", now);
    }
  }
  return now;
}

test("the eight HYROX stations, in race order", () => {
  assert.deepEqual(HYROX.map((s) => s.name), ["SkiErg", "Sled push", "Sled pull", "Burpee broad jumps", "Rowing", "Farmers carry", "Sandbag lunges", "Wall balls"]);
});

test("alternating sides moves you on; the same side twice does nothing", () => {
  const r = createRace(null);
  r.start(0);
  assert.equal(r.press("L", 0.1), "rep");
  assert.equal(r.press("L", 0.2), null);
  assert.equal(r.press("R", 0.3), "rep");
  assert.equal(r.reps(), 2);
});

test("a full station moves to the next one", () => {
  const r = createRace(null);
  r.start(0);
  clear(r, 0);
  assert.equal(r.station(), 1);
  assert.equal(r.reps(), 0);
});

test("on a timing station, a hit in the zone counts and a miss costs time", () => {
  const r = createRace(null);
  r.start(0);
  let now = 0;
  while (HYROX[r.station()].kind === "alt") now = clear(r, now);
  const t0 = r.time(now);
  const start = now - r.since(now);
  assert.equal(r.press("hit", start + NEEDLE_PERIOD + OUT_ZONE), "miss");
  assert.equal(r.reps(), 0);
  assert.ok(Math.abs(r.time(start + NEEDLE_PERIOD + OUT_ZONE) - (start + NEEDLE_PERIOD + OUT_ZONE) - MISS_PENALTY) < 1e-9);
  assert.equal(r.press("hit", start + NEEDLE_PERIOD * 2 + IN_ZONE), "rep");
  assert.equal(r.reps(), 1);
  assert.ok(t0 >= 0);
});

test("finishing all eight is done, and the best time is kept", () => {
  const store = memory();
  const r = createRace(store);
  r.start(0);
  let now = 0;
  let last = null;
  while (r.state === "running") {
    now = clear(r, now);
    last = r.state;
  }
  assert.equal(last, "done");
  assert.ok(r.best() > 0);
  assert.equal(createRace(store).best(), r.best());
});

test("presses before the start or after the finish are ignored", () => {
  const r = createRace(null);
  assert.equal(r.press("L", 1), null);
  r.start(0);
  let now = 0;
  while (r.state === "running") now = clear(r, now);
  const t = r.time(now);
  assert.equal(r.press("R", now + 5), null);
  assert.equal(r.time(now + 5), t, "the clock stops at the finish");
});

test("a slower second race doesn't replace the best", () => {
  const store = memory();
  const a = createRace(store);
  a.start(0);
  let now = 0;
  while (a.state === "running") now = clear(a, now, 0.1);
  const best = a.best();
  const b = createRace(store);
  b.start(100);
  now = 100;
  while (b.state === "running") now = clear(b, now, 0.3);
  assert.equal(b.best(), best);
});

test("a broken stored best is ignored", () => {
  const store = memory();
  store.setItem("life.hyrox.best", "fast");
  assert.equal(createRace(store).best(), null);
});
