import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { CHAPTERS, clock } from "@/life/chapters";
import { profile, work } from "@/content/site";
import { lockScroll } from "@/lib/smooth-scroll";
import AtharvOS from "@/os/AtharvOS";
import MiniMap, { type Player } from "@/life/Hud";
import { STATIONS, options, startState, step, swap, type PlayInput, type PlayState, type Station } from "@/life/play";
import { createAudio, type Audio } from "@/life/audio";
import type { SceneId } from "@/life/scenes";
import { postcard } from "@/life/photo";
import LoaderArt from "@/life/LoaderArt";
import ArVilla from "@/life/ArVilla";
import { createTone } from "@/life/tone";
import type { World } from "@/life/world";
import { TRIAL_GATES, TRIAL_START, clockText, createTrial, type Trial } from "@/life/trial";
import { MEDALS, createMedals, type Medals } from "@/life/medals";
import { SITE, bookWith, spawnFrom, xPost, type Spawn } from "@/life/links";
import { WEATHER_ICON, baliHour, fetchBali, skyHour, type Weather } from "@/life/bali";
import { HYROX, ZONE, createRace, needleAt, type Race } from "@/life/hyrox";
import { STOPS, createTour, type Tour } from "@/life/tour";
import "@/life/life.css";

/**
 * "A day with Atharv": a full-screen 3D world, a villa in Bali, travelled one
 * moment at a time from the sunrise run to the last conversation on the roof.
 *
 * Story mode: each wheel turn, swipe or arrow key glides the camera to the
 * next moment and settles there, so nobody lands between two shots. The page
 * still scrolls underneath (each chapter is 130vh), which keeps anchors,
 * deep links and the prerendered copy simple.
 *
 * "Live it": the same day as a small game. Walk the villa, ride the scooter,
 * take the jet ski out from the beach, and stop at stations to do what the
 * story shows: train, plunge, cook, post, join the pool mastermind, or open
 * the laptop.
 */

const STEP = 1.3; // viewport heights of scroll per chapter
const N = CHAPTERS.length;
const HOLD = 0.3; // the first 30% of a chapter's scroll is the held shot
const DAY = 17.3; // golden hour
const NIGHT = 20.6;
const TOP: Record<PlayState["mode"], number> = { walk: 5.2, scooter: 11, jetski: 22 };
const angleTo = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
const LOADER_NAME = "ATHARV GOLAIT";
const MODE_LABEL: Record<PlayState["mode"], string> = { walk: "On foot", scooter: "Scooter", jetski: "Jet ski" };
const SHARE_PHOTO = "A postcard from Atharv Golait's villa in Bali. You can walk around it 🌴";

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const inOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

// the last chapter's flight lands on the desk shot first, and Atharv's head marks where he leaves it
const DESK = CHAPTERS.find((c) => c.zone === "build")!;
const HEAD = [-3, 4.75, -3.2] as const;
const SHOULDER = [-1.3, 5.25, -3.55] as const;

