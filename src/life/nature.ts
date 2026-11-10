import * as THREE from "three";

/**
 * What makes the place feel alive, all in the shaders: rippling water with
 * caustics on the pool floor, surf that comes and goes, wind in the leaves,
 * ground colour that isn't flat, and real blades of grass and rice.
 */

export const windTime = { value: 0 };
/** In the game, leaves between the camera and the player thin out so they never block the view.
 * xyz of `camFadeA` is the camera; `camFadeB` is the player, w the radius (0 turns it off). */
export const camFadeA = { value: new THREE.Vector3() };
export const camFadeB = { value: new THREE.Vector4() };

const WORLD_VERT = /* glsl */ `
  #ifdef USE_INSTANCING
    vec4 lifeWorld = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
  #else
    vec4 lifeWorld = modelMatrix * vec4(transformed, 1.0);
  #endif
`;
const NOISE = /* glsl */ `
  float lfHash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float lfNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(lfHash(i), lfHash(i + vec2(1, 0)), f.x), mix(lfHash(i + vec2(0, 1)), lfHash(i + vec2(1, 1)), f.x), f.y);
  }
  float lfFbm(vec2 p) { return 0.55 * lfNoise(p) + 0.3 * lfNoise(p * 2.3 + 5.0) + 0.15 * lfNoise(p * 5.1 + 9.0); }
`;

function patch(m: THREE.Material, key: string, fn: (s: THREE.WebGLProgramParametersWithUniforms) => void) {
  m.onBeforeCompile = (s) => {
    s.uniforms.uWind = windTime;
    s.vertexShader = s.vertexShader.replace("void main() {", "varying vec3 vLife;\nuniform float uWind;\nvoid main() {");
    s.vertexShader = s.vertexShader.replace("#include <project_vertex>", `#include <project_vertex>\n${WORLD_VERT}\nvLife = lifeWorld.xyz;`);
    s.fragmentShader = s.fragmentShader.replace("void main() {", `varying vec3 vLife;\nuniform float uWind;\n${NOISE}\nvoid main() {`);
    fn(s);
  };
  m.customProgramCacheKey = () => key;
  m.needsUpdate = true;
}

