import * as THREE from "three";

/**
 * The sky: a gradient dome with drifting clouds and a sun, driven by the hour.
 * The same dome is rendered into the scene's environment map, so reflections
 * and ambient light always match the sky you can see.
 */

const frag = /* glsl */ `
  uniform vec3 uTop, uBottom, uSun, uSunDir;
  uniform float uNight, uTime, uDisc;
  varying vec3 vDir;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 11.3; a *= 0.5; }
    return s;
  }
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -0.05, 1.0);
    vec3 col = mix(uBottom, uTop, pow(smoothstep(0.0, 0.62, h), 0.7));
    float s = max(dot(d, uSunDir), 0.0);
    col += uSun * (pow(s, 6.0) * 0.28 + pow(s, 64.0) * 0.5) * (1.0 - uNight);
    col += uSun * smoothstep(0.9994, 0.9998, s) * uDisc * (1.0 - uNight);
    if (d.y > 0.0) {
      vec2 p = d.xz / (d.y + 0.16) * 1.15 + uTime * vec2(0.006, 0.002);
      float c = smoothstep(0.5, 0.78, fbm(p));
      float shade = smoothstep(0.5, 0.95, fbm(p + uSunDir.xz * 0.12));
      vec3 lit = mix(vec3(1.0), uSun, 0.45) * mix(1.15, 0.68, shade);
      lit = mix(lit, uBottom * 1.25, 0.22);
      lit = mix(lit, uTop * 1.5 + 0.015, uNight);
      col = mix(col, lit, c * smoothstep(0.0, 0.14, d.y) * 0.92);
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createSky(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uNight: { value: 0 },
    uTime: { value: 0 },
    uDisc: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * mat4(mat3(modelViewMatrix)) * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: frag,
  });
  const geometry = new THREE.SphereGeometry(1, 32, 20);
  const dome = new THREE.Mesh(geometry, material);
  dome.frustumCulled = false;
  dome.renderOrder = -10;
  scene.add(dome);

  const envScene = new THREE.Scene();
  const envDome = new THREE.Mesh(geometry, material);
  envDome.frustumCulled = false;
  envScene.add(envDome);
  const pm = new THREE.PMREMGenerator(renderer);
  // the dome goes into a small cube first, and both targets are reused: a fresh
  // PMREM from the scene each time allocated new targets and stalled for ~200 ms.
  // Now it costs under a millisecond, so it can follow the hour closely
  const cube = new THREE.WebGLCubeRenderTarget(64, { type: THREE.HalfFloatType });
  const cubeCam = new THREE.CubeCamera(0.1, 10, cube);
  let target: THREE.WebGLRenderTarget | null = null;
  let envHour = -99;

  return {
    time: uniforms.uTime,
    update(s: { top: THREE.Color; bottom: THREE.Color; sun: THREE.Color; night: number }, dir: THREE.Vector3, hour: number) {
      uniforms.uTop.value.copy(s.top);
      uniforms.uBottom.value.copy(s.bottom);
      uniforms.uSun.value.copy(s.sun);
      uniforms.uSunDir.value.copy(dir).normalize();
      uniforms.uNight.value = s.night;
      if (Math.abs(hour - envHour) < 0.05) return;
      envHour = hour;
      uniforms.uDisc.value = 0; // the sun itself is the directional light
      cubeCam.update(renderer, envScene);
      const next = pm.fromCubemap(cube.texture, target ?? undefined);
      uniforms.uDisc.value = 14;
      scene.environment = next.texture;
      target = next;
    },
    dispose() {
      target?.dispose();
      cube.dispose();
      pm.dispose();
    },
  };
}
