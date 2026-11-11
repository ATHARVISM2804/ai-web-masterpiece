/**
 * The story's sounds, one layer per moment of the day, all synthesised: no
 * files, nothing to license. Each layer has a weight (0..1) that the scroll
 * sets, so moments crossfade as the camera flies between them. Steady beds
 * (gas, shivering, crowd murmur, the night pad) are gain-ramped; events
 * (footsteps, keys, clinks, chimes) are scheduled per frame at a rate scaled
 * by their weight.
 */

export type SceneId = "intro" | "run" | "hiit" | "recovery" | "cook" | "build" | "clients" | "post" | "network" | "outro" | "os";

export function createScenes(ctx: AudioContext, out: AudioNode, noise: AudioBuffer) {
  const w: Record<SceneId, number> = { intro: 0, run: 0, hiit: 0, recovery: 0, cook: 0, build: 0, clients: 0, post: 0, network: 0, outro: 0, os: 0 };
  let dive = 0;
  const ramp = (p: AudioParam, v: number, k = 0.2) => p.setTargetAtTime(v, ctx.currentTime, k);

  /* ---------- building blocks ---------- */
  const bed = (type: BiquadFilterType, f: number, q: number, rate = 1) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    src.playbackRate.value = rate;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = f;
    filt.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(filt).connect(g).connect(out);
    src.start(0, Math.random() * 2);
    return { g, filt };
  };
  // a short burst of filtered noise: a step, a key, a sizzle pop
  const burst = (f: number, q: number, peak: number, len: number, type: BiquadFilterType = "bandpass", at = ctx.currentTime) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 1 + Math.random() * 0.5;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = f;
    filt.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(filt).connect(g).connect(out);
    src.start(at, Math.random() * 2.5);
    src.stop(at + len + 0.05);
  };
  // a pitched blip: chimes, clinks, a kick drum
  const tone = (f0: number, f1: number, peak: number, len: number, type: OscillatorType = "sine", at = ctx.currentTime) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + len + 0.05);
  };

  /* ---------- steady beds ---------- */
  const gas = bed("highpass", 2600, 0.5, 1.4); // the burner
  const shiver = bed("bandpass", 420, 1.2, 0.8); // breath through chattering teeth
  const shake = ctx.createOscillator(); // ...trembling at 14 Hz
  const shakeDepth = ctx.createGain();
  shake.frequency.value = 14;
  shakeDepth.gain.value = 0;
  shake.connect(shakeDepth).connect(shiver.g.gain);
  shake.start();
  const water = bed("lowpass", 520, 0.7, 0.7); // the pool lapping round the mastermind
  const whoosh = bed("bandpass", 300, 2.5, 1); // the dive into the laptop
  const zoom = ctx.createOscillator();
  const zoomG = ctx.createGain();
  zoom.type = "sawtooth";
  zoom.frequency.value = 60;
  zoomG.gain.value = 0;
  const zoomF = ctx.createBiquadFilter();
  zoomF.type = "lowpass";
  zoomF.frequency.value = 900;
  zoom.connect(zoomF).connect(zoomG).connect(out);
  zoom.start();

  // the night: a soft open chord, breathing slowly
  const pad = ctx.createGain();
  pad.gain.value = 0;
  const padF = ctx.createBiquadFilter();
  padF.type = "lowpass";
  padF.frequency.value = 700;
  padF.connect(pad).connect(out);
  [110, 164.8, 220, 277.2, 329.6].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = i % 2 ? "triangle" : "sine";
    o.frequency.value = f;
    o.detune.value = (Math.random() - 0.5) * 12;
    const g = ctx.createGain();
    g.gain.value = 0.18;
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 0.07 + i * 0.03;
    depth.gain.value = 0.12;
    lfo.connect(depth).connect(g.gain);
    o.connect(g).connect(padF);
    o.start();
    lfo.start();
  });

  // voices for a murmured conversation: a buzzy source through two moving formants
  const crowd = ctx.createGain();
  crowd.gain.value = 0;
  crowd.connect(out);
  const voices = Array.from({ length: 6 }, (_, i) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = 110 + i * 18;
    const f1 = ctx.createBiquadFilter();
    const f2 = ctx.createBiquadFilter();
    f1.type = f2.type = "bandpass";
    f1.Q.value = f2.Q.value = 7;
    const g = ctx.createGain();
    g.gain.value = 0;
    o.connect(f1).connect(g);
    o.connect(f2).connect(g);
    g.connect(crowd);
    o.start();
    return { o, f1, f2, g, next: 0, base: [100, 125, 150, 175, 205, 230][i] };
  });
  const VOWELS = [[730, 1090], [530, 1840], [270, 2290], [570, 840], [440, 1020], [660, 1700], [390, 1990]];

  /* ---------- events, by rate ---------- */
  const next: Partial<Record<string, number>> = {};
  const every = (key: string, weight: number, period: () => number, fire: (at: number) => void) => {
    const now = ctx.currentTime;
    if (weight < 0.05) {
      next[key] = 0;
      return;
    }
    if (!next[key]) next[key] = now + Math.random() * 0.2;
    if (now >= next[key]!) {
      fire(Math.max(now, next[key]!));
      next[key] = now + period();
    }
  };

  return {
    /** How much of each moment is on screen: the two either side of the current flight. */
    set(weights: Partial<Record<SceneId, number>>, diveK = 0) {
      (Object.keys(w) as SceneId[]).forEach((k) => (w[k] = weights[k] ?? 0));
      dive = diveK;
    },
    tick(t: number) {
      // beds
      ramp(gas.g.gain, w.cook * 0.07, 0.3);
      ramp(shakeDepth.gain, w.recovery * 0.06, 0.3);
      ramp(shiver.g.gain, w.recovery * 0.05, 0.3);
      ramp(water.g.gain, w.clients * 0.12 * (0.8 + 0.2 * Math.sin(t * 0.9)), 0.4);
      ramp(pad.gain, w.outro * 0.05 + w.os * 0.02, 0.8);
      ramp(crowd.gain, w.clients * 0.06 + w.network * 0.11, 0.4);
      // the dive: a rush that rises with the push into the screen
      const rush = dive * (1 - dive) * 4;
      ramp(whoosh.g.gain, w.os * rush * 0.16, 0.08);
      ramp(whoosh.filt.frequency, 300 + dive * 5200, 0.08);
      ramp(zoomG.gain, w.os * rush * 0.025, 0.08);
      ramp(zoom.frequency, 60 + dive * dive * 520, 0.08);

      // the conversation: each voice says a syllable, pauses, says another
      const talk = w.clients + w.network;
      const now = ctx.currentTime;
      voices.forEach((v, i) => {
        if (talk < 0.05 || (i >= 3 && w.network < 0.2)) return;
        if (now < v.next) return;
        const [a, b] = VOWELS[Math.floor(Math.random() * VOWELS.length)];
        v.o.frequency.setTargetAtTime(v.base * (0.85 + Math.random() * 0.4), now, 0.03);
        v.f1.frequency.setTargetAtTime(a, now, 0.02);
        v.f2.frequency.setTargetAtTime(b, now, 0.02);
        const len = 0.08 + Math.random() * 0.16;
        v.g.gain.cancelScheduledValues(now);
        v.g.gain.setTargetAtTime(0.5, now, 0.02);
        v.g.gain.setTargetAtTime(0, now + len, 0.04);
        // a few syllables, then a breath
        v.next = now + len + (Math.random() < 0.2 ? 0.5 + Math.random() * 1.2 : 0.04 + Math.random() * 0.1);
      });

      // footsteps on sand, and a breath every other stride
      every("step", w.run, () => 0.34 + Math.random() * 0.03, (at) => {
        burst(140, 0.8, 0.3 * w.run, 0.09, "lowpass", at);
        burst(1800, 1.5, 0.05 * w.run, 0.05, "bandpass", at);
      });
      every("breath", w.run + w.hiit * 0.8, () => 0.7 + Math.random() * 0.1, (at) => burst(900, 1.2, 0.05 * Math.max(w.run, w.hiit), 0.3, "bandpass", at));
      // HIIT: a beat to move to, and the thud of landing jacks
      every("kick", w.hiit, () => 0.5, (at) => tone(140, 45, 0.09 * w.hiit, 0.22, "sine", at));
      every("hat", w.hiit, () => 0.25, (at) => burst(8000, 0.8, 0.03 * w.hiit, 0.04, "highpass", at));
      every("land", w.hiit, () => 0.62, (at) => burst(110, 0.9, 0.12 * w.hiit, 0.12, "lowpass", at + 0.05));
      // the ice bath: cubes knocking together
      every("ice", w.recovery, () => 0.3 + Math.random() * 1.1, (at) => {
        const f = 2200 + Math.random() * 1800;
        tone(f, f * 0.98, 0.05 * w.recovery, 0.18, "sine", at);
        tone(f * 2.76, f * 2.7, 0.02 * w.recovery, 0.1, "sine", at);
      });
      // cooking: oil spitting in the pan
      every("sizzle", w.cook, () => 0.04 + Math.random() * 0.12, (at) => burst(4000 + Math.random() * 3000, 2, 0.05 * w.cook, 0.03, "bandpass", at));
      // building: typing in bursts, the odd space bar
      every("key", w.build, () => (Math.random() < 0.1 ? 0.5 + Math.random() * 0.6 : 0.07 + Math.random() * 0.08), (at) => {
        const space = Math.random() < 0.12;
        burst(space ? 900 : 2600 + Math.random() * 1600, space ? 1 : 3, (space ? 0.22 : 0.16) * w.build, space ? 0.06 : 0.025, "bandpass", at);
      });
      // posting: the little rising chirp a post makes, then a like or two
      every("tweet", w.post, () => 2.2 + Math.random() * 1.5, (at) => {
        tone(1300, 2600, 0.13 * w.post, 0.09, "sine", at);
        tone(1900, 3200, 0.1 * w.post, 0.08, "sine", at + 0.09);
      });
      every("like", w.post, () => 0.9 + Math.random() * 1.4, (at) => tone(880, 1320, 0.07 * w.post, 0.12, "triangle", at));
      // people on the roof: glasses touching
      every("clink", w.network, () => 1 + Math.random() * 2.5, (at) => {
        const f = 3200 + Math.random() * 1500;
        tone(f, f, 0.04 * w.network, 0.35, "sine", at);
        tone(f * 1.5, f * 1.5, 0.015 * w.network, 0.25, "sine", at + 0.01);
      });
    },
  };
}