/** Ripples from the world position; `sea` adds rollers and a shallow shelf. */
export function patchWater(m: THREE.MeshStandardMaterial, sea: boolean) {
  const scale = sea ? "0.16" : "1.5";
  const amp = sea ? "0.16" : "0.07";
  // the sea fills the screen at the beach: its fine layer is one octave, not three
  const fine = sea ? "lfNoise" : "lfFbm";
  patch(m, sea ? "life-sea" : "life-pool", (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      /* glsl */ `#include <normal_fragment_maps>
      {
        vec2 q = vLife.xz * ${scale};
        float t = uWind * 0.7;
        float e = 0.12;
        float h0 = lfFbm(q + t * vec2(0.5, 0.3)) + 0.6 * ${fine}(q * 2.1 - t * vec2(0.4, 0.6));
        float hx = lfFbm(q + vec2(e, 0.0) + t * vec2(0.5, 0.3)) + 0.6 * ${fine}((q + vec2(e, 0.0)) * 2.1 - t * vec2(0.4, 0.6));
        float hz = lfFbm(q + vec2(0.0, e) + t * vec2(0.5, 0.3)) + 0.6 * ${fine}((q + vec2(0.0, e)) * 2.1 - t * vec2(0.4, 0.6));
        vec3 wn = normalize(vec3(-(hx - h0) / e * ${amp}, 1.0, -(hz - h0) / e * ${amp}));
        normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
      }`,
    );
    if (sea)
      s.fragmentShader = s.fragmentShader.replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        {
          float shore = smoothstep(190.0, 260.0, vLife.x);
          diffuseColor.rgb = mix(vec3(0.05, 0.42, 0.42), vec3(0.015, 0.13, 0.22), shore);
        }`,
      );
  });
}

/** Caustics: the moving net of light on the floor of a sunlit pool. */
export function patchCaustics(m: THREE.MeshStandardMaterial, day: { value: number }) {
  patch(m, "life-caustics", (s) => {
    s.uniforms.uDay = day;
    s.fragmentShader = s.fragmentShader.replace("void main() {", "uniform float uDay;\nvoid main() {");
    s.fragmentShader = s.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      /* glsl */ `#include <emissivemap_fragment>
      {
        vec2 p = mod(vLife.xz * 1.3, 6.28318) - 250.0;
        vec2 i = p;
        float c = 1.0;
        for (int n = 0; n < 4; n++) {
          float tt = uWind * 0.5 * (1.0 - 3.5 / float(n + 1));
          i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
          c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005)));
        }
        c = 1.17 - pow(c / 4.0, 1.4);
        totalEmissiveRadiance += diffuseColor.rgb * pow(abs(c), 8.0) * 1.6 * uDay;
        // after dark, the six lamps in the north wall throw pools of light across the stone
        float glow = 0.0;
        for (int k = 0; k < 6; k++) {
          vec3 d = vLife - vec3(-4.6 + float(k) * 2.3, -0.55, 6.11);
          glow += exp(-dot(d, d) * 0.55);
        }
        totalEmissiveRadiance += vec3(0.45, 0.95, 0.9) * (glow * 1.4 + 0.12) * (1.0 - uDay);
      }`,
    );
  });
}

/** Surf: the white lines run up and back, and break into pieces. */
export function patchFoam(m: THREE.Material) {
  patch(m, "life-foam", (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      "#include <color_fragment>",
      /* glsl */ `#include <color_fragment>
      if (lfFbm(vec2(vLife.x * 1.4 - sin(uWind * 0.4) * 2.0, vLife.z * 0.35 + uWind * 0.15)) < 0.42 + 0.12 * sin(uWind * 0.5 + vLife.x)) discard;`,
    );
  });
}

/** Breaks up flat ground colour with large soft patches. */
export function patchGround(m: THREE.MeshStandardMaterial, key: string, freq: number, low: number, high: number) {
  patch(m, `life-ground-${key}`, (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      "#include <color_fragment>",
      /* glsl */ `#include <color_fragment>
      diffuseColor.rgb *= mix(${low.toFixed(2)}, ${high.toFixed(2)}, lfFbm(vLife.xz * ${freq.toFixed(3)}));`,
    );
  });
}

/** Black sand: patchy on the beach, dark and glossy where the waves reach. */
export function patchSand(m: THREE.MeshStandardMaterial) {
  patch(m, "life-sand", (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      "#include <color_fragment>",
      /* glsl */ `#include <color_fragment>
      diffuseColor.rgb *= mix(0.75, 1.3, lfFbm(vLife.xz * vec2(0.5, 0.12)));
      float wet = smoothstep(176.0, 186.0, vLife.x + sin(vLife.z * 0.08 + uWind * 0.25) * 1.6);
      diffuseColor.rgb *= mix(1.0, 0.45, wet);`,
    );
    s.fragmentShader = s.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      /* glsl */ `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.18, smoothstep(178.0, 186.0, vLife.x));`,
    );
  });
}

/** Busy masonry, calmed: flatter relief, and each brick pulled towards the wall's average colour. */
export function patchCalm(m: THREE.MeshStandardMaterial, amount: number) {
  if (m.userData.calm) return; // materials are shared across meshes
  m.userData.calm = true;
  m.normalScale.multiplyScalar(0.5);
  const avg = { value: new THREE.Color(1, 1, 1) };
  const img = m.map?.image as CanvasImageSource | undefined;
  if (img) {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    c.canvas.width = c.canvas.height = 1;
    c.drawImage(img, 0, 0, 1, 1);
    const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
    avg.value.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace).multiply(m.color);
  }
  patch(m, `life-calm-${m.name}`, (s) => {
    s.uniforms.uAvg = avg;
    s.fragmentShader = s.fragmentShader.replace("void main() {", "uniform vec3 uAvg;\nvoid main() {");
    s.fragmentShader = s.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>\n      diffuseColor.rgb = mix(diffuseColor.rgb, uAvg, ${amount.toFixed(2)});`,
    );
  });
}

/** The sun's colour on skin edges; world.ts sets it with the hour. */
export const skinRim = { value: new THREE.Color() };

