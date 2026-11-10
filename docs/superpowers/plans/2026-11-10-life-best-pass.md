# "Make it the best" pass (Bali villa + Live it) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the Bali villa day-scroll and the Live it game from "works at 30 fps" to a steady 60 fps, then add the approved premium, alive and extras layers.

**Architecture:** Everything renders from one closure, `createWorld` in `src/life/world.ts`, fed a `Frame` per tick by `src/pages/Life.tsx`; game rules live in `src/life/play.ts`. Phase B changes how that closure renders (lights, shadow, post chain, culling) without changing what it shows. Phases A, C and D add small self-contained modules beside it (`fx.ts`, `trial.ts`, `photo.ts`) and wire them in at one call site each, so `world.ts` stops growing.

**Tech Stack:** three.js 0.170, n8ao 1.9, three-mesh-bvh, React + Vite, Blender build scripts (only touched if a fix cannot be done at load time), puppeteer-core headless Chrome for measurement.

**Spec:** the approved scope below (agreed with Atharv on 2026-11-10; there is no separate spec file).

- **A, premium:** image-based lighting, better skin (less orange, slight glow), contact shadows under people, 3D grass, toned-down bricks, night pool lights, lanterns and fireflies.
- **B, smooth:** steady 60 fps, loading progress.
- **C, alive:** idle breathing and looking around, pool splash with camera dip, scooter headlight at night, jet ski wake, one timed scooter/jet ski run with a best time, client projects as framed screens in the studio that open on interact.
- **D, extras:** photo mode (postcard PNG with "Atharv Golait, VelyxLabs"), an always-reachable Book a call at the gate, the Avaturn face once the GLB arrives.
- **Order:** B → A → C → D. Each phase leaves the site working and is a stopping point.

## Global Constraints

- No `git commit`, `git push` or deploy unless Atharv asks in that moment. Checkpoints are bench numbers and screenshots, not commits.
- Keep the UI light: no XP, quest or stats panels (rejected before).
- Every new effect is gated by the existing `low` tier flag (phones, ≤4 cores): off or reduced there.
- No new real-time lights. Night glow is emissive + bloom, baked lamp map, or the existing `carry` light. (Each added light recompiles every lit shader and costs every fragment.)
- No AI-generated images; anything new is code-built or Atharv's own files.
- No licensed audio: new sounds go through the procedural `src/life/audio.ts`.
- Bench only in headless Chrome (`bench.mjs`, flags `--disable-gpu-vsync --disable-frame-rate-limit`); never in the Claude-in-Chrome tab.
- Screenshots of animated states use the page's `?still` mode.
- Dev server: `npx vite --port 5195`.
- `npx tsc --noEmit -p tsconfig.app.json` and `npm run lint` stay clean for the files touched.

## Review Focus

1. **Phone / low tier:** a 390×844 viewport with `low` true must not get slower or lose a shot. Pinned in Task B4 (phone bench row) and each A/C task's low gate.
2. **Dusk transition:** scrolling through 17:30–19:30 must not hitch when night-only things switch on. Pinned in Task B2 (frame-time trace across the hour sweep).
3. **Storage blocked:** private windows throw on `localStorage`; the timed run must still work and just not remember. Pinned in Task C4's test.
4. **Tab hidden mid-run:** the timer must pause, not record a 40-minute "best time" or a huge `dt` step. Pinned in Task C4's test.
5. **Portrait camera:** new props (lanterns, frames, gate sign) must not sit where the 1.22× portrait pull-back camera clips them. Pinned in Task A5's portrait screenshots.

---

## Phase B: steady 60 fps

Known so far: real Chrome on the M5 runs Live it at ~30 fps; headless unlocked reads 43 at the pool spot; hiding all plain meshes gives 84; JS is ~4 ms; N8AO ~10%; ~380 draws, ~2.3M triangles with the shadow pass. Whether the cost scales with resolution is **unknown** (the old `dpr` variants were invalid).

**Target:** headless unlocked ≥ 90 fps at `title`, `play` and `pool` (1470×835 @2x). That is the margin at which real, vsynced Chrome holds 60.

### Task B1: a bench that names the cost

