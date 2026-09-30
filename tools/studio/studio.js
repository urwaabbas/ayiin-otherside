import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export { THREE, RoundedBoxGeometry };

/** Seamless cyclorama sweep: floor → quarter curve → wall. */
export function sweep(color, { radius = 3.2, depth = -3.2, width = 40, front = 14, top = 20 } = {}) {
  const prof = [];
  const step = Math.max(0.5, (front - depth) / 60);
  for (let z = front; z > depth; z -= step) prof.push([z, 0]);
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * (Math.PI / 2);
    prof.push([depth - Math.sin(a) * radius, radius - Math.cos(a) * radius]);
  }
  for (let y = radius + step; y <= top; y += step) prof.push([depth - radius, y]);
  const pos = [], idx = [];
  prof.forEach(([z, y], i) => {
    pos.push(-width / 2, y, z, width / 2, y, z);
    if (i > 0) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // make normals face the camera side
  const c = new THREE.Color(color);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, side: THREE.DoubleSide, emissive: c.clone(), emissiveIntensity: 0.2 }));
  return m;
}

export function softbox(intensity, w, h, pos, target = [0, 0.6, 0], color = '#ffffff') {
  const l = new THREE.RectAreaLight(color, intensity, w, h);
  l.position.set(...pos);
  l.lookAt(...target);
  return l;
}

/* ─── Materials ─── */
export const M = {
  ceramic: (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.3, ...o }),
  glaze: (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.6, ...o }),
  matte: (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.62, ...o }),
  plastic: (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.38, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 1.4, ...o }),
  softTouch: (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.78, ...o }),
  metal: (c = '#c9ccd1', o = {}) => new THREE.MeshPhysicalMaterial({ color: c, metalness: 1, roughness: 0.22, envMapIntensity: 2.6, ...o }),
  brushed: (c = '#c7cacf', o = {}) => new THREE.MeshPhysicalMaterial({ color: c, metalness: 1, roughness: 0.38, anisotropy: 0.6, envMapIntensity: 2.6, ...o }),
  chrome: (o = {}) => new THREE.MeshPhysicalMaterial({ color: '#e8eaee', metalness: 1, roughness: 0.06, envMapIntensity: 2.8, ...o }),
  fabric: (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.95, sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color(c).lerp(new THREE.Color('#ffffff'), 0.35), ...o }),
  rubber: (c = '#1b1c1f', o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.85, ...o }),
  glass: (c = '#ffffff', o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.03, transmission: 1, ior: 1.5, thickness: 0.15, envMapIntensity: 2, ...o }),
  wood: (c = '#b58a5a', o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, clearcoat: 0.2, ...o }),
  paper: (c = '#f4f2ec', o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.9, ...o }),
  emissive: (c, i = 2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i }),
};

/** Canvas texture helper — labels, speckle, weave, kraft fibres. */
export function canvasTex(w, h, draw, { repeat, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

export function noiseTex(base, dots, { size = 512, count = 1800, r = [0.6, 1.8], repeat = [2, 2], alpha = 0.5 } = {}) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return canvasTex(size, size, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < count; i++) {
      ctx.globalAlpha = alpha * (0.3 + rnd() * 0.7);
      ctx.fillStyle = dots[Math.floor(rnd() * dots.length)];
      ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, r[0] + rnd() * (r[1] - r[0]), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, { repeat });
}

export function lathe(points, segs = 96) {
  return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segs);
}
export function tube(pts, r, segs = 64, rs = 20, closed = false) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed), segs, r, rs, closed);
}
export function rbox(w, h, d, r = 0.05, s = 6) { return new RoundedBoxGeometry(w, h, d, s, r); }
export function mesh(geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], scale) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos); m.rotation.set(...rot);
  if (scale) m.scale.set(...(Array.isArray(scale) ? scale : [scale, scale, scale]));
  return m;
}
export function group(...children) { const g = new THREE.Group(); children.flat().forEach((c) => c && g.add(c)); return g; }
