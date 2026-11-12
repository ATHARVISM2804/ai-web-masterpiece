// node --test src/life/bali.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { baliHour, skyHour, weatherFrom } from "./bali.ts";

test("Bali is UTC+8 all year", () => {
  assert.equal(baliHour(new Date("2026-11-11T00:00:00Z")), 8);
  assert.equal(baliHour(new Date("2026-11-11T09:30:00Z")), 17.5);
  assert.equal(baliHour(new Date("2026-11-11T20:15:00Z")), 4.25);
  assert.equal(baliHour(new Date("2026-06-01T16:00:00Z")), 0);
});

test("small hours are drawn as deep night, not dawn", () => {
  assert.equal(skyHour(2), 23);
  assert.equal(skyHour(0), 23);
  assert.equal(skyHour(4.9), 23);
  assert.equal(skyHour(5), 5);
  assert.equal(skyHour(13.5), 13.5);
  assert.equal(skyHour(23.6), 23.6);
});

test("weather codes become cloud and rain", () => {
  assert.deepEqual(weatherFrom(0, 29), { kind: "clear", cloud: 0, rain: 0, temp: 29 });
  assert.equal(weatherFrom(2, 28).kind, "cloudy");
  assert.equal(weatherFrom(3, 28).cloud, 0.8);
  assert.equal(weatherFrom(45, 27).kind, "cloudy");
  const drizzle = weatherFrom(51, 26);
  assert.equal(drizzle.kind, "rain");
  assert.ok(drizzle.rain > 0 && drizzle.rain < weatherFrom(65, 26).rain);
  assert.equal(weatherFrom(81, 26).kind, "rain");
  assert.equal(weatherFrom(95, 25).kind, "storm");
  assert.equal(weatherFrom(95, 25).rain, 1);
});

test("the temperature is rounded, and a missing one stays missing", () => {
  assert.equal(weatherFrom(0, 28.6).temp, 29);
  assert.equal(weatherFrom(0, undefined).temp, null);
  assert.equal(weatherFrom(0, Number.NaN).temp, null);
});

test("an unknown code is treated as clear", () => {
  assert.equal(weatherFrom(-1, 28).kind, "clear");
  assert.equal(weatherFrom(Number.NaN, 28).kind, "clear");
});
