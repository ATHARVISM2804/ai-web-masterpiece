// node --test src/life/medals.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { MEDALS, createMedals } from "./medals.ts";
import { walkable } from "./play.ts";

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

test("there are six medals, and each one can be reached", () => {
  assert.equal(MEDALS.length, 6);
  for (const m of MEDALS) {
    // the sea one is for the jet ski; the rest are on foot
    if (m.sea) assert.ok(m.x > 186 && m.x < 900 && Math.abs(m.z) < 500, `${m.id} should be on the jet ski's sea`);
    else assert.ok(walkable(m.x, m.z), `${m.id} at ${m.x},${m.z} should be walkable`);
  }
});

test("passing close picks a medal up once, and only that one", () => {
  const md = createMedals(null);
  const m = MEDALS[0];
  assert.equal(md.near(m.x + 0.5, m.z), m.id);
  assert.equal(md.near(m.x + 0.5, m.z), null, "already found");
  assert.equal(md.count(), 1);
  assert.deepEqual(md.found(), [m.id]);
});

test("far away picks nothing up", () => {
  const md = createMedals(null);
  assert.equal(md.near(-500, -500), null);
  assert.equal(md.count(), 0);
});

test("found medals are remembered across visits", () => {
  const store = memory();
  const a = createMedals(store);
  a.near(MEDALS[1].x, MEDALS[1].z);
  a.near(MEDALS[2].x, MEDALS[2].z);
  const b = createMedals(store);
  assert.equal(b.count(), 2);
  assert.ok(b.has(MEDALS[1].id) && b.has(MEDALS[2].id));
});

test("all six makes it complete", () => {
  const md = createMedals(null);
  MEDALS.forEach((m) => md.near(m.x, m.z));
  assert.equal(md.count(), 6);
  assert.ok(md.complete());
});

test("a broken or foreign store value is ignored", () => {
  const store = memory();
  store.setItem("life.medals", "{not json");
  assert.equal(createMedals(store).count(), 0);
  store.setItem("life.medals", JSON.stringify(["nope", MEDALS[0].id]));
  assert.equal(createMedals(store).count(), 1);
});

test("a store that throws still lets you play", () => {
  const bad = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } };
  const md = createMedals(bad);
  assert.equal(md.near(MEDALS[0].x, MEDALS[0].z), MEDALS[0].id);
});
