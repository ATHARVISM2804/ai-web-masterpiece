import * as THREE from "three";

/**
 * Small visual extras the world ticks every frame. Each builds its own
 * object(s) and leaves placing them to world.ts.
 */

/** Soft dark discs under feet, so nobody floats: one instance per person. */
export function contactShadows(max: number) {
  const strength = new THREE.InstancedBufferAttribute(new Float32Array(max), 1);
  const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  geo.setAttribute("aStrength", strength);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    vertexShader: /* glsl */ `
      attribute float aStrength;
      varying vec2 vUv;
      varying float vK;
      void main() {
        vUv = uv;
        vK = aStrength;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying float vK;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = (1.0 - smoothstep(0.0, 1.0, d)) * (1.0 - smoothstep(0.0, 1.0, d));
        gl_FragColor = vec4(0.06, 0.04, 0.03, a * vK);
      }`,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, max);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  mesh.count = 0;
  const m = new THREE.Matrix4();
  let n = 0;
  return {
    mesh,
    begin() {
      n = 0;
    },
    /** A disc `size` metres across at (x, y, z); `k` is how dark, 0..1. */
    add(x: number, y: number, z: number, size: number, k: number) {
      if (n >= max || k <= 0.01) return;
      mesh.setMatrixAt(n, m.makeScale(size, 1, size).setPosition(x, y + 0.015, z));
      strength.setX(n, k);
      n++;
    },
    end() {
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      strength.needsUpdate = true;
    },
  };
}

/** Paper lanterns on short ironwood posts, lit after dusk: they glow and bloom, they cast no light. */
export function lanterns(spots: [number, number, number][]) {
  const post = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.05, 0.06, 0.7, 8).translate(0, 0.35, 0),
    new THREE.MeshStandardMaterial({ color: "#3a2a1e", roughness: 0.8 }),
    spots.length,
  );
  const paper = new THREE.MeshStandardMaterial({ color: "#efe2c6", roughness: 0.9, emissive: "#ffb25e", emissiveIntensity: 0 });
  const shade = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.15, 0.3, 12).translate(0, 0.85, 0), paper, spots.length);
  const cap = new THREE.InstancedMesh(new THREE.ConeGeometry(0.2, 0.12, 12).translate(0, 1.06, 0), post.material, spots.length);
  const m = new THREE.Matrix4();
  spots.forEach(([x, y, z], i) => [post, shade, cap].forEach((im) => im.setMatrixAt(i, m.makeTranslation(x, y, z))));
  const group = new THREE.Group();
  [post, cap].forEach((im) => (im.castShadow = true));
  group.add(post, shade, cap);
  return {
    group,
    update(night: number, t: number) {
      paper.emissiveIntensity = night * (2.2 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 3.1) * 0.06);
    },
  };
}

