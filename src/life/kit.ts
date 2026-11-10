import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Parts the day is built from: soft clay materials, rounded blocks, and a
 * posable figure. Everything is matte with a little sheen, the way a stop-motion
 * set is lit, so primitive shapes read as crafted rather than placeholder.
 */

export const clay = (color: string, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.62,
    metalness: 0,
    sheen: 0.4,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color("#ffffff"),
    envMapIntensity: 0.55,
    ...o,
  });

export const glow = (color: string) => new THREE.MeshBasicMaterial({ color, toneMapped: false });

export const M = {
  wall: clay("#f3ede5"),
  wallIn: clay("#ece4d9"),
  slab: clay("#e6dccf"),
  wood: clay("#d4a77c", { roughness: 0.55 }),
  woodDark: clay("#9b6b47", { roughness: 0.5 }),
  oak: clay("#e2c29d"),
  counter: clay("#fbf8f3", { roughness: 0.35, clearcoat: 0.3 }),
  ink: clay("#2a2a30", { roughness: 0.45 }),
  steel: clay("#c9ccd2", { roughness: 0.3, metalness: 0.35 }),
  black: clay("#1c1c20", { roughness: 0.35 }),
  grass: clay("#a9cf8f"),
  grassDark: clay("#86b56f"),
  rock: clay("#c3a688"),
  rockDark: clay("#957860"),
  leaf: clay("#6faa62"),
  leafDark: clay("#4f8c4f"),
  pot: clay("#d98c63"),
  sofa: clay("#e7b98f"),
  cushion: clay("#f4d6b5"),
  rug: clay("#e9dcc8"),
  mat: clay("#ff8a5c"),
  red: clay("#e8574a"),
  orange: clay("#f39a4a"),
  yellow: clay("#f2c94c"),
  green: clay("#5fb35a"),
  white: clay("#ffffff"),
  glass: new THREE.MeshPhysicalMaterial({ color: "#dff1ff", roughness: 0.08, transmission: 0, transparent: true, opacity: 0.22, depthWrite: false }),
  bulb: glow("#ffe2a8"),
};

const geo = new Map<string, THREE.BufferGeometry>();
const cached = <T extends THREE.BufferGeometry>(key: string, make: () => T) => {
  if (!geo.has(key)) geo.set(key, make());
  return geo.get(key) as T;
};

const mesh = (g: THREE.BufferGeometry, m: THREE.Material, shadow = true) => {
  const o = new THREE.Mesh(g, m);
  o.castShadow = o.receiveShadow = shadow;
  return o;
};

/** A rounded box resting on y = 0, centred on x and z. */
export function rbox(w: number, h: number, d: number, r: number, m: THREE.Material) {
  const rr = Math.min(r, h / 2 - 0.001, w / 2 - 0.001, d / 2 - 0.001);
  return mesh(
    cached(`rb${w}:${h}:${d}:${rr}`, () => new RoundedBoxGeometry(w, h, d, 4, Math.max(0.001, rr)).translate(0, h / 2, 0)),
    m,
  );
}

