import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { at, type Person } from "./kit";
import { patchSkin } from "./nature";

/**
 * The cast: realistic rigged men built from MakeHuman's CC0 data
 * (blender/build_men.py). The scene still poses people through the same
 * joint groups the clay figures used (`Person`); a Body reads one of those
 * pose rigs every frame and turns it into rotations on its own skeleton.
 *
 * The mapping: each driven bone gets a world rotation D on top of its rest
 * orientation, where D is the clay joint's rotation composed down the chain
 * (hips, torso, shoulder, elbow) and, for limbs, a correction that brings the
 * bone from the rest A-pose to hanging straight down, the clay figure's
 * neutral. Bones in between keep their rest offsets.
 */

export type CastId = "atharv" | "luca" | "kwame" | "kenji" | "mateo" | "arjun";

/** A pose rig: the clay figure's joints with no geometry. */
export function rig(hipY: number): Person {
  const root = new THREE.Group();
  const hips = at(new THREE.Group(), 0, hipY, 0);
  root.add(hips);
  const torso = new THREE.Group();
  hips.add(torso);
  const head = at(new THREE.Group(), 0, 0.66, 0);
  torso.add(head);
  const limb = (parent: THREE.Object3D, x: number, y: number, dy: number) => {
    const a = at(new THREE.Group(), x, y, 0);
    const b = at(new THREE.Group(), 0, dy, 0);
    a.add(b);
    parent.add(a);
    return [a, b];
  };
  const [armL, elbowL] = limb(torso, -0.27, 0.5, -0.29);
  const [armR, elbowR] = limb(torso, 0.27, 0.5, -0.29);
  const [legL, kneeL] = limb(hips, -0.11, 0, -0.42);
  const [legR, kneeR] = limb(hips, 0.11, 0, -0.42);
  return { root, hips, torso, head, armL, armR, elbowL, elbowR, legL, legR, kneeL, kneeR, hipY };
}

const DOWN = new THREE.Vector3(0, -1, 0);
const I = new THREE.Quaternion();

interface Drive {
  bone: THREE.Bone;
  /** Rest A-pose to hanging down, for limbs. */
  down: THREE.Quaternion;
}

export class Body {
  readonly root: THREE.Object3D;
  /** Height of the hip joints above the soles when standing. */
  readonly hipY: number;
  private bones: THREE.Bone[] = [];
  private restW = new Map<THREE.Bone, THREE.Quaternion>();
  private W = new Map<THREE.Bone, THREE.Quaternion>();
  private D = new Map<THREE.Bone, THREE.Quaternion>();
  private drives: Record<string, Drive> = {};
  private q = [0, 1, 2, 3, 4, 5].map(() => new THREE.Quaternion());