/** Fireflies over the garden and the paddy edge at night: slow loops, each pulsing on its own. */
export function fireflies(n: number, areas: [number, number, number, number][]) {
  const seed = new Float32Array(n * 4);
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const [x0, x1, z0, z1] = areas[i % areas.length];
    pos.set([x0 + Math.random() * (x1 - x0), -0.1 + Math.random() * 1.6, z0 + Math.random() * (z1 - z0)], i * 3);
    seed.set([Math.random() * 6.28, 0.3 + Math.random() * 0.5, 0.6 + Math.random() * 1.4, Math.random() * 6.28], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  const uniforms = { uTime: { value: 0 }, uNight: { value: 0 }, uScale: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      uniform float uTime, uNight, uScale;
      varying float vA;
      void main() {
        float t = uTime * aSeed.y + aSeed.x;
        vec3 p = position + vec3(sin(t) * aSeed.z, sin(t * 1.7) * 0.25, cos(t * 0.8) * aSeed.z);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // on for a moment, then dark for longer
        vA = uNight * pow(max(0.0, sin(uTime * 1.3 * aSeed.y + aSeed.w)), 6.0);
        gl_PointSize = uScale * 26.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = vA * (1.0 - smoothstep(0.0, 1.0, d));
        gl_FragColor = vec4(vec3(1.0, 0.92, 0.45) * 2.4 * a, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return {
    points,
    update(night: number, t: number, pixelRatio: number) {
      points.visible = night > 0.05;
      uniforms.uNight.value = night;
      uniforms.uTime.value = t;
      uniforms.uScale.value = pixelRatio;
    },
  };
}

/** A headlight: a faint beam from the lamp and a pool of light on the road ahead. Both additive, neither lights anything. */
export function headlight() {
  const uI = { value: 0 };
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uI },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: "varying float vD; void main() { vD = length(position) / 6.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform float uI; varying float vD; void main() { float a = smoothstep(0.0, 0.3, vD) * pow(1.0 - clamp(vD, 0.0, 1.0), 2.0) * uI * 0.16; gl_FragColor = vec4(vec3(1.0, 0.93, 0.78) * a, a); }",
  });
  // apex at the lamp, opening forward (+z) and tipped a little towards the road
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.1, 6, 24, 1, true).translate(0, -3, 0).rotateX(-Math.PI / 2).rotateX(0.12), beamMat);
  beam.name = "beam";
  const poolMat = new THREE.ShaderMaterial({
    uniforms: { uI },
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    blending: THREE.AdditiveBlending,
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform float uI; varying vec2 vUv; void main() { vec2 d = (vUv - 0.5) * 2.0; float a = (1.0 - smoothstep(0.1, 1.0, length(d))) * smoothstep(-1.0, -0.4, d.y) * uI * 0.5; gl_FragColor = vec4(vec3(1.0, 0.9, 0.72) * a, a); }",
  });
  // long and well ahead: from the chase camera, road close in front sits right behind the rider's head
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 9).rotateX(-Math.PI / 2), poolMat);
  pool.name = "beamPool";
  pool.position.set(0, 0.04, 7.5);
  return { beam, pool, intensity: uI };
}

/** The jet ski's wake: a ribbon of foam laid down behind the stern that widens and fades over three seconds. */
export function wake(points = 40, life = 3) {
  const trail: { x: number; z: number; sx: number; sz: number; t: number }[] = [];
  const pos = new Float32Array(points * 2 * 3);
  const age = new Float32Array(points * 2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAge", new THREE.BufferAttribute(age, 1));
  const idx: number[] = [];
  for (let i = 0; i < points - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  geo.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    vertexShader: "attribute float aAge; varying float vA; varying vec2 vS; void main() { vA = aAge; vS = vec2(float(gl_VertexID % 2), aAge); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      varying float vA; varying vec2 vS;
      float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      void main() {
        float edge = 1.0 - pow(abs(vS.x * 2.0 - 1.0), 3.0);
        float foam = 0.65 + 0.35 * h(floor(gl_FragCoord.xy * 0.5));
        float a = (1.0 - vA) * (1.0 - vA) * edge * foam * 0.95;
        gl_FragColor = vec4(vec3(0.95, 0.98, 1.0), a);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  let lastDrop = 0;
  return {
    mesh,
    /** `on` while the jet ski is moving; (x, z) the stern; y the water. */
    update(t: number, on: boolean, x: number, y: number, z: number, yaw: number) {
      if (on && t - lastDrop > life / points) {
        lastDrop = t;
        trail.unshift({ x, z, sx: Math.cos(yaw), sz: -Math.sin(yaw), t });
        trail.length = Math.min(trail.length, points);
      }
      for (let i = 0; i < points; i++) {
        const p = trail[Math.min(i, trail.length - 1)];
        const k = p ? Math.min(1, (t - p.t) / life) : 1;
        const w = 0.35 + k * 1.6;
        for (let s = 0; s < 2; s++) {
          const j = (i * 2 + s) * 3;
          const side = s ? w : -w;
          pos[j] = p ? p.x + p.sx * side : 0;
          pos[j + 1] = y;
          pos[j + 2] = p ? p.z + p.sz * side : 0;
          age[i * 2 + s] = p ? k : 1;
        }
      }
      mesh.visible = trail.length > 1 && t - trail[0].t < life;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAge.needsUpdate = true;
    },
  };
}
