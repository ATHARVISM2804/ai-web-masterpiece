import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

/**
 * The title screen's name, standing on the pool deck as big 3D letters (after
 * Bruno Simon's portfolio): they drop in one by one and land with a bounce,
 * hop when the pointer touches them, and hop away when the day starts.
 * Each letter is a damped spring on its height and tilt. A "\n" in the text
 * starts a second row, set in front of the first.
 */
export async function titleWord(text: string, at: THREE.Vector3, size = 1.15) {
  const font = new FontLoader().parse(await (await fetch("/life/helvetiker_bold.typeface.json")).json());
  const face = new THREE.MeshStandardMaterial({ color: "#f3e9d8", roughness: 0.45 });
  const side = new THREE.MeshStandardMaterial({ color: "#b0703c", roughness: 0.6 });
  const group = new THREE.Group();
  group.position.copy(at);

  // set the letters by their own shapes (the font's side bearings leave gaps round "I"), each row centred on `at`
  const gap = size * 0.1;
  const letters: { mesh: THREE.Mesh; y: number; vy: number; tilt: number; vt: number; delay: number }[] = [];
  const rows = text.split("\n");
  let i = 0;
  rows.forEach((row, r) => {
    const first = letters.length;
    let x = 0;
    for (const ch of row) {
      i++;
      if (ch === " ") {
        x += size * 0.5;
        continue;
      }
      const g = new TextGeometry(ch, { font, size, depth: size * 0.32, curveSegments: 6, bevelEnabled: true, bevelThickness: size * 0.03, bevelSize: size * 0.025, bevelSegments: 3 });
      g.computeBoundingBox();
      const bb = g.boundingBox!;
      // pivot at the bottom centre of the letter, so it rocks on its foot
      g.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
      const mesh = new THREE.Mesh(g, [face, side]);
      mesh.castShadow = mesh.receiveShadow = true;
      const w = bb.max.x - bb.min.x;
      mesh.position.set(x + w / 2, 0, (r - (rows.length - 1) / 2) * size * 1.3);
      x += w + gap;
      mesh.userData.letter = letters.length;
      group.add(mesh);
      letters.push({ mesh, y: 7, vy: 0, tilt: 0, vt: 0, delay: 0.35 + i * 0.07 });
    }
    const width = x - gap;
    letters.slice(first).forEach((l) => (l.mesh.position.x -= width / 2));
  });

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let shown = 0;
  let hovered = -1;
  let gone = false;
  let clock = 0;

  const hop = (l: (typeof letters)[number], v: number) => {
    if (l.y > 0.25) return;
    l.vy = v;
    l.vt += (Math.random() - 0.5) * 6;
  };

  return {
    group,
    /** Pointer in normalised device coords; a click makes a bigger hop. */
    pointer(camera: THREE.Camera, nx: number, ny: number, click: boolean) {
      if (!group.visible) return;
      ndc.set(nx, ny);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(group.children, false)[0];
      const i = hit ? (hit.object.userData.letter as number) : -1;
      if (i >= 0 && (i !== hovered || click)) hop(letters[i], click ? 7.5 : 4.5);
      hovered = i;
    },
    /** `on`: the title is up. When it goes, the letters hop off and sink. */
    update(dt: number, on: boolean) {
      clock += dt;
      if (on && !shown) shown = 1;
      if (!on && shown && !gone) {
        gone = true;
        letters.forEach((l, i) => (l.delay = clock + i * 0.04));
      }
      group.visible = shown > 0 && !(gone && letters.every((l) => l.mesh.scale.x < 0.01));
      if (!group.visible) return;
      for (const l of letters) {
        if (clock < l.delay) {
          l.mesh.visible = !gone;
          continue;
        }
        l.mesh.visible = true;
        if (gone) {
          // a last hop, then shrink into the deck
          if (l.vy === 0 && l.y <= 0) l.vy = 5;
          const s = Math.max(0, l.mesh.scale.x - dt * 1.6);
          l.mesh.scale.setScalar(s);
        }
        // gravity, a springy landing, and a tilt that settles back upright
        l.vy -= 22 * dt;
        l.y += l.vy * dt;
        if (l.y < 0) {
          l.y = 0;
          l.vy = Math.abs(l.vy) > 2 ? -l.vy * 0.32 : 0;
          if (Math.abs(l.vy) > 0) l.vt += (Math.random() - 0.5) * 2.5;
        }
        l.vt += (-l.tilt * 90 - l.vt * 9) * dt;
        l.tilt += l.vt * dt;
        l.mesh.position.y = l.y;
        l.mesh.rotation.z = l.tilt * 0.35;
        l.mesh.rotation.x = l.tilt * 0.15;
      }
    },
  };
}

export type TitleWord = Awaited<ReturnType<typeof titleWord>>;