/** Skin: a little less orange, and a soft rim where the light wraps round the edges. */
export function patchSkin(m: THREE.MeshStandardMaterial) {
  m.roughness = 0.55;
  patch(m, "life-skin", (s) => {
    s.uniforms.uRim = skinRim;
    s.fragmentShader = s.fragmentShader.replace("void main() {", "uniform vec3 uRim;\nvoid main() {");
    s.fragmentShader = s.fragmentShader.replace(
      "#include <color_fragment>",
      /* glsl */ `#include <color_fragment>
      {
        float l = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
        diffuseColor.rgb = mix(vec3(l), diffuseColor.rgb, 0.9);
      }`,
    );
    s.fragmentShader = s.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      /* glsl */ `#include <emissivemap_fragment>
      {
        float f = 1.0 - max(dot(normal, normalize(vViewPosition)), 0.0);
        totalEmissiveRadiance += uRim * diffuseColor.rgb * pow(f, 3.0);
      }`,
    );
  });
}

/** Leaves sway with height, and flutter on top of that. */
export function patchWind(m: THREE.Material, key: string, amount: number) {
  patch(m, `life-wind-${key}`, (s) => {
    s.vertexShader = s.vertexShader.replace(
      "#include <project_vertex>",
      /* glsl */ `${WORLD_VERT}
      {
        float k = max(lifeWorld.y + 0.3, 0.0) * ${amount.toFixed(4)};
        float ph = lifeWorld.x * 0.21 + lifeWorld.z * 0.17;
        lifeWorld.x += k * (sin(uWind * 0.9 + ph) + 0.4 * sin(uWind * 3.1 + ph * 7.0));
        lifeWorld.z += k * 0.7 * cos(uWind * 0.7 + ph * 1.3);
        lifeWorld.y += k * 0.25 * sin(uWind * 2.3 + ph * 5.0);
      }
      vec4 mvPosition = viewMatrix * lifeWorld;
      gl_Position = projectionMatrix * mvPosition;`,
    );
    s.vertexShader = s.vertexShader.replace(`${WORLD_VERT}\nvLife = lifeWorld.xyz;`, "vLife = lifeWorld.xyz;");
    s.uniforms.uFadeA = camFadeA;
    s.uniforms.uFadeB = camFadeB;
    s.fragmentShader = s.fragmentShader.replace(
      "void main() {",
      /* glsl */ `uniform vec3 uFadeA; uniform vec4 uFadeB;
      void main() {
        if (uFadeB.w > 0.0) {
          // distance from this leaf to the line between camera and player; dithered away near it
          vec3 ab = uFadeB.xyz - uFadeA;
          float t = clamp(dot(vLife - uFadeA, ab) / dot(ab, ab), 0.0, 0.92);
          float d = distance(vLife, uFadeA + ab * t) / uFadeB.w;
          if (d < 1.0 && lfHash(floor(gl_FragCoord.xy)) > d * d) discard;
        }`,
    );
  });
}

/* ---------------- blades ---------------- */

/** A tuft of tapered blades, 1 unit tall, each curving outwards a little more than the last. */
function tuftGeometry(n = 3) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let b = 0; b < n; b++) {
    const a = (b / n) * Math.PI * 2 + 0.4;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    const lean = 0.22 + (b % 3) * 0.08;
    const tall = 1 - (b % 2) * 0.22;
    const base = pos.length / 3;
    [[0, 0.05], [0.4, 0.042], [0.75, 0.025], [1, 0]].forEach(([y, w]) => {
      const out = lean * y * y;
      pos.push(c * out - s * w, y * tall, s * out + c * w, c * out + s * w, y * tall, s * out - c * w);
    });
    idx.push(base, base + 1, base + 3, base, base + 3, base + 2, base + 2, base + 3, base + 5, base + 2, base + 5, base + 4, base + 4, base + 5, base + 6);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(pos.flatMap(() => [0, 1, 0]).slice(0, pos.length), 3));
  g.setIndex(idx);
  return g;
}

