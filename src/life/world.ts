import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { N8AOPass } from "n8ao";
import { MeshBVH, acceleratedRaycast } from "three-mesh-bvh";
import type { Zone } from "./chapters";
import { work } from "@/content/site";
import { M, rbox, ball, at, group, paint, screen, rest, sit, type Person } from "./kit";
import { castFrom, rig, type Body, type CastId } from "./cast";
import { SEA_LEVEL, groundY, swell, type PlayState } from "./play";
import { createSky } from "./sky";
import { TRIAL_GATES, TRIAL_START } from "./trial";
import { MEDALS } from "./medals";
import { createScaler } from "./adapt";
import { titleWord } from "./titleword";
import { contactShadows, fireflies, headlight, lanterns as pathLanterns, wake } from "./fx";
import { grass, patchCalm, patchCaustics, patchFoam, patchGround, patchSand, patchWater, patchWind, rice, windTime, camFadeA, camFadeB, skinRim } from "./nature";

/**
 * The building Atharv's day happens in: a cutaway villa in Bali with a pool,
 * island. Ground floor is the kitchen and the meeting room, the first floor
 * the studio and the lounge, the roof the gym by morning and the place to
 * meet people by night. One Atharv is on stage at a time, in the zone of the
 * current chapter; the light follows the hour.
 */

export interface Frame {
  cam: THREE.Vector3;
  look: THREE.Vector3;
  hour: number;
  zone: Zone;
  /** Pointer, -0.5..0.5 on each axis. */
  mx: number;
  my: number;
  /** The dive into the laptop, 0..1: a push right into the screen. */
  warp?: number;
  /** The title screen is up: the name stands on the pool deck. */
  title?: boolean;
}

const F = 3.5; // first floor
const RUN_X = 176.5; // the hard sand near the waterline
const R = 7; // roof

/* ---------------- the light through the day ---------------- */

type Key = [number, string, string, string, number, string, number];
// hour, sky top, sky bottom, sun colour, sun intensity, hemisphere sky, hemisphere intensity
const KEYS: Key[] = [
  [5, "#2c3160", "#e9a48e", "#ffb48a", 0.4, "#8c90c8", 0.5],
  [6.5, "#8fb0e4", "#ffd6b8", "#ffc59a", 1.9, "#d9d6ef", 0.85],
  [9, "#79b2ef", "#e4f1ff", "#fff1dc", 2.6, "#e6f0ff", 1.0],
  [13, "#5f9fea", "#d6ebff", "#ffffff", 2.9, "#eaf3ff", 1.05],
  [17, "#6f90d8", "#ffd3a1", "#ffc37e", 2.4, "#f3dfcf", 0.95],
  [18.6, "#4b4f93", "#f59e7c", "#ff9b6a", 1.3, "#c9a7b8", 0.7],
  [20, "#1b2150", "#4b4a86", "#8fa2ff", 0.3, "#5d63a8", 0.28],
  [23, "#0b0f28", "#1d2250", "#8d9cff", 0.22, "#3f4686", 0.2],
];

const cA = new THREE.Color();
const cB = new THREE.Color();
function mix(a: string, b: string, k: number, out = new THREE.Color()) {
  return out.copy(cA.set(a)).lerp(cB.set(b), k);
}

export function skyAt(hour: number) {
  let i = 0;
  while (i < KEYS.length - 2 && hour > KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = THREE.MathUtils.clamp((hour - a[0]) / (b[0] - a[0]), 0, 1);
  return {
    top: mix(a[1], b[1], k),
    bottom: mix(a[2], b[2], k),
    sun: mix(a[3], b[3], k),
    sunI: THREE.MathUtils.lerp(a[4], b[4], k),
    hemi: mix(a[5], b[5], k),
    hemiI: THREE.MathUtils.lerp(a[6], b[6], k),
    night: THREE.MathUtils.smoothstep(hour, 18.2, 20.2),
  };
}

/* ---------------- textures ---------------- */

const font = (w: number, size: number) => `${w} ${size}px Geist, ui-sans-serif, system-ui, sans-serif`;

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

const tvTex = () =>
  paint(1024, 576, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#15151a");
    g.addColorStop(1, "#24242c");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#ff8a5c";
    c.font = font(600, 26);
    c.fillText("VELYXLABS  ·  SCOPING CALL", 64, 86);
    c.fillStyle = "#ffffff";
    c.font = font(700, 64);
    c.fillText("Inbound lead →", 64, 190);
    c.fillText("booked call.", 64, 262);
    c.font = font(500, 26);
    c.fillStyle = "#a9a9b6";
    c.fillText("An agent that qualifies, replies and books. No human in the loop.", 64, 318);
    const bars = [0.34, 0.5, 0.46, 0.62, 0.7, 0.66, 0.84, 0.92];
    bars.forEach((b, i) => {
      c.fillStyle = i === bars.length - 1 ? "#ff8a5c" : "#3b3b46";
      roundRect(c, 64 + i * 112, h - 60 - b * 170, 76, b * 170, 10);
      c.fill();
    });
  });

const neonTex = (text: string, color: string) =>
  paint(1024, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.font = font(800, 150);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.shadowColor = color;
    c.shadowBlur = 40;
    c.fillStyle = color;
    c.fillText(text, w / 2, h / 2 + 6);
    c.shadowBlur = 0;
    c.fillStyle = "#ffffff";
    c.fillText(text, w / 2, h / 2 + 6);
  });

