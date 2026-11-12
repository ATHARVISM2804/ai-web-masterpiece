// node --test src/life/tour.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { STOPS, createTour } from "./tour.ts";
import { rideable } from "./play.ts";

test("every stop is somewhere the scooter can get to", () => {
  assert.ok(STOPS.length >= 5);
  for (const s of STOPS) assert.ok(rideable(s.x, s.z), `${s.id} at ${s.x},${s.z}`);
});

test("stops are taken in order: the next one only", () => {
  const t = createTour();
  t.start();
  const [a, b] = STOPS;
  assert.equal(t.arrive(b.x, b.z), null, "can't skip ahead");
  assert.equal(t.arrive(a.x, a.z), 0);
  assert.equal(t.arrive(a.x, a.z), null, "each stop counts once");
  assert.equal(t.next(), 1);
  assert.equal(t.arrive(b.x, b.z), 1);
});

test("the last stop finishes the tour", () => {
  const t = createTour();
  t.start();
  STOPS.forEach((s) => t.arrive(s.x, s.z));
  assert.equal(t.state, "done");
  assert.equal(t.next(), null);
});

test("nothing happens before it starts or after it's cancelled", () => {
  const t = createTour();
  assert.equal(t.arrive(STOPS[0].x, STOPS[0].z), null);
  t.start();
  t.cancel();
  assert.equal(t.arrive(STOPS[0].x, STOPS[0].z), null);
  assert.equal(t.next(), null);
});
