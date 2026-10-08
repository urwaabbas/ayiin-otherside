// Accumulated-rasterisation studio renderer. Query: kind, c, a, t (hex, no #), view (hero|angle|detail|scene|cut), size, frames, shape.
// view=cut renders the hero framing on a transparent background: no sweep, only the product and the soft
// shadow it casts on an invisible floor — a cut-out the site can place in any environment.
import { THREE, sweep, noiseTex, RoundedBoxGeometry } from './studio.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BUILDERS } from './products.js';

const q = new URLSearchParams(location.search);
const job = {
  kind: q.get('kind') || 'mug',
  color: '#' + (q.get('c') || 'a7b39a'),
  accent: '#' + (q.get('a') || '2a2c31'),
  tint: '#' + (q.get('t') || 'e9e8e3'),
  view: q.get('view') || 'hero',
  size: +(q.get('size') || 900),
  frames: +(q.get('frames') || 96),
  exposure: +(q.get('exp') || 1),
  env: +(q.get('env') || 0.42),
};
const S = job.size;
const isCut = job.view === 'cut';

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: isCut });
renderer.setSize(S, S);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = job.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
scene.environmentIntensity = job.env;
scene.environmentRotation.y = 0.6;
scene.background = isCut ? null : new THREE.Color(job.tint);

const built = await BUILDERS[job.kind]({ color: job.color, accent: job.accent, tint: job.tint, view: isCut ? 'hero' : job.view, shape: q.get('shape') });
const obj = built.object;
scene.add(obj);
obj.traverse((o) => { if (o.isMesh) { o.castShadow = o.userData.noShadow ? false : true; o.receiveShadow = true; } });
const box = new THREE.Box3().setFromObject(obj);
obj.position.y -= box.min.y;
box.setFromObject(obj);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());
const L = Math.max(size.x, size.y, size.z);

const isScene = job.view === 'scene';
const wallColor = isScene ? new THREE.Color(job.tint).lerp(new THREE.Color('#cfc6b6'), 0.35) : new THREE.Color(job.tint);
const backdrop = sweep(wallColor, { radius: (isScene ? 0.6 : 3.2) * L, depth: (isScene ? -1.1 : -2.2) * L, width: 60 * L, front: 40 * L, top: 40 * L });
backdrop.receiveShadow = true;
if (isCut) {
  // shadow catcher: invisible except where the product's shadow falls
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60 * L, 60 * L), new THREE.ShadowMaterial({ opacity: +(q.get('shadow') || 0.34) }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
} else scene.add(backdrop);
const floorStanding = ['chair', 'taskchair'].includes(job.kind);
if (isScene) {
  scene.background = wallColor.clone();
  backdrop.material.emissiveIntensity = 0.04;
}
if (isScene && !floorStanding) {
  // travertine plinth the product sits on
  const pw = Math.max(size.x, size.z) * 1.4 + 0.3 * L, ph = 0.1 * L;
  const stoneTex = noiseTex('#e7dfd1', ['#d6cbb7', '#efe9de', '#cbbfa9'], { count: 2600, r: [0.4, 2.2], repeat: [2, 1], alpha: 0.5 });
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(pw, ph, Math.min(pw, size.z * 1.3 + 0.5 * L), 6, 0.03 * L), new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: stoneTex, roughness: 0.62, clearcoat: 0.05 }));
  plinth.position.set(center.x, -ph / 2, center.z);
  plinth.castShadow = plinth.receiveShadow = true;
  scene.add(plinth);
  backdrop.position.y = -ph;
}

function shadowLight(intensity, mapSize = 2048) {
  const l = new THREE.DirectionalLight('#ffffff', intensity);
  l.castShadow = true;
  l.shadow.mapSize.set(mapSize, mapSize);
  const e = L * (isScene ? 3.2 : 1.4);
  Object.assign(l.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 0.1 * L, far: 30 * L });
  l.shadow.bias = -0.0002;
  l.shadow.normalBias = 0.01 * L;
  l.shadow.radius = 2;
  l.target.position.copy(center);
  scene.add(l, l.target);
  return l;
}
const key = shadowLight(+(q.get('key') || (isScene ? 1.35 : 1.05)), isScene ? 4096 : 2048);
if (isScene) key.color.set('#fff0dc');
// window gobo: invisible to the camera, but it casts the window shadow
const KEY = new THREE.Vector3(-4.2, 5.0, 4.0);
if (isScene) {
  const W = 5.2 * L, H = 5.2 * L, pane = [1.05 * L, 1.3 * L], mull = 0.12 * L;
  const g = new THREE.Shape(); g.moveTo(-W / 2, -H / 2); g.lineTo(W / 2, -H / 2); g.lineTo(W / 2, H / 2); g.lineTo(-W / 2, H / 2); g.lineTo(-W / 2, -H / 2);
  for (let cx = 0; cx < 3; cx++) for (let cy = 0; cy < 2; cy++) {
    const x0 = (cx - 1.5) * (pane[0] + mull) + mull / 2 + 0.6 * L, y0 = (cy - 1) * (pane[1] + mull) + mull / 2 - 0.2 * L;
    const h = new THREE.Path(); h.moveTo(x0, y0); h.lineTo(x0, y0 + pane[1]); h.lineTo(x0 + pane[0], y0 + pane[1]); h.lineTo(x0 + pane[0], y0); h.lineTo(x0, y0); g.holes.push(h);
  }
  const gobo = new THREE.Mesh(new THREE.ShapeGeometry(g), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide }));
  gobo.position.copy(center).addScaledVector(KEY, 0.5 * L);
  gobo.lookAt(center.clone().addScaledVector(KEY, 2 * L));
  gobo.castShadow = true;
  scene.add(gobo);
}
const hemi = shadowLight(+(q.get('hemi') || 0.42), 1024);
const fill = new THREE.DirectionalLight('#ffffff', +(q.get('fill') || 0.12));
fill.position.set(center.x + 5 * L, center.y + 2 * L, center.z + 4 * L);
fill.target.position.copy(center);
scene.add(fill, fill.target);

