// node --test src/life/links.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { SPAWNS, SITE, bookWith, spawnFrom, xPost } from "./links.ts";
import { walkable } from "./play.ts";

test("a post on X carries the text and the link, encoded", () => {
  const u = new URL(xPost("Beach run 0:41.2 & a new best", "https://www.atharvgolait.dev/?at=lane"));
  assert.equal(u.origin + u.pathname, "https://x.com/intent/post");
  assert.equal(u.searchParams.get("text"), "Beach run 0:41.2 & a new best");
  assert.equal(u.searchParams.get("url"), "https://www.atharvgolait.dev/?at=lane");
});

test("the booking link gets a note, without losing what it had", () => {
  const u = new URL(bookWith("https://cal.com/atharvgolait/30min", "Found all 6 medals"));
  assert.equal(u.pathname, "/atharvgolait/30min");
  assert.equal(u.searchParams.get("notes"), "Found all 6 medals");
  const v = new URL(bookWith("https://cal.com/a/b?month=2026-12", "hi"));
  assert.equal(v.searchParams.get("month"), "2026-12");
  assert.equal(v.searchParams.get("notes"), "hi");
});

test("?at= picks a named spot to start at", () => {
  assert.deepEqual(spawnFrom("?at=beach"), SPAWNS.beach);
  assert.deepEqual(spawnFrom("?utm_source=card&at=GYM"), SPAWNS.gym);
});

test("no spot, or one that doesn't exist, starts nowhere special", () => {
  assert.equal(spawnFrom(""), null);
  assert.equal(spawnFrom("?at=moon"), null);
  assert.equal(spawnFrom("?at=toString"), null);
  assert.equal(spawnFrom("?at=__proto__"), null);
});

test("every named spot is somewhere you can stand", () => {
  for (const [name, s] of Object.entries(SPAWNS)) assert.ok(walkable(s.x, s.z), `${name} at ${s.x},${s.z}`);
});

test("the site link is the live domain", () => {
  assert.equal(SITE, "https://www.atharvgolait.dev");
});