/** Instanced tufts that sway, darken towards the root, and shrink away past `fade` metres from the camera. */
function blades(key: string, count: number, sway: number, fade: number, perTuft = 3) {
  const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: 0.4 });
  patch(mat, `life-blades-${key}`, (s) => {
    s.vertexShader = s.vertexShader.replace("void main() {", "varying float vBladeH;\nvoid main() {");
    s.fragmentShader = s.fragmentShader.replace("void main() {", "varying float vBladeH;\nvoid main() {");
    s.fragmentShader = s.fragmentShader.replace(
      "#include <color_fragment>",
      "#include <color_fragment>\n      diffuseColor.rgb *= mix(0.45, 1.12, vBladeH);",
    );
    s.vertexShader = s.vertexShader.replace(
      "#include <begin_vertex>",
      /* glsl */ `#include <begin_vertex>
      vBladeH = position.y;
      #ifdef USE_INSTANCING
        transformed *= 1.0 - smoothstep(${(fade * 0.6).toFixed(1)}, ${fade.toFixed(1)}, distance(cameraPosition, (modelMatrix * instanceMatrix[3]).xyz));
        vec2 org = instanceMatrix[3].xz;
        float ph = org.x * 0.6 + org.y * 0.45;
        float gust = sin(uWind * 1.1 + ph * 0.2) * 0.6 + 0.5;
        transformed.x += position.y * position.y * ${sway.toFixed(3)} * (sin(uWind * 2.2 + ph) + gust);
        transformed.z += position.y * position.y * ${(sway * 0.6).toFixed(3)} * cos(uWind * 1.7 + ph);
      #endif`,
    );
  });
  const mesh = new THREE.InstancedMesh(tuftGeometry(perTuft), mat, count);
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  return mesh;
}

type Rect = [number, number, number, number];
const LAWN_HOLES: Rect[] = [[-6.4, 6.4, -4.4, 4.4], [-11.1, 13.1, 4.1, 12.6], [8.8, 14.4, -3.9, 2.9], [8.5, 16.7, -10.7, -4.3]];

export function grass(low: boolean) {
  const count = low ? 9000 : 32000;
  const mesh = blades("grass", count, 0.09, low ? 18 : 30, 5);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const c = new THREE.Color();
  let n = 0;
  let guard = 0;
  while (n < count && guard++ < count * 12) {
    const x = -11.7 + Math.random() * 28.4;
    const z = -10.7 + Math.random() * 24.5;
    if (LAWN_HOLES.some(([a, b, d, e]) => x > a && x < b && z > d && z < e)) continue;
    const h = 0.11 + Math.random() * 0.13;
    q.setFromAxisAngle(up, Math.random() * 6.28);
    m.compose(new THREE.Vector3(x, -0.3, z), q, new THREE.Vector3(h * 1.5, h, h * 1.5));
    mesh.setMatrixAt(n, m);
    mesh.setColorAt(n, c.setHSL(0.24 + Math.random() * 0.05, 0.5, 0.26 + Math.random() * 0.12));
    n++;
  }
  mesh.count = n;
  return mesh;
}

/** Rice standing in rows on the paddies near the villa. */
export function rice(paddies: number[][], low: boolean) {
  const radius = low ? 34 : 62;
  const count = low ? 7000 : 26000;
  const mesh = blades("rice", count, 0.07, radius + 30);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const c = new THREE.Color();
  let n = 0;
  const near = paddies.filter(([x, , z]) => Math.hypot(x, z) < radius).sort((a, b) => Math.hypot(a[0], a[2]) - Math.hypot(b[0], b[2]));
  for (const [cx, y, cz, w, d, gold] of near) {
    for (let px = -w / 2 + 0.2; px < w / 2 - 0.1 && n < count; px += 0.55) {
      for (let pz = -d / 2 + 0.2; pz < d / 2 - 0.1 && n < count; pz += 0.42) {
        // some paddies run under the lane and the garden: no rice poking through the paving
        const [bx, bz] = [cx + px, cz + pz];
        if ((bz > 14.2 && bz < 18.5 && bx < 152) || (bx > -12.2 && bx < 17.2 && bz > -11.2 && bz < 14.4)) continue;
        const h = 0.42 + Math.random() * 0.14;
        q.setFromAxisAngle(up, Math.random() * 6.28);
        m.compose(new THREE.Vector3(cx + px + Math.random() * 0.08, y, cz + pz + Math.random() * 0.08), q, new THREE.Vector3(h * 0.95, h, h * 0.95));
        mesh.setMatrixAt(n, m);
        if (gold) c.setHSL(0.14 + Math.random() * 0.02, 0.55, 0.42 + Math.random() * 0.08);
        else c.setHSL(0.235 + Math.random() * 0.035, 0.58, 0.32 + Math.random() * 0.1);
        mesh.setColorAt(n, c);
        n++;
      }
    }
  }
  mesh.count = n;
  return mesh;
}