/** A cylinder resting on y = 0. */
export function cyl(rt: number, rb: number, h: number, m: THREE.Material, seg = 28) {
  return mesh(cached(`cy${rt}:${rb}:${h}:${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg).translate(0, h / 2, 0)), m);
}

export function ball(r: number, m: THREE.Material, sx = 1, sy = 1, sz = 1) {
  const o = mesh(cached(`sp${r}`, () => new THREE.SphereGeometry(r, 28, 20)), m);
  o.scale.set(sx, sy, sz);
  return o;
}

/** A capsule hanging down from its top end (so a pivot at the top rotates it like a limb). */
export function limb(r: number, len: number, m: THREE.Material) {
  return mesh(cached(`li${r}:${len}`, () => new THREE.CapsuleGeometry(r, len, 6, 14).translate(0, -len / 2 - r * 0.4, 0)), m);
}

export function at<T extends THREE.Object3D>(o: T, x = 0, y = 0, z = 0, ry = 0): T {
  o.position.set(x, y, z);
  o.rotation.y = ry;
  return o;
}

export function group(...kids: THREE.Object3D[]) {
  const g = new THREE.Group();
  kids.forEach((k) => g.add(k));
  return g;
}

/** A canvas texture drawn once (screens, posters, phone UI). */
export function paint(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** A flat lit screen: emissive so it reads at night, `map` for its content. */
export function screen(w: number, h: number, map: THREE.Texture) {
  const m = new THREE.MeshBasicMaterial({ map, toneMapped: false });
  const o = new THREE.Mesh(cached(`pl${w}:${h}`, () => new THREE.PlaneGeometry(w, h)), m);
  return o;
}

/* ---------------- plants ---------------- */

export function plant(scale = 1, potM: THREE.Material = M.pot) {
  const g = group(cyl(0.2, 0.15, 0.32, potM));
  const leaves = [
    [0, 0.62, 0, 0.26],
    [0.13, 0.5, 0.06, 0.18],
    [-0.12, 0.52, -0.05, 0.2],
    [0.02, 0.8, 0.04, 0.16],
  ];
  leaves.forEach(([x, y, z, r], i) => g.add(at(ball(r, i % 2 ? M.leafDark : M.leaf, 1, 1.15, 1), x, y, z)));
  g.scale.setScalar(scale);
  return g;
}

export function tree(scale = 1) {
  const g = group(cyl(0.12, 0.17, 1.1, M.woodDark));
  [
    [0, 1.55, 0, 0.62],
    [0.36, 1.25, 0.12, 0.42],
    [-0.32, 1.32, -0.1, 0.46],
    [0.05, 1.95, 0.05, 0.4],
  ].forEach(([x, y, z, r], i) => g.add(at(ball(r, i % 2 ? M.leafDark : M.leaf), x, y, z)));
  g.scale.setScalar(scale);
  return g;
}

/* ---------------- people ---------------- */

export interface Look {
  skin: string;
  shirt: string;
  pants: string;
  hair: string;
  shoes?: string;
  /** "curly" piles the hair high; "short" keeps it close; "long" drops it behind. */
  hairStyle?: "curly" | "short" | "long" | "bun";
  /** Sleeveless top: the arms show skin. */
  tank?: boolean;
  /** Shorts: the legs show skin below the knee. */
  shorts?: boolean;
}

export interface Person {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  elbowL: THREE.Group;
  elbowR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  kneeL: THREE.Group;
  kneeR: THREE.Group;
  /** Hip height when standing. */
  hipY: number;
}

/**
 * A clay figure about 1.8 units tall with feet at y = 0. Joints are pivot
 * groups, so poses are plain rotations. Shoulders and hips swing on x (negative
 * is forward) and z (out); elbows bend forward with a negative x, knees bend
 * back with a positive x.
 */
export function person(look: Look): Person {
  const skin = clay(look.skin);
  const shirt = clay(look.shirt);
  const pants = clay(look.pants);
  const hairM = clay(look.hair, { roughness: 0.8, sheen: 0.2 });
  const shoes = clay(look.shoes ?? "#f2f2f2", { roughness: 0.45 });
  const hipY = 0.86;

  const root = new THREE.Group();
  const hips = at(new THREE.Group(), 0, hipY, 0);
  root.add(hips);

  const legs = [-1, 1].map((s) => {
    const leg = at(new THREE.Group(), 0.11 * s, 0, 0);
    leg.add(limb(0.098, 0.3, pants));
    const knee = at(new THREE.Group(), 0, -0.42, 0);
    knee.add(limb(0.084, 0.3, look.shorts ? skin : pants));
    knee.add(at(rbox(0.16, 0.1, 0.27, 0.05, shoes), 0, -0.44, 0.04));
    leg.add(knee);
    hips.add(leg);
    return { leg, knee };
  });

  const torso = new THREE.Group();
  hips.add(torso);
  torso.add(at(rbox(0.36, 0.2, 0.24, 0.1, pants), 0, -0.06, 0));
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.3, 8, 18), shirt);
  body.castShadow = body.receiveShadow = true;
  body.scale.set(1.08, 1, 0.78);
  body.position.y = 0.32;
  torso.add(body);

  const head = at(new THREE.Group(), 0, 0.66, 0);
  torso.add(head);
  head.add(at(cyl(0.065, 0.075, 0.12, skin), 0, -0.04, 0));
  const face = ball(0.205, skin, 0.95, 1.05, 0.98);
  face.position.y = 0.2;
  head.add(face);
  [-1, 1].forEach((s) => {
    head.add(at(ball(0.04, skin, 0.6, 1, 0.8), 0.2 * s, 0.19, -0.01));
    const eye = at(ball(0.022, M.black), 0.075 * s, 0.22, 0.185);
    eye.castShadow = false;
    head.add(eye);
  });
  head.add(at(ball(0.03, skin, 1, 0.8, 0.9), 0, 0.17, 0.2));

  const hs = look.hairStyle ?? "short";
  const lumps: number[][] =
    hs === "curly"
      ? [[0, 0.36, -0.02, 0.17], [0.1, 0.33, 0.08, 0.12], [-0.11, 0.34, 0.07, 0.12], [0.14, 0.29, -0.08, 0.13], [-0.14, 0.3, -0.09, 0.13], [0, 0.3, -0.14, 0.15], [0.05, 0.4, 0.06, 0.11], [-0.06, 0.41, -0.06, 0.12]]
      : hs === "long"
        ? [[0, 0.33, -0.02, 0.2], [0, 0.18, -0.12, 0.2], [0.13, 0.1, -0.08, 0.12], [-0.13, 0.1, -0.08, 0.12], [0, 0.0, -0.13, 0.15]]
        : hs === "bun"
          ? [[0, 0.32, -0.02, 0.2], [0, 0.42, -0.13, 0.1]]
          : [[0, 0.33, -0.03, 0.19], [0, 0.27, -0.1, 0.18]];
  lumps.forEach(([x, y, z, r]) => head.add(at(ball(r, hairM, 1, 0.82, 1), x, y, z)));

  const arms = [-1, 1].map((s) => {
    const arm = at(new THREE.Group(), 0.27 * s, 0.5, 0);
    arm.add(limb(look.tank ? 0.07 : 0.08, 0.2, look.tank ? skin : shirt));
    const elbow = at(new THREE.Group(), 0, -0.29, 0);
    elbow.add(limb(0.064, 0.2, skin));
    elbow.add(at(ball(0.068, skin), 0, -0.32, 0));
    arm.add(elbow);
    torso.add(arm);
    return { arm, elbow };
  });

  return {
    root, hips, torso, head,
    armL: arms[0].arm, armR: arms[1].arm, elbowL: arms[0].elbow, elbowR: arms[1].elbow,
    legL: legs[0].leg, legR: legs[1].leg, kneeL: legs[0].knee, kneeR: legs[1].knee,
    hipY,
  };
}

/** Resets every joint, so each pose starts from standing. */
export function rest(p: Person) {
  p.hips.position.set(0, p.hipY, 0);
  p.hips.rotation.set(0, 0, 0);
  p.torso.rotation.set(0, 0, 0);
  p.head.rotation.set(0, 0, 0);
  p.armL.rotation.set(0, 0, -0.08);
  p.armR.rotation.set(0, 0, 0.08);
  p.elbowL.rotation.set(-0.15, 0, 0);
  p.elbowR.rotation.set(-0.15, 0, 0);
  p.legL.rotation.set(0, 0, 0);
  p.legR.rotation.set(0, 0, 0);
  p.kneeL.rotation.set(0, 0, 0);
  p.kneeR.rotation.set(0, 0, 0);
}

/** Sitting on a seat of the given height, shins down. */
export function sit(p: Person, seat = 0.48) {
  p.hips.position.y = seat + 0.08;
  p.legL.rotation.x = p.legR.rotation.x = -1.5;
  p.kneeL.rotation.x = p.kneeR.rotation.x = 1.5;
}

export const Atharv: Look = { skin: "#b9805a", shirt: "#232327", pants: "#3f4b63", hair: "#17120f", hairStyle: "curly", shoes: "#f4f4f4" };
export const AtharvGym: Look = { ...Atharv, shirt: "#2b2b30", pants: "#2b2b30", tank: true, shorts: true, shoes: "#ff7a45" };