// Camera
const camera = new THREE.PerspectiveCamera(24, 1, 0.01 * L, 100 * L);
const views = {
  hero: { az: -0.32, el: 0.2, fill: 0.7 },
  angle: { az: 0.62, el: 0.36, fill: 0.62 },
  detail: { az: -0.18, el: 0.16, fill: 2.0, aperture: 0.035 },
  top: { az: -0.2, el: 0.95, fill: 0.64 },
  scene: { az: -0.28, el: 0.14, fill: 0.56 },
  cut: { az: -0.34, el: 0.2, fill: 0.74 },
};
const v = { ...(views[job.view] ?? views.hero), ...(built.view?.[isCut ? 'hero' : job.view] ?? {}), ...(isCut ? { fill: views.cut.fill * ((built.view?.hero?.fill ?? views.hero.fill) / views.hero.fill) } : {}) };
const radius = size.length() / 2;
const dist = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) / v.fill) * 0.8;
const target = v.target ? new THREE.Vector3(...v.target) : isScene ? center.clone().add(new THREE.Vector3(0, -0.04 * L, 0)) : center.clone();
const camPos = new THREE.Vector3(
  target.x + dist * Math.sin(v.az) * Math.cos(v.el),
  target.y + dist * Math.sin(v.el),
  target.z + dist * Math.cos(v.az) * Math.cos(v.el),
);

// Accumulation targets
const rtFrame = new THREE.WebGLRenderTarget(S, S, { type: THREE.HalfFloatType, samples: 4 });
const rtAcc = new THREE.WebGLRenderTarget(S, S, { type: THREE.FloatType });
const accumMat = new THREE.ShaderMaterial({
  uniforms: { tFrame: { value: null }, weight: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: 'uniform sampler2D tFrame; uniform float weight; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tFrame, vUv) * weight; }',
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneFactor,
  depthTest: false,
  depthWrite: false,
  transparent: true,
});
const accumQuad = new FullScreenQuad(accumMat);
const output = new OutputPass();

let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const up = new THREE.Vector3(0, 1, 0);
const fwd = new THREE.Vector3();
const right = new THREE.Vector3();
const camUp = new THREE.Vector3();
fwd.subVectors(target, camPos).normalize();
right.crossVectors(fwd, up).normalize();
camUp.crossVectors(right, fwd).normalize();

window.render = async () => {
  const t0 = performance.now();
  renderer.setRenderTarget(rtAcc);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  const px = new Float32Array(4);
  for (let i = 0; i < job.frames; i++) {
    // soft key: random point on a big softbox, upper-left
    const jit = isScene ? 0.12 : 1;
    const kx = KEY.x + (rnd() - 0.5) * 3.2 * jit, ky = KEY.y + (rnd() - 0.5) * 2.4 * jit, kz = KEY.z + (rnd() - 0.5) * 3.2 * jit;
    key.position.set(center.x + kx * L, center.y + ky * L, center.z + kz * L);
    // sky occlusion: cosine-weighted random direction on the upper hemisphere
    const u = rnd(), w = rnd();
    const r = Math.sqrt(u) * 0.92, phi = 2 * Math.PI * w;
    hemi.position.set(center.x + r * Math.cos(phi) * 8 * L, center.y + Math.sqrt(1 - r * r) * 8 * L, center.z + r * Math.sin(phi) * 8 * L);
    // camera: subpixel jitter + aperture (depth of field)
    const ap = v.aperture ? v.aperture * dist : 0;
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * ap;
    camera.position.copy(camPos).addScaledVector(right, Math.cos(a) * rr).addScaledVector(camUp, Math.sin(a) * rr);
    camera.lookAt(target);
    camera.setViewOffset(S, S, rnd() - 0.5, rnd() - 0.5, S, S);
    renderer.setRenderTarget(rtFrame);
    if (isCut) renderer.setClearColor(0x000000, 0);
    else renderer.setClearColor(scene.background, 1);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(rtAcc);
    accumMat.uniforms.tFrame.value = rtFrame.texture;
    accumMat.uniforms.weight.value = 1 / job.frames;
    renderer.autoClear = false; // never wipe the accumulation buffer
    accumQuad.render(renderer);
    renderer.autoClear = true;
    if (i % 8 === 7) { renderer.readRenderTargetPixels(rtAcc, 0, 0, 1, 1, px); await new Promise((res) => setTimeout(res, 0)); }
    window.progress = { frame: i + 1, ms: Math.round(performance.now() - t0) };
  }
  renderer.setRenderTarget(null);
  output.renderToScreen = true;
  output.render(renderer, null, rtAcc);
  return { ms: Math.round(performance.now() - t0), frames: job.frames };
};
window.ready = true;
