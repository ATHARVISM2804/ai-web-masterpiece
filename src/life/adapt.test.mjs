// node --test src/life/adapt.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createScaler } from "./adapt.ts";

// run frames `ms` apart for `seconds`, starting at `now`; returns the time reached
function frames(s, now, ms, seconds) {
  const end = now + seconds * 1000;
  for (; now < end; now += ms) s.frame(now);
  return now;
}

test("a steady 60 fps keeps full resolution", () => {
  const s = createScaler(0);
  frames(s, 0, 16.7, 20);
  assert.equal(s.scale, 1);
});

test("one long stall (a hidden tab, a GC) doesn't drop resolution", () => {
  const s = createScaler(0);
  let now = frames(s, 0, 16.7, 5);
  now += 400; // the stall
  frames(s, now, 16.7, 10);
  assert.equal(s.scale, 1);
});

test("sustained slow frames step down, never below 0.6", () => {
  const s = createScaler(0);
  frames(s, 0, 30, 60);
  assert.equal(s.scale, 0.6);
});

test("after a slow patch, steady 60 fps climbs back to full", () => {
  const s = createScaler(0);
  let now = frames(s, 0, 30, 6);
  assert.ok(s.scale < 1);
  frames(s, now, 16.7, 40);
  assert.equal(s.scale, 1);
});

test("a step up that fails sets a ceiling, which lifts again after a long good spell", () => {
  const s = createScaler(0);
  // slow enough at full res, fine a notch below: it settles under a ceiling
  let now = 0;
  for (let i = 0; i < 4000; i++) {
    now += s.scale > 0.92 ? 22 : 16.7;
    s.frame(now);
  }
  assert.ok(s.ceil < 1, `ceil ${s.ceil}`);
  // the machine frees up (another tab closed): it gets back to full
  frames(s, now, 16.7, 120);
  assert.equal(s.scale, 1);
});
