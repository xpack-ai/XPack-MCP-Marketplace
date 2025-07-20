/*
 * EarthPixelAnimation.ts
 * An interactive particle-based Earth sphere background animation inspired by the standalone "Sphere" demo.
 *
 * Because this animation is used from a React Client Component we do **all** DOM / WebGL calls inside
 * `initEarthPixelAnimation` and *never* on the server. A cleanup callback is returned so the caller can
 * dispose ThreeJS resources when the component un-mounts.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/** Public configuration options */
export interface EarthAnimationOptions {
  /** Particle count (default 12_000) */
  particleCount?: number;
  /** Radius of the sphere in world units (default 12) */
  radius?: number;
  /** Whether user can orbit the camera (default true) */
  interactive?: boolean;
  /** Strength of the bloom effect (default 1.2) */
  bloomStrength?: number;
  background?: string;
  color?: string;
  colorPole?: string;
}

// Internal (default) config. We merge these with the incoming partial config.
const DEFAULT_CONFIG: Required<EarthAnimationOptions> = {
  particleCount: 12000,
  radius: 12,
  interactive: true,
  bloomStrength: 0,
  background: "0x000000",
  color: "#00aaff",
  colorPole: "#3399ff",
};

export function initEarthPixelAnimation(
  canvas: HTMLCanvasElement,
  container: HTMLDivElement,
  options?: EarthAnimationOptions
) {
  // ---- Merge config -------------------------------------------------------
  const CFG = {
    ...DEFAULT_CONFIG,
    ...(options || {}),
  } as Required<EarthAnimationOptions>;

  // ---- THREE.js essentials ----------------------------------------------
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000308, 0.025);

  const camera = new THREE.PerspectiveCamera(
    65,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 28);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(CFG.background, 1); // 白色背景

  renderer.toneMapping = THREE.NoToneMapping;

  // Post-processing (bloom) -------------------------------------------------
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    CFG.bloomStrength,
    0.55,
    0.02
  );
  composer.addPass(bloomPass);

  // Orbit controls ---------------------------------------------------------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;
  controls.enableZoom = CFG.interactive;
  controls.enableRotate = CFG.interactive;

  // Lights -----------------------------------------------------------------
  scene.add(new THREE.AmbientLight(0x404040));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(10, 15, 10);
  scene.add(dirLight);

  // ---- Utility functions --------------------------------------------------
  const tempVec = new THREE.Vector3();

  function generateSpherePoints(count: number, radius: number): Float32Array {
    const pts = new Float32Array(count * 3);
    const golden = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // from 1 to -1
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const idx = i * 3;
      pts[idx] = x * radius;
      pts[idx + 1] = y * radius;
      pts[idx + 2] = z * radius;
    }
    return pts;
  }

  function createStarTexture(): THREE.CanvasTexture {
    const size = 64;
    const cvs = document.createElement("canvas");
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.3)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(cvs);
  }

  // ---- Particle system (Earth) -------------------------------------------
  const positions = generateSpherePoints(CFG.particleCount, CFG.radius);
  const sizes = new Float32Array(CFG.particleCount);
  const opacities = new Float32Array(CFG.particleCount);
  const colors = new Float32Array(CFG.particleCount * 3);

  const colorCenter = new THREE.Color(CFG.color);
  const colorPole = new THREE.Color(CFG.colorPole);

  for (let i = 0; i < CFG.particleCount; i++) {
    sizes[i] = THREE.MathUtils.randFloat(0.08, 0.22);
    opacities[i] = 1.0;

    // colouring: make poles slightly lighter
    tempVec.fromArray(positions, i * 3);
    const t = (tempVec.y / CFG.radius + 1) / 2; // 0..1
    const c = colorCenter.clone().lerp(colorPole, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const starTex = createStarTexture();

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      pointTexture: { value: starTex },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute float opacity;
      varying float vOpacity;
      varying vec3 vColor;
      uniform float uTime;

      void main() {
        vOpacity = opacity;
        vColor = color;
        vec3 pos = position;
        float n = sin(pos.x * 0.08 + uTime * 0.4) * 0.4;
        pos += normalize(pos) * n; // subtle breathing
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (400.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D pointTexture;
      varying float vOpacity;
      varying vec3 vColor;
      void main() {
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        if (texColor.a < 0.05) discard;
        gl_FragColor = vec4(vColor, vOpacity * texColor.a);
      }`,
    blending: THREE.NormalBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ---- Star field ---------------------------------------------------------
  function addStarField(count = 14000) {
    const starPos: number[] = [];
    const starSizeArr: number[] = [];
    const starColorArr: number[] = [];

    for (let i = 0; i < count; i++) {
      tempVec.set(
        THREE.MathUtils.randFloatSpread(600),
        THREE.MathUtils.randFloatSpread(600),
        THREE.MathUtils.randFloatSpread(600)
      );
      if (tempVec.length() < 150) tempVec.setLength(150 + Math.random() * 450);
      starPos.push(tempVec.x, tempVec.y, tempVec.z);
      starSizeArr.push(Math.random() * 0.25 + 0.1);
      const twinkle = Math.random() < 0.15;
      const c = new THREE.Color();
      if (twinkle) c.setHSL(Math.random(), 0.7, 0.65);
      else c.setHSL(0.6, Math.random() * 0.1, 0.8 + Math.random() * 0.2);
      starColorArr.push(c.r, c.g, c.b);
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPos, 3)
    );
    starGeo.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(starSizeArr, 1)
    );
    starGeo.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(starColorArr, 3)
    );

    const starMat = new THREE.ShaderMaterial({
      uniforms: { pointTexture: { value: starTex } },
      vertexShader: /* glsl */ `
        attribute float size; varying vec3 vColor; void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D pointTexture; varying vec3 vColor; void main() {
          float a = texture2D(pointTexture, gl_PointCoord).a; if (a < 0.1) discard;
          gl_FragColor = vec4(vColor, a * 0.8);
        }`,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    const starPts = new THREE.Points(starGeo, starMat);
    scene.add(starPts);
  }

  addStarField();

  // ---- Resize handling ----------------------------------------------------
  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener("resize", onResize);

  // ---- Animation loop -----------------------------------------------------
  const clock = new THREE.Clock();
  let rafId: number;
  function animate() {
    rafId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    mat.uniforms.uTime.value = elapsed;
    controls.update();
    composer.render();
  }
  animate();

  // ---- Cleanup ------------------------------------------------------------
  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    controls.dispose();
    renderer.dispose();
    geo.dispose();
    mat.dispose();
    starTex.dispose();
  };
}
