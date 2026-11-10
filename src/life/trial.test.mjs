// node --test src/life/trial.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createTrial } from "./trial.ts";

const GATES = [
  { x: 0, z: 0, r: 2 },
  { x: 10, z: 0, r: 2 },
  { x: 20, z: 0, r: 2 },
];

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

// drive from gate to gate, `step` seconds of ticks apart
function run(trial, start, step = 0.1, path = [[0, 0], [5, 0], [10, 0], [15, 0], [20, 0]]) {
  let now = start;
  trial.start(now);
  let state = "running";
  for (const [x, z] of path) {
    now += step;
    state = trial.tick(now, x, z, false);
  }
  return { state, now };
}

test("passing every gate in order finishes, and time() is the time it took", () => {
  const t = createTrial(memory(), GATES);
  const { state } = run(t, 100);
  assert.equal(state, "done");
  assert.ok(Math.abs(t.time() - 0.5) < 1e-9, `time ${t.time()}`);
});

test("a faster run becomes the best; a slower one doesn't", () => {
  const store = memory();
  const t = createTrial(store, GATES);
  run(t, 0, 0.2);
  assert.ok(Math.abs(t.best() - 1.0) < 1e-9);
  run(t, 10, 0.1);
  assert.ok(Math.abs(t.best() - 0.5) < 1e-9);
  run(t, 20, 0.3);
  assert.ok(Math.abs(t.best() - 0.5) < 1e-9);
  // and it's remembered for the next visit
  assert.ok(Math.abs(createTrial(store, GATES).best() - 0.5) < 1e-9);
});

test("a hidden tab doesn't run the clock, and coming back doesn't add the gap", () => {
  const t = createTrial(memory(), GATES);
  t.start(0);
  t.tick(0.1, 0, 0, false);
  t.tick(30, 1, 0, true);
  assert.ok(Math.abs(t.time() - 0.1) < 1e-9, `time ${t.time()}`);
  // the first frame back after a long stall counts as one frame at most
  t.tick(2400, 1, 0, false);
  assert.ok(t.time() < 0.5, `time ${t.time()}`);
});

test("blocked storage still finishes and keeps the best for the session", () => {
  const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  for (const store of [broken, null]) {
    const t = createTrial(store, GATES);
    assert.equal(t.best(), null);
    const { state } = run(t, 0);
    assert.equal(state, "done");
    assert.ok(Math.abs(t.best() - 0.5) < 1e-9);
  }
});

test("skipping a gate doesn't finish", () => {
  const t = createTrial(memory(), GATES);
  const { state } = run(t, 0, 0.1, [[0, 0], [20, 0], [20, 0]]);
  assert.equal(state, "running");
  assert.equal(t.next(), 1);
});