**Files:**
- Create: `<scratchpad>/bench2.mjs` (from the old session's `bench.mjs`; not in the repo)
- Modify: `src/life/world.ts` (`debug` object only)

**Interfaces:**
- Produces: `world.debug` gains `scene`, `camera`, `rt` (the composer target), `lamps`, `setScale(k: number)` (sets `scale`, then pixel ratio and `resize()`), so variants can be toggled from the page.
- Produces: `node bench2.mjs [spot] [variant,variant…]` printing JSON `{base, variants: {name: fps}}`; spots `title | play | pool | beach | night` (`night` = pool spot at hour 21).

- [ ] **Step 1:** extend `debug` as above.
- [ ] **Step 2:** write `bench2.mjs` with these variants, each undone before the next:
  - `scale50`: `setScale(0.5)` → fill-rate bound or not
  - `basic`: `scene.overrideMaterial = MeshBasicMaterial` → shader cost vs geometry cost
  - `noshadow`: `renderer.shadowMap.enabled=false` plus `sun.castShadow=false`
  - `nolamps`: remove the 6 lamps and `carry` from the scene (not intensity 0)
  - `noao`: `ao.enabled=false` with a plain `RenderPass` in its place
  - `nomsaa`: composer target `samples = 0`
  - `nofar`: hide meshes whose bounding sphere radius > 40
  - `noenv`, `nobloom`, `nograde`
- [ ] **Step 3:** run all variants at `pool`, `play`, `beach`, `night` in the background (each run under 100 s; split the variant list in halves). Record the table at the bottom of this file under "B1 results".

**Done when:** the table exists and the top three costs add up to most of the gap between base and 90.

### Task B2: apply the fixes the table points to

**Files:** Modify `src/life/world.ts`; possibly `src/life/nature.ts`, `src/life/merge.ts`.

Apply in order of measured gain, re-benching after each; stop when the target is met. The fix for each cost is decided here:

| If this variant gains ≥ 8 fps | Fix |
|---|---|
| `nolamps` | The six room lamps become night-only: removed from the scene while `night < 0.02`, added back above it, with both shader variants warmed by `renderer.compileAsync` during load so dusk does not hitch. If night still misses target, drop to the two lamps nearest the camera and lean on the baked `lampMap`. |
| `noshadow` | `PCFSoftShadowMap` instead of VSM (no blur passes); map 2048 → 1536; `castShadow` only for meshes inside the 28 m shadow box's reach (radius < 12, not < 40). |
| `nomsaa` | Composer target `samples: 2`; if edges visibly crawl, add an SMAA pass and use `samples: 0`. |
| `noao` | `ao.setQualityMode("Low")`, keep `halfRes`; confirm N8AO is not rendering the scene a second time on top of the composer's target (read `node_modules/n8ao/dist/N8AO.js`; if it is, hand it the beauty target). |
| `scale50` (fill bound) | Cap `dpr` at 1.4 high tier; let `adapt()` engage sooner (drop at > 19 ms, recover at < 14 ms). |
| `basic` but not `scale50` (shader bound on big surfaces) | Simplify the patched ground/sea/caustics fbm: fewer octaves past 40 m from the camera, by distance in the fragment shader. |
| `nofar` (geometry bound) | Split far landscape meshes into ≤ 120 m cells so frustum culling drops what is behind the camera. Do it at load in `merge.ts` (it already walks the villa); delete `mergeStatic`'s unused merge path if it still merges nothing. |

- [ ] **Step 1:** apply fix 1, re-bench the four spots, append numbers.
- [ ] **Step 2:** repeat for the next fix until `title`, `play`, `pool`, `beach` ≥ 90 and `night` ≥ 75.
- [ ] **Step 3 (dusk hitch, Review Focus 2):** in headless, sweep `hour` 17 → 20 over 6 s and log the worst frame. Expected: no frame over 34 ms after the first second.
- [ ] **Step 4:** screenshot the nine story chapters and the pool/beach/night game spots before and after (`?still`); compare side by side. Expected: no visible loss a viewer would notice at normal size; list any that are visible and get Atharv's call.
- [ ] **Step 5:** remove `merge.ts` and its call if profiling ended with it unused; keep `litCopy`.

### Task B3: loading progress

**Files:** Modify `src/life/world.ts` (the `onProgress` calls), `src/pages/Life.tsx` (title screen), `src/life/life.css`.

Today progress jumps 15 → 60 → 62 → 65 → 90 → 100 and `men.glb` and the two lightmaps report nothing.

- [ ] **Step 1:** make progress byte-weighted across `villa.glb`, `men.glb`, the two lightmaps and `paddies.json` (0–85%), then 85–100% for shader warm-up via `renderer.compileAsync(scene, camera)`, so the first frame after "Start" does not stall.
- [ ] **Step 2:** on the title screen show one thin bar and the percentage under the menu; menu items are disabled until 100.
- [ ] **Step 3:** verify with network throttled to "Fast 4G" in headless: the percentage never goes backwards and never sits still for more than 2 s; the first frame after Start is under 50 ms.

### Task B4: confirm on the real thing

- [ ] **Step 1:** phone row: bench at 390×844 @3x (`low` tier). Expected: no slower than before the phase (record both).
- [ ] **Step 2:** ask Atharv to open `http://localhost:5195` in his normal Chrome, play for a minute, and report whether it feels smooth. (Headless numbers are the proxy; his screen is the test.)
- [ ] **Step 3:** update the memory file: perf findings become "what fixed it", the "Next step" list is replaced.

---

## Phase A: premium look

New file `src/life/fx.ts` holds the small visual add-ons; each is a function that takes what it needs and returns `{ object, update(t, night) }`. `world.ts` calls them once and ticks them in `render()`.

### Task A1: lighting and skin

**Files:** Modify `src/life/world.ts` (`light()`), `src/life/cast.ts` (body materials), `src/life/nature.ts` (new `patchSkin`).

- **Image-based lighting:** the sky dome already feeds a PMREM environment (`sky.ts`). Keep that (it follows the time of day; a downloaded HDRI would not) and make it do the ambient work: hemisphere light down to ~35% of today's intensity, `environmentIntensity` up to compensate, so shaded sides pick up sky colour instead of a flat fill.
- **Skin:** `patchSkin(mat)` desaturates the albedo slightly toward neutral brown (less orange), sets roughness ≈ 0.55, and adds a soft fresnel rim tinted by the sun colour (the "slight glow").
- [ ] Implement; screenshot the pool mastermind, gym and rooftop chapters at 07:00, 13:00, 18:30, 21:00; adjust until skin reads natural in all four. Bench: no spot drops more than 2 fps.

### Task A2: contact shadows

**Files:** Create `src/life/fx.ts` (`contactShadows(count: number)`); modify `world.ts` (`perform()`).

- One `InstancedMesh` of soft radial-gradient quads (multiply blend, no depth write), one per visible body, placed at the body's feet on `groundY`, squashed along the sun direction; in the pool it sits on the pool floor and fades. No extra shadow pass.
- [ ] Implement; screenshot gym, rooftop, beach run. Expected: every standing figure is visibly grounded; nothing floats.

### Task A3: grass, bricks

**Files:** Modify `src/life/nature.ts` (`grass`), `src/life/world.ts` (material pass).

- **Grass:** `grass(low)` exists; read it first. Target: instanced curved blades with wind, dense within 25 m of the camera and fading out by distance in the shader; ~60k blades high tier, ~12k low. Lawn only.
- **Bricks:** at load, for brick materials: `normalScale` × 0.5 and the base colour pulled 25% toward its own average (lower contrast). No Blender rebuild.
- [ ] Implement; before/after screenshots of the garden and the lane wall; bench stays ≥ target.

### Task A4: night pool lights, lanterns, fireflies

**Files:** `src/life/fx.ts` (`poolLights()`, `fireflies(n: number)`), `src/life/nature.ts` (`patchCaustics` gets a night term), `world.ts`.

- **Pool:** four emissive underwater discs on the pool walls plus a night term in the pool-stone shader that paints soft moving light pools on the floor; `pool_water` emissive stays.
- **Lanterns:** eight emissive path lanterns (instanced) along the garden path and gate; they bloom, they do not light.
- **Fireflies:** 120 `Points` over the garden and rice edge, each drifting on its own slow loop and pulsing; night only; 40 on low tier.
- [ ] Implement; screenshots at 19:30 and 21:00 from the pool, garden and gate; night bench ≥ 75.

### Task A5: portrait check (Review Focus 5)

- [ ] Screenshot all chapters at 390×844; nothing new clips the camera or blocks a shot.

---

## Phase C: alive

### Task C1: idle life

**Files:** Modify `src/life/world.ts` (`player()`, `pose()`).

- Standing still for > 0.6 s in the game: chest rise on a 4 s breath, weight shift, and a head look toward a random nearby point every 3–6 s (eased). Story poses get the breath only.
- [ ] Implement; a 6 s headless capture shows the head turning at least once.

### Task C2: pool splash, headlight, wake

**Files:** `src/life/fx.ts` (`wake()`), `world.ts` (`splash()`, `town()`), `src/pages/Life.tsx` (camera), `src/life/audio.ts`.

- **Splash:** on `wading` false → true, burst 60 particles from the existing spray pool, play a procedural splash, and dip the camera 0.25 m over 0.4 s (skipped under `prefers-reduced-motion`).
- **Headlight:** when `night > 0.3` on the scooter: an additive cone mesh from the lamp and a soft light pool decal on the road 4 m ahead; the existing `carry` light moves 2 m forward. No new light.
- **Wake:** a ribbon of 40 segments trailing the jet ski on the water, widening and fading over 3 s.
- [ ] Implement; screenshots of each; bench at sea ≥ target.

### Task C3: project frames in the studio

**Files:** Modify `src/life/play.ts` (`STATIONS`), `world.ts` (frames), `src/pages/Life.tsx` (overlay), `src/life/life.css`.

- Three framed screens on the studio wall using `public/life/northloop.webp`, `contour.webp`, `plotline.webp`; names and one-liners come from the existing `work.items` in `src/os/apps.tsx`.
- One station "Work wall" (verb "Look"); interacting opens a light overlay: screenshot, name, one line, "Visit ↗", arrows to step between the three. Esc or walking away closes it.
- [ ] Implement; headless: teleport to the wall, press the interact key, assert the overlay shows a project name and closes on Esc.

### Task C4: the timed run

**Files:** Create `src/life/trial.ts`, `src/life/trial.test.mjs`; modify `play.ts` (one station), `Life.tsx` (timer readout).

**Interfaces:**
- Produces: `createTrial(store: Pick<Storage, "getItem" | "setItem"> | null)` → `{ start(now: number), tick(now: number, x: number, z: number, hidden: boolean): "idle" | "running" | "done", time(): number, best(): number | null }`.

- The run: scooter from the villa gate to the beach lot, three gates along the lane. Started from a small flag at the gate; UI is one line top-centre (`0:23.4 · best 0:21.9`) and nothing else.
- [ ] **Step 1: failing tests** (`node --test src/life/trial.test.mjs`):
  - passing all gates in order finishes and `time()` equals elapsed;
  - a faster second run replaces `best()`, a slower one does not;
  - `tick(…, hidden=true)` does not advance `time()` (Review Focus 4);
  - a `store` whose `setItem` throws, or `null`, still finishes a run and returns `best()` for the session (Review Focus 3);
  - skipping a gate does not finish.
- [ ] **Step 2:** implement until they pass.
- [ ] **Step 3:** wire the station, gates (emissive arches from `fx.ts`) and readout; headless run with teleports completes and shows a best time.

---

## Phase D: extras

### Task D1: photo mode

**Files:** Create `src/life/photo.ts`; modify `world.ts` (expose `snapshot(): HTMLCanvasElement`, rendered and read in the same tick), `Life.tsx`, `life.css`.

- Key `P` or a small camera button in the game: HUD hides, drag orbits freely, the shutter saves a PNG postcard: the frame with a white border and the caption "Atharv Golait, VelyxLabs" set in Geist.
- [ ] Implement; headless: trigger the shutter, assert a PNG download of the expected size whose bottom strip is not black (caption drawn, frame not empty).

### Task D2: Book a call

**Files:** Modify `play.ts` (station at the gate), `Life.tsx` (HUD link).

- A station at the villa gate (verb "Book a call") opening `profile.booking` in a new tab, with a small sign by the gate; plus one quiet text link in the game's corner so it is reachable from anywhere.
- [ ] Implement; headless: the link's `href` equals `profile.booking` at the gate and from the beach.

### Task D3: Atharv's face

Blocked until Atharv exports his Avaturn GLB. Then: bring the head into `blender/build_men.py` for the `atharv` body and re-export `men.glb`.

---

## B1 results

(filled in during Task B1)

Measured headless, 1470×835 @2x, unlocked frame rate. The machine's speed drifted between runs (battery charging), so every variant ran next to a baseline in the same run.

| Finding | Cost | Fix |
|---|---|---|
| N8AO saw transparent materials and re-rendered the scene twice more per frame (each one redrawing the shadow map) | ~35% | `autoDetectTransparency = false`, `transparencyAware = false` |
| Composer target had 4× MSAA but the scene is drawn into N8AO's own (non-MSAA) target: full-screen passes paid for MSAA, edges got none | ~10% | composer target no MSAA; `ao.beautyRenderTarget.samples = 4` (high tier): same cost as before, real edge smoothing |
| Fill-rate bound: half resolution doubled fps | — | DPR cap 1.6 → 1.4 (high tier); adaptive scale reacts at >19 ms; its recovery could never trigger under 60 Hz vsync, now recovers below 17.4 ms up to a learned ceiling |
| VSM shadow 2048, blur 12 | ~17% | 1536, blur 6, radius 4 (halves it) |
| Sea ripple: 18 noise lookups per pixel | ~15% at beach | fine layer one octave (12 lookups) |
| Sky environment re-PMREM every 0.2 h allocated new targets: 125–285 ms freeze, many times while scrolling the story or at dusk | freezes | reused 64 px cube + `fromCubemap` into the same target: 0.7 ms; now refreshes every 0.05 h |
| Lamps, env map, bloom, AO quality, material groups | each ≤ noise | none |

After: pool 80, play 79, night 72, beach 68 fps (same-run baselines before the fixes were 25–49). Dusk sweep 17→20 h: worst frame 47 ms (was 370), median 18.6 ms.