const phoneTex = () =>
  paint(256, 512, (c, w, h) => {
    c.fillStyle = "#000000";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffffff";
    c.font = font(800, 34);
    c.textAlign = "center";
    c.fillText("𝕏", w / 2, 50);
    c.textAlign = "left";
    for (let i = 0; i < 4; i++) {
      const y = 90 + i * 104;
      c.fillStyle = "#2f3336";
      c.fillRect(0, y - 14, w, 1);
      c.fillStyle = i === 0 ? "#ff8a5c" : "#6b6f75";
      c.beginPath();
      c.arc(30, y + 16, 15, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#e7e9ea";
      c.fillRect(56, y + 4, 150, 9);
      c.fillStyle = "#71767b";
      c.fillRect(56, y + 22, 170, 8);
      c.fillRect(56, y + 38, 120, 8);
    }
  });

/** A post card in X's dark style, with Atharv's handle. */
const postTex = (line1: string, line2: string, likes: string) =>
  paint(640, 300, (c, w, h) => {
    c.fillStyle = "#ffffff";
    roundRect(c, 0, 0, w, h, 28);
    c.fill();
    c.fillStyle = "#b9805a";
    c.beginPath();
    c.arc(56, 58, 26, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#0f1419";
    c.font = font(700, 24);
    c.fillText("Atharv Golait", 96, 52);
    c.fillStyle = "#536471";
    c.font = font(500, 20);
    c.fillText("@Atharv_Golait", 96, 80);
    c.fillStyle = "#0f1419";
    c.font = font(500, 27);
    c.fillText(line1, 32, 146);
    c.fillText(line2, 32, 184);
    c.fillStyle = "#f91880";
    c.font = font(600, 22);
    c.fillText(`♥ ${likes}`, 32, 252);
    c.fillStyle = "#536471";
    c.fillText("↻ Repost   ·   Reply", 150, 252);
  });

/* ---------------- the world ---------------- */

export async function createWorld(canvas: HTMLCanvasElement, onProgress: (k: number) => void) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  // quality tier: phones and small machines skip the costlier passes
  const low = window.matchMedia("(max-width: 760px)").matches || (navigator.hardwareConcurrency || 8) <= 4;
  const dpr = Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.4);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  // the sky is also the scene's environment: see sky.ts
  const sky = createSky(renderer, scene);
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.25, 12000);
  scene.fog = new THREE.Fog("#dfe8f2", 300, 9000);

  const hemi = new THREE.HemisphereLight("#ffffff", "#d9c6ad", 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffffff", 2.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 70;
  sun.shadow.radius = 4;
  sun.shadow.blurSamples = 6;
  sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target);
  sun.target.position.set(0, 2, 0);
  const sunDir = new THREE.Vector3(-22, 20, 16);

  // loading: the files by size up to 85%, then warming up the shaders
  const share = { villa: 11.8, men: 3.0, sky: 0.46, lamp: 0.46 };
  const got = { villa: 0, men: 0, sky: 0, lamp: 0 };
  const total = Object.values(share).reduce((a, b) => a + b, 0);
  let shown = 0;
  const report = (k: number) => {
    shown = Math.max(shown, k); // never backwards
    onProgress(shown);
  };
  const part = (key: keyof typeof share) => (e: ProgressEvent | number) => {
    got[key] = typeof e === "number" ? e : e.total ? e.loaded / e.total : got[key];
    report((Object.keys(share) as (keyof typeof share)[]).reduce((a, k) => a + share[k] * got[k], 0) / total * 0.85);
  };

  const world = new THREE.Group();
  scene.add(world);
  const add = (o: THREE.Object3D, x = 0, y = 0, z = 0, ry = 0) => world.add(at(o, x, y, z, ry));

  /* the villa, its garden and Bali around it: built in Blender (blender/build_villa.py) */
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  // decoded off the main thread (an <img> 2048 map decoded during its upload, a 140 ms stall),
  // unflipped for glTF UVs
  const bmpLoader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: "none" });
  const lightmap = async (url: string, key: "sky" | "lamp") => {
    const t = new THREE.Texture(await bmpLoader.loadAsync(url));
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = false;
    t.channel = 1;
    t.needsUpdate = true;
    part(key)(1);
    return t;
  };
  const [gltf, men, skyMap, lampMap] = await Promise.all([
    loader.loadAsync("/life/villa.glb", part("villa")).then((g) => (part("villa")(1), g)),
    loader.loadAsync("/life/men.glb", part("men")).then((g) => (part("men")(1), g)),
    lightmap("/life/villa_sky.webp", "sky"),
    lightmap("/life/villa_lamp.webp", "lamp"),
  ]);
  const cast = castFrom(men.scene);
  Object.values(cast).forEach((b) => {
    b.root.visible = false;
    world.add(b.root);
  });
  const villa = gltf.scene;
  world.add(villa);
  const cityWin: THREE.MeshStandardMaterial[] = [];
  const waters: THREE.MeshStandardMaterial[] = [];
  const fires: THREE.MeshStandardMaterial[] = [];
  const glowMats: THREE.MeshStandardMaterial[] = [];
  const baked: THREE.MeshStandardMaterial[] = [];
  const lanterns: THREE.MeshStandardMaterial[] = [];
  const dayLight = { value: 1 };
  // one lit copy per material, so meshes that shared a material still share one
  const litCopy = new Map<THREE.Material, THREE.MeshStandardMaterial>();
  villa.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    // rooms carry baked light on a second UV set; their material copies get the maps
    if (m.geometry.attributes.uv1) {
      const src = m.material as THREE.MeshStandardMaterial;
      let copy = litCopy.get(src);
      if (!copy) {
        copy = src.clone();
        copy.aoMap = skyMap;
        copy.aoMapIntensity = 0.55;
        copy.lightMap = lampMap;
        copy.lightMapIntensity = 0;
        litCopy.set(src, copy);
        baked.push(copy);
      }
      m.material = copy;
    }
    const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[];
    // the sun's shadow map only covers what is near the camera: the far
    // landscape neither casts into it nor needs to read it
    m.geometry.computeBoundingSphere();
    m.updateWorldMatrix(true, false);
    const r = m.geometry.boundingSphere!.radius * m.matrixWorld.getMaxScaleOnAxis();
    m.castShadow = r < 40;
    m.receiveShadow = r < 400;
    mats.forEach((mat) => {
      const n = mat.name;
      if (n.startsWith("glass") || n.endsWith("_glass") || mat.transparent) {
        mat.depthWrite = false;
        m.castShadow = false;
      }
      if (n.startsWith("city_win")) cityWin.push(mat);
      if (n === "glow_fire") fires.push(mat);
      if (n.startsWith("glow_") || n === "modern_ceiling_globe" || n === "modern_ceiling_lamp_01_glass" || n === "street_lamp_01_glass") {
        if (!mat.emissiveMap && mat.emissive.getHex() === 0) mat.emissive.set("#ffd9a0");
        glowMats.push(mat);
      }
      if (n === "pool_water") {
        Object.assign(mat, { opacity: 0.42, roughness: 0.04, metalness: 0 });
        mat.color.set("#2fa9a6");
        patchWater(mat, false);
        waters.push(mat);
      }
      if (n === "sea") {
        Object.assign(mat, { roughness: 0.1, metalness: 0 });
        patchWater(mat, true);
      }
      if (n === "pool_stone") patchCaustics(mat, dayLight);
      if (n.startsWith("rattan")) {
        // woven shades: cut out, not blended, and they glow from inside at night
        Object.assign(mat, { transparent: false, alphaTest: 0.28, side: THREE.DoubleSide, depthWrite: true });
        m.castShadow = n === "rattan_lattice";
        if (mat.map) {
          mat.emissive.set("#ffb468");
          mat.emissiveMap = mat.map;
          lanterns.push(mat);
        }
      }
      if (n === "glass_clear" || n === "glass_partition") mat.envMapIntensity = 0.22; // glass, not a mirror
      if (n === "foam") patchFoam(mat);
      if (n === "sand") patchSand(mat);
      if (n === "red_brick" || n === "batu_candi") patchCalm(mat, 0.45);
      if (n === "ulin_deck") mat.color.set("#a8957f"); // keeps timber from going purple in the blue shade
      if (n === "teak_floor") mat.color.set("#f2d7b4");
      if (n === "lawn") patchGround(mat, "lawn", 0.35, 0.62, 1.05);
      if (n === "lowland") patchGround(mat, "lowland", 0.012, 0.6, 1.2);
      if (n === "rice") patchGround(mat, "rice", 0.05, 0.7, 1.2);
      if (n === "palm_frond") patchWind(mat, "palm", 0.018);
      if (n === "banana_leaf") patchWind(mat, "banana", 0.03);
      if (n === "frangi_leaf") patchWind(mat, "frangi", 0.012);
      if (n === "vine_leaf") patchWind(mat, "vine", 0.004);
      // trunks don't sway, but they thin out in front of the game camera like the leaves
      if (n === "palm_trunk") patchWind(mat, "palmtrunk", 0);
      if (n === "frangi_bark") patchWind(mat, "frangibark", 0);
    });
  });
  // leaves, water and the like: the game camera passes through them
  const SOFT = /glass|water|sea|rattan|palm|banana|frangi|vine|leaf|grass|rice|foam|glow|lantern|fire|flower|pendant|bulb/;
  const softName = (m: THREE.Mesh) => {
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    return SOFT.test(`${m.name} ${mats.map((x) => x.name).join(" ")}`.toLowerCase());
  };
  world.add(grass(low));
  const riceField = rice(await (await fetch("/life/paddies.json")).json(), low);
  world.add(riceField);

  /* screens, signs and the small things three.js animates */
  // MacBook Pro in Midnight, like the one the page dives into
  const alu = new THREE.MeshStandardMaterial({ color: "#2b313c", metalness: 0.7, roughness: 0.36 });
  const laptop = group(rbox(0.52, 0.018, 0.36, 0.012, alu));
  // keyboard and trackpad; the top of the canvas is the edge nearest the chair
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.34), new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.5, roughness: 0.45, map: paint(500, 340, (c, w, h) => {
    c.fillStyle = "#2b313c";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#252a34";
    roundRect(c, w * 0.32, 14, w * 0.36, 110, 10);
    c.fill();
    c.fillStyle = "#1d1e21";
    roundRect(c, 32, 140, w - 64, 186, 8);
    c.fill();
    c.fillStyle = "#2c2d31";
    for (let r = 0; r < 6; r++) {
      const kh = r === 0 ? 14 : 24;
      const y = 316 - (r === 0 ? 14 : 0) - r * 30 + (r === 0 ? 0 : 0);
      const n = r === 5 ? 14 : 13;
      for (let k = 0; k < n; k++) {
        const kw = (w - 84) / n - 4;
        roundRect(c, 42 + k * (kw + 4), y - kh, kw, kh, 3);
        c.fill();
      }
    }
  }) }));
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = 0.0185;
  laptop.add(deck);
  const lid = new THREE.Group();
  lid.position.set(0, 0.018, 0.18);
  lid.rotation.x = 0.3;
  lid.add(rbox(0.52, 0.34, 0.012, 0.01, alu));
  // the screen, facing the chair: the Atharv OS desktop the camera dives into
  const lcdMat = new THREE.MeshBasicMaterial({ color: "#20242a", toneMapped: false });
  new THREE.TextureLoader().load("/life/wallpaper-black-villa.webp", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    // the photo is 4:5: crop it to the screen's band, balcony to driveway, like the desktop does
    t.repeat.set(1, ((0.31 / 0.49) * 1080) / 1350);
    t.offset.set(0, 0.28);
    lcdMat.map = t;
    lcdMat.color.set("#ffffff");
    lcdMat.needsUpdate = true;
  });
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.49, 0.31), lcdMat);
  lcd.position.set(0, 0.17, -0.007);
  lcd.rotation.y = Math.PI;
  lid.add(lcd);
  laptop.add(lid);
  add(laptop, -3, F + 0.765, -2.5);

  // a laptop open on the swim-up bar, facing the pool
  const barLaptop = group(rbox(0.34, 0.014, 0.24, 0.01, alu));
  const barLid = new THREE.Group();
  barLid.position.set(0, 0.014, -0.12);
  barLid.rotation.x = -0.35;
  barLid.add(rbox(0.34, 0.23, 0.01, 0.008, alu));
  const barScreen = screen(0.32, 0.2, tvTex());
  barScreen.position.set(0, 0.115, 0.006);
  barLid.add(barScreen);
  barLaptop.add(barLid);
  add(barLaptop, 8.95, 0.11, 7.7, -Math.PI / 2);

  const display = group(rbox(2.7, 1.62, 0.06, 0.03, M.black));
  const shot = screen(2.58, 1.5, new THREE.Texture());
  shot.position.set(0, 0.81, 0.035);
  display.add(shot);
  add(display, -5.86, F + 1.0, -1.1, Math.PI / 2);

  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.15), new THREE.MeshStandardMaterial({ roughness: 0.8, map: paint(360, 460, (c, w, h) => {
    c.fillStyle = "#ff8a5c";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1c1c20";
    c.font = font(800, 64);
    c.fillText("SHIP", 36, 120);
    c.fillText("DAILY.", 36, 190);
    c.font = font(500, 22);
    c.fillText("— Atharv", 36, h - 40);
  }) }));
  poster.position.set(5.2, 2.5, -3.87);
  poster.scale.setScalar(1.5);
  world.add(poster);
  const posts = [
    postTex("Shipped a client's AI agent today.", "Inbound lead → booked call. 0 humans.", "1.2K"),
    postTex("Most AI agencies won't survive 2027.", "Here's what the ones that do have in common:", "864"),
    postTex("Ran 5k, cooked, shipped two features.", "Boring days build companies.", "2.4K"),
  ].map((map, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.6), new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false }));
    m.position.set(3.0 + i * 0.95, 2.05 + (i % 2) * 0.5, -2.2 + i * 0.35);
    m.userData.y = m.position.y;
    m.rotation.y = -0.35;
    world.add(m);
    return m;
  });

  const roofSign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.15), new THREE.MeshBasicMaterial({ map: neonTex("VELYXLABS", "#ff8a5c"), transparent: true, toneMapped: false }));
  roofSign.position.set(-1.2, R + 1.25, -3.95);
  world.add(roofSign);

  // string lights over the terrace
  const posts4 = [[1.0, -3.5], [5.7, -3.5], [5.7, 3.4], [1.0, 3.4]];
  const bulbM = new THREE.MeshBasicMaterial({ color: "#ffd38a", toneMapped: false });
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 12, 8), bulbM, 44);
  const bm4 = new THREE.Matrix4();
  for (let s = 0, n = 0; s < 4; s++) {
    const [ax, az] = posts4[s];
    const [bx, bz] = posts4[(s + 1) % 4];
    for (let i = 1; i < 12; i++, n++) {
      const k = i / 12;
      bulbs.setMatrixAt(n, bm4.makeTranslation(ax + (bx - ax) * k, R + 2.45 - Math.sin(k * Math.PI) * 0.45, az + (bz - az) * k));
    }
  }
  world.add(bulbs);

  /* stars */
  const starG = new THREE.BufferGeometry();
  const sp: number[] = [];
  for (let i = 0; i < 700; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * 0.85 + 0.12;
    sp.push(Math.cos(u) * 3000 * Math.sqrt(1 - v * v), v * 3000, Math.sin(u) * 3000 * Math.sqrt(1 - v * v));
  }
  starG.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const starM = new THREE.PointsMaterial({ color: "#ffffff", size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  scene.add(new THREE.Points(starG, starM));

  /* night lights */
  const lamps = [
    [-3.2, 2.2, -0.75, 6],
    [3, 2.1, -1.0, 5],
    [-3, F + 2.0, -2.0, 6],
    [3, F + 2.0, -2.0, 5],
    [3.3, R + 2.2, -0.3, 9],
    [-2, R + 2, 0, 4],
  ].map(([x, y, z, i]) => {
    const l = new THREE.PointLight("#ffc98a", 0, 9, 1.6);
    l.position.set(x, y, z);
    l.userData.max = i;
    scene.add(l);
    return l;
  });

  // the title: ATHARV GOLAIT in big letters on the deck between the pool and the house
  // portrait screens get it in two rows, so it fits the width
  const tall = canvas.clientWidth / canvas.clientHeight < 0.8;
  const name = await titleWord(tall ? "ATHARV\nGOLAIT" : "ATHARV GOLAIT", new THREE.Vector3(1.3, 0, 5.15), tall ? 1.1 : 1.0);
  world.add(name.group);

  // the work wall: client products framed on the villa's west wall, facing the side lawn
  const teak = new THREE.MeshStandardMaterial({ color: "#5a3d27", roughness: 0.55 });
  const texs = new THREE.TextureLoader();
  work.items.slice(0, 3).forEach((w, i) => {
    const fw = 1.34;
    const fh = 0.86;
    const frame = rbox(fw + 0.1, fh + 0.1, 0.05, 0.015, teak);
    frame.position.y = -(fh + 0.1) / 2;
    const mat = new THREE.MeshBasicMaterial({ color: "#20242a", toneMapped: false });
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), mat);
    pic.position.z = 0.03;
    // small enough for a texture: Cloudinary resizes on the fly
    texs.load(w.image.replace("/upload/", "/upload/w_1024,q_auto,f_auto/"), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      const img = t.image as { width: number; height: number };
      // cover the frame, keeping the top of the page and leaning left, where the headline sits
      const k = fw / fh / (img.width / img.height);
      if (k < 1) {
        t.repeat.set(k, 1);
        t.offset.set((1 - k) * 0.1, 0);
      } else {
        t.repeat.set(1, 1 / k);
        t.offset.set(0, 1 - 1 / k);
      }
      mat.map = t;
      mat.color.set("#ffffff");
      mat.needsUpdate = true;
    });
    add(group(frame, pic), -6.43, 1.38, -3.1 + i * 1.5, -Math.PI / 2);
  });

  // the beach run's arches: coral, the next one lit, all of them only while you're on the scooter
  const archOn = new THREE.MeshStandardMaterial({ color: "#ff6a45", emissive: "#ff6a45", emissiveIntensity: 1.6, roughness: 0.5 });
  const archOff = new THREE.MeshStandardMaterial({ color: "#efe6d2", roughness: 0.6 });
  const arches = [TRIAL_START, ...TRIAL_GATES].map((g) => {
    const y = groundY(g.x, g.z);
    const half = g.z > 14 ? 1.95 : g.r * 0.85; // on the lane, posts on its edges
    // tall enough that the chase camera rides under the bar
    const a = group(at(rbox(0.16, 4, 0.16, 0.05, archOff), 0, 0, -half), at(rbox(0.16, 4, 0.16, 0.05, archOff), 0, 0, half), at(rbox(0.2, 0.22, half * 2 + 0.16, 0.06, archOff), 0, 3.9, 0));
    a.position.set(g.x, y, g.z);
    a.visible = false;
    world.add(a);
    return a;
  });
  let trialNext: number | null = null;
  function showArches() {
    const on = !!play && play.mode === "scooter";
    arches.forEach((a, i) => {
      a.visible = on;
      // i = 0 is the start; while a run is on, gate i - 1 is the one to make
      const lit = trialNext === null ? i === 0 : i === trialNext + 1;
      a.children.forEach((m) => ((m as THREE.Mesh).material = lit ? archOn : archOff));
    });
  }

  // the six hidden marathon medals: gold on a coral ribbon, turning slowly, gone once found
  const gold = new THREE.MeshStandardMaterial({ color: "#f2c14e", emissive: "#b97a0e", emissiveIntensity: 0.55, metalness: 0.9, roughness: 0.22 });
  const ribbon = new THREE.MeshStandardMaterial({ color: "#ff6a45", roughness: 0.6, side: THREE.DoubleSide });
  const discGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.06, 28).rotateX(Math.PI / 2);
  const medals = MEDALS.map((m) => {
    const g = group(new THREE.Mesh(discGeo, gold), at(new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.34), ribbon), 0, 0.46, 0));
    g.userData.y = m.sea ? SEA_LEVEL + 1.3 : groundY(m.x, m.z) + 1.2;
    g.position.set(m.x, g.userData.y, m.z);
    g.scale.setScalar(m.sea ? 2.6 : 1.5);
    g.visible = false;
    world.add(g);
    return g;
  });
  let medalsFound = new Set<string>();
  function showMedals(t: number) {
    medals.forEach((g, i) => {
      g.visible = !medalsFound.has(MEDALS[i].id);
      if (!g.visible) return;
      g.rotation.y = t * 1.6 + i;
      g.position.y = g.userData.y + Math.sin(t * 2 + i) * 0.08;
    });
  }

  // a sign by the gate: building something? book a call
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.56), new THREE.MeshStandardMaterial({ roughness: 0.7, map: paint(360, 224, (c, w, h) => {
    c.fillStyle = "#f4ecdc";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1c1c20";
    c.font = font(700, 34);
    c.fillText("Building", 26, 70);
    c.fillText("something?", 26, 112);
    c.fillStyle = "#ff6a45";
    c.font = font(700, 26);
    c.fillText("Book a call  →", 26, 176);
  }) }));
  sign.position.set(0, 1.0, 0.05);
  add(group(at(rbox(0.07, 1.3, 0.07, 0.02, teak), 0, 0, 0), sign), 5.3, -0.3, 13.55, Math.PI);

  // paper lanterns along the lawn and either side of the gate, and fireflies over the garden and paddies
  const lit = pathLanterns([[-8, -0.3, 13.3], [-3, -0.3, 13.3], [1.95, -0.3, 13.3], [4.05, -0.3, 13.3], [8, -0.3, 13.3], [12.5, -0.3, 13.3], [14.6, -0.3, 8.5], [-9, -0.3, 2.5]]);
  world.add(lit.group);
  const flies = fireflies(low ? 40 : 120, [[-11, 16, 12.6, 13.8], [13.2, 16.5, -3, 12], [-11.5, -6.5, -10, 4], [-20, 25, -30, -12]]);
  world.add(flies.points);

  /* ---------- people ---------- */
  // the yaw that turns someone at (x, z) towards the middle of the pool circle
  const face = (x: number, z: number) => Math.atan2(6.4 - x, 8.3 - z);
  const place = (p: Person, x: number, y: number, z: number, ry: number) => {
    at(p.root, x, y, z, ry);
    world.add(p.root);
    return p;
  };
  // every scene poses an invisible rig; the cast's real bodies follow them
  const hipY = cast.atharv.hipY;
  const me = {
    intro: place(rig(hipY), -1.0, R, 1.0, 0.5),
    // a sunrise run along the waterline; the y is the sand's height there
    run: place(rig(hipY), RUN_X, -0.65 - (RUN_X - 150) * 0.024, 0, 0),
    hiit: place(rig(hipY), 11.9, 0.18, 0.5, -0.35),
    cook: place(rig(hipY), -2.95, 0, -1.65, 0),
    build: place(rig(hipY), -3, F, -3.25, 0),
    // standing in the pool for the afternoon mastermind (pool floor at -1.1)
    clients: place(rig(hipY), 6.3, -1.1, 7.05, face(6.3, 7.05)),
    // in the ice bath, legs along the tub
    recovery: place(rig(hipY), 12.75, 0.1, -6.7, Math.PI / 2),
    post: place(rig(hipY), 2.5, 0, -1.8, 0.15),
    network: place(rig(hipY), 2.55, R, -0.25, 1.25),
  } as Record<string, Person>;
  me.outro = me.build;
  // "Live it": Atharv wherever the player takes him, on foot or riding
  me.ride = place(rig(hipY), 0, 0, 0, 0);
  me.ride.root.rotation.order = "YXZ";

  /* the scooter: a cream retro step-through, the Canggu classic */
  const cream = new THREE.MeshStandardMaterial({ color: "#efe6d2", roughness: 0.35, metalness: 0.1 });
  const darkS = new THREE.MeshStandardMaterial({ color: "#1c1c1e", roughness: 0.6 });
  const chromeS = new THREE.MeshStandardMaterial({ color: "#d9dce2", roughness: 0.2, metalness: 1 });
  const scooter = new THREE.Group();
  const lean = new THREE.Group();
  scooter.add(lean);
  lean.add(at(rbox(0.34, 0.1, 0.62, 0.04, darkS), 0, 0.24, 0.02));
  lean.add(at(rbox(0.36, 0.42, 0.72, 0.13, cream), 0, 0.3, -0.42));
  lean.add(at(rbox(0.32, 0.11, 0.66, 0.05, darkS), 0, 0.72, -0.36));
  lean.add(at(rbox(0.38, 0.74, 0.16, 0.07, cream), 0, 0.3, 0.46));
  const bars = group(at(rbox(0.26, 0.17, 0.2, 0.06, cream), 0, 0, 0));
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.66, 8), chromeS);
  handle.rotation.z = Math.PI / 2;
  handle.position.y = 0.12;
  bars.add(handle);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), new THREE.MeshBasicMaterial({ color: "#fff6dc", toneMapped: false }));
  lamp.rotation.x = Math.PI / 2;
  lamp.position.set(0, 0.06, 0.11);
  bars.add(lamp);
  bars.position.set(0, 1.0, 0.44);
  lean.add(bars);
  const wheels = [0.62, -0.62].map((z) => {
    const w = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.06, 10, 24), darkS);
    tyre.rotation.y = Math.PI / 2;
    w.add(tyre);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 12), chromeS);
    hub.rotation.z = Math.PI / 2;
    w.add(hub);
    w.position.set(0, 0.25, z);
    lean.add(w);
    return w;
  });
  scooter.traverse((o) => ((o as THREE.Mesh).isMesh && ((o.castShadow = true), (o.receiveShadow = true))));
  // after dark the lamp throws a beam and a pool of light on the road
  const beam = headlight();
  beam.beam.position.copy(lamp.position);
  bars.add(beam.beam);
  scooter.add(beam.pool);
  [beam.beam, beam.pool].forEach((o) => ((o.castShadow = false), (o.receiveShadow = false), (o.visible = false)));
  scooter.visible = false;
  world.add(scooter);
  let play: PlayState | null = null;
  const playState = () => play;

  /* the jet ski: a white hull, a gloss-black deck, a coral rub rail */
  const hullShape = (w: number, nose: number, tail: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, nose);
    sh.bezierCurveTo(w * 0.55, nose * 0.85, w, nose * 0.35, w, 0);
    sh.lineTo(w * 0.94, tail);
    sh.lineTo(-w * 0.94, tail);
    sh.lineTo(-w, 0);
    sh.bezierCurveTo(-w, nose * 0.35, -w * 0.55, nose * 0.85, 0, nose);
    return sh;
  };
  // extruded downwards from y = 0, nose towards +z
  const slab = (w: number, nose: number, tail: number, depth: number, bevel: number, m: THREE.Material) => {
    const g = new THREE.ExtrudeGeometry(hullShape(w, nose, tail), { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 20 });
    g.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
  };
  const hullM = new THREE.MeshPhysicalMaterial({ color: "#f3f4f6", roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const deckM = new THREE.MeshPhysicalMaterial({ color: "#121418", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
  const coralM = new THREE.MeshStandardMaterial({ color: "#ff5a3c", roughness: 0.35 });
  const seatM = new THREE.MeshStandardMaterial({ color: "#1b1b1d", roughness: 0.75 });
  const jet = new THREE.Group();
  jet.rotation.order = "YXZ";
  jet.add(at(slab(0.56, 1.7, -1.45, 0.42, 0.06, hullM), 0, 0.22, 0));
  jet.add(at(slab(0.6, 1.76, -1.5, 0.05, 0.02, coralM), 0, 0.25, 0));
  jet.add(at(slab(0.48, 1.45, -1.3, 0.14, 0.05, deckM), 0, 0.42, 0));
  jet.add(at(rbox(0.38, 0.16, 1.05, 0.07, seatM), 0, 0.45, -0.45));
  jet.add(at(rbox(0.4, 0.26, 0.42, 0.1, deckM), 0, 0.44, 0.55));
  const screenJ = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.2), new THREE.MeshPhysicalMaterial({ color: "#1d2a33", roughness: 0.05, transmission: 0.3, transparent: true, opacity: 0.7 }));
  screenJ.position.set(0, 0.78, 0.7);
  screenJ.rotation.x = -0.6;
  jet.add(screenJ);
  const jetBars = group(at(rbox(0.1, 0.24, 0.08, 0.03, deckM), 0, 0, 0));
  const jetHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8), chromeS);
  jetHandle.rotation.z = Math.PI / 2;
  jetHandle.position.y = 0.14;
  jetBars.add(jetHandle);
  jetBars.position.set(0, 0.7, 0.42);
  jet.add(jetBars);
  jet.add(at(rbox(0.5, 0.04, 0.3, 0.02, coralM), 0, 0.5, -1.2));
  jet.visible = false;
  world.add(jet);

  // spray off the hull, which settles into foam on the water
  const SPRAY = 220;
  const sprayPos = new Float32Array(SPRAY * 3).fill(-1000);
  const sprayVel = new Float32Array(SPRAY * 3);
  const sprayLife = new Float32Array(SPRAY);
  // where each drop lands and settles: the sea for the jet ski, the pool's surface for a jump in
  const sprayFloor = new Float32Array(SPRAY).fill(SEA_LEVEL + 0.03);
  const POOL_TOP = -0.08;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let wasWading = false;
  let dipAt = -10;
  const foam = wake();
  world.add(foam.mesh);
  const sprayG = new THREE.BufferGeometry();
  sprayG.setAttribute("position", new THREE.BufferAttribute(sprayPos, 3));
  const drop = paint(32, 32, (c, w) => {
    const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.6)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  });
  const spray = new THREE.Points(sprayG, new THREE.PointsMaterial({ color: "#ffffff", size: 0.32, map: drop, transparent: true, opacity: 0.9, depthWrite: false }));
  spray.frustumCulled = false;
  world.add(spray);
  // after dark a warm light rides along, so you can still see yourself
  const carry = new THREE.PointLight("#ffd9a8", 0, 14, 1.4);
  world.add(carry);
  let sprayNext = 0;
  let sprayLast = 0;
  function splash(t: number, live: boolean) {
    // after the game the world still holds its last state: only a live game makes spray and wake
    const play = live ? playState() : null;
    const dt = Math.min(0.05, t - sprayLast);
    sprayLast = t;
    // stepping into the pool: a burst of drops, and the camera ducks with you
    const wading = !!play && play.mode === "walk" && play.wading && !play.action;
    if (wading && !wasWading && play) {
      for (let k = 0; k < 60; k++) {
        const i = sprayNext++ % SPRAY;
        const a = Math.random() * Math.PI * 2;
        const out = 0.6 + Math.random() * 1.2;
        sprayPos.set([play.x + Math.cos(a) * 0.3, POOL_TOP, play.z + Math.sin(a) * 0.3], i * 3);
        sprayVel.set([Math.cos(a) * out, 1.5 + Math.random() * 2, Math.sin(a) * out], i * 3);
        sprayLife[i] = 0.9 + Math.random() * 0.6;
        sprayFloor[i] = POOL_TOP;
      }
      dipAt = t;
    }
    wasWading = wading;
    const jetOn = !!play && play.mode === "jetski" && Math.abs(play.speed) > 1.5;
    if (play) foam.update(t, jetOn, play.x - Math.sin(play.yaw) * 1.4, SEA_LEVEL + 0.04, play.z - Math.cos(play.yaw) * 1.4, play.yaw);
    const on = play && play.mode === "jetski" && Math.abs(play.speed) > 1.5;
    if (on && play) {
      const n = Math.ceil(Math.abs(play.speed) * 0.7);
      const fx = Math.sin(play.yaw), fz = Math.cos(play.yaw);
      for (let k = 0; k < n; k++) {
        const i = sprayNext++ % SPRAY;
        const side = k % 2 ? 1 : -1;
        const back = k % 3 === 0 ? -1.5 : 0.3 - Math.random() * 1.2;
        sprayPos[i * 3] = play.x + fx * back + fz * side * 0.55;
        sprayPos[i * 3 + 1] = play.y + 0.1;
        sprayPos[i * 3 + 2] = play.z + fz * back - fx * side * 0.55;
        const out = 1.2 + Math.random() * 1.6;
        sprayVel[i * 3] = fz * side * out - fx * play.speed * 0.25;
        sprayVel[i * 3 + 1] = 1.2 + Math.random() * 2.2 + Math.abs(play.lean) * 3;
        sprayVel[i * 3 + 2] = -fx * side * out - fz * play.speed * 0.25;
        sprayLife[i] = 1.6 + Math.random();
        sprayFloor[i] = SEA_LEVEL + 0.03;
      }
    }
    for (let i = 0; i < SPRAY; i++) {
      if (sprayLife[i] <= 0) continue;
      sprayLife[i] -= dt;
      if (sprayLife[i] <= 0) {
        sprayPos[i * 3 + 1] = -1000;
        continue;
      }
      const water = sprayFloor[i];
      if (sprayPos[i * 3 + 1] > water || sprayVel[i * 3 + 1] > 0) {
        sprayVel[i * 3 + 1] -= 9.8 * dt;
        for (let a = 0; a < 3; a++) sprayPos[i * 3 + a] += sprayVel[i * 3 + a] * dt;
      } else sprayPos[i * 3 + 1] = water; // foam, drifting to a stop
    }
    sprayG.attributes.position.needsUpdate = true;
  }

  // a neighbour's scooter on the lane, so the street has traffic
  const traffic = scooter.clone();
  traffic.visible = false;
  world.add(traffic);
  const trafficWheels = wheels.map((w) => traffic.children[0].children[lean.children.indexOf(w)]);
  const phone = group(rbox(0.075, 0.155, 0.01, 0.01, M.black));
  const phoneScreen = screen(0.068, 0.145, phoneTex());
  phoneScreen.position.set(0, 0.078, 0.006);
  phone.add(phoneScreen);
  phone.position.set(0, 0.09, 0.04);
  phone.rotation.set(-1.2, 0, 0);
  phone.visible = false;
  cast.atharv.hand.R.add(phone);

  const bro = (id: CastId, x: number, y: number, z: number, ry: number) => {
    const p = place(rig(cast[id].hipY), x, y, z, ry);
    p.root.userData.cast = id;
    return p;
  };
  const pool = [bro("luca", 7.7, -1.1, 8.0, face(7.7, 8.0)), bro("kwame", 5.0, -1.1, 8.3, face(5.0, 8.3)), bro("mateo", 7.0, -1.1, 9.55, face(7.0, 9.55))];
  const buddy = bro("kwame", 10.6, 0.18, -1.2, -0.25);
  const sauna = bro("kenji", 10.2, 0, -9.3, 0);
  const friends = [bro("kenji", 4.0, R, -0.15, -1.6), bro("mateo", 3.25, R, -1.55, 0.1), bro("arjun", 4.2, R, 2.25, Math.PI + 0.3)];
  const rider = bro("arjun", 0, 0, 0, 0);

  // glass never casts a shadow
  world.traverse((o) => {
    if ((o as THREE.Mesh).material === M.glass) o.castShadow = false;
  });

  const all = Object.values(me);
  const extras = [...pool, buddy, sauna, ...friends, rider];

  /* screen content */
  new THREE.TextureLoader().load("/life/velyx-hero.webp", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    (shot.material as THREE.MeshBasicMaterial).map = t;
    (shot.material as THREE.MeshBasicMaterial).needsUpdate = true;
  });

  /* post: ambient occlusion over the lit scene, then tone mapping */
  // the scene is drawn once, into N8AO's own target: that is where edges get smoothed.
  // The composer's buffers only carry full-screen passes, so they need no MSAA.
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, rt);
  const ao = new N8AOPass(scene, camera, 1, 1);
  Object.assign(ao.configuration, {
    aoRadius: 0.9,
    distanceFalloff: 0.45,
    intensity: 2.4,
    color: new THREE.Color("#2d1f1a"),
    gammaCorrection: false,
    halfRes: true,
    screenSpaceRadius: false,
  });
  ao.setQualityMode("Medium");
  // left on, it renders the whole scene twice more for glass and water (each time redrawing the shadow map)
  ao.autoDetectTransparency = false;
  ao.configuration.transparencyAware = false;
  ao.beautyRenderTarget.samples = low ? 0 : 4;
  composer.addPass(ao);
  // lamps, lanterns and the sun on the water glow a little
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.55, 0.92);
  if (!low) composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // the grade: warm highlights, teal shadows, a soft vignette; and the warp into the laptop
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uNight: { value: 0 }, uWarp: { value: 0 }, uCenter: { value: new THREE.Vector2(0.5, 0.5) }, uAspect: { value: 1 }, uTime: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uNight, uWarp, uAspect, uTime; uniform vec2 uCenter; varying vec2 vUv;
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        vec3 warm = vec3(1.04, 1.0, 0.94), cool = mix(vec3(0.95, 1.0, 1.03), vec3(0.92, 0.95, 1.08), uNight);
        c.rgb *= mix(cool, warm, smoothstep(0.2, 0.8, l));
        c.rgb = mix(vec3(l), c.rgb, 1.06);
        vec2 d = vUv - 0.5;
        c.rgb *= 1.0 - dot(d, d) * (0.42 + uNight * 0.3);
        if (uWarp > 0.001) {
          // drawn into the screen: a soft smear towards it, the colours parting a little
          vec2 v = vUv - uCenter;
          float s = uWarp * uWarp * 0.18;
          vec3 acc = vec3(0.0);
          for (int i = 0; i < 16; i++) {
            float k = 1.0 - s * float(i) / 15.0;
            acc.r += texture2D(tDiffuse, uCenter + v * k * (1.0 + 0.012 * uWarp)).r;
            acc.g += texture2D(tDiffuse, uCenter + v * k).g;
            acc.b += texture2D(tDiffuse, uCenter + v * k * (1.0 - 0.012 * uWarp)).b;
          }
          c.rgb = mix(c.rgb, acc / 16.0, smoothstep(0.0, 0.25, uWarp));
          // light-speed streaks rushing in from the edges
          vec2 q = v * vec2(uAspect, 1.0);
          float r = length(q);
          // thin radial lanes; each carries one long dash racing outwards past the camera
          float ang = (atan(q.y, q.x) + 3.1416) * 72.0;
          float lane = floor(ang);
          float across = abs(fract(ang) - 0.5) * 2.0;
          float h = fract(sin(lane * 91.7) * 437.5);
          float run = fract(r * (0.6 + h * 0.8) - uTime * (0.8 + h * 1.6) * (0.4 + uWarp * 1.6) + h * 7.0);
          float dash = smoothstep(0.0, 0.08, run) * (1.0 - smoothstep(0.35, 0.55, run));
          float streak = dash * (1.0 - smoothstep(0.12, 0.45, across)) * step(1.0 - uWarp * 1.3, h) * smoothstep(0.08, 0.5, r);
          c.rgb += mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.8, 0.55), h) * streak * smoothstep(0.5, 1.0, uWarp) * 0.1;
          // the screen's glow spreads as you reach it
          c.rgb += vec3(1.0, 0.95, 0.85) * exp(-r * 5.0) * uWarp * uWarp * 0.35;
          c.rgb = mix(c.rgb, vec3(1.0, 0.98, 0.95), smoothstep(0.85, 1.0, uWarp) * 0.25);
        }
        gl_FragColor = c;
      }`,
  });
  composer.addPass(grade);

  // dynamic resolution (adapt.ts); test browsers run slow on purpose, so they keep full resolution
  const scaler = createScaler(performance.now());
  let scale = 1;
  function adapt() {
    if (!scaler.frame(performance.now()) || navigator.webdriver) return;
    scale = scaler.scale;
    renderer.setPixelRatio(dpr * scale);
    resize();
  }

  let baseFov = 32;
  let lastWarp = 0;
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr * scale);
    composer.setSize(w, h);
    camera.aspect = w / h;
    // narrow screens pull back so the shot still fits
    baseFov = w / h < 0.8 ? 44 : w / h < 1.2 ? 38 : 32;
    camera.fov = baseFov;
    // on phones the chapter card covers the lower part, so the shot sits higher
    if (w / h < 0.8) camera.setViewOffset(w, h, 0, h * 0.13, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  const HEMI = 0.45;
  const ENV = 1.35;
  let lastHour = -1;
  let nightNow = 0;
  // the weather in Bali right now (setWeather): cloud dims the sun, rain falls round the camera
  const weather = { cloud: 0, rain: 0 };
  function light(hour: number) {
    if (Math.abs(hour - lastHour) < 0.005) return;
    lastHour = hour;
    const s = skyAt(hour);
    nightNow = s.night;
    // the sun rises behind the left of the loft and sets to the right
    const a = THREE.MathUtils.mapLinear(THREE.MathUtils.clamp(hour, 5, 20), 5, 20, -0.2, Math.PI + 0.2);
    const el = Math.max(0.18, Math.sin(a));
    sunDir.set(Math.cos(a) * -22, 6 + el * 24, 16);
    sky.cloud.value = weather.cloud;
    sky.update(s, sunDir, hour);
    dayLight.value = 1 - s.night;
    // by day the map adds a little warm bounce, so shaded rooms don't go blue
    baked.forEach((m) => (m.lightMapIntensity = 1.15 + s.night * 6.5));
    lanterns.forEach((m) => (m.emissiveIntensity = s.night * 1.5));
    sun.color.copy(s.sun);
    sun.intensity = s.sunI * (1 - weather.cloud * 0.65);
    // the sky's own light does most of the ambient work, so shade takes the sky's colour
    hemi.color.copy(s.hemi);
    hemi.intensity = s.hemiI * HEMI * (1 - weather.cloud * 0.25);
    scene.environmentIntensity = (1.15 - s.night * 1.0) * ENV * (1 - weather.cloud * 0.3);
    skinRim.value.copy(s.sun).multiplyScalar(s.sunI * 0.09 * (1 - s.night) + s.night * 0.05);
    starM.opacity = s.night * 0.9;
    lamps.forEach((l) => (l.intensity = (l.userData.max as number) * s.night * 0.45));
    // unlit glass by day, warm and bright after dusk
    bulbM.color.set("#77736c").lerp(cB.set("#ffd38a").multiplyScalar(1.6), s.night);
    glowMats.forEach((m) => (m.emissiveIntensity = 0.15 + s.night * 2.6));
    // a city of windows comes on after dusk
    cityWin.forEach((m) => (m.emissiveIntensity = s.night * 1.6));
    (scene.fog as THREE.Fog).color.copy(s.bottom).lerp(s.top, 0.15);
    (scene.fog as THREE.Fog).far = (9000 - s.night * 5000) * (1 - weather.rain * 0.9);
    // rain hangs a grey haze over everything
    (scene.fog as THREE.Fog).color.lerp(cB.set("#8d949c").multiplyScalar(1 - s.night * 0.8), weather.rain * 0.7);
    // the pool lights up after dark
    waters.forEach((m) => {
      if (m.name !== "pool_water") return;
      m.emissive.set("#2fd3c8");
      m.emissiveIntensity = s.night * 0.32;
    });
    roofSign.material.opacity = 0.35 + s.night * 0.65;
    grade.uniforms.uNight.value = s.night;
    bloom.strength = 0.25 + s.night * 0.45;
  }

  const projV = new THREE.Vector3();

  /* ---------- camera collision: the villa's solid parts, around the plot ---------- */
  // leaves and trunks thin out instead (nature.ts), so the camera never jumps for a palm
  const solids: THREE.Mesh[] = [];
  const near = new THREE.Box3(new THREE.Vector3(-16, -3, -15), new THREE.Vector3(21, 14, 26));
  const bb = new THREE.Box3();
  const solidMesh = (o: THREE.Object3D) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || (m as THREE.InstancedMesh).isInstancedMesh) return;
    if (m.name.startsWith("soft:") || (!m.name.startsWith("solid:") && softName(m))) return;
    if (!bb.setFromObject(m).intersectsBox(near)) return;
    solids.push(m);
  };
  world.updateMatrixWorld(true);
  villa.traverse(solidMesh);
  // the trees take a while: built a few at a time, so the loader keeps moving
  let slice = performance.now();
  for (const m of solids) {
    m.geometry.boundsTree = new MeshBVH(m.geometry);
    m.raycast = acceleratedRaycast;
    if (performance.now() - slice > 12) {
      await new Promise((r) => setTimeout(r, 0));
      slice = performance.now();
    }
  }
  const ray = new THREE.Raycaster();
  ray.firstHitOnly = true;
  const rayDir = new THREE.Vector3();

  /* ---------- birds: a few flocks wheeling over the villa and the beach by day ---------- */
  const BIRDS = 26;
  const wingGeo = (side: number) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.24, 0, 0, -0.2, side * 0.62, 0.07, -0.14, side * 0.3, 0.03, 0.12], 3));
    g.setIndex([0, 1, 3, 3, 1, 2]);
    g.computeVertexNormals();
    return g;
  };
  const birdM = new THREE.MeshBasicMaterial({ color: "#2b2622", side: THREE.DoubleSide, fog: true });
  // plain meshes: few enough that instancing isn't worth it
  const wingGeos = [wingGeo(1), wingGeo(-1)];
  const flock = new THREE.Group();
  scene.add(flock);
  const wings = Array.from({ length: BIRDS }, () =>
    wingGeos.map((g) => {
      const m = new THREE.Mesh(g, birdM);
      m.matrixAutoUpdate = false;
      flock.add(m);
      return m;
    }),
  );
  const flocks = Array.from({ length: BIRDS }, (_, i) => {
    const beach = i >= 16;
    return {
      // high over the roof garden, clear of the story's cameras
      cx: beach ? 172 : 1, cz: beach ? 4 : -1,
      r: (beach ? 18 : 6) + (i % 5) * 1.3,
      h: (beach ? 5 : 13) + (i % 4) * 1.2,
      w: (0.16 + (i % 3) * 0.03) * (i % 2 ? 1 : -1),
      a: i * 0.7,
      s: beach ? 1.6 : 1.2,
    };
  });
  const bq = new THREE.Quaternion();
  const be = new THREE.Euler(0, 0, 0, "YXZ");
  const bp = new THREE.Vector3();
  const bs = new THREE.Vector3();
  function birds(t: number) {
    const on = nightNow < 0.8;
    flock.visible = on;
    if (!on) return;
    flocks.forEach((b, i) => {
      const a = b.a + t * b.w;
      bp.set(b.cx + Math.cos(a) * b.r, b.h + Math.sin(t * 0.6 + i) * 1.2, b.cz + Math.sin(a) * b.r);
      // heading along the circle, banked into it
      const yaw = Math.atan2(-Math.sin(a) * Math.sign(b.w), Math.cos(a) * Math.sign(b.w));
      // flap in bursts, glide in between
      const flap = Math.sin(t * 0.9 + i * 1.3) > -0.2 ? Math.sin(t * 11 + i) * 0.7 : 0.12;
      bs.setScalar(b.s);
      wings[i].forEach((m, k) => {
        be.set(0, yaw, (k ? -1 : 1) * flap + Math.sign(b.w) * 0.25);
        m.matrix.compose(bp, bq.setFromEuler(be), bs);
      });
    });
  }

  // rain: short streaks in a box that follows the camera, wrapped as they fall through it
  const DROPS = 2600;
  const RAIN_BOX = 26;
  const rainPos = new Float32Array(DROPS * 6);
  for (let i = 0; i < DROPS; i++) {
    const x = (Math.random() - 0.5) * RAIN_BOX;
    const y = Math.random() * RAIN_BOX * 0.6;
    const z = (Math.random() - 0.5) * RAIN_BOX;
    rainPos.set([x, y, z, x + 0.04, y + 0.55, z], i * 6);
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rainM = new THREE.LineBasicMaterial({ color: "#aebccd", transparent: true, opacity: 0, depthWrite: false });
  const rain = new THREE.LineSegments(rainGeo, rainM);
  rain.frustumCulled = false;
  rain.visible = false;
  world.add(rain);
  let rainT = 0;
  function showRain(on: boolean, t: number, cam: THREE.Vector3) {
    // under a roof (the house, the gym bale) it stays dry
    const roofed = (Math.abs(cam.x) < 6.4 && Math.abs(cam.z) < 4.4 && cam.y < 7.2) || (cam.x > 8.8 && cam.x < 14.4 && cam.z > -3.9 && cam.z < 2.9 && cam.y < 3);
    rain.visible = on && weather.rain > 0 && !roofed;
    const dt = Math.min(0.05, t - rainT);
    rainT = t;
    if (!rain.visible) return;
    rainM.opacity = 0.35 + weather.rain * 0.45;
    // each drop falls and comes back in at the top of the box; the box rides with the camera
    const H = RAIN_BOX * 0.6;
    for (let i = 0; i < DROPS; i++) {
      let y = rainPos[i * 6 + 1] - dt * 16;
      if (y < 0) y += H;
      rainPos[i * 6 + 1] = y;
      rainPos[i * 6 + 4] = y + 0.55;
    }
    rainGeo.attributes.position.needsUpdate = true;
    rain.position.set(Math.round(cam.x), cam.y - H * 0.45, Math.round(cam.z));
  }

  /* ---------- poses ---------- */
  const T = new THREE.Clock();
  function pose(zone: Zone, t: number) {
    all.forEach((p) => (p.root.visible = false));
    scooter.visible = false;
    carry.intensity = 0;
    jet.visible = false;
    traffic.visible = false;
    extras.forEach((p) => (p.root.visible = false));
    // the game's own props only stand while the game is on
    if (zone !== "ride" || !play) {
      arches.forEach((a) => (a.visible = false));
      medals.forEach((m) => (m.visible = false));
      foam.mesh.visible = false;
    }
    // at the laptop Atharv has stepped away; only the screen is left
    if (zone === "os") {
      posts.forEach((m) => (m.visible = false));
      return;
    }
    if (zone === "ride" && play) {
      town(play, t);
      if (!play.action) {
        player(play, t);
        posts.forEach((m) => (m.visible = false));
        return;
      }
      // a station's moment: the story's own staging takes over
      zone = play.action as Zone;
    }
    const p = me[zone];
    p.root.visible = true;
    rest(p);
    p.torso.rotation.x = Math.sin(t * 2.1) * 0.012;

    if (zone === "intro") {
      // a morning stretch before the run
      const k = (Math.sin(t * 0.9) + 1) / 2;
      p.armL.rotation.z = -0.1 - k * 2.7;
      p.armR.rotation.z = 0.1 + k * 2.7;
      p.elbowL.rotation.x = p.elbowR.rotation.x = -0.1;
      p.head.rotation.x = -0.25 * k;
    } else if (zone === "run") {
      const w = t * 8.5;
      const s = Math.sin(w);
      p.legL.rotation.x = s * 0.7;
      p.legR.rotation.x = -s * 0.7;
      p.kneeL.rotation.x = 0.35 + Math.max(0, -Math.sin(w + 0.9)) * 1.25;
      p.kneeR.rotation.x = 0.35 + Math.max(0, Math.sin(w + 0.9)) * 1.25;
      p.armL.rotation.x = -s * 0.75;
      p.armR.rotation.x = s * 0.75;
      p.elbowL.rotation.x = p.elbowR.rotation.x = -1.45;
      p.armL.rotation.z = -0.12;
      p.armR.rotation.z = 0.12;
      p.hips.position.y = p.hipY - 0.05 + Math.abs(Math.cos(w)) * 0.07;
      p.torso.rotation.x = 0.14;
      // along the shore and back round, at an easy 5 m/s
      p.root.position.z = ((t * 2.6) % 30) - 20;
    } else if (zone === "hiit") {
      // jumping jacks
      const w = t * 5.5;
      const k = (1 - Math.cos(w)) / 2;
      p.armL.rotation.z = -0.15 - k * 2.6;
      p.armR.rotation.z = 0.15 + k * 2.6;
      p.elbowL.rotation.x = p.elbowR.rotation.x = -0.15;
      p.legL.rotation.z = -k * 0.3;
      p.legR.rotation.z = k * 0.3;
      p.kneeL.rotation.x = p.kneeR.rotation.x = (1 - k) * 0.25;
      p.hips.position.y = p.hipY + Math.abs(Math.sin(w)) * 0.18 - (1 - k) * 0.05;
      buddy.root.visible = true;
      rest(buddy);
      const k2 = (1 - Math.cos(w + 0.6)) / 2;
      buddy.armL.rotation.z = -0.15 - k2 * 2.6;
      buddy.armR.rotation.z = 0.15 + k2 * 2.6;
      buddy.legL.rotation.z = -k2 * 0.3;
      buddy.legR.rotation.z = k2 * 0.3;
      buddy.hips.position.y = buddy.hipY + Math.abs(Math.sin(w + 0.6)) * 0.18 - (1 - k2) * 0.05;
    } else if (zone === "cook") {
      const w = t * 4;
      p.armR.rotation.x = -0.45 + Math.sin(w) * 0.1;
      p.armR.rotation.z = 0.2 + Math.cos(w) * 0.1;
      p.elbowR.rotation.x = -1.05;
      p.armL.rotation.x = -0.35;
      p.armL.rotation.z = -0.2;
      p.elbowL.rotation.x = -1.1;
      p.head.rotation.x = 0.35 + Math.sin(t * 0.7) * 0.05;
      p.head.rotation.y = Math.sin(t * 0.4) * 0.15;
    } else if (zone === "build" || zone === "outro") {
      sit(p, 0.48);
      p.armL.rotation.x = p.armR.rotation.x = -0.45;
      p.elbowL.rotation.x = -1.05 + Math.sin(t * 14) * 0.05;
      p.elbowR.rotation.x = -1.05 + Math.sin(t * 13 + 1) * 0.05;
      p.armL.rotation.z = -0.1;
      p.armR.rotation.z = 0.1;
      p.head.rotation.x = 0.2 + Math.sin(t * 0.5) * 0.04;
      p.head.rotation.y = Math.sin(t * 0.3) * 0.1;
    } else if (zone === "clients") {
      // waist-deep, talking with his hands
      p.armR.rotation.x = -0.55 + Math.sin(t * 2.2) * 0.3;
      p.armR.rotation.z = 0.25;
      p.elbowR.rotation.x = -0.9 + Math.sin(t * 2.2 + 0.6) * 0.25;
      p.armL.rotation.x = -0.3;
      p.armL.rotation.z = -0.25;
      p.elbowL.rotation.x = -0.7;
      p.head.rotation.y = Math.sin(t * 0.6) * 0.3;
      pool.forEach((c, i) => {
        c.root.visible = true;
        rest(c);
        c.torso.rotation.x = Math.sin(t * 1.3 + i) * 0.02;
        c.head.rotation.x = Math.sin(t * 1.1 + i * 2) * 0.08;
        c.head.rotation.y = Math.sin(t * 0.5 + i) * 0.25;
        if (i === 0) {
          // hands on hips, listening
          c.armL.rotation.z = -0.55;
          c.armR.rotation.z = 0.55;
          c.elbowL.rotation.x = c.elbowR.rotation.x = -1.4;
          c.armL.rotation.x = c.armR.rotation.x = 0.35;
        } else if (i === 1) {
          // laughing at something
          c.head.rotation.x = -0.25 + Math.abs(Math.sin(t * 3)) * 0.1;
          c.armR.rotation.x = -0.5;
          c.elbowR.rotation.x = -1.2 + Math.sin(t * 2.6) * 0.2;
        } else {
          // arms folded
          c.armL.rotation.x = c.armR.rotation.x = -0.35;
          c.elbowL.rotation.x = c.elbowR.rotation.x = -1.9;
          c.armL.rotation.z = 0.35;
          c.armR.rotation.z = -0.35;
        }
      });
    } else if (zone === "recovery") {
      // lying back in the ice, arms over the sides, breathing slow
      sit(p, 0.12);
      p.kneeL.rotation.x = p.kneeR.rotation.x = 0.15;
      p.torso.rotation.x = -0.25 + Math.sin(t * 0.8) * 0.02;
      p.armL.rotation.z = -0.25;
      p.armR.rotation.z = 0.25;
      p.armL.rotation.x = p.armR.rotation.x = -0.5;
      p.elbowL.rotation.x = p.elbowR.rotation.x = -0.7;
      p.head.rotation.x = -0.15;
      sauna.root.visible = true;
      rest(sauna);
      sit(sauna, 0.5);
      sauna.torso.rotation.x = 0.35 + Math.sin(t * 0.7) * 0.02;
      sauna.armL.rotation.x = sauna.armR.rotation.x = -0.7;
      sauna.elbowL.rotation.x = sauna.elbowR.rotation.x = -0.6;
      sauna.head.rotation.x = 0.3;
    } else if (zone === "post") {
      sit(p, 0.5);
      p.armR.rotation.x = -0.35;
      p.armR.rotation.z = -0.05;
      p.elbowR.rotation.x = -1.7 + Math.sin(t * 3) * 0.03;
      p.armL.rotation.x = -0.25;
      p.elbowL.rotation.x = -0.9;
      p.head.rotation.x = 0.32;
      p.head.rotation.y = -0.1;
    } else if (zone === "network") {
      p.armR.rotation.x = -0.35 + Math.sin(t * 1.8) * 0.2;
      p.armR.rotation.z = 0.2;
      p.elbowR.rotation.x = -1.1 + Math.sin(t * 1.8 + 0.5) * 0.3;
      p.armL.rotation.x = -0.25;
      p.elbowL.rotation.x = -1.3;
      p.head.rotation.y = Math.sin(t * 0.5) * 0.25;
      friends.forEach((f, i) => {
        f.root.visible = true;
        rest(f);
        f.torso.rotation.x = Math.sin(t * 2 + i) * 0.015;
        f.head.rotation.x = Math.sin(t * 1.2 + i * 1.7) * 0.12;
        if (i === 0) {
          f.armR.rotation.x = -0.4;
          f.elbowR.rotation.x = -1.2 + Math.sin(t * 2.4) * 0.25;
        } else {
          f.armL.rotation.x = -0.2;
          f.elbowL.rotation.x = -1.4;
        }
        if (i === 2) {
          sit(f, 0.4);
          f.armL.rotation.x = f.armR.rotation.x = -0.3;
        }
      });
    }
    posts.forEach((m, i) => {
      m.visible = zone === "post";
      m.position.y = m.userData.y + Math.sin(t * 1.1 + i) * 0.06;
    });
  }


  /* ---------- "Live it" ---------- */
  // seated astride a scooter or a jet ski, hands on the bars
  function astride(p: Person, seat: number, steer: number, hunch: number) {
    sit(p, seat);
    p.kneeL.rotation.x = p.kneeR.rotation.x = 1.25;
    p.legL.rotation.x = p.legR.rotation.x = -1.25;
    p.legL.rotation.z = -0.12;
    p.legR.rotation.z = 0.12;
    p.torso.rotation.x = 0.28 + hunch;
    // the torso's lean swings the arms back, so reach past it to the grips
    p.armL.rotation.x = p.armR.rotation.x = -1.42;
    p.armL.rotation.z = -0.14;
    p.armR.rotation.z = 0.14;
    p.elbowL.rotation.x = p.elbowR.rotation.x = -0.15;
    p.head.rotation.x = -0.12;
    p.head.rotation.y = -steer * 0.25;
  }

  function placeScooter(g: THREE.Object3D, x: number, y: number, z: number, yaw: number, lean: number, steer: number) {
    g.visible = true;
    g.position.set(x, y, z);
    g.rotation.y = yaw;
    g.children[0].rotation.z = lean;
    if (g === scooter) bars.rotation.y = steer * 0.35;
  }

  function player(s: PlayState, t: number) {
    const p = me.ride;
    p.root.visible = true;
    rest(p);
    p.root.position.set(s.x, s.y, s.z);
    p.root.rotation.set(0, s.yaw, 0);
    if (s.mode === "scooter") {
      wheels.forEach((w) => (w.rotation.x = s.wheel));
      p.root.rotation.z = s.lean;
      p.root.translateZ(-0.14);
      astride(p, 0.66, s.steer, Math.min(0.08, Math.abs(s.speed) * 0.008));
      return;
    }
    if (s.mode === "jetski") {
      // nose up under power, rolled into the turn
      const pitch = -Math.min(0.12, Math.abs(s.speed) * 0.006) + Math.sin(t * 2.3) * 0.02;
      jet.rotation.x = p.root.rotation.x = pitch;
      jet.rotation.z = p.root.rotation.z = s.lean * 1.2;
      jetBars.rotation.y = s.steer * 0.4;
      p.root.translateZ(-0.35);
      p.root.translateY(0.02);
      astride(p, 0.47, s.steer, Math.min(0.12, Math.abs(s.speed) * 0.006));
      return;
    }
    // on foot: a walk that becomes a run with speed
    const v = Math.abs(s.speed);
    const w = s.wheel;
    const sw = Math.sin(w);
    const amp = Math.min(1, v / 1.6);
    const run = Math.min(1, Math.max(0, (v - 2.2) / 2.5));
    p.legL.rotation.x = sw * (0.42 + run * 0.3) * amp;
    p.legR.rotation.x = -sw * (0.42 + run * 0.3) * amp;
    p.kneeL.rotation.x = (0.08 + Math.max(0, -Math.sin(w + 0.9)) * (0.55 + run * 0.7)) * amp;
    p.kneeR.rotation.x = (0.08 + Math.max(0, Math.sin(w + 0.9)) * (0.55 + run * 0.7)) * amp;
    p.armL.rotation.x = -sw * (0.35 + run * 0.4) * amp;
    p.armR.rotation.x = sw * (0.35 + run * 0.4) * amp;
    p.elbowL.rotation.x = p.elbowR.rotation.x = -0.25 - run * 1.2;
    p.hips.position.y = p.hipY - run * 0.04 + Math.abs(Math.cos(w)) * (0.025 + run * 0.05) * amp;
    p.torso.rotation.x = run * 0.12 + Math.sin(t * 2.1) * 0.012 * (1 - amp);
    if (s.wading) {
      // hands up out of the water
      p.armL.rotation.z = -0.45;
      p.armR.rotation.z = 0.45;
      p.elbowL.rotation.x = p.elbowR.rotation.x = -0.9;
    }
    idle(p, v, t);
  }

  // standing still: a slow breath, weight moving from foot to foot, and a look around now and then
  const gaze = { since: -1, yaw: 0, pitch: 0, toYaw: 0, toPitch: 0, next: 0, last: 0 };
  function idle(p: Person, v: number, t: number) {
    const dt = Math.min(0.1, t - gaze.last);
    gaze.last = t;
    if (v > 0.05) {
      gaze.since = -1;
      gaze.toYaw = gaze.toPitch = 0;
    } else {
      if (gaze.since < 0) gaze.since = t;
      if (t > gaze.next) {
        gaze.toYaw = (Math.random() - 0.5) * 1.4;
        gaze.toPitch = (Math.random() - 0.35) * 0.3;
        gaze.next = t + 3 + Math.random() * 3;
      }
    }
    const k = gaze.since < 0 ? 0 : THREE.MathUtils.smoothstep(t - gaze.since, 0.6, 1.4);
    const ease = 1 - Math.exp(-dt * 2.2);
    gaze.yaw += (gaze.toYaw * k - gaze.yaw) * ease;
    gaze.pitch += (gaze.toPitch * k - gaze.pitch) * ease;
    p.head.rotation.y += gaze.yaw;
    p.head.rotation.x += gaze.pitch;
    if (!k) return;
    const breath = Math.sin(t * (Math.PI / 2)); // one breath every four seconds
    p.torso.rotation.x += breath * 0.018 * k;
    p.armL.rotation.z -= (0.05 + breath * 0.012) * k;
    p.armR.rotation.z += (0.05 + breath * 0.012) * k;
    const shift = Math.sin(t * 0.45) * 0.035 * k;
    p.hips.rotation.z = shift;
    p.torso.rotation.z = -shift * 0.8;
  }

  // everyone else, and the things you can ride when you aren't on them
  function town(s: PlayState, t: number) {
    showArches();
    showMedals(t);
    if (s.mode !== "scooter") placeScooter(scooter, s.scooter.x, groundOf(s.scooter.x, s.scooter.z), s.scooter.z, s.scooter.yaw, 0.1, 0.3);
    else placeScooter(scooter, s.x, s.y, s.z, s.yaw, s.lean, s.steer);
    const lit = s.mode === "scooter" && nightNow > 0.3;
    beam.intensity.value = THREE.MathUtils.smoothstep(nightNow, 0.3, 0.7);
    beam.beam.visible = beam.pool.visible = lit;
    traffic.getObjectByName("beam")!.visible = traffic.getObjectByName("beamPool")!.visible = nightNow > 0.3;
    // the light that rides along moves ahead with the headlight
    const ahead = lit ? 2 : 0;
    carry.position.set(s.x + Math.sin(s.yaw) * ahead, s.y + 2.6, s.z + Math.cos(s.yaw) * ahead);
    carry.intensity = nightNow * 9;
    jet.visible = true;
    if (s.mode !== "jetski") {
      jet.position.set(s.jetski.x, SEA_LEVEL + swell(s.jetski.x, s.jetski.z, t) * 0.4, s.jetski.z);
      jet.rotation.set(Math.sin(t * 1.4) * 0.03, s.jetski.yaw, Math.sin(t * 1.1) * 0.04);
    } else {
      jet.position.set(s.x, s.y, s.z);
      jet.rotation.y = s.yaw;
    }
    // two founders hanging in the pool, waiting for a third
    [pool[0], pool[2]].forEach((c, i) => {
      c.root.visible = true;
      rest(c);
      c.head.rotation.y = Math.sin(t * 0.5 + i) * 0.35;
      c.head.rotation.x = Math.sin(t * 1.1 + i * 2) * 0.08;
      c.armR.rotation.x = -0.4 + Math.sin(t * (1.8 + i * 0.4)) * 0.25;
      c.elbowR.rotation.x = -1.0;
      c.armL.rotation.z = -0.45;
    });
    // a training partner on the gym bale, between sets
    buddy.root.visible = true;
    rest(buddy);
    const w = t * 5.2;
    const k = Math.max(0, Math.sin(t * 0.6)) > 0.3 ? (1 - Math.cos(w)) / 2 : 0;
    buddy.armL.rotation.z = -0.15 - k * 2.6;
    buddy.armR.rotation.z = 0.15 + k * 2.6;
    buddy.legL.rotation.z = -k * 0.3;
    buddy.legR.rotation.z = k * 0.3;
    buddy.hips.position.y = buddy.hipY + k * Math.abs(Math.sin(w)) * 0.18;
    // the sauna
    sauna.root.visible = true;
    rest(sauna);
    sit(sauna, 0.5);
    sauna.torso.rotation.x = 0.35 + Math.sin(t * 0.7) * 0.02;
    sauna.armL.rotation.x = sauna.armR.rotation.x = -0.7;
    sauna.elbowL.rotation.x = sauna.elbowR.rotation.x = -0.6;
    sauna.head.rotation.x = 0.3;
    // traffic: up the lane one side, back down the other
    const L = 190;
    const d = (t * 8) % (2 * L);
    const east = d < L;
    const x = east ? -50 + d : -50 + 2 * L - d;
    const z = east ? 15.6 : 17.2;
    const yaw = east ? Math.PI / 2 : -Math.PI / 2;
    placeScooter(traffic, x, -0.32, z, yaw, 0, 0);
    trafficWheels.forEach((w) => (w.rotation.x = t * 33));
    rider.root.visible = true;
    rest(rider);
    rider.root.position.set(x, -0.32, z);
    rider.root.rotation.set(0, yaw, 0);
    rider.root.translateZ(-0.14);
    astride(rider, 0.66, 0, 0.05);
  }
  const groundOf = (x: number, z: number) => (x > 140 ? -0.65 - Math.max(0, x - 150) * 0.024 : z > 14.2 ? -0.32 : -0.3);

  // after the scene is posed, each visible rig drives its body, and gets a shadow at its feet
  const feet = contactShadows(16);
  world.add(feet.mesh);
  const footAt = new THREE.Vector3();
  function perform() {
    const used = new Set<Body>();
    feet.begin();
    const drive = (p: Person, b: Body) => {
      if (!p.root.visible) return;
      b.apply(p);
      used.add(b);
      // fainter as he jumps, and through pool water
      p.root.getWorldPosition(footAt);
      const lift = Math.max(0, p.hips.position.y - p.hipY);
      const wet = footAt.y < -0.9 ? 0.45 : 1;
      feet.add(footAt.x, footAt.y, footAt.z, 0.95, (0.72 - lift * 2.5) * wet * (1 - nightNow * 0.4));
    };
    all.forEach((p) => drive(p, cast.atharv));
    extras.forEach((p) => drive(p, cast[p.root.userData.cast as CastId]));
    Object.values(cast).forEach((b) => (b.root.visible = used.has(b)));
    feet.end();
  }

  const ORIGIN = new THREE.Vector3();
  const look = new THREE.Vector3();
  let lastT = 0;
  function render(f: Frame) {
    const t = T.getElapsedTime();
    name.update(Math.min(0.05, t - lastT), !!f.title);
    lastT = t;
    adapt();
    windTime.value = t;
    sky.time.value = t;
    riceField.visible = f.cam.distanceTo(ORIGIN) < 150;
    light(f.hour);
    showRain(f.zone === "ride" && !!play, t, f.cam);
    pose(f.zone, t);
    perform();
    splash(t, f.zone === "ride");
    birds(t);
    phone.visible = f.zone === "post" || (f.zone === "ride" && play?.action === "post");
    camera.position.copy(f.cam);
    // portrait screens step back along the same line so wide shots still fit
    if (camera.aspect < 0.8) {
      camera.position.sub(f.look).multiplyScalar(1.22).add(f.look);
      // but never back through the garden wall
      const inPlot = (v: THREE.Vector3) => v.x > -11 && v.x < 15.8 && v.z > -10 && v.z < 13.2;
      if (inPlot(f.cam) && !inPlot(camera.position)) camera.position.copy(f.cam);
    }
    const dip = (t - dipAt) / 0.4;
    if (!reduced && dip >= 0 && dip < 1) camera.position.y -= Math.sin(dip * Math.PI) * 0.25;
    camera.position.x += f.mx * 0.6;
    camera.position.y -= f.my * 0.35;
    look.copy(f.look);
    camera.lookAt(look);
    // in the game, thin out the leaves between the camera and the player; on the title, between it and the villa
    if (f.zone === "ride" && play && !play.action) {
      camFadeA.value.copy(camera.position);
      camFadeB.value.set(look.x, look.y, look.z, 1.6);
    } else if (f.title) {
      camFadeA.value.copy(camera.position);
      camFadeB.value.set(look.x, look.y, look.z, 3);
    } else camFadeB.value.w = 0;
    // the warp: the camera eases right up to the screen and the lens opens a little
    const warp = f.warp ?? 0;
    if (warp > 0 || lastWarp > 0) {
      camera.position.lerp(look, warp * 0.75);
      camera.fov = baseFov + warp * warp * 8;
      camera.updateProjectionMatrix();
      lastWarp = warp;
    }
    projV.copy(look).project(camera);
    grade.uniforms.uWarp.value = warp;
    grade.uniforms.uCenter.value.set(projV.x * 0.5 + 0.5, projV.y * 0.5 + 0.5);
    grade.uniforms.uAspect.value = camera.aspect;
    grade.uniforms.uTime.value = t;
    // the sun's shadow box travels with the shot, so the beach gets shadows too
    sun.target.position.copy(look);
    sun.position.copy(look).add(sunDir);
    lit.update(nightNow, t);
    flies.update(nightNow, t, renderer.getPixelRatio());
    fires.forEach((m, i) => (m.emissiveIntensity = (0.3 + nightNow * 1.2) * (0.85 + 0.3 * Math.abs(Math.sin(t * 9 + i * 1.7)))));
    composer.render();
  }

  resize();
  // compile every shader now, behind the loader, so the first frames don't stall:
  // all people and rides shown for the warm-up, then one full frame through the passes
  // lit first: without the sky's environment map every material would compile twice
  light(17.3);
  const hidden: THREE.Object3D[] = [];
  scene.traverse((o) => !o.visible && (hidden.push(o), (o.visible = true)));
  camera.position.set(-14, 9, 22);
  camera.lookAt(2, 1, 0);
  // in pieces, so the bar keeps moving: Metal compiles slowly and there are many programs
  const pieces = [...scene.children.filter((o) => o !== world), ...world.children.filter((o) => o !== villa), ...villa.children];
  // compiled for where the scene is really drawn, N8AO's linear target, not the screen: a program's
  // variant depends on its target, so compiling for the screen meant compiling everything again on frame one
  renderer.setRenderTarget(ao.beautyRenderTarget);
  for (let i = 0; i < pieces.length; i += 8) {
    await Promise.all(pieces.slice(i, i + 8).map((o) => renderer.compileAsync(o, camera, scene)));
    report(0.85 + (Math.min(pieces.length, i + 8) / pieces.length) * 0.1);
  }
  renderer.setRenderTarget(null);
  // the textures go up to the GPU a few at a time: the first frame used to upload all of them
  // at once, a second's freeze right as the loader finished its name
  const uploads = new Set<THREE.Texture>();
  const grab = (v: unknown) => v instanceof THREE.Texture && uploads.add(v);
  scene.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    (Array.isArray(m) ? m : m ? [m] : []).forEach((mat: THREE.Material) => {
      Object.values(mat).forEach(grab);
      if (mat instanceof THREE.ShaderMaterial) Object.values(mat.uniforms).forEach((u) => grab(u.value));
    });
  });
  let budget = performance.now();
  let up = 0;
  for (const tx of uploads) {
    renderer.initTexture(tx);
    if (performance.now() - budget > 10) {
      report(0.95 + (++up / uploads.size) * 0.04);
      await new Promise((r) => setTimeout(r, 0));
      budget = performance.now();
    }
  }
  // the full-screen passes compile on first use: bring them in one per tick
  const passOn = composer.passes.map((p) => p.enabled);
  composer.passes.forEach((p, i) => (p.enabled = i === 0));
  for (let i = 0; i < composer.passes.length; i++) {
    composer.passes[i].enabled = passOn[i];
    composer.render();
    await new Promise((r) => setTimeout(r, 0));
  }
  hidden.forEach((o) => (o.visible = false));
  lastHour = -1; // the first real frame lights the scene for its own hour
  report(1);

  return {
    /** "Live it": the game state to show, or null for the story. */
    setPlayer(s: PlayState | null) {
      play = s;
    },
    /** Photo mode: the current frame, drawn again and copied while the canvas still holds it. */
    snapshot() {
      composer.render();
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = canvas.height;
      c.getContext("2d")!.drawImage(canvas, 0, 0);
      return c;
    },
    /** The title letters: the pointer, in normalised device coords; a click hops harder. */
    titlePointer(nx: number, ny: number, click: boolean) {
      name.pointer(camera, nx, ny, click);
    },
    /** Bali's weather now: cloud and rain, each 0..1. */
    setWeather(cloud: number, rain: number) {
      weather.cloud = cloud;
      weather.rain = rain;
      lastHour = -1; // relight with the new sky
    },
    /** The beach run: the gate to make next, or null when no run is on. */
    setTrial(next: number | null) {
      trialNext = next;
    },
    /** The medals already found, so they stop being drawn. */
    setMedals(found: string[]) {
      medalsFound = new Set(found);
    },
    /** A world point on screen, in CSS pixels; null when behind the camera. */
    project(x: number, y: number, z: number) {
      projV.set(x, y, z).project(camera);
      if (projV.z > 1) return null;
      return { x: (projV.x * 0.5 + 0.5) * canvas.clientWidth, y: (-projV.y * 0.5 + 0.5) * canvas.clientHeight };
    },
    /** How much of the way from a point to the camera is clear: 1 is all of it. */
    clearance(from: THREE.Vector3, to: THREE.Vector3) {
      rayDir.subVectors(to, from);
      const len = rayDir.length();
      if (len < 0.01) return 1;
      ray.set(from, rayDir.divideScalar(len));
      ray.far = len;
      const hit = ray.intersectObjects(solids, false)[0];
      return hit ? Math.max(0.06, (hit.distance - 0.3) / len) : 1;
    },
    render,
    resize,
    /** Dev only: what the last frame cost, and the passes, for profiling. */
    debug: {
      renderer, composer, ao, bloom, grade, sun, scene, camera, rt, lamps, carry, basic: new THREE.MeshBasicMaterial({ color: "#888" }),
      get frameMs() { return scaler.frameMs; },
      get scale() { return scale; },
      setScale(k: number) {
        scale = k;
        renderer.setPixelRatio(dpr * scale);
        resize();
      },
    },
    dispose() {
      sky.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}

export type World = Awaited<ReturnType<typeof createWorld>>;
