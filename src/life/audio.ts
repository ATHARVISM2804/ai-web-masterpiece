/**
 * Bali, by ear, synthesised in the browser so there is nothing to license or
 * download: wind in the palms, surf that grows as you near the beach, birds by
 * day and crickets after dark, and engines that rise with speed. Starts on a
 * click (browsers ask for that) and stays quiet under everything else.
 */

export interface Mix {
  /** 0..1: how close the sea is. */
  surf: number;
  night: number;
  engine: "none" | "scooter" | "jetski";
  /** 0..1 of top speed. */
  throttle: number;
}

export function createAudio() {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.0;
  master.connect(ctx.destination);

  // one shared buffer of brown noise
  const len = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  const noise = (f: number, q: number, type: BiquadFilterType) => {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = f;
    filt.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(filt).connect(g).connect(master);
    src.start();
    return { g, filt };
  };

  const wind = noise(500, 0.4, "lowpass");
  const surf = noise(700, 0.6, "bandpass");
  const spray = noise(2400, 0.8, "bandpass");

  // an engine: two detuned saws through a low-pass
  const engine = ctx.createGain();
  engine.gain.value = 0;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 600;
  lp.connect(engine).connect(master);
  const oscs = [0, 1].map((k) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = 50;
    o.detune.value = k ? 9 : -9;
    o.connect(lp);
    o.start();
    return o;
  });

  // birds: a quick rising whistle now and then; crickets: a pulsing tone at night
  const chirp = () => {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const f = 2400 + Math.random() * 1800;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * (1.3 + Math.random() * 0.4), t + 0.08);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.025, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.14);
  };
  const cricket = ctx.createOscillator();
  cricket.frequency.value = 4600;
  const cricketGain = ctx.createGain();
  cricketGain.gain.value = 0;
  const pulse = ctx.createOscillator();
  pulse.frequency.value = 18;
  const pulseDepth = ctx.createGain();
  pulseDepth.gain.value = 0;
  pulse.connect(pulseDepth).connect(cricketGain.gain);
  cricket.connect(cricketGain).connect(master);
  cricket.start();
  pulse.start();

  let on = false;
  let mix: Mix = { surf: 0, night: 0, engine: "none", throttle: 0 };
  let birdT = 0;
  const ramp = (p: AudioParam, v: number, k = 0.25) => p.setTargetAtTime(v, ctx.currentTime, k);

  return {
    get on() {
      return on;
    },
    async start() {
      await ctx.resume();
      on = true;
      ramp(master.gain, 0.9, 0.6);
    },
    stop() {
      on = false;
      ramp(master.gain, 0, 0.2);
    },
    set(m: Mix) {
      mix = m;
    },
    /** A splash: a burst of filtered noise that falls away. */
    splash() {
      if (!on) return;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = 1.6;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 0.7;
      f.frequency.setValueAtTime(2200, t);
      f.frequency.exponentialRampToValueAtTime(500, t + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      src.connect(f).connect(g).connect(master);
      src.start(t, Math.random() * 2);
      src.stop(t + 0.75);
    },
    /** Called every frame. */
    tick(dt: number) {
      if (!on) return;
      const t = ctx.currentTime;
      ramp(wind.g.gain, 0.05 + 0.025 * Math.sin(t * 0.21), 0.8);
      // surf rolls in and out every few seconds
      ramp(surf.g.gain, mix.surf * (0.1 + 0.08 * Math.sin(t * 0.8)), 0.4);
      ramp(spray.g.gain, mix.engine === "jetski" ? mix.throttle * 0.08 : 0, 0.15);
      const eng = mix.engine === "none" ? 0 : mix.engine === "scooter" ? 0.045 : 0.06;
      ramp(engine.gain, eng * (0.35 + mix.throttle * 0.65), 0.12);
      const base = mix.engine === "jetski" ? 38 : 55;
      oscs.forEach((o) => ramp(o.frequency, base + mix.throttle * (mix.engine === "jetski" ? 70 : 110), 0.1));
      ramp(lp.frequency, 380 + mix.throttle * 1400, 0.1);
      ramp(pulseDepth.gain, mix.night * 0.012, 0.6);
      birdT -= dt;
      if (birdT < 0 && mix.night < 0.5) {
        const n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) setTimeout(chirp, i * 140);
        birdT = 2 + Math.random() * 5;
      }
    },
  };
}

export type Audio = ReturnType<typeof createAudio>;