const REDUCED = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// private windows can refuse storage outright
const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export default function Life() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const osRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<HTMLDivElement>(null);
  const trialRef = useRef<HTMLParagraphElement>(null);
  const worldRef = useRef<World | null>(null);
  const [atLaptop, setAtLaptop] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  // the loader's name is its progress bar: one letter shoots up per step of loading, never faster than a beat apart
  const [lit, setLit] = useState(0);
  const [fontIn, setFontIn] = useState(false);
  useEffect(() => {
    let live = true;
    const done = () => live && setFontIn(true);
    document.fonts.load("1em Anton").then(done, done);
    setTimeout(done, 1500);
    return () => void (live = false);
  }, []);
  useEffect(() => {
    if (!fontIn) return;
    const want = Math.max(1, Math.ceil((loaded / 100) * LOADER_NAME.length));
    if (lit >= want) return;
    const t = setTimeout(() => setLit((l) => l + 1), lit ? 85 : 120);
    return () => clearTimeout(t);
  }, [fontIn, loaded, lit]);
  const [active, setActive] = useState(0);
  const [hour, setHour] = useState(CHAPTERS[0].hour);
  const [chosen, setChosen] = useState(() => typeof location !== "undefined" && location.hash.startsWith("#day-"));
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<PlayState["mode"]>("walk");
  const [player, setPlayer] = useState<Player | null>(null);
  const [near, setNear] = useState<Station | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [talk, setTalk] = useState<{ st: Station; i: number } | null>(null);
  const [laptop, setLaptop] = useState(false);
  const [workAt, setWorkAt] = useState<number | null>(null);
  const [photo, setPhoto] = useState(false);
  const [flash, setFlash] = useState(0);
  const [sound, setSound] = useState(false);
  // Live it's sky: Bali as it is right now, or a fixed golden hour or night
  const [skyMode, setSkyMode] = useState<"bali" | "day" | "night">("bali");
  const [playHour, setPlayHour] = useState(DAY);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [phone, setPhone] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [medalCount, setMedalCount] = useState(0);
  // the founder pass after a beach run, the prize for all six medals, or a postcard to share
  const [reward, setReward] = useState<{ kind: "run" | "hyrox"; time: number; best: boolean } | { kind: "medals" | "photo" | "tour" } | null>(null);
  // the Canggu tour: on or off, and the stop whose card is up
  const [touring, setTouring] = useState(false);
  const [tourCard, setTourCard] = useState<number | null>(null);
  // the villa in AR (ArVilla), over everything
  const [ar, setAr] = useState(false);
  const tourMarkRef = useRef<HTMLDivElement>(null);
  // the HYROX challenge: which station and how many reps, while a race is on
  const [race, setRace] = useState<{ station: number; reps: number; miss: number } | null>(null);
  const raceRef = useRef<HTMLDivElement>(null);
  const did = (id: string) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  // shared between the render loop and the handlers
  const ctl = useRef({
    goTo: (_i: number) => undefined as void,
    play: null as PlayState | null,
    near: null as Station | null,
    /** Dialogue or laptop open: the player stands still. */
    busy: false,
    talking: false,
    laptop: false,
    hour: DAY,
    skyMode: "bali" as "bali" | "day" | "night",
    weather: null as Weather | null,
    audio: null as Audio | null,
    /** The game camera: yaw and pitch round the player, and how far back. */
    camYaw: Math.PI,
    camPitch: 0.32,
    zoom: 4.6,
    lastLook: 0,
    /** Share of the camera arm that's clear of walls, smoothed. */
    camReach: 1,
    /** Keys and the touch stick, as x (right) and y (forward). */
    keyAxis: { x: 0, y: 0 },
    stick: { x: 0, y: 0 },
    run: false,
    /** The title screen is up: the camera orbits the villa. */
    title: true,
    /** Last frame's `wading`, to hear the moment you step in. */
    wasWading: false,
    /** The work wall's card is open. */
    work: false,
    /** When the laptop was opened in the game: the warp into it runs from here. */
    warpAt: 0,
    /** Photo mode: the HUD is away and the player holds still while you frame the shot. */
    photo: false,
    /** The beach run, made on first use; `armed` once you're clear of the start arch. */
    trial: null as Trial | null,
    armed: true,
    /** The six hidden medals, made once storage can be read. */
    medals: null as Medals | null,
    /** The HYROX race, made on first use; `racing` while one is on. */
    race: null as Race | null,
    racing: false,
    raceEndedAt: -1e9,
    tour: null as Tour | null,
    /** The AR viewer is open: the page's own keys, wheel and swipes stand down. */
    ar: false,
  });

  useEffect(() => {
    lockScroll(true); // this page moves itself; the site's smooth scroll stands down
    const c = ctl.current;
    if (import.meta.env.DEV) (window as unknown as { __play: typeof c }).__play = c; // for testing the game headless
    let raf = 0;
    let disposed = false;
    let dispose = () => undefined as void;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.tx = e.clientX / innerWidth - 0.5;
      pointer.ty = e.clientY / innerHeight - 0.5;
      // on the title screen, the letters on the deck hop when touched
      if (c.title) worldRef.current?.titlePointer((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2, false);
    };
    addEventListener("pointermove", onMove, { passive: true });
    // in the game, dragging the scene looks around: left and right, up and down
    let drag: { id: number; x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (c.title && !(e.target as HTMLElement).closest?.("button, a, .arv")) worldRef.current?.titlePointer((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2, true);
      if (ctl.current.play && e.target === canvasRef.current) drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const onDrag = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const k = e.pointerType === "touch" ? 0.008 : 0.005;
      c.camYaw -= (e.clientX - drag.x) * k;
      c.camPitch = Math.min(1.05, Math.max(0.02, c.camPitch + (e.clientY - drag.y) * k * 0.8));
      c.lastLook = performance.now();
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) drag = null;
    };
    addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onDrag);
    addEventListener("pointerup", onUp);

    /* ---------- story stepping ---------- */
    const unit = () => innerHeight * STEP;
    const tween = { from: 0, to: 0, t0: 0, dur: 0, on: false };
    const at = () => scrollY / unit();
    const goTo = (target: number) => {
      target = Math.max(0, Math.min(N - 1, target));
      const now = at();
      const cur = Math.round(now - HOLD + 0.5 - 0.5);
      if (target === cur && Math.abs(now - (target + HOLD)) < 0.01) return;
      const far = Math.abs(target - now) > 1.6;
      // start where the flight starts, end where the next shot holds
      const from = far ? now : target > now ? Math.max(now, Math.floor(now) + HOLD) : Math.min(now, target + 0.92);
      const to = target === N - 1 ? N - 1 : target + HOLD;
      scrollTo(0, from * unit());
      // into the laptop (and back out) is the slow one: desk, a moment at work, then the screen
      const laptop = !far && (target === N - 1 || from > N - 2);
      Object.assign(tween, { from, to, t0: performance.now(), dur: laptop ? 5200 : far ? 1200 : 1700, on: true });
    };
    ctl.current.goTo = goTo;
    const current = () => Math.max(0, Math.min(N - 1, Math.floor(at() - HOLD + 0.999)));
    let wheelAcc = 0;
    let wheelT = 0;
    const onWheel = (e: WheelEvent) => {
      if (c.ar) return;
      if (ctl.current.play) {
        // the wheel zooms the game camera
        if ((e.target as HTMLElement).closest?.(".life__os, .phone")) return;
        e.preventDefault();
        c.zoom = Math.min(9, Math.max(2.4, c.zoom * Math.exp(e.deltaY * 0.0012)));
        return;
      }
      if (c.title) return;
      if ((e.target as HTMLElement).closest?.(".life__os")) return; // the laptop scrolls itself
      e.preventDefault();
      if (tween.on) return;
      const t = performance.now();
      if (t - wheelT > 260) wheelAcc = 0;
      wheelT = t;
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) > 40) {
        goTo(current() + Math.sign(wheelAcc));
        wheelAcc = 0;
      }
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (ctl.current.play || c.ar || (e.target as HTMLElement).closest?.(".life__os, button, a, .arv")) return;
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (ctl.current.play || c.title || c.ar || (e.target as HTMLElement).closest?.(".life__os")) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40 && !tween.on) goTo(current() + Math.sign(dy));
    };
    const keys = new Set<string>();
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === "keydown";
      if (ctl.current.play) {
        // keys are tracked even while a card or mode holds the player, so none is left "held" after
        keys[down ? "add" : "delete"](e.key.toLowerCase());
        const k = (a: string, b: string) => keys.has(a) || keys.has(b);
        c.keyAxis.y = (k("w", "arrowup") ? 1 : 0) - (k("s", "arrowdown") ? 1 : 0);
        c.keyAxis.x = (k("d", "arrowright") ? 1 : 0) - (k("a", "arrowleft") ? 1 : 0);
        c.run = keys.has("shift");
        if (c.ar) return; // the keys are still followed, so none stays held after AR closes
        if (ctl.current.laptop) {
          if (down && e.key === "Escape") closeLaptop.current();
          return;
        }
        if (ctl.current.racing) {
          if (!down || e.repeat) return;
          const k = e.key.toLowerCase();
          if (["arrowleft", "a"].includes(k)) racePress.current("L");
          else if (["arrowright", "d"].includes(k)) racePress.current("R");
          else if (k === " " || k === "enter") racePress.current("hit");
          else if (k === "escape") endRace.current();
          if (k !== "escape") e.preventDefault();
          return;
        }
        if (ctl.current.photo) {
          if (down && (e.key === "Escape" || e.key.toLowerCase() === "c")) togglePhoto.current();
          if (down && !e.repeat && e.key === "Enter") shoot.current();
          return;
        }
        if (down && !e.repeat && e.key.toLowerCase() === "c" && !ctl.current.busy) {
          togglePhoto.current();
          return;
        }
        if (ctl.current.work) {
          if (down && (e.key === "Escape" || e.key.toLowerCase() === "e")) closeWork.current();
          if (down && (e.key === "ArrowRight" || e.key === "ArrowLeft")) stepWork.current(e.key === "ArrowRight" ? 1 : -1);
          return;
        }
        if (down && ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) e.preventDefault();
        if (down && !e.repeat && (e.key.toLowerCase() === "e" || e.key === "Enter" || (e.key === " " && ctl.current.talking))) interact.current();
        if (down && !e.repeat && e.key.toLowerCase() === "p") setPhone((v) => !v);
        if (down && e.key === "Escape") {
          if (ctl.current.talking) endTalk.current();
          else stopPlay.current();
        }
        return;
      }
      if (c.ar || !down || (e.target as HTMLElement).closest?.(".life__os, input, textarea")) return;
      if (c.title) {
        titleKey.current(e);
        return;
      }
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        if (!tween.on) goTo(current() + 1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        if (!tween.on) goTo(current() - 1);
      }
    };
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: false });
    addEventListener("touchend", onTouchEnd, { passive: true });
    addEventListener("keydown", onKey);
    addEventListener("keyup", onKey);

    (async () => {
      const [{ createWorld }, THREE] = await Promise.all([import("@/life/world"), import("three")]);
      if (disposed || !canvasRef.current) return;
      const world = await createWorld(canvasRef.current, (k) => setLoaded(Math.round(k * 100)));
      if (disposed) return world.dispose();
      worldRef.current = world;
      c.medals ??= createMedals(storage());
      world.setMedals(c.medals.found());
      setMedalCount(c.medals.count());
      if (import.meta.env.DEV) (window as unknown as { __world: typeof world }).__world = world;
      const onResize = () => world.resize();
      addEventListener("resize", onResize);

      const cam = new THREE.Vector3();
      const look = new THREE.Vector3();
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const out = new THREE.Vector3();
      const chase = { cam: new THREE.Vector3(), look: new THREE.Vector3(), fresh: true };
      const focus = new THREE.Vector3();
      const orbitCam = new THREE.Vector3();
      const orbitLook = new THREE.Vector3(1.3, 2.2, 3.4);
      let titleK = c.title ? 1 : 0;
      let shown = -1;
      let shownHour = -1;
      let laptopOn = false;
      let last = performance.now();
      let mapT = 0;
      let hourT = 0;
      const tone = createTone(canvasRef.current);

      const frame = () => {
        const now = performance.now();
        const dt = (now - last) / 1000;
        last = now;
        // under the AR viewer the world rests: model-viewer has its own GPU work to do
        if (c.ar) {
          raf = requestAnimationFrame(frame);
          return;
        }

        /* ---------- live it ---------- */
        const r = ctl.current.play;
        if (r) {
          const c = ctl.current;
          // keys and the stick, merged; on foot they move relative to the camera
          const ax = Math.max(-1, Math.min(1, c.keyAxis.x + c.stick.x));
          const ay = Math.max(-1, Math.min(1, c.keyAxis.y + c.stick.y));
          const run = c.run || Math.hypot(c.stick.x, c.stick.y) > 0.92;
          const fx0 = Math.sin(c.camYaw);
          const fz0 = Math.cos(c.camYaw);
          const input: PlayInput = c.busy
            ? { throttle: 0, steer: 0, run: false, moveX: 0, moveZ: 0 }
            : r.mode === "walk"
              ? { throttle: 0, steer: 0, run, moveX: fx0 * ay - fz0 * ax, moveZ: fz0 * ay + fx0 * ax }
              : { throttle: ay, steer: -ax, run };
          step(r, input, dt, now / 1000);
          if (r.action && r.actionT <= 0) {
            const st = STATIONS.find((x) => x.act === r.action);
            r.action = null;
            if (st?.note) toast.current(st.note);
          }
          world.setPlayer(r);
          // the beach run: ride east through the start arch and the clock starts
          const tr = (c.trial ??= createTrial(storage(), TRIAL_GATES));
          if (r.mode === "scooter") {
            const fromStart = Math.hypot(r.x - TRIAL_START.x, r.z - TRIAL_START.z);
            if (fromStart < TRIAL_START.r && c.armed && r.speed > 1 && Math.sin(r.yaw) > 0.5) {
              tr.start(now / 1000);
              c.armed = false;
            } else if (fromStart > 8) c.armed = true;
            if (tr.state === "running" && tr.tick(now / 1000, r.x, r.z, document.hidden) === "done") {
              const best = tr.best();
              setReward({ kind: "run", time: tr.time(), best: best !== null && best >= tr.time() });
            }
          } else if (tr.state === "running") tr.cancel();
          world.setTrial(tr.state === "running" ? tr.next() : null);
          // the Canggu tour: ride to the next stop and its card comes up
          const tour = c.tour;
          if (tour?.state === "running") {
            const at = tour.arrive(r.x, r.z);
            if (at !== null) {
              c.audio?.splash();
              if (tour.next() === null) {
                setTouring(false);
                setTourCard(null);
                setReward({ kind: "tour" });
              } else setTourCard(at);
            }
          }
          const tm = tourMarkRef.current;
          if (tm) {
            const n = tour?.next();
            const stop = n != null ? STOPS[n] : null;
            const sp = stop ? world.project(stop.x, (stop.x > 140 ? -1.2 : 0) + 3, stop.z) : null;
            tm.style.opacity = sp ? "1" : "0";
            if (sp && stop) {
              tm.style.transform = `translate(${sp.x}px, ${sp.y}px) translate(-50%, -100%)`;
              (tm.lastChild as HTMLElement).textContent = `${Math.round(Math.hypot(stop.x - r.x, stop.z - r.z))} m`;
            }
          }
          // the HYROX race: the clock and the needle move every frame, outside React
          if (c.racing && c.race && raceRef.current) {
            const t = now / 1000;
            const clk = raceRef.current.querySelector<HTMLElement>(".hyrox__clock");
            if (clk) clk.textContent = clockText(c.race.time(t));
            const nd = raceRef.current.querySelector<HTMLElement>(".hyrox__needle");
            if (nd) nd.style.left = `${needleAt(c.race.since(t)) * 100}%`;
            r.actionT = 99; // Atharv keeps training while the race is on
          }
          // the hidden medals: pass close to one, on foot or riding, and it's yours
          const md = (c.medals ??= createMedals(storage()));
          const got = md.near(r.x, r.z);
          if (got) {
            world.setMedals(md.found());
            setMedalCount(md.count());
            c.audio?.splash();
            if (md.complete()) setReward({ kind: "medals" });
            else toast.current(`🥇 ${MEDALS.find((m) => m.id === got)!.where}. ${md.count()} of ${MEDALS.length} found.`);
          }
          if (trialRef.current) {
            const best = tr.best();
            trialRef.current.hidden = tr.state !== "running";
            trialRef.current.textContent = `${clockText(tr.time())}${best !== null ? ` · best ${clockText(best)}` : ""}`;
          }
          // a station's moment, or the mastermind, is filmed like the story
          const story = r.action ?? (c.talking ? "clients" : null);
          const shot = story ? CHAPTERS.find((x) => x.zone === story) : null;
          if (shot) {
            cam.fromArray(shot.cam);
            look.fromArray(shot.look);
          } else {
            // riding, the camera settles in behind you unless you've just looked round
            if (r.mode !== "walk" && Math.abs(r.speed) > 1 && now - c.lastLook > 1200) c.camYaw += angleTo(c.camYaw, r.yaw) * Math.min(1, dt * 2.2);
            const eye = r.mode === "walk" ? 1.45 : 1.25;
            focus.set(r.x, r.y + eye, r.z);
            const indoors = r.mode === "walk" && Math.abs(r.x) < 6.2 && Math.abs(r.z) < 4.2;
            const dist = c.zoom * (r.mode === "walk" ? (indoors ? 0.72 : 1) : r.mode === "scooter" ? 1.3 : 1.7) + Math.abs(r.speed) * 0.07;
            const cp = Math.cos(c.camPitch);
            cam.set(focus.x - Math.sin(c.camYaw) * cp * dist, focus.y + Math.sin(c.camPitch) * dist, focus.z - Math.cos(c.camYaw) * cp * dist);
            if (indoors) {
              // keep inside the room: under the ceiling, off the back and side walls
              cam.x = Math.min(5.9, Math.max(-5.9, cam.x));
              cam.z = Math.max(-3.9, cam.z);
              cam.y = Math.min(cam.y, 3.1);
            }
            cam.y = Math.max(cam.y, r.y + 0.35);
            // walls and pillars pull the camera in at once; it eases back out when clear
            const clear = world.clearance(focus, cam);
            c.camReach = clear < c.camReach ? clear : Math.min(clear, c.camReach + dt * 1.5);
            cam.sub(focus).multiplyScalar(c.camReach).add(focus);
            look.copy(focus);
          }
          const k = chase.fresh ? 1 : 1 - Math.exp(-dt * (shot ? 2.5 : 16));
          chase.cam.lerp(cam, k);
          chase.look.lerp(look, k);
          chase.fresh = false;
          // opening the laptop: the push into the screen plays out, then the desktop is there
          const warpK = c.laptop ? Math.min(1, (now - c.warpAt) / 1600) : 0;
          const warp = REDUCED ? 0 : warpK * warpK;
          world.render({ cam: chase.cam, look: chase.look, hour: c.hour, zone: "ride", mx: 0, my: 0, warp });
          tone(now);
          // markers over the stations and the rides
          const box = markersRef.current;
          if (box) {
            const spots = [...STATIONS, { x: r.scooter.x, z: r.scooter.z }, { x: r.jetski.x, z: r.jetski.z }];
            spots.forEach((p, n) => {
              const el = box.children[n] as HTMLElement;
              if (!el) return;
              const d = Math.hypot(p.x - r.x, p.z - r.z);
              const hide = r.action || c.talking || d < 3 || (n === STATIONS.length && r.mode === "scooter") || (n > STATIONS.length && r.mode === "jetski");
              const sp = !hide && d < 260 ? world.project(p.x, (p.x > 140 ? -1.2 : 0) + 2.3, p.z) : null;
              if (!sp) {
                el.style.opacity = "0";
                return;
              }
              el.style.opacity = String(Math.min(1, 30 / d + 0.3));
              el.style.transform = `translate(${sp.x}px, ${sp.y}px) translate(-50%, -100%)`;
              (el.lastChild as HTMLElement).textContent = d > 25 ? `${Math.round(d)} m` : "";
            });
          }
          const n = c.busy ? null : options(r);
          if (n?.id !== c.near?.id) {
            c.near = n;
            setNear(n);
          }
          if (c.audio) {
            c.audio.story({});
            if (r.wading && !c.wasWading && r.mode === "walk") c.audio.splash();
            c.wasWading = r.wading;
            c.audio.set({
              surf: Math.min(1, Math.max(0, (r.x - 110) / 70)),
              night: c.hour > 19 ? 1 : 0,
              engine: r.mode === "walk" ? "none" : r.mode,
              throttle: r.mode === "walk" ? 0 : Math.min(1, Math.abs(r.speed) / TOP[r.mode]),
            });
            c.audio.tick(dt);
          }
          if (osRef.current) {
            osRef.current.style.opacity = String(REDUCED ? warpK : smooth(0.8, 1, warpK));
            osRef.current.style.pointerEvents = warpK > 0.9 ? "auto" : "none";
          }
          if (c.skyMode === "bali" && now - hourT > 20000) {
            hourT = now;
            c.hour = skyHour(baliHour(new Date()));
            setPlayHour(c.hour);
          }
          if (now - mapT > 66) {
            mapT = now;
            setPlayer({ x: r.x, z: r.z, yaw: r.yaw });
            setMode(r.mode);
          }
          raf = requestAnimationFrame(frame);
          return;
        }
        chase.fresh = true;

        /* ---------- story ---------- */
        if (tween.on) {
          const k = Math.min(1, (now - tween.t0) / tween.dur);
          scrollTo(0, (tween.from + (tween.to - tween.from) * ease(k)) * unit());
          if (k >= 1) tween.on = false;
        }
        const p = Math.min(N - 1, Math.max(0, scrollY / unit()));
        const i = Math.min(N - 2, Math.floor(p));
        const A = CHAPTERS[i];
        const B = CHAPTERS[i + 1];
        const final = i === N - 2;
        const k = p - i;
        // the last stretch has its own path: in to the desk, a moment of Atharv at work,
        // then a slow push over his shoulder into the screen
        const e = final ? inOut(smooth(HOLD, 0.6, k)) : inOut(smooth(HOLD, 0.9, k));
        const to = final ? DESK : B;

        // arc out and up between shots so the camera never cuts through a floor;
        // long hops (to the beach and back) arc less, relative to their length
        cam.fromArray(A.cam).lerp(b.fromArray(to.cam), e);
        const span = a.fromArray(A.cam).distanceTo(b);
        const arc = Math.min(span, 18 + span * 0.15);
        out.copy(cam).setY(0).normalize().multiplyScalar(arc * 0.28 * Math.sin(Math.PI * e));
        cam.add(out).add(a.set(0, arc * 0.14 * Math.sin(Math.PI * e), 0));
        look.fromArray(A.look).lerp(b.fromArray(to.look), e);
        if (final) {
          // then the push: a curve round behind his right shoulder, so the screen is met face on
          const t = inOut(smooth(0.68, 1, k));
          if (t > 0) {
            a.copy(cam).multiplyScalar((1 - t) * (1 - t));
            out.fromArray(SHOULDER).multiplyScalar(2 * (1 - t) * t);
            cam.copy(a).add(out).add(b.fromArray(B.cam).multiplyScalar(t * t));
            look.lerp(b.fromArray(B.look), t);
          }
        }

        let h = A.hour + (B.hour - A.hour) * e;
        // the title screen: a slow golden-hour orbit of the villa, eased out once you choose
        titleK += ((c.title ? 1 : 0) - titleK) * Math.min(1, dt * 1.6);
        if (titleK > 0.001) {
          // a slow sway across the front: the name on the deck, the villa behind it
          const ang = 0.12 + Math.sin(now / 1000 * 0.06) * 0.32;
          orbitCam.set(1.3 + Math.sin(ang) * 18, 16 + Math.sin(now / 1000 * 0.13) * 0.6, 3.4 + Math.cos(ang) * 18);
          const k2 = titleK * titleK * (3 - 2 * titleK);
          cam.lerp(orbitCam, k2);
          look.lerp(orbitLook, k2);
          h += (17.4 - h) * k2;
        }
        const cur = e < 0.5 ? i : i + 1;
        // Atharv steps out of the shot only as the camera reaches his shoulder
        const zone = final && cam.distanceTo(a.fromArray(HEAD)) < 1.1 ? "os" : final && e >= 0.5 ? "outro" : CHAPTERS[cur].zone;
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        // the screen fills the view; scrolling back runs it all in reverse
        const dive = final ? smooth(0.8, 1, k) : 0;
        // the sound of the day: the two moments either side of the flight, crossfaded
        if (c.audio) {
          const push = final ? inOut(smooth(0.68, 1, k)) : 0;
          const wts: Partial<Record<SceneId, number>> = final ? { outro: 1 - push * 0.8, os: push } : titleK > 0.5 ? { intro: 1 } : { [A.zone]: 1 - e, [B.zone]: e };
          c.audio.story(wts, push);
          c.audio.set({ surf: (wts.run ?? 0) * 0.9, night: smooth(19, 20.5, h), engine: "none", throttle: 0 });
          c.audio.tick(dt);
        }
        world.render({ cam, look, hour: h, zone, title: c.title, mx: final ? pointer.x * (1 - smooth(0.6, 0.8, k)) : pointer.x, my: final ? pointer.y * (1 - smooth(0.6, 0.8, k)) : pointer.y, warp: REDUCED ? 0 : dive });
        tone(now);

        if (cur !== shown) {
          shown = cur;
          setActive(cur);
          if (cur > 0) setChosen(true); // scrolling is a choice too
        }
        if (Math.abs(h - shownHour) > 1 / 60) {
          shownHour = h;
          setHour(h);
        }
        // as the screen fills the view, the desktop takes over the page
        const os = final ? smooth(REDUCED ? 0.8 : 0.93, 0.995, k) : 0;
        if (osRef.current) {
          osRef.current.style.opacity = String(os);
          osRef.current.style.pointerEvents = os > 0.9 ? "auto" : "none";
        }
        if (uiRef.current) uiRef.current.style.opacity = String((1 - smooth(0.72, 0.86, final ? k : 0)) * (1 - titleK));
        if ((os > 0.9) !== laptopOn) {
          laptopOn = os > 0.9;
          setAtLaptop(laptopOn);
        }
        // the chapter card is fully there while the camera holds, gone mid-flight
        if (cardRef.current) {
          const vis = Math.abs(e - 0.5) * 2;
          cardRef.current.style.opacity = String(smooth(0.35, 0.9, vis));
          cardRef.current.style.transform = `translateY(${(1 - smooth(0.35, 0.9, vis)) * 14}px)`;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      setTimeout(() => !disposed && setReady(true), 350);
      dispose = () => {
        removeEventListener("resize", onResize);
        world.dispose();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onDrag);
      removeEventListener("pointerup", onUp);
      c.audio?.stop();
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("keydown", onKey);
      removeEventListener("keyup", onKey);
      lockScroll(false);
      dispose();
    };
  }, []);

  /* ---------- live it ---------- */
  const toast = useRef((text: string) => {
    setNote(text);
    setTimeout(() => setNote((n) => (n === text ? null : n)), 3400);
  });
  // sound needs a click to start: choosing how to spend the day is one
  const begin = useCallback(() => {
    try {
      ctl.current.audio ??= createAudio();
      void ctl.current.audio.start();
      setSound(true);
    } catch {
      setSound(false);
    }
  }, []);
  const applySky = useRef((m: "bali" | "day" | "night") => {
    const c = ctl.current;
    c.skyMode = m;
    c.hour = m === "bali" ? skyHour(baliHour(new Date())) : m === "day" ? DAY : NIGHT;
    const w = m === "bali" ? c.weather : null;
    worldRef.current?.setWeather(w?.cloud ?? 0, w?.rain ?? 0);
    setSkyMode(m);
    setPlayHour(c.hour);
  });
  const startPlay = useCallback((at?: Spawn, silent = false) => {
    const c = ctl.current;
    c.play = startState();
    if (at) Object.assign(c.play, at);
    applySky.current("bali");
    if (!c.weather)
      void fetchBali().then((w) => {
        if (!w) return;
        c.weather = w;
        setWeather(w);
        if (c.skyMode === "bali" && c.play) worldRef.current?.setWeather(w.cloud, w.rain);
      });
    Object.assign(c, { camYaw: c.play.yaw, camPitch: 0.32, zoom: 4.6, run: false });
    c.keyAxis = { x: 0, y: 0 };
    c.stick = { x: 0, y: 0 };
    c.busy = c.talking = c.laptop = false;
    setChosen(true);
    setPlaying(true);
    // sound needs a click to start, and this is one (a ?at= link isn't: it starts silent, 🔇 turns it on)
    if (!silent)
      try {
        c.audio ??= createAudio();
        void c.audio.start();
        setSound(true);
      } catch {
        setSound(false);
      }
    toast.current(matchMedia("(pointer: coarse)").matches ? "Left thumb moves, right thumb looks. Tap a prompt to use it." : "WASD to move, drag to look, scroll to zoom. E uses what's near you.");
  }, []);
  const stopPlay = useRef(() => {
    const c = ctl.current;
    c.play = null;
    c.near = null;
    c.busy = c.talking = c.laptop = c.work = c.photo = false;
    setPlaying(false);
    setPlayer(null);
    setNear(null);
    setTalk(null);
    setLaptop(false);
    setWorkAt(null);
    setPhoto(false);
    setPhone(false);
    setReward(null);
    c.race?.cancel();
    c.racing = false;
    setRace(null);
    c.tour?.cancel();
    setTouring(false);
    setTourCard(null);
    worldRef.current?.setWeather(0, 0); // the story keeps its own clear day
  });
  const endTalk = useRef(() => {
    did("pool");
    ctl.current.busy = ctl.current.talking = false;
    setTalk(null);
  });
  const closeLaptop = useRef(() => {
    ctl.current.busy = ctl.current.laptop = false;
    setLaptop(false);
  });
  useEffect(() => {
    if (tourCard === null) return;
    const t = setTimeout(() => setTourCard(null), 9000);
    return () => clearTimeout(t);
  }, [tourCard]);
  const endTour = () => {
    ctl.current.tour?.cancel();
    setTouring(false);
    setTourCard(null);
  };
  const endRace = useRef(() => {
    const c = ctl.current;
    c.race?.cancel();
    c.busy = c.racing = false;
    if (c.play) {
      c.play.action = null;
      c.play.actionT = 0;
    }
    setRace(null);
  });
  const racePress = useRef((p: "L" | "R" | "hit") => {
    const c = ctl.current;
    const race = c.race;
    if (!race || !c.racing) return;
    const now = performance.now() / 1000;
    const ev = race.press(p, now);
    if (!ev) return;
    if (ev === "done") {
      c.raceEndedAt = performance.now();
      const best = race.best();
      endRace.current();
      setReward({ kind: "hyrox", time: race.time(now), best: best !== null && best >= race.time(now) });
      c.audio?.splash();
      return;
    }
    if (ev === "station") c.audio?.splash();
    setRace((v) => ({ station: race.station(), reps: race.reps(), miss: ev === "miss" ? (v?.miss ?? 0) + 1 : v?.miss ?? 0 }));
  });
  const togglePhoto = useRef(() => {
    const c = ctl.current;
    // not over a conversation, the laptop or the work card: they hold the player themselves
    if (!c.photo && c.busy) return;
    c.photo = !c.photo;
    c.busy = c.photo;
    setPhoto(c.photo);
  });
  // the shutter: a postcard of what's on screen, saved as a PNG
  const shoot = useRef(() => {
    const world = worldRef.current;
    if (!world) return;
    const card = postcard(world.snapshot(), `${profile.name}, VelyxLabs`, "Canggu, Bali");
    setFlash((n) => n + 1);
    // made synchronously: iOS only opens the share sheet while the tap is still being handled
    const bytes = atob(card.toDataURL("image/png").split(",")[1]);
    const buf = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
    const blob = new Blob([buf], { type: "image/png" });
    const save = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "bali-postcard.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      setReward({ kind: "photo" });
    };
    // phones hand the postcard to the share sheet; elsewhere, or if sharing fails, it's saved with X a click away
    const file = new File([blob], "bali-postcard.png", { type: "image/png" });
    if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], text: SHARE_PHOTO, url: SITE }).catch((e: Error) => e.name !== "AbortError" && save());
      return;
    }
    save();
  });
  const closeWork = useRef(() => {
    ctl.current.busy = ctl.current.work = false;
    setWorkAt(null);
  });
  const stepWork = useRef((d: number) => setWorkAt((i) => (i === null ? i : (i + d + work.items.length) % work.items.length)));
  const interact = useRef(() => {
    const c = ctl.current;
    const s = c.play;
    if (!s) return;
    // in a conversation, E moves it on
    if (c.talking) {
      setTalk((t) => {
        if (!t) return t;
        if (t.i + 1 < (t.st.talk?.length ?? 0)) return { ...t, i: t.i + 1 };
        did(t.st.id);
        c.busy = c.talking = false;
        return null;
      });
      return;
    }
    const st = c.near;
    if (!st) return;
    if (st.mount || st.id === "off" || st.id === "ashore") {
      swap(s, st);
      c.camYaw = s.yaw;
    } else if (st.talk) {
      c.busy = c.talking = true;
      setTalk({ st, i: 0 });
    } else if (st.laptop) {
      did(st.id);
      c.busy = c.laptop = true;
      setLaptop(true);
      c.warpAt = performance.now();
    } else if (st.tour) {
      did(st.id);
      // straight onto a scooter at the sign, facing west to the first stop, and off
      Object.assign(s.scooter, { x: st.x, z: 16.4, yaw: -Math.PI / 2 });
      swap(s, { ...st, mount: "scooter" });
      c.camYaw = s.yaw;
      (c.tour ??= createTour()).start();
      setTouring(true);
      setTourCard(null);
      toast.current(`Six stops, lane to beach. First: ${STOPS[0].title.toLowerCase()}, just west.`);
    } else if (st.hyrox) {
      // a finishing tap on Enter or E shouldn't roll straight into another race
      if (performance.now() - c.raceEndedAt < 1500) return;
      did(st.id);
      setReward(null);
      const race = (c.race ??= createRace(storage()));
      race.start(performance.now() / 1000);
      c.busy = c.racing = true;
      s.action = "hiit";
      s.actionT = 99;
      setRace({ station: 0, reps: 0, miss: 0 });
    } else if (st.book) {
      did(st.id);
      window.open(profile.booking, "_blank", "noopener");
    } else if (st.work) {
      did(st.id);
      c.busy = c.work = true;
      setWorkAt(0);
    } else if (st.act) {
      did(st.id);
      s.action = st.act;
      s.actionT = st.seconds ?? 6;
    } else if (st.note) {
      did(st.id);
      toast.current(st.note);
    }
    c.near = null;
    setNear(null);
  });
  const toggleSound = async () => {
    let a = ctl.current.audio;
    try {
      a ??= ctl.current.audio = createAudio();
      if (a.on) a.stop();
      else await a.start();
    } catch {
      // no Web Audio here: stays off
    }
    setSound(!!a?.on);
  };
  const cycleSky = () => applySky.current(skyMode === "bali" ? "day" : skyMode === "day" ? "night" : "bali");
  // the touch stick: drag from its centre, up to its rim
  const stickRef = useRef<HTMLDivElement>(null);
  const stickPtr = useRef<number | null>(null);
  const moveStick = (e: React.PointerEvent) => {
    if (stickPtr.current !== e.pointerId || !stickRef.current) return;
    const b = stickRef.current.getBoundingClientRect();
    let x = (e.clientX - (b.left + b.width / 2)) / (b.width / 2);
    let y = -(e.clientY - (b.top + b.height / 2)) / (b.height / 2);
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    ctl.current.stick = { x, y };
    (stickRef.current.firstChild as HTMLElement).style.transform = `translate(${x * 34}px, ${-y * 34}px)`;
  };
  const endStick = (e: React.PointerEvent) => {
    if (stickPtr.current !== e.pointerId) return;
    stickPtr.current = null;
    ctl.current.stick = { x: 0, y: 0 };
    if (stickRef.current) (stickRef.current.firstChild as HTMLElement).style.transform = "";
  };

  /* ---------- the title screen ---------- */
  const [sel, setSel] = useState(0);
  useEffect(() => {
    ctl.current.title = !chosen;
  }, [chosen]);
  const watch = () => {
    begin();
    setChosen(true);
  };
  useEffect(() => {
    ctl.current.ar = ar;
  }, [ar]);
  const closeAr = useCallback(() => setAr(false), []);
  // ?ar opens the villa in AR straight away
  useEffect(() => {
    if (new URLSearchParams(location.search).has("ar")) setAr(true);
  }, []);
  // a ?at= link (a business card, a post) skips the title and starts you there
  useEffect(() => {
    if (!ready) return;
    const at = spawnFrom(location.search);
    if (at) startPlay(at, true);
  }, [ready, startPlay]);
  const titleKey = useRef((_e: KeyboardEvent) => undefined as void);
  titleKey.current = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "s", "w"].includes(e.key)) {
      e.preventDefault();
      setSel((v) => 1 - v);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (sel === 0) startPlay();
      else watch();
    }
  };

  const leaveLaptop = () => (ctl.current.play ? closeLaptop.current() : ctl.current.goTo(N - 2));
  const ch = CHAPTERS[active];
  const shownHour = playing ? playHour : hour;
  const { time, ampm } = clock(skyMode === "bali" && playing ? baliHour(new Date()) : shownHour);
  const night = shownHour >= 19.5 || shownHour < 5.5;
  const skyLabel = skyMode === "day" ? "☀ Golden hour" : skyMode === "night" ? "☾ Night" : `${weather ? WEATHER_ICON[weather.kind] : "🌴"} Bali now${weather?.temp != null ? ` · ${weather.temp}°` : ""}`;
  const line = talk?.st.talk?.[talk.i];
  // the phone fills up as the day happens
  const inbox = [
    { who: "Luca", text: "Pool at 2? Bring ideas, not slides.", on: true },
    { who: "Kwame", text: "Same time tomorrow. Don't skip legs.", on: done.includes("gym") },
    { who: "Mateo", text: "Saw your post. Can we talk agents this week?", on: done.includes("sofa") },
    { who: "Luca", text: "Sending the scope doc tonight. Let's build it.", on: done.includes("pool") },
    { who: "Kenji", text: "Respect for the 4°C. Sauna after?", on: done.includes("ice") },
  ].filter((m) => m.on).reverse();

  return (
    <main className={`life${night ? " is-night" : ""}${playing ? " is-riding" : ""}${photo ? " is-photo" : ""}`}>
      <canvas ref={canvasRef} className="life__canvas" aria-hidden="true" />

      <div className={`life__loader${ready && lit >= LOADER_NAME.length ? " is-done" : ""}`} aria-hidden={ready}>
        <LoaderArt progress={loaded} />
        <p className="life__loader-name" aria-label="Atharv Golait">
          {LOADER_NAME.split("").map((c, i) => (
            <span key={i} aria-hidden="true" className={i < lit ? "is-on" : undefined} style={{ "--i": i } as CSSProperties}>
              {c}
            </span>
          ))}
        </p>
        <p className="life__loader-note">Waking up the day, {loaded}%</p>
      </div>

      <div className="life__ui" ref={uiRef}>
        <header className="life__top">
          <div className="glass life__id">
            <span className="life__name">{profile.name}</span>
            <span className="life__role">Founder, VelyxLabs</span>
          </div>
        </header>

        {!playing && chosen && (
          <button type="button" className="life__sound glass" aria-label={sound ? "Mute" : "Sound on"} onClick={toggleSound}>
            {sound ? "🔊" : "🔇"}
          </button>
        )}
        <div className="life__clock glass" aria-label={`Time of day ${time} ${ampm}`}>
          <span className="life__clock-icon" aria-hidden="true">{night ? "☾" : "☀"}</span>
          <span className="life__clock-time">
            {time}
            <small>{ampm}</small>
          </span>
        </div>

        {!playing && chosen && (
          <>
            <section className="life__card glass" ref={cardRef} aria-live="polite">
              <span className="life__time">{clock(ch.hour).time} {clock(ch.hour).ampm}</span>
              <h1 className="life__title">{ch.title}</h1>
              <p className="life__text">{ch.text}</p>
              {ch.cta && (
                <a className="life__cta" href={ch.cta.href} target="_blank" rel="noopener noreferrer">
                  {ch.cta.label} <span aria-hidden="true">↗</span>
                </a>
              )}
            </section>

            <nav className="life__pills glass" aria-label="Moments of the day">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.zone}
                  type="button"
                  className={i === active ? "is-on" : ""}
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => ctl.current.goTo(i)}
                >
                  {c.pill}
                </button>
              ))}
            </nav>

            {active === 0 && <p className="life__hint">Scroll to spend the day</p>}

            {active === N - 2 && (
              <aside className="gate glass">
                <p className="gate__q">Want to see more about Atharv?</p>
                <p className="gate__a">My work, my story and the agents I've shipped, all on my laptop.</p>
                <button type="button" onClick={() => ctl.current.goTo(N - 1)}>
                  Open my laptop <span aria-hidden="true">→</span>
                </button>
              </aside>
            )}

            <button type="button" className="life__play" onClick={() => startPlay()}>
              <span aria-hidden="true">🎮</span> Live it
            </button>
          </>
        )}

        <MiniMap active={active} player={player} />
      </div>

      {ready && !chosen && (
        <div className="title" role="dialog" aria-label="How do you want to spend the day?">
          {/* the name itself stands on the pool deck, in 3D (titleword.ts) */}
          <div className="title__block">
            <h1 className="title__name">A day in Bali with Atharv Golait</h1>
            <p className="title__kicker">
              <span>A day in Bali</span>
              <span>Canggu</span>
              <span>Day 01</span>
            </p>
            <ul className="title__menu" role="menu">
              {[
                { label: "Live it", sub: "Free roam. Walk the villa, ride the scooter, take the jet ski out.", go: () => startPlay() },
                { label: "Watch my day", sub: "Ten moments, sunrise to midnight. Just scroll.", go: watch },
              ].map((m, i) => (
                <li key={m.label} role="none">
                  <button type="button" role="menuitem" className={sel === i ? "is-sel" : ""} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={m.go}>
                    <span className="title__num">0{i + 1}</span>
                    <span className="title__label">{m.label}</span>
                    <span className="title__sub">{m.sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p className="title__help">
            <span className="title__keys"><kbd>↑</kbd><kbd>↓</kbd> choose <kbd>Enter</kbd> start</span>
            <span>Founder, VelyxLabs · best with sound</span>
            <button type="button" className="title__ar" onClick={() => setAr(true)}>🏝 See it in AR</button>
          </p>
        </div>
      )}

      {playing && (
        <div className="ride">
          <div className="ride__markers" ref={markersRef} aria-hidden="true">
            {STATIONS.map((p) => (
              <div key={p.id} className={`ride__marker${p.act || p.talk || p.laptop ? "" : " is-place"}`}>
                <b>{p.label}</b>
                <span />
              </div>
            ))}
            <div className="ride__marker is-ride"><b>🛵 Scooter</b><span /></div>
            <div className="ride__marker is-ride"><b>🌊 Jet ski</b><span /></div>
          </div>
          {touring && (
            <div className="ride__marker is-tour" ref={tourMarkRef} aria-hidden="true">
              <b>{STOPS[ctl.current.tour?.next() ?? 0]?.title}</b>
              <span />
            </div>
          )}
          {touring && tourCard !== null && (
            <div className="tourcard glass" role="status">
              <p className="talk__who">Canggu tour · stop {tourCard + 1} of {STOPS.length}</p>
              <h3>{STOPS[tourCard].title}</h3>
              <p>{STOPS[tourCard].line}</p>
              <p className="tourcard__next">Next: {STOPS[tourCard + 1]?.title.toLowerCase()} →</p>
            </div>
          )}
          {touring && tourCard === null && (
            <button type="button" className="tourcard__end glass" onClick={endTour}>End the tour</button>
          )}

          <div className="ride__bar glass">
            <strong>{MODE_LABEL[mode]}</strong>
            <span className="ride__keys">
              <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Shift</kbd> {mode === "walk" ? "run" : "boost"} · <kbd>E</kbd> interact
            </span>
            <button type="button" className="ride__icon" aria-label={sound ? "Mute" : "Sound on"} onClick={toggleSound}>{sound ? "🔊" : "🔇"}</button>
            <button type="button" className="ride__sky" title="The sky: Bali right now, golden hour, or night" onClick={cycleSky}>{skyLabel}</button>
            <button type="button" className="ride__icon ride__cam" aria-label="Photo mode" title="Photo mode (C)" onClick={() => togglePhoto.current()}>📷</button>
            <button type="button" onClick={() => stopPlay.current()}>Back to the story</button>
          </div>

          {workAt !== null && (() => {
            const w = work.items[workAt];
            const [name, sub] = w.name.split(" – ");
            return (
              <div className="workcard glass" role="dialog" aria-label="Client work">
                <img src={w.image.replace("/upload/", "/upload/w_1200,q_auto,f_auto/")} alt={`${name}, screenshot`} />
                <div className="workcard__body">
                  <p className="talk__who">{workAt + 1} / {work.items.length}</p>
                  <h3>{name}</h3>
                  <p>{sub}</p>
                  <div className="talk__end">
                    <a className="life__cta" href={w.href} target="_blank" rel="noopener noreferrer">Visit <span aria-hidden="true">↗</span></a>
                    <button type="button" aria-label="Previous project" onClick={() => stepWork.current(-1)}>←</button>
                    <button type="button" aria-label="Next project" onClick={() => stepWork.current(1)}>→</button>
                    <button type="button" onClick={() => closeWork.current()}>Close <kbd>Esc</kbd></button>
                  </div>
                </div>
              </div>
            );
          })()}
          <p ref={trialRef} className="trial glass" hidden />
          <a className="ride__book glass" href={profile.booking} target="_blank" rel="noopener noreferrer">Book a call <span aria-hidden="true">↗</span></a>
          {photo && (
            <div className="photo">
              <p className="photo__hint glass">Drag to frame, scroll to zoom · <kbd>Enter</kbd> shoot · <kbd>C</kbd> back</p>
              <button type="button" className="photo__shutter" aria-label="Take the photo" onClick={() => shoot.current()} />
              <button type="button" className="photo__close glass" onClick={() => togglePhoto.current()}>Done</button>
            </div>
          )}
          {flash > 0 && <div key={flash} className="photo__flash" aria-hidden="true" />}
          {near && !talk && workAt === null && (
            <button type="button" className="ride__prompt glass" onClick={() => interact.current()}>
              <span>{near.label}</span>
              <strong>{near.verb}</strong>
              <kbd>E</kbd>
            </button>
          )}
          {note && <p className="ride__note glass" role="status">{note}</p>}
          {race && (() => {
            const st = HYROX[race.station];
            return (
              <div className="hyrox glass" ref={raceRef} role="dialog" aria-label="HYROX challenge">
                <div className="hyrox__top">
                  <p className="talk__who">HYROX · {race.station + 1} of {HYROX.length}</p>
                  <p className="hyrox__clock">0:00.0</p>
                </div>
                <h3 className="hyrox__name">{st.name} <small>{st.what}</small></h3>
                {st.kind === "alt" ? (
                  <>
                    <div className="hyrox__bar"><span style={{ width: `${(race.reps / st.reps) * 100}%` }} /></div>
                    <p className="hyrox__how">Alternate <kbd>←</kbd> <kbd>→</kbd> as fast as you can</p>
                    <div className="hyrox__pads">
                      <button type="button" onPointerDown={() => racePress.current("L")}>Left</button>
                      <button type="button" onPointerDown={() => racePress.current("R")}>Right</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hyrox__track">
                      <span className="hyrox__zone" style={{ left: `${ZONE[0] * 100}%`, width: `${(ZONE[1] - ZONE[0]) * 100}%` }} />
                      <span className="hyrox__needle" />
                    </div>
                    <p className="hyrox__how">
                      <kbd>Space</kbd> when the needle is in the zone · {race.reps}/{st.reps}
                      {race.miss > 0 && <em key={race.miss} className="hyrox__miss"> +1s</em>}
                    </p>
                    <div className="hyrox__pads">
                      <button type="button" onPointerDown={() => racePress.current("hit")}>Now!</button>
                    </div>
                  </>
                )}
                <button type="button" className="hyrox__quit" onClick={() => endRace.current()}>Quit <kbd>Esc</kbd></button>
              </div>
            );
          })()}
          {reward && (
            <div className="pass glass" role="dialog" aria-label={reward.kind === "photo" ? "Share your postcard" : "Founder pass"}>
              {reward.kind === "hyrox" && (
                <>
                  <p className="talk__who">HYROX sim{reward.best ? " · new best" : ""}</p>
                  <h3 className="pass__big">{clockText(reward.time)}</h3>
                  <p>All eight stations done. Atharv races the real thing in 2027: HYROX Bangalore, Mumbai and Delhi.</p>
                  <div className="talk__end">
                    <a className="life__cta" href={xPost(`Finished the HYROX sim in Atharv Golait's Bali villa gym in ${clockText(reward.time)} 🏋️ Your turn:`, `${SITE}/?at=gym`)} target="_blank" rel="noopener noreferrer">Post my time on X <span aria-hidden="true">↗</span></a>
                    <button type="button" onClick={() => setReward(null)}>Back to the gym</button>
                  </div>
                </>
              )}
              {reward.kind === "tour" && (
                <>
                  <p className="talk__who">Canggu tour · done</p>
                  <h3 className="pass__big">That's my Canggu.</h3>
                  <p>{STOPS[STOPS.length - 1].line} Thanks for riding along. If you're building something, come talk about it.</p>
                  <div className="talk__end">
                    <a className="life__cta" href={bookWith(profile.booking, "Rode the Canggu tour")} target="_blank" rel="noopener noreferrer">Book a call <span aria-hidden="true">↗</span></a>
                    <a href={xPost("Rode a scooter tour of Canggu inside Atharv Golait's portfolio 🛵🌴", `${SITE}/?at=lane`)} target="_blank" rel="noopener noreferrer">Post it on X ↗</a>
                    <button type="button" onClick={() => setReward(null)}>Keep riding</button>
                  </div>
                </>
              )}
              {reward.kind === "run" && (
                <>
                  <p className="talk__who">Founder pass</p>
                  <h3 className="pass__big">{clockText(reward.time)}</h3>
                  <p>{reward.best ? "Beach run, a new best. " : "Beach run done. "}Riders who make it to the sand get a call with Atharv, no pitch deck needed.</p>
                  <div className="talk__end">
                    <a className="life__cta" href={bookWith(profile.booking, `Founder pass: beach run ${clockText(reward.time)}`)} target="_blank" rel="noopener noreferrer">Book a call <span aria-hidden="true">↗</span></a>
                    <a href={xPost(`Just did the beach run through Atharv Golait's Bali villa in ${clockText(reward.time)} 🛵 Beat that:`, `${SITE}/?at=lane`)} target="_blank" rel="noopener noreferrer">Post my time on X ↗</a>
                    <button type="button" onClick={() => setReward(null)}>Keep riding</button>
                  </div>
                </>
              )}
              {reward.kind === "medals" && (
                <>
                  <p className="talk__who">All {MEDALS.length} medals</p>
                  <h3 className="pass__big">🥇🥇🥇🥇🥇🥇</h3>
                  <p>Six marathons, six gold medals, and now you've found every one. That earns you a free automation audit of your business.</p>
                  <div className="talk__end">
                    <a className="life__cta" href={bookWith(profile.booking, "Found all 6 medals: free automation audit")} target="_blank" rel="noopener noreferrer">Claim the audit <span aria-hidden="true">↗</span></a>
                    <a href={xPost("Found all 6 hidden gold medals in Atharv Golait's Bali villa 🥇 Can you?", SITE)} target="_blank" rel="noopener noreferrer">Post it on X ↗</a>
                    <button type="button" onClick={() => setReward(null)}>Keep exploring</button>
                  </div>
                </>
              )}
              {reward.kind === "photo" && (
                <>
                  <p className="talk__who">Postcard saved</p>
                  <p>Attach it to a post and tag @Atharv_Golait.</p>
                  <div className="talk__end">
                    <a className="life__cta" href={xPost(SHARE_PHOTO, SITE)} target="_blank" rel="noopener noreferrer">Post on X <span aria-hidden="true">↗</span></a>
                    <button type="button" onClick={() => setReward(null)}>Close</button>
                  </div>
                </>
              )}
            </div>
          )}

          {talk && line && (
            <div className="talk glass" role="dialog" aria-label={talk.st.label}>
              <p className="talk__who">{line.who}</p>
              <p className="talk__line">{line.line}</p>
              {talk.i + 1 < (talk.st.talk?.length ?? 0) ? (
                <button type="button" onClick={() => interact.current()}>Next <kbd>E</kbd></button>
              ) : (
                <div className="talk__end">
                  <a className="life__cta" href={profile.booking} target="_blank" rel="noopener noreferrer">Book a call <span aria-hidden="true">↗</span></a>
                  <button type="button" onClick={() => endTalk.current()}>Back to the pool</button>
                </div>
              )}
            </div>
          )}

          <button type="button" className={`phone-btn glass${phone ? " is-on" : ""}`} aria-label={phone ? "Put the phone away" : "Check my phone"} onClick={() => setPhone((v) => !v)}>
            <svg aria-hidden="true" width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="1" width="14" height="20" rx="3.5" /><path d="M7 4h4" strokeLinecap="round" /></svg>
            {inbox.length > 1 && !phone && <i>{inbox.length}</i>}
          </button>
          {phone && (
            <aside className="phone" aria-label="Atharv's phone">
              <div className="phone__notch" />
              <p className="phone__time">{time}</p>
              <p className="phone__head">Messages</p>
              <ul className="phone__msgs">
                {inbox.map((m) => (
                  <li key={m.who + m.text}>
                    <b>{m.who}</b>
                    <span>{m.text}</span>
                  </li>
                ))}
              </ul>
              <p className="phone__head">Medals · {medalCount}/{MEDALS.length}</p>
              <p className="phone__medals" aria-label={`${medalCount} of ${MEDALS.length} medals found`}>
                {MEDALS.map((m, i) => <span key={m.id} className={i < medalCount ? "is-done" : ""}>🥇</span>)}
              </p>
              <p className="phone__head">Today · {done.length}/{STATIONS.length}</p>
              <div className="phone__day">
                {STATIONS.map((st) => (
                  <span key={st.id} className={done.includes(st.id) ? "is-done" : ""} title={st.label}>{st.label}</span>
                ))}
              </div>
              <button type="button" className="phone__ar" onClick={() => setAr(true)}>🏝 Put the villa on your table (AR)</button>
              <a className="phone__cta" href={profile.booking} target="_blank" rel="noopener noreferrer">Book a call with Atharv ↗</a>
            </aside>
          )}

          <div
            ref={stickRef}
            className={`stick${talk || laptop || race ? " is-off" : ""}`}
            aria-label="Move"
            onPointerDown={(e) => {
              stickPtr.current = e.pointerId;
              e.currentTarget.setPointerCapture(e.pointerId);
              moveStick(e);
            }}
            onPointerMove={moveStick}
            onPointerUp={endStick}
            onPointerCancel={endStick}
          >
            <span />
          </div>
        </div>
      )}

      <div className="life__os" ref={osRef} aria-hidden={!(atLaptop || laptop)}>
        {/* the laptop on the desk: Atharv OS inside a MacBook Pro, the room soft behind it */}
        <div className={`mbp${atLaptop || laptop ? " is-on" : ""}`}>
          <div className="mbp__lid">
            <span className="mbp__cam" aria-hidden="true" />
            <div className="mbp__screen">
              <AtharvOS active={atLaptop || laptop} onExit={leaveLaptop} />
            </div>
            <p className="mbp__chin" aria-hidden="true">MacBook Pro</p>
          </div>
          <div className="mbp__base" aria-hidden="true" />
        </div>
        {(atLaptop || laptop) && (
          <button type="button" className="os-back" onClick={leaveLaptop}>
            <span aria-hidden="true">←</span> Back to the desk
          </button>
        )}
      </div>

      {ar && <ArVilla onClose={closeAr} />}

      <div className="life__track" style={{ height: `${(N - 1) * STEP * 100 + 100}vh` }}>
        {CHAPTERS.map((c, i) => (
          <div key={c.zone} id={`day-${c.zone}`} className="life__anchor" style={{ top: `${i * STEP * 100}vh` }} />
        ))}
      </div>
    </main>
  );
}