  constructor(source: THREE.Object3D) {
    this.root = cloneSkinned(source);
    this.root.position.set(0, 0, 0);
    this.root.traverse((o) => {
      const m = o as THREE.SkinnedMesh;
      if (m.isSkinnedMesh) {
        m.castShadow = m.receiveShadow = true;
        m.frustumCulled = false;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat.name.startsWith("skin_")) patchSkin(mat);
        if (mat.transparent) {
          // hair, brows and lashes: cut out, not blended, so they sort right
          mat.transparent = false;
          mat.alphaTest = 0.45;
          mat.side = THREE.DoubleSide;
          mat.depthWrite = true;
        }
      }
      if ((o as THREE.Bone).isBone) this.bones.push(o as THREE.Bone);
    });
    // rest orientation and head position of every bone, in the body's space
    const pos = new Map<THREE.Bone, THREE.Vector3>();
    for (const b of this.bones) {
      const parent = b.parent as THREE.Bone;
      const pW = parent?.isBone ? this.restW.get(parent)! : I;
      const pP = parent?.isBone ? pos.get(parent)! : new THREE.Vector3();
      this.restW.set(b, pW.clone().multiply(b.quaternion));
      pos.set(b, b.position.clone().applyQuaternion(pW).add(pP));
      this.W.set(b, new THREE.Quaternion());
    }
    // the glTF loader drops the dots from node names and numbers repeats, so
    // upperarm01.L arrives as upperarm01L, or upperarm01L_3 on a later body
    const get = (n: string) => {
      const want = THREE.PropertyBinding.sanitizeNodeName(n);
      return this.bones.find((b) => b.name.replace(/_\d+$/, "") === want)!;
    };
    const P = (n: string) => pos.get(get(n))!;
    // the clay figure's left arm is on -x
    const L = P("upperarm01.L").x < 0 ? ".L" : ".R";
    const R = L === ".L" ? ".R" : ".L";
    const limb = (name: string, from: string, to: string): Drive => {
      const dir = P(to).clone().sub(P(from)).normalize();
      return { bone: get(name), down: new THREE.Quaternion().setFromUnitVectors(dir, DOWN) };
    };
    const still = (name: string): Drive => ({ bone: get(name), down: new THREE.Quaternion() });
    this.drives = {
      spineLow: still("spine04"),
      spineHigh: still("spine02"),
      head: still("head"),
      armL: limb("upperarm01" + L, "upperarm01" + L, "lowerarm01" + L),
      elbowL: limb("lowerarm01" + L, "lowerarm01" + L, "wrist" + L),
      armR: limb("upperarm01" + R, "upperarm01" + R, "lowerarm01" + R),
      elbowR: limb("lowerarm01" + R, "lowerarm01" + R, "wrist" + R),
      legL: limb("upperleg01" + L, "upperleg01" + L, "lowerleg01" + L),
      kneeL: limb("lowerleg01" + L, "lowerleg01" + L, "foot" + L),
      legR: limb("upperleg01" + R, "upperleg01" + R, "lowerleg01" + R),
      kneeR: limb("lowerleg01" + R, "lowerleg01" + R, "foot" + R),
    };
    this.hipY = (P("upperleg01.L").y + P("upperleg01.R").y) / 2;
    this.hand = { L: get("wrist" + L), R: get("wrist" + R) };
  }

  readonly hand: { L: THREE.Bone; R: THREE.Bone };

  /** Strike the pose held by a rig, where the rig stands. */
  apply(p: Person) {
    const [H, T, A, B, X, half] = this.q;
    const E = (o: THREE.Object3D, out: THREE.Quaternion) => out.setFromEuler(o.rotation);
    E(p.hips, H);
    T.copy(H).multiply(E(p.torso, X));
    const d = this.drives;
    this.D.clear();
    const set = (k: string, q: THREE.Quaternion) => {
      const dr = d[k];
      this.D.set(dr.bone, q.clone().multiply(dr.down));
    };
    half.copy(I).slerp(E(p.torso, X), 0.5);
    set("spineLow", H.clone().multiply(half));
    set("spineHigh", T);
    set("head", T.clone().multiply(E(p.head, X)));
    for (const s of ["L", "R"] as const) {
      const arm = s === "L" ? p.armL : p.armR;
      const elbow = s === "L" ? p.elbowL : p.elbowR;
      const leg = s === "L" ? p.legL : p.legR;
      const knee = s === "L" ? p.kneeL : p.kneeR;
      A.copy(T).multiply(E(arm, X));
      set("arm" + s, A);
      set("elbow" + s, A.clone().multiply(E(elbow, X)));
      B.copy(H).multiply(E(leg, X));
      set("leg" + s, B);
      set("knee" + s, B.clone().multiply(E(knee, X)));
    }
    // walk the skeleton parents-first: driven bones take D on top of rest,
    // the rest keep their rest offset from a parent that may have moved
    for (const b of this.bones) {
      const parent = b.parent as THREE.Bone;
      const pW = parent?.isBone ? this.W.get(parent)! : I;
      const w = this.W.get(b)!;
      const dq = this.D.get(b);
      if (dq) {
        w.copy(dq).multiply(this.restW.get(b)!);
        b.quaternion.copy(pW).invert().multiply(w);
      } else {
        w.copy(pW).multiply(b.quaternion);
      }
    }
    // stand where the rig stands; the hips' height moves the whole body
    p.root.updateWorldMatrix(true, false);
    this.root.position.setFromMatrixPosition(p.root.matrixWorld);
    this.root.quaternion.setFromRotationMatrix(p.root.matrixWorld);
    this.root.translateY(p.hips.position.y - p.hipY);
  }
}

/** One body per cast member, cloned from the loaded file. */
export function castFrom(scene: THREE.Object3D) {
  const bodies = {} as Record<CastId, Body>;
  for (const id of ["atharv", "luca", "kwame", "kenji", "mateo", "arjun"] as CastId[]) {
    const src = scene.getObjectByName(id);
    if (src) bodies[id] = new Body(src);
  }
  return bodies;
}
