import { THREE, M, lathe, tube, rbox, mesh, group, canvasTex, noiseTex } from './studio.js';

/* Units ≈ decimetres. Every builder returns { object, view? } */

const C = (c) => new THREE.Color(c);
const hex = (c) => '#' + c.getHexString();
const darker = (c, t) => hex(C(c).lerp(C('#0a0b0d'), t));
const lighter = (c, t) => hex(C(c).lerp(C('#ffffff'), t));
const lum = (c) => { const k = C(c); return 0.2126 * k.r + 0.7152 * k.g + 0.0722 * k.b; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const reseed = (s) => { seed = s; };

/* ─── textures ─── */
function weave(base, { size = 256, step = 4, contrast = 0.12, repeat = [8, 8] } = {}) {
  return canvasTex(size, size, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
      const on = ((x / step + y / step) % 2) === 0;
      ctx.fillStyle = on ? `rgba(255,255,255,${contrast})` : `rgba(0,0,0,${contrast})`;
      ctx.fillRect(x, y, step, step / 2);
    }
  }, { repeat });
}
function bumpNoise({ size = 512, count = 6000, r = [0.6, 2.2], repeat = [4, 4], seedv = 3 } = {}) {
  reseed(seedv);
  return canvasTex(size, size, (ctx, w, h) => {
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < count; i++) {
      const v = Math.floor(90 + rnd() * 120);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, r[0] + rnd() * (r[1] - r[0]), 0, Math.PI * 2); ctx.fill();
    }
  }, { repeat, srgb: false });
}
function stripes(base, line, { size = 256, gap = 16, width = 2, repeat = [1, 1], vertical = false } = {}) {
  return canvasTex(size, size, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = line;
    for (let p = 0; p < (vertical ? w : h); p += gap) vertical ? ctx.fillRect(p, 0, width, h) : ctx.fillRect(0, p, w, width);
  }, { repeat });
}
function label(w, h, draw) { return canvasTex(w, h, draw); }
function symbolPath(ctx, x, y, s, fill) {
  // Ayiin aperture mark, 52×54 box scaled by s
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-6, -6);
  const p = new Path2D('M6 60V32A26 26 0 0 1 58 32V60Z M20 60A86.67 86.67 0 0 1 32 16A86.67 86.67 0 0 1 44 60Z');
  ctx.fillStyle = fill; ctx.fill(p, 'evenodd');
  ctx.fill(new Path2D('M21.9 42Q32 35.5 42.1 42Q32 48.5 21.9 42Z'));
  ctx.restore();
}

/* ─── geometry helpers ─── */
function ribbon(pathPts, w, t, r = 0.02, segs = 120) {
  const shape = new THREE.Shape();
  const x = w / 2, y = t / 2;
  shape.moveTo(-x + r, -y); shape.lineTo(x - r, -y); shape.quadraticCurveTo(x, -y, x, -y + r);
  shape.lineTo(x, y - r); shape.quadraticCurveTo(x, y, x - r, y); shape.lineTo(-x + r, y);
  shape.quadraticCurveTo(-x, y, -x, y - r); shape.lineTo(-x, -y + r); shape.quadraticCurveTo(-x, -y, -x + r, -y);
  const path = new THREE.CatmullRomCurve3(pathPts.map((p) => V(...p)));
  return new THREE.ExtrudeGeometry(shape, { steps: segs, extrudePath: path, bevelEnabled: false });
}
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slab(w, h, d, r, bevel = 0.01) {
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), { depth: d - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 16 });
  g.translate(0, 0, -(d - bevel * 2) / 2);
  return g;
}
function ellipsoid(rx, ry, rz, ws = 64, hs = 48) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(rx, ry, rz);
  return g;
}

/* ─── builders ─── */
export const BUILDERS = {
  /* Aurel ANC over-ear headphones */
  async headphones({ color, accent }) {
    const dark = lum(color) < 0.2;
    const shell = M.softTouch(color, { roughness: 0.55, clearcoat: 0.15 });
    const padMat = M.softTouch(darker(color, dark ? 0.1 : 0.18), { roughness: 0.72, sheen: 0.5, sheenRoughness: 0.7, sheenColor: C(lighter(color, 0.4)) });
    const meshFab = M.fabric(darker(color, 0.55), { map: weave(darker(color, 0.55), { contrast: 0.08, repeat: [10, 10] }) });
    const steel = M.brushed(dark ? '#8f949b' : '#c7cace', { roughness: 0.3 });
    const R = 1.05, top = 2.25;
    const arc = [];
    for (let i = 0; i <= 28; i++) { const a = Math.PI * (i / 28); arc.push([Math.cos(a) * R, top - (1 - Math.sin(a)) * 1.02, 0]); }
    const parts = [];
    parts.push(mesh(ribbon(arc, 0.34, 0.1, 0.045, 160), shell));
    const inner = arc.slice(3, 26).map(([x, y, z]) => [x * 0.9, y - 0.12, z]);
    parts.push(mesh(ribbon(inner, 0.3, 0.1, 0.05, 140), padMat));
    for (const s of [-1, 1]) {
      parts.push(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 24), steel, [s * R, 1.08, 0]));
      parts.push(mesh(ribbon([[s * (R + 0.02), 0.9, -0.34], [s * (R + 0.08), 0.95, 0], [s * (R + 0.02), 0.9, 0.34]], 0.06, 0.05, 0.02, 40), steel));
      // cup shell: rounded oval puck with axis on x
      const prof = [[0, 0.24], [0.34, 0.24], [0.44, 0.2], [0.5, 0.12], [0.52, 0.02], [0.5, -0.08], [0.46, -0.14], [0, -0.14]];
      const cup = mesh(lathe(prof, 96), shell, [s * (R + 0.04), 0.55, 0], [0, 0, (-s * Math.PI) / 2], [1, 1, 1.26]);
      parts.push(cup);
      // outer cap (brushed insert)
      parts.push(mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.02, 96), M.softTouch(lighter(color, dark ? 0.06 : 0), { roughness: 0.42 }), [s * (R + 0.29), 0.55, 0], [0, 0, Math.PI / 2], [1, 1, 1.26]));
      parts.push(mesh(new THREE.TorusGeometry(0.335, 0.012, 16, 96), M.metal(dark ? '#a1a5ab' : '#d8dadd', { roughness: 0.25 }), [s * (R + 0.3), 0.55, 0], [0, Math.PI / 2, 0], [1, 1.26, 1]));
      // ear cushion
      parts.push(mesh(new THREE.TorusGeometry(0.34, 0.13, 36, 96), padMat, [s * (R - 0.18), 0.55, 0], [0, Math.PI / 2, 0], [1, 1.26, 1]));
      parts.push(mesh(new THREE.CircleGeometry(0.28, 64), meshFab, [s * (R - 0.2), 0.55, 0], [0, (-s * Math.PI) / 2, 0], [1.26, 1, 1]));
    }
    parts.push(mesh(new THREE.SphereGeometry(0.02, 16, 16), M.emissive('#c8ff3d', 2.2), [R + 0.28, 0.2, 0.2]));
    parts.push(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 24), M.metal('#2a2c30'), [R + 0.3, 0.26, -0.22], [0, 0, Math.PI / 2]));
    const g = group(parts);
    g.rotation.y = -0.55;
    return { object: g, view: { hero: { fill: 0.7 }, detail: { az: 0.2, el: 0.12, fill: 2.4, target: [0.7, 0.6, 0.6] } } };
  },

  /* Aurel Buds Pro */
  async earbuds({ color }) {
    const gloss = M.glaze(color, { roughness: 0.22 });
    const tip = M.softTouch(darker(color, 0.12), { roughness: 0.6 });
    const caseBody = mesh(slab(0.64, 0.52, 0.28, 0.2, 0.06), gloss, [0, 0.26, 0]);
    const seam = mesh(new THREE.BoxGeometry(0.62, 0.006, 0.29), M.matte(darker(color, 0.35)), [0, 0.37, 0]);
    const led = mesh(new THREE.SphereGeometry(0.012, 16, 16), M.emissive('#c8ff3d', 2), [0, 0.3, 0.142]);
    const bud = (x, z, ry) => {
      const body = mesh(ellipsoid(0.12, 0.1, 0.1), gloss, [0, 0.12, 0]);
      const stem = mesh(new THREE.CapsuleGeometry(0.04, 0.24, 8, 24), gloss, [0.02, 0.0, 0.02], [0.2, 0, 0.15]);
      const t = mesh(lathe([[0, 0.07], [0.05, 0.065], [0.07, 0.03], [0.065, 0], [0, 0]], 48), tip, [-0.1, 0.16, 0], [0, 0, Math.PI / 2 + 0.3]);
      const grille = mesh(new THREE.CircleGeometry(0.03, 32), M.metal('#3a3c40', { roughness: 0.5 }), [0.08, 0.16, 0.07], [0, 0.8, 0]);
      const g = group(body, stem, t, grille);
      g.position.set(x, 0.16, z); g.rotation.y = ry;
      return g;
    };
    const g = group(caseBody, seam, led, bud(-0.52, 0.34, 0.4), bud(0.56, 0.3, 2.6));
    return { object: g, view: { detail: { target: [-0.4, 0.2, 0.3], fill: 2.6 } } };
  },

  /* Halo Speaker Mini */
  async speaker({ color, accent }) {
    const fabric = M.fabric(color, { map: weave(color, { contrast: 0.16, step: 3, repeat: [18, 12] }), bumpMap: weave('#808080', { contrast: 0.4, step: 3, repeat: [18, 12] }), bumpScale: 0.6 });
    const cap = M.softTouch(darker(color, 0.08), { roughness: 0.5 });
    const body = mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.55, 128, 1, true), fabric, [0, 0.9, 0]);
    const top = mesh(lathe([[0, 1.72], [0.5, 1.72], [0.6, 1.7], [0.63, 1.66], [0.63, 1.62], [0, 1.62]], 128), cap);
    const bottom = mesh(lathe([[0, 0.12], [0.62, 0.12], [0.63, 0.14], [0.62, 0.18], [0, 0.18]], 128), cap);
    const foot = mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.12, 96), M.rubber('#26282c'), [0, 0.06, 0]);
    const btn = (x, sym) => mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 48), M.softTouch(darker(color, 0.2), { roughness: 0.45 }), [x, 1.73, 0.1]);
    const loop = mesh(new THREE.TorusGeometry(0.16, 0.025, 16, 64, Math.PI), M.softTouch(accent), [0.63, 1.4, 0], [0, Math.PI / 2, -Math.PI / 2]);
    const g = group(body, top, bottom, foot, btn(-0.16), btn(0.16), mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 48), M.softTouch(accent), [0, 1.732, -0.12]), loop);
    return { object: g, view: { detail: { target: [0, 1.5, 0.3], fill: 2.2, el: 0.35 } } };
  },

  /* Kova Book 14 Air */
  async laptop({ color }) {
    const alu = M.brushed(color, { roughness: 0.34 });
    const W = 3.1, D = 2.15;
    const base = mesh(slab(W, D, 0.14, 0.12, 0.03), alu, [0, 0.07, 0], [-Math.PI / 2, 0, 0]);
    const deckTex = label(1024, 710, (ctx, w, h) => {
      ctx.fillStyle = hex(C(color)); ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1b1c1f';
      const kw = 58, gap = 8, ox = 80, oy = 60;
      for (let r = 0; r < 6; r++) for (let k = 0; k < 13; k++) {
        const wd = r === 5 && k === 5 ? kw * 5 + gap * 4 : kw;
        if (r === 5 && k > 5 && k < 10) continue;
        ctx.beginPath(); ctx.roundRect(ox + k * (kw + gap), oy + r * (kw * 0.78 + gap), wd, kw * 0.78, 8); ctx.fill();
      }
      ctx.fillStyle = hex(C(color).lerp(C('#000'), 0.08));
      ctx.beginPath(); ctx.roundRect(w / 2 - 190, 470, 380, 210, 16); ctx.fill();
    });
    const deck = mesh(new THREE.PlaneGeometry(W - 0.2, D - 0.2), M.matte('#ffffff', { map: deckTex, roughness: 0.4, metalness: 0.3 }), [0, 0.141, 0], [-Math.PI / 2, 0, 0]);
    const screenTex = label(1400, 900, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#2b35d9'); g.addColorStop(0.55, '#8b94ff'); g.addColorStop(1, '#c8ff3d');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(10,11,13,0.45)'; ctx.fillRect(0, 0, w, 44);
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '500 26px Helvetica'; ctx.fillText('9:41', w - 110, 30);
      ctx.fillStyle = 'rgba(247,247,242,0.92)'; ctx.beginPath(); ctx.roundRect(120, 160, 540, 360, 24); ctx.fill();
      ctx.fillStyle = '#0a0b0d'; ctx.font = '600 48px Helvetica'; ctx.fillText('Good morning', 170, 250);
      ctx.fillStyle = '#62666e'; ctx.font = '28px Helvetica'; ctx.fillText('3 approvals · 2 deliveries today', 170, 300);
      symbolPath(ctx, 1040, 560, 4.6, 'rgba(10,11,13,0.85)');
    });
    const lid = group(
      mesh(slab(W, D - 0.05, 0.08, 0.12, 0.02), alu, [0, 0, -0.04], [0, 0, 0]),
      mesh(new THREE.PlaneGeometry(W - 0.06, D - 0.1), M.glaze('#0c0d10', { roughness: 0.1 }), [0, 0, 0.001]),
      mesh(new THREE.PlaneGeometry(W - 0.28, D - 0.36), new THREE.MeshStandardMaterial({ map: screenTex, emissive: '#ffffff', emissiveMap: screenTex, emissiveIntensity: 0.9, roughness: 0.15 }), [0, 0.05, 0.003]),
    );
    lid.position.set(0, 0.14, -D / 2 + 0.02);
    lid.rotation.x = -0.32;
    lid.children.forEach((c) => (c.position.y += (D - 0.05) / 2));
    const g = group(base, deck, lid);
    g.rotation.y = -0.45;
    return { object: g, view: { hero: { el: 0.22, fill: 0.95 }, angle: { fill: 0.9 }, detail: { target: [0.3, 0.2, 0.4], fill: 2.2, el: 0.45 } } };
  },

  /* Kova Keys low-profile keyboard */
  async keyboard({ color, accent }) {
    const dark = lum(color) < 0.2;
    const shell = M.brushed(color, { roughness: 0.4, metalness: dark ? 0.6 : 0.3 });
    const keyMat = M.softTouch(dark ? '#2b2e33' : lighter(color, 0.3), { roughness: 0.5 });
    const W = 3.6, D = 1.25;
    const base = mesh(slab(W, D, 0.14, 0.08, 0.025), shell, [0, 0.07, 0], [-Math.PI / 2, 0, 0]);
    const keys = [];
    const kw = 0.2, gap = 0.035;
    const rows = [14, 14, 13, 12, 9];
    for (let r = 0; r < 5; r++) {
      let x = -W / 2 + 0.16;
      const n = rows[r];
      for (let k = 0; k < n; k++) {
        let w = kw;
        if (r === 4 && k === 4) w = kw * 6 + gap * 5;
        if (r === 2 && k === n - 1) w = kw * 1.8;
        if (r === 3 && (k === 0 || k === n - 1)) w = kw * 2.2;
        keys.push(mesh(rbox(w, 0.07, kw, 0.03, 3), keyMat, [x + w / 2, 0.17, -D / 2 + 0.18 + r * (kw + gap)]));
        x += w + gap;
      }
    }
    const ledBar = mesh(new THREE.BoxGeometry(0.16, 0.012, 0.03), M.emissive('#c8ff3d', 1.4), [W / 2 - 0.3, 0.143, -D / 2 + 0.08]);
    const g = group(base, keys, ledBar);
    g.rotation.x = 0.06;
    g.rotation.y = -0.35;
    return { object: g, view: { hero: { el: 0.62, fill: 0.84 }, angle: { el: 0.55, fill: 0.84 }, scene: { el: 0.5, fill: 0.78 }, detail: { target: [0.6, 0.15, 0.2], fill: 2.6, el: 0.5 } } };
  },

  /* Kova Vista 27" monitor */
  async monitor({ color }) {
    const alu = M.brushed(color, { roughness: 0.3 });
    const W = 6.1, H = 3.5;
    const scr = label(1600, 920, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, h, w, 0);
      g.addColorStop(0, '#1d2340'); g.addColorStop(0.45, '#4652f0'); g.addColorStop(0.8, '#aab1ff'); g.addColorStop(1, '#d9ff7a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      symbolPath(ctx, w / 2 - 150, h / 2 - 160, 5.8, 'rgba(247,247,242,0.95)');
    });
    const panel = group(
      mesh(slab(W, H, 0.12, 0.06, 0.02), alu, [0, 0, -0.06]),
      mesh(new THREE.PlaneGeometry(W - 0.05, H - 0.05), M.glaze('#0b0c0f', { roughness: 0.08 }), [0, 0, 0.001]),
      mesh(new THREE.PlaneGeometry(W - 0.16, H - 0.34), new THREE.MeshStandardMaterial({ map: scr, emissive: '#ffffff', emissiveMap: scr, emissiveIntensity: 0.85, roughness: 0.2 }), [0, 0.1, 0.002]),
      mesh(new THREE.BoxGeometry(W - 0.05, 0.22, 0.02), M.brushed(color, { roughness: 0.28 }), [0, -H / 2 + 0.12, 0.004]),
    );
    panel.position.set(0, 2.95, 0);
    const neck = mesh(slab(0.5, 2.2, 0.16, 0.06, 0.02), alu, [0, 1.35, -0.3], [-0.08, 0, 0]);
    const foot = mesh(slab(2.1, 1.4, 0.08, 0.5, 0.02), alu, [0, 0.04, -0.3], [-Math.PI / 2, 0, 0]);
    const g = group(panel, neck, foot);
    g.rotation.y = -0.38;
    return { object: g, view: { detail: { target: [1.6, 1.4, 0.2], fill: 2.4 } } };
  },

  /* Kova One phone */
  async phone({ color, accent }) {
    const frame = M.metal(color, { roughness: 0.28 });
    const back = M.softTouch(color, { roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.4 });
    const W = 0.72, H = 1.48, T = 0.08;
    const scr = label(720, 1480, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#2b35d9'); g.addColorStop(0.6, '#8b94ff'); g.addColorStop(1, '#c8ff3d');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff'; ctx.font = '200 180px Helvetica'; ctx.textAlign = 'center'; ctx.fillText('9:41', w / 2, 360);
      ctx.font = '400 40px Helvetica'; ctx.fillText('Friday, September 25', w / 2, 180);
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.roundRect(60, h - 300, w - 120, 150, 36); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(w / 2 - 90, 36, 180, 48, 24); ctx.fill();
    });
    const front = group(
      mesh(slab(W, H, T, 0.12, 0.02), frame),
      mesh(new THREE.PlaneGeometry(W - 0.03, H - 0.03), M.glaze('#08090b', { roughness: 0.05 }), [0, 0, T / 2 + 0.001]),
      mesh(new THREE.PlaneGeometry(W - 0.07, H - 0.07), new THREE.MeshStandardMaterial({ map: scr, emissive: '#ffffff', emissiveMap: scr, emissiveIntensity: 0.9, roughness: 0.1 }), [0, 0, T / 2 + 0.002]),
    );
    front.position.set(0.28, H / 2, 0.18);
    front.rotation.set(-0.02, -0.28, 0);
    const bump = group(
      mesh(slab(0.32, 0.32, 0.03, 0.09, 0.01), M.glaze(darker(color, 0.1), { roughness: 0.2 }), [0, 0, 0.015]),
      mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 48), M.glaze('#0c0d10', { roughness: 0.05 }), [-0.06, 0.06, 0.035], [Math.PI / 2, 0, 0]),
      mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 48), M.glaze('#0c0d10', { roughness: 0.05 }), [0.06, -0.06, 0.035], [Math.PI / 2, 0, 0]),
      mesh(new THREE.TorusGeometry(0.075, 0.008, 12, 48), M.metal(color), [-0.06, 0.06, 0.05]),
      mesh(new THREE.TorusGeometry(0.075, 0.008, 12, 48), M.metal(color), [0.06, -0.06, 0.05]),
    );
    bump.position.set(-0.15, 0.5, -T / 2);
    bump.rotation.y = Math.PI;
    const rear = group(mesh(slab(W, H, T, 0.12, 0.02), frame), mesh(new THREE.PlaneGeometry(W - 0.03, H - 0.03), back, [0, 0, -T / 2 - 0.001], [0, Math.PI, 0]), bump);
    rear.position.set(-0.42, H / 2, -0.25);
    rear.rotation.set(0.0, Math.PI + 0.35, 0);
    return { object: group(front, rear), view: { hero: { el: 0.12 }, detail: { target: [0.3, 1.1, 0.2], fill: 2.2 } } };
  },

  /* Arc table lamp */
  async lamp({ color }) {
    reseed(5);
    const stone = noiseTex(color, [darker(color, 0.15), lighter(color, 0.25), darker(color, 0.3)], { size: 512, count: 5000, r: [0.4, 2.4], repeat: [2, 1], alpha: 0.45 });
    const base = mesh(lathe([[0, 0], [0.62, 0], [0.64, 0.03], [0.6, 0.2], [0.42, 0.42], [0.14, 0.52], [0, 0.53]], 128), M.ceramic('#ffffff', { map: stone, roughness: 0.55, clearcoat: 0.2 }));
    const stem = mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.6, 32), M.metal('#c8b489', { roughness: 0.25 }), [0, 1.8, 0]);
    const shadeMat = M.fabric('#f1ebdf', { side: THREE.DoubleSide, map: weave('#f1ebdf', { contrast: 0.05, step: 2, repeat: [30, 10] }), emissive: '#ffe7b8', emissiveIntensity: 0.35 });
    const shade = mesh(lathe([[1.05, 2.2], [0.62, 3.25], [0.61, 3.26]], 128), shadeMat);
    shade.userData.noShadow = true;
    const bulbGlow = mesh(new THREE.SphereGeometry(0.16, 32, 32), M.emissive('#ffd9a0', 3), [0, 2.55, 0]);
    const warm = new THREE.PointLight('#ffcf8a', 3.2, 6, 1.6);
    warm.position.set(0, 2.45, 0);
    const g = group(base, stem, shade, bulbGlow, warm);
    return { object: g, view: { detail: { target: [0.3, 0.35, 0.3], fill: 2.4, el: 0.28 } } };
  },

  /* Loom lounge chair */
  async chair({ color, accent }) {
    const boucle = M.fabric(color, { bumpMap: bumpNoise({ count: 9000, r: [0.8, 2.2], repeat: [6, 6] }), bumpScale: 3, roughness: 1, sheen: 0.8 });
    const oak = M.wood('#b98c5c', { map: stripes('#b98c5c', 'rgba(120,80,45,0.35)', { gap: 9, width: 3, repeat: [1, 4], vertical: false }) });
    const seat = mesh(rbox(6.6, 1.3, 5.6, 0.55, 8), boucle, [0, 2.35, 0.4]);
    const back = mesh(rbox(6.4, 4.0, 1.5, 0.7, 8), boucle, [0, 4.3, -2.1], [-0.16, 0, 0]);
    const armL = mesh(rbox(1.3, 3.1, 6.2, 0.6, 8), boucle, [-3.55, 2.9, 0.1]);
    const armR = mesh(rbox(1.3, 3.1, 6.2, 0.6, 8), boucle, [3.55, 2.9, 0.1]);
    const legs = [];
    for (const [x, z] of [[-3.6, 2.6], [3.6, 2.6], [-3.6, -2.4], [3.6, -2.4]]) legs.push(mesh(new THREE.CylinderGeometry(0.22, 0.15, 1.5, 32), oak, [x, 0.75, z], [z > 0 ? 0.12 : -0.12, 0, x > 0 ? -0.1 : 0.1]));
    const rail = mesh(rbox(7.6, 0.28, 0.3, 0.1), oak, [0, 1.45, 2.7]);
    const rail2 = mesh(rbox(7.6, 0.28, 0.3, 0.1), oak, [0, 1.45, -2.5]);
    const g = group(seat, back, armL, armR, legs, rail, rail2);
    g.rotation.y = -0.5;
    return { object: g, view: { detail: { target: [2.2, 3.0, 2.0], fill: 2.5, aperture: 0.01 } } };
  },

  /* Ergo task chair */
  async taskchair({ color, accent }) {
    const dark = lum(color) < 0.3;
    const plastic = M.plastic(dark ? '#1f2125' : '#d9dbd8', { roughness: 0.5 });
    const meshTex = canvasTex(256, 256, (ctx, w, h) => { ctx.fillStyle = dark ? '#6a6f79' : '#e2e4e0'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = dark ? '#1c1e22' : '#9a9e9b'; ctx.lineWidth = 2.2; for (let i = -w; i < w * 2; i += 16) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, h); ctx.lineTo(i + h, 0); ctx.stroke(); } }, { repeat: [4, 5] });
    const meshMat = M.fabric('#ffffff', { map: meshTex, roughness: 0.85, sheen: 0.4 });
    const chrome = M.chrome();
    const parts = [];
    // base
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leg = mesh(rbox(2.9, 0.22, 0.34, 0.1), plastic, [Math.cos(a) * 1.45, 0.55, Math.sin(a) * 1.45], [0, -a, -0.08]);
      parts.push(leg);
      for (const o of [-0.09, 0.09]) parts.push(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 32), M.rubber('#141517', { roughness: 0.5 }), [Math.cos(a) * 2.75 + Math.cos(a + Math.PI / 2) * o, 0.24, Math.sin(a) * 2.75 + Math.sin(a + Math.PI / 2) * o], [Math.PI / 2, 0, -a + Math.PI / 2]));
      parts.push(mesh(rbox(0.2, 0.3, 0.2, 0.06), plastic, [Math.cos(a) * 2.75, 0.48, Math.sin(a) * 2.75]));
    }
    parts.push(mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 32), plastic, [0, 0.65, 0]));
    parts.push(mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.2, 32), chrome, [0, 1.8, 0]));
    parts.push(mesh(rbox(1.8, 0.4, 1.8, 0.1), plastic, [0, 2.95, 0]));
    // seat
    parts.push(mesh(rbox(4.6, 0.7, 4.4, 0.32, 6), M.fabric(dark ? lighter(color, 0.1) : color, { roughness: 1 }), [0, 3.45, 0.2]));
    // back: frame + mesh
    const back = group(
      mesh(rbox(4.2, 5.0, 0.26, 0.5, 6), plastic),
      mesh(rbox(3.8, 4.6, 0.12, 0.45, 6), meshMat, [0, 0, 0.1]),
      mesh(rbox(2.8, 0.22, 0.14, 0.1, 4), M.softTouch(accent), [0, -1.25, 0.16]),
    );
    back.position.set(0, 6.6, -2.2);
    back.rotation.x = -0.12;
    parts.push(back);
    parts.push(mesh(rbox(0.5, 3.4, 0.36, 0.15), plastic, [0, 4.6, -2.25], [-0.2, 0, 0]));
    for (const s of [-1, 1]) {
      parts.push(mesh(rbox(0.3, 1.5, 0.4, 0.1), plastic, [s * 2.3, 4.3, 0.1]));
      parts.push(mesh(rbox(0.7, 0.24, 2.2, 0.1), M.softTouch('#1a1b1e'), [s * 2.3, 5.1, 0.2]));
    }
    const g = group(parts);
    g.rotation.y = -0.55;
    return { object: g, view: { detail: { target: [0, 6.3, -1.9], fill: 2.2, az: -0.4 } } };
  },

  /* Stoneware bud vase trio */
  async vase({ color }) {
    reseed(9);
    const speck = noiseTex(color, [darker(color, 0.55), darker(color, 0.3), lighter(color, 0.4)], { count: 3200, r: [0.4, 1.3], repeat: [3, 2], alpha: 0.6 });
    const mat = M.ceramic('#ffffff', { map: speck, roughness: 0.32 });
    const v1 = mesh(lathe([[0, 0.02], [0.3, 0], [0.42, 0.25], [0.44, 0.55], [0.3, 0.9], [0.13, 1.08], [0.11, 1.35], [0.14, 1.4], [0.09, 1.4], [0.08, 1.2], [0, 1.2]]), mat, [-0.95, 0, 0.2]);
    const v2 = mesh(lathe([[0, 0.02], [0.36, 0], [0.5, 0.4], [0.52, 1.0], [0.36, 1.55], [0.16, 1.85], [0.14, 2.2], [0.18, 2.26], [0.11, 2.26], [0.1, 2.0], [0, 2.0]]), mat, [0, 0, -0.2]);
    const v3 = mesh(lathe([[0, 0.02], [0.28, 0], [0.36, 0.18], [0.35, 0.42], [0.2, 0.62], [0.1, 0.8], [0.13, 0.85], [0.08, 0.85], [0, 0.7]]), mat, [0.9, 0, 0.3]);
    const stem = mesh(tube([[0, 2.0, -0.2], [0.05, 2.6, -0.2], [0.2, 3.3, -0.25], [0.35, 3.8, -0.3]], 0.012, 64, 8), M.matte('#6f7d52'));
    const bloom = mesh(ellipsoid(0.14, 0.2, 0.14), M.fabric('#e9d7ad'), [0.36, 3.85, -0.3]);
    const stem2 = mesh(tube([[-0.95, 1.2, 0.2], [-1.0, 1.6, 0.2], [-1.15, 2.1, 0.25]], 0.01, 40, 8), M.matte('#6f7d52'));
    const bloom2 = mesh(ellipsoid(0.1, 0.13, 0.1), M.fabric('#c8ff3d', { roughness: 0.8 }), [-1.16, 2.16, 0.25]);
    return { object: group(v1, v2, v3, stem, bloom, stem2, bloom2), view: { detail: { target: [0, 1.0, 0.3], fill: 2.2 } } };
  },

  /* Ember soy candle */
  async candle({ color, accent }) {
    const glass = M.glass(color, { roughness: 0.08, thickness: 0.4, attenuationColor: C(color), attenuationDistance: 0.6, ior: 1.52 });
    const tumbler = mesh(lathe([[0, 0], [0.78, 0], [0.8, 0.04], [0.8, 1.6], [0.76, 1.6], [0.74, 0.1], [0, 0.1]], 128), glass);
    const wax = mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.18, 96), M.matte(accent, { roughness: 0.7 }), [0, 0.7, 0]);
    const lbl = label(1024, 300, (ctx, w, h) => {
      ctx.fillStyle = '#f6f2e9'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0a0b0d'; ctx.textAlign = 'center';
      ctx.font = '500 38px Helvetica'; ctx.fillText('K I N D R E D', w * 0.25, 110);
      ctx.font = '300 58px Georgia'; ctx.fillText('Fig & Cedar', w * 0.25, 190);
      ctx.font = '24px Helvetica'; ctx.fillText('SOY · 300 G · 60 H', w * 0.25, 245);
    });
    lbl.wrapS = THREE.RepeatWrapping;
    const band = mesh(new THREE.CylinderGeometry(0.805, 0.805, 0.62, 96, 1, true, -0.9, 1.8), M.paper('#ffffff', { map: lbl, roughness: 0.8 }), [0, 0.7, 0]);
    const wick = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), M.matte('#2a241f'), [0, 1.36, 0]);
    const flame = mesh(lathe([[0, 0], [0.04, 0.03], [0.05, 0.08], [0.03, 0.16], [0, 0.22]], 32), M.emissive('#ffb14a', 4), [0, 1.42, 0]);
    flame.userData.noShadow = true;
    const glow = new THREE.PointLight('#ffb866', 1.4, 3, 2);
    glow.position.set(0, 1.55, 0);
    return { object: group(tumbler, wax, band, wick, flame, glow), view: { detail: { target: [0, 1.25, 0.3], fill: 3, el: 0.35 } } };
  },

  /* Olive tree in terracotta */
  async plant({ color, accent }) {
    reseed(21);
    const terra = noiseTex(color, [darker(color, 0.2), lighter(color, 0.15)], { count: 5000, r: [0.4, 1.4], alpha: 0.35 });
    const pot = mesh(lathe([[0, 0.02], [0.72, 0], [0.8, 1.2], [0.92, 1.25], [0.92, 1.45], [0.84, 1.45], [0.8, 1.3], [0, 1.3]], 128), M.matte('#ffffff', { map: terra, roughness: 0.85 }));
    const soil = mesh(new THREE.CircleGeometry(0.8, 64), M.matte('#3b2d22', { roughness: 1 }), [0, 1.38, 0], [-Math.PI / 2, 0, 0]);
    const bark = M.wood('#6b563f', { roughness: 0.85 });
    const trunk = mesh(tube([[0, 1.3, 0], [0.05, 2.2, 0.02], [-0.06, 3.1, 0], [0.04, 3.9, -0.05]], 0.07, 64, 12), bark);
    const branches = [
      [[0.0, 3.0, 0], [0.5, 3.6, 0.2], [0.9, 4.1, 0.2]],
      [[0, 3.3, 0], [-0.6, 3.9, -0.1], [-1.0, 4.3, 0.1]],
      [[0.03, 3.8, -0.04], [0.2, 4.4, -0.3], [0.3, 4.9, -0.2]],
      [[0.02, 3.6, 0], [-0.2, 4.3, 0.4], [-0.3, 4.8, 0.5]],
    ].map((b) => mesh(tube(b, 0.03, 40, 8), bark));
    const leafGeo = ellipsoid(0.03, 0.22, 0.012, 12, 8);
    const greens = ['#7d9164', '#98a982', '#6a7d55', '#8a9a74'].map((c) => M.matte(c, { roughness: 0.55, side: THREE.DoubleSide, sheen: 0.4, sheenColor: C('#c8d4b8') }));
    const leaves = [];
    for (let i = 0; i < 520; i++) {
      const a = rnd() * Math.PI * 2, e = rnd();
      const r = 0.2 + Math.sqrt(rnd()) * 1.15;
      const p = [Math.cos(a) * r, 3.6 + e * 1.6 - r * 0.25, Math.sin(a) * r * 0.9];
      const lf = mesh(leafGeo, greens[i % 4], p, [rnd() * 3, rnd() * 3, rnd() * 3]);
      leaves.push(lf);
    }
    return { object: group(pot, soil, trunk, branches, leaves), view: { detail: { target: [0.4, 4.2, 0.6], fill: 2.6 } } };
  },

  /* Pour gooseneck kettle */
  async kettle({ color, accent }) {
    const dark = lum(color) < 0.2;
    const body = dark ? M.softTouch(color, { roughness: 0.52, metalness: 0.3 }) : lum(color) > 0.7 && color !== '#c9ccd0' ? M.glaze(color, { roughness: 0.35 }) : M.brushed(color, { roughness: 0.28 });
    const trim = lum(accent) < 0.2 ? M.softTouch(accent, { roughness: 0.5 }) : M.wood(accent, { roughness: 0.4 });
    const shell = mesh(lathe([[0, 0.12], [0.86, 0.12], [0.92, 0.2], [0.94, 0.5], [0.9, 1.1], [0.72, 1.55], [0.4, 1.7], [0, 1.72]], 128), body, [0, 0.12, 0]);
    const lid = mesh(lathe([[0, 1.86], [0.34, 1.84], [0.4, 1.78], [0.4, 1.72]], 64), body, [0, 0.12, 0]);
    const knob = mesh(ellipsoid(0.1, 0.07, 0.1), trim, [0, 2.02, 0]);
    const spout = mesh(tube([[-0.84, 0.55, 0], [-1.25, 0.7, 0], [-1.5, 1.2, 0], [-1.55, 1.75, 0], [-1.62, 1.95, 0], [-1.78, 1.98, 0]], 0.055, 96, 20), body);
    const handle = mesh(ribbon([[0.62, 1.5, 0], [1.2, 1.55, 0], [1.42, 1.1, 0], [1.25, 0.55, 0], [0.9, 0.4, 0]], 0.16, 0.12, 0.05, 80), trim);
    const plate = mesh(new THREE.CylinderGeometry(1.02, 1.05, 0.14, 96), M.softTouch('#1d1f23', { roughness: 0.45 }), [0, 0.07, 0]);
    const lcd = mesh(new THREE.PlaneGeometry(0.34, 0.07), M.emissive('#c8ff3d', 1.2), [0, 0.07, 1.041]);
    const g = group(plate, shell, lid, knob, spout, handle, lcd);
    g.rotation.y = 0.35;
    return { object: g, view: { detail: { target: [-1.3, 1.6, 0.3], fill: 2.6, az: -0.6 } } };
  },

  /* Everyday stoneware mugs */
  async mug({ color }) {
    const mugGeo = () => lathe([[0, 0.02], [0.54, 0], [0.605, 0.025], [0.62, 0.1], [0.632, 1.17], [0.616, 1.2], [0.577, 1.2], [0.565, 1.15], [0.561, 0.16], [0.49, 0.11], [0, 0.11]]);
    const one = (x, z, ry, s) => {
      reseed(s);
      const speck = noiseTex(color, [darker(color, 0.55), darker(color, 0.35), lighter(color, 0.4)], { count: 2600, r: [0.5, 1.4], repeat: [3, 2], alpha: 0.55 });
      const mat = M.ceramic('#ffffff', { map: speck });
      const g = group(mesh(mugGeo(), mat), mesh(tube([[0.6, 0.98, 0], [0.92, 0.96, 0], [1.01, 0.64, 0], [0.9, 0.32, 0], [0.6, 0.28, 0]], 0.07, 64, 24), mat));
      g.position.set(x, 0, z); g.rotation.y = ry;
      return g;
    };
    return { object: group(one(-0.5, 0.35, -0.6, 3), one(0.75, -0.55, -0.95, 4)), view: { detail: { target: [-0.3, 1.0, 0.8], fill: 3 } } };
  },

  /* Oro coffee bag — stand-up pouch */
  async coffeebag({ color, accent }) {
    const geo = new THREE.BoxGeometry(1.5, 2.3, 0.7, 24, 36, 12);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const ty = (y + 1.15) / 2.3; // 0 bottom → 1 top
      const pinch = ty > 0.78 ? 1 - Math.min(1, (ty - 0.78) / 0.12) : 1;
      const bulge = Math.sin(Math.PI * Math.min(1, ty * 1.1)) * 0.25 + 0.75;
      p.setZ(i, z * pinch * bulge * (1 - Math.pow(Math.abs(x) / 0.75, 6) * 0.35));
      p.setX(i, x * (1 + (ty < 0.1 ? (0.1 - ty) * 0.6 : 0)));
    }
    geo.computeVertexNormals();
    reseed(12);
    const tex = label(1024, 1600, (ctx, w, h) => {
      ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { ctx.fillStyle = `rgba(90,60,30,${rnd() * 0.12})`; ctx.fillRect(rnd() * w, rnd() * h, 2, 1); }
      ctx.fillStyle = '#f7f6f1'; ctx.fillRect(170, 520, 684, 760);
      ctx.fillStyle = '#0a0b0d'; ctx.textAlign = 'center';
      ctx.font = '600 44px Helvetica'; ctx.fillText('O R O', w / 2, 610);
      ctx.font = '26px Helvetica'; ctx.fillText('COFFEE ROASTERS · OAKLAND', w / 2, 650);
      symbolPath(ctx, w / 2 - 70, 700, 2.7, '#0a0b0d');
      ctx.font = '300 74px Georgia'; ctx.fillText('Ethiopia', w / 2, 960);
      ctx.fillText('Guji', w / 2, 1040);
      ctx.font = '26px Helvetica'; ctx.fillText('WASHED · BERGAMOT · PEACH', w / 2, 1110);
      ctx.fillRect(330, 1150, 364, 2);
      ctx.font = '600 30px Helvetica'; ctx.fillText('1 KG · WHOLE BEAN', w / 2, 1210);
    });
    const kraft = M.paper('#ffffff', { map: tex, roughness: 0.75, bumpMap: bumpNoise({ count: 4000, r: [0.4, 1.2], repeat: [2, 3] }), bumpScale: 0.4 });
    const bag = mesh(geo, kraft, [0, 1.15, 0]);
    const seal = mesh(new THREE.BoxGeometry(1.52, 0.2, 0.08), M.paper(darker(color, 0.1), { roughness: 0.8 }), [0, 2.2, 0]);
    const valve = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 32), M.plastic('#f2f0ea'), [0.45, 1.75, 0.25], [Math.PI / 2 - 0.15, 0, 0]);
    const g = group(bag, seal, valve);
    g.rotation.y = -0.35;
    return { object: g, view: { detail: { target: [0, 1.1, 0.4], fill: 2.3 } } };
  },

  /* Stride Runner 2 — sneaker (lofted upper, collar opening, laces) */
  async sneaker({ color, accent }) {
    const Lx = 2.9;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const halfW = (u) => { const toe = Math.sqrt(Math.min(1, u / 0.16)); const heel = 1 - 0.28 * sm(0.86, 1, u); return (0.37 + 0.09 * Math.sin(Math.PI * Math.min(1, u * 1.25))) * toe * heel; };
    const dropAt = (u) => 0.85 + 0.45 * u; // midsole thicker at the heel
    const soleTopAt = (u) => 0.06 + 0.26 * dropAt(u) - 0.03;
    const height = (u) => { const toe = Math.sqrt(Math.min(1, u / 0.1)); return (0.3 + 0.26 * sm(0.18, 0.6, u) + 0.26 * sm(0.55, 0.85, u) - 0.06 * sm(0.9, 1, u)) * toe; };
    const xAt = (u) => -Lx / 2 + u * Lx;
    const soleTop = 0;
    const inOpening = (u, v) => { const du = (u - 0.84) / 0.15, dv = (v - Math.PI / 2) / 0.9; return du * du + dv * dv < 1; };
    const spring = (x) => { const u = (x + Lx / 2) / Lx; return 0.22 * Math.pow(Math.max(0, (0.22 - u) / 0.22), 2) + 0.04 * Math.pow(Math.max(0, (u - 0.9) / 0.1), 2); };
    const bend = (geo, thick = false) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), u = Math.min(1, Math.max(0, (x + Lx / 2) / Lx)); let y = p.getY(i); if (thick) y = 0.06 + (y - 0.06) * dropAt(u); p.setY(i, y + spring(x)); } p.needsUpdate = true; geo.computeVertexNormals(); return geo; };
    const NU = 120, NV = 72;
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= NU; i++) {
      const u = i / NU;
      for (let j = 0; j <= NV; j++) {
        const v = (j / NV) * Math.PI;
        let h = height(u);
        // vamp dips toward the opening
        const x = xAt(u), y = soleTopAt(u) + h * Math.sin(v) * (1 - 0.06 * Math.cos(v * 2)), z = halfW(u) * Math.cos(v) * (0.9 + 0.1 * Math.sin(v));
        pos.push(x, y, z); uv.push(u, j / NV);
      }
    }
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
      const u = (i + 0.5) / NU, v = ((j + 0.5) / NV) * Math.PI;
      if (inOpening(u, v)) continue;
      const a = i * (NV + 1) + j, b = a + NV + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g0 = new THREE.BufferGeometry();
    g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g0.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g0.setIndex(idx);
    bend(g0);
    const knit = canvasTex(512, 256, (ctx, w, h) => { ctx.fillStyle = color; ctx.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 5) for (let x = 0; x < w; x += 5) { ctx.fillStyle = (x + y) % 10 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.ellipse(x + 2.5, y + 2.5, 2.2, 1.3, 0.7, 0, Math.PI * 2); ctx.fill(); } }, { repeat: [6, 3] });
    const upperMat = M.fabric(color, { map: knit, roughness: 0.9, sheen: 0.7, side: THREE.FrontSide });
    const upper = mesh(g0, upperMat);
    const lining = mesh(g0, M.fabric(lum(color) > 0.5 ? '#3a3d42' : '#15161a', { side: THREE.BackSide }));
    // heel counter + toe cap overlays
    const overlay = M.softTouch(lum(color) > 0.6 ? '#e9e8e2' : darker(color, 0.2), { roughness: 0.5 });
    // collar padding around opening edge
    const edge = [];
    for (let k = 0; k <= 64; k++) {
      const t = (k / 64) * Math.PI * 2;
      const u = Math.min(1, 0.84 + Math.cos(t) * 0.15), v = Math.PI / 2 + Math.sin(t) * 0.9;
      const h = height(u), x = xAt(u);
      edge.push([x, soleTopAt(u) + h * Math.sin(v) * (1 - 0.06 * Math.cos(v * 2)) + spring(x), halfW(u) * Math.cos(v) * (0.9 + 0.1 * Math.sin(v))]);
    }
    const collar = mesh(tube(edge, 0.07, 128, 16, true), M.softTouch(lum(color) > 0.6 ? '#dcdad3' : darker(color, 0.15), { roughness: 0.75 }));
    // sole
    const foot = new THREE.Shape();
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const x = xAt(u), w = halfW(u) * 1.12 + 0.03;
      i ? foot.lineTo(x, w) : foot.moveTo(x, w);
    }
    for (let i = 80; i >= 0; i--) { const u = i / 80; foot.lineTo(xAt(u), -(halfW(u) * 1.12 + 0.03)); }
    const midGeo = new THREE.ExtrudeGeometry(foot, { depth: 0.14, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.06, bevelSegments: 5, curveSegments: 24 });
    midGeo.rotateX(Math.PI / 2); midGeo.translate(0, 0.26, 0); bend(midGeo, true);
    const midsole = mesh(midGeo, M.matte('#f5f4ef', { roughness: 0.62 }));
    const outGeo = new THREE.ExtrudeGeometry(foot, { depth: 0.05, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.02, bevelSegments: 2 });
    outGeo.rotateX(Math.PI / 2); outGeo.translate(0, 0.07, 0); bend(outGeo);
    const outsole = mesh(outGeo, M.rubber(accent === '#f1f0ea' ? '#cfcabd' : accent, { roughness: 0.7 }));
    // tongue & laces over the vamp
    const top = (u) => soleTopAt(u) + height(u) + spring(xAt(u));
    const tongue = mesh(ribbon([[xAt(0.5), top(0.5) - 0.01, 0], [xAt(0.62), top(0.62) + 0.03, 0], [xAt(0.72), top(0.72) + 0.16, 0]], 0.44, 0.07, 0.03, 30), M.fabric(lighter(color, 0.04)));
    const laceMat = M.fabric(lum(color) > 0.6 ? '#fbfaf6' : '#1c1e22', { roughness: 0.8 });
    const laces = [];
    for (let k = 0; k < 5; k++) {
      const u = 0.34 + k * 0.07;
      const x = xAt(u), y = top(u) + 0.015, w = halfW(u) * 0.6;
      laces.push(mesh(tube([[x - 0.04, y - 0.05, -w], [x + 0.02, y + 0.02, 0], [x + 0.08, y - 0.05, w]], 0.022, 20, 8), laceMat));
      laces.push(mesh(tube([[x + 0.08, y - 0.05, -w], [x + 0.02, y + 0.025, 0], [x - 0.04, y - 0.05, w]], 0.022, 20, 8), laceMat));
    }
    const heelTab = mesh(rbox(0.1, 0.26, 0.22, 0.04), M.softTouch(accent), [xAt(1) + 0.01, top(0.985) - 0.02, 0], [0, 0, -0.25]);
    const stripe = mesh(ribbon([[xAt(0.3), top(0.3) - 0.14, halfW(0.3) * 0.96], [xAt(0.55), top(0.55) - 0.2, halfW(0.55) * 0.97], [xAt(0.8), soleTopAt(0.8) + 0.2, halfW(0.8) * 0.96]], 0.09, 0.012, 0.004, 40), M.softTouch(accent, { roughness: 0.45 }));
    const g = group(outsole, midsole, upper, lining, collar, tongue, laces, heelTab, stripe);
    g.rotation.y = 0.5;
    return { object: g, view: { hero: { el: 0.16, fill: 0.74 }, detail: { target: [0.2, 0.9, 0.5], fill: 2.6 } } };
  },

  /* Transit daypack */
  async backpack({ color, accent }) {
    const nylon = M.fabric(lighter(color, 0.24), { map: weave(lighter(color, 0.24), { contrast: 0.06, step: 2, repeat: [24, 30] }), roughness: 0.7, sheen: 0.35, sheenRoughness: 0.5 });
    const trim = M.softTouch(darker(color, 0.35), { roughness: 0.7 });
    const body = mesh(rbox(3.0, 4.6, 1.5, 0.62, 10), nylon, [0, 2.4, 0]);
    const pocket = mesh(rbox(2.3, 2.0, 0.5, 0.35, 8), nylon, [0, 1.6, 0.72]);
    const zipper = M.metal('#2a2c30', { roughness: 0.4 });
    const zipLine = mesh(tube([[-1.3, 1.1, 0.78], [-1.35, 3.6, 0.72], [-0.8, 4.55, 0.55], [0.8, 4.55, 0.55], [1.35, 3.6, 0.72], [1.3, 1.1, 0.78]], 0.025, 120, 8), trim);
    const pull = mesh(rbox(0.1, 0.34, 0.04, 0.02), zipper, [0.9, 4.35, 0.62], [0, 0, 0.2]);
    const pocketZip = mesh(tube([[-1.05, 2.45, 0.9], [1.05, 2.45, 0.9]], 0.02, 20, 8), trim);
    const pull2 = mesh(rbox(0.26, 0.08, 0.04, 0.02), M.softTouch(accent), [0.75, 2.4, 0.97]);
    const handle = mesh(ribbon([[-0.4, 4.7, -0.2], [-0.25, 5.2, -0.2], [0.25, 5.2, -0.2], [0.4, 4.7, -0.2]], 0.22, 0.06, 0.02, 40), trim);
    const strapL = mesh(ribbon([[-1.2, 4.3, -0.8], [-1.6, 3.2, -0.85], [-1.45, 1.2, -0.85], [-1.1, 0.5, -0.75]], 0.36, 0.12, 0.05, 60), trim);
    const strapR = mesh(ribbon([[1.2, 4.3, -0.8], [1.6, 3.2, -0.85], [1.45, 1.2, -0.85], [1.1, 0.5, -0.75]], 0.36, 0.12, 0.05, 60), trim);
    const patch = mesh(rbox(0.5, 0.3, 0.03, 0.05), M.softTouch(darker(color, 0.45)), [0, 1.25, 0.975]);
    const logo = mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshStandardMaterial({ map: label(128, 128, (ctx) => { ctx.clearRect(0, 0, 128, 128); symbolPath(ctx, 20, 18, 1.7, accent); }), transparent: true, roughness: 0.5 }), [0, 1.25, 0.992]);
    const g = group(body, pocket, zipLine, pull, pocketZip, pull2, handle, strapL, strapR, patch, logo);
    g.rotation.y = -0.4;
    return { object: g, view: { detail: { target: [0.6, 2.5, 1.0], fill: 2.5 } } };
  },

  /* Meridian automatic watch */
  async watch({ color, accent }) {
    const steel = M.metal(color, { roughness: 0.14 });
    const dialTex = label(1024, 1024, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2);
      g.addColorStop(0, accent); g.addColorStop(1, hex(C(accent).lerp(C(lum(accent) > 0.5 ? '#b8b2a4' : '#000000'), 0.25)));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const ink = lum(accent) > 0.5 ? '#1a1b1e' : '#efe9dc';
      ctx.fillStyle = ink; ctx.strokeStyle = ink;
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
        ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(a);
        ctx.fillRect(-(big ? 7 : 2), -h / 2 + 40, big ? 14 : 4, big ? 70 : 24);
        ctx.restore();
      }
      ctx.textAlign = 'center'; ctx.font = '600 44px Helvetica'; ctx.fillText('MERIDIAN', w / 2, 330);
      ctx.font = '26px Helvetica'; ctx.fillText('AUTOMATIC', w / 2, 690); ctx.fillText('SWISS MADE', w / 2, 950);
    });
    const caseG = mesh(lathe([[0, 0], [0.88, 0], [0.96, 0.08], [0.98, 0.22], [0.93, 0.3], [0.86, 0.32], [0, 0.32]], 128), steel);
    const bezel = mesh(new THREE.TorusGeometry(0.86, 0.045, 24, 128), M.metal(color, { roughness: 0.08 }), [0, 0.32, 0], [Math.PI / 2, 0, 0]);
    const dial = mesh(new THREE.CircleGeometry(0.82, 128), M.matte('#ffffff', { map: dialTex, roughness: 0.35, metalness: 0.1 }), [0, 0.31, 0], [-Math.PI / 2, 0, 0]);
    const handMat = M.metal(lum(accent) > 0.5 ? '#2a2c30' : '#e9e4d6', { roughness: 0.2 });
    const hand = (len, w, ang, y) => { const m = mesh(new THREE.BoxGeometry(w, 0.012, len), handMat, [0, y, 0]); m.geometry.translate(0, 0, -len / 2 + 0.06); m.rotation.y = ang; return m; };
    const hands = [hand(0.5, 0.05, -1.05, 0.33), hand(0.72, 0.035, 0.52, 0.345), mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 24), handMat, [0, 0.34, 0])];
    const sec = mesh(new THREE.BoxGeometry(0.012, 0.008, 0.8), M.matte('#5967ff'), [0, 0.36, 0]);
    sec.geometry.translate(0, 0, -0.3); sec.rotation.y = 2.4;
    const crystal = mesh(new THREE.CircleGeometry(0.86, 128), M.glass('#ffffff', { thickness: 0.02, roughness: 0.02 }), [0, 0.37, 0], [-Math.PI / 2, 0, 0]);
    crystal.userData.noShadow = true;
    const crown = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 32), steel, [1.03, 0.16, 0], [0, 0, Math.PI / 2]);
    const lugs = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) lugs.push(mesh(rbox(0.14, 0.18, 0.4, 0.04), steel, [sx * 0.5, 0.14, sz * 0.92]));
    const leather = M.softTouch(lum(color) > 0.5 && color !== '#c9a765' ? '#3a2a1f' : '#1a1b1e', { roughness: 0.62, bumpMap: bumpNoise({ count: 7000, r: [0.3, 0.9], repeat: [4, 8] }), bumpScale: 0.3 });
    const strap1 = mesh(ribbon([[0, 0.12, -1.0], [0, -0.1, -1.9], [0, -0.9, -2.3], [0, -1.8, -1.9], [0, -2.05, -1.0]], 0.72, 0.1, 0.03, 80), leather);
    const strap2 = mesh(ribbon([[0, 0.12, 1.0], [0, -0.1, 1.9], [0, -0.9, 2.3], [0, -1.8, 1.9], [0, -2.05, 1.0]], 0.72, 0.1, 0.03, 80), leather);
    const head = group(caseG, bezel, dial, hands, sec, crystal, crown, lugs, strap1, strap2);
    head.rotation.set(Math.PI / 2 - 0.22, 0, 0);
    head.position.y = 2.2;
    const g = group(head);
    g.rotation.y = -0.35;
    return { object: g, view: { hero: { el: 0.08, fill: 0.7 }, detail: { target: [0.1, 2.3, 0.5], fill: 3.2, el: 0.05 } } };
  },

  /* Solstice sunglasses */
  async sunglasses({ color, accent }) {
    reseed(31);
    const tort = color === '#6b4a2e'
      ? noiseTex('#5a3a22', ['#2b1a0f', '#8a5a2e', '#c08040', '#3b2616'], { size: 512, count: 900, r: [4, 22], repeat: [1, 1], alpha: 0.55 })
      : null;
    const acetate = M.glaze(color, { roughness: 0.18, ...(tort ? { map: tort } : {}), ...(color === '#d8d4cc' ? { transmission: 0.6, thickness: 0.2, roughness: 0.12 } : {}) });
    const lensMat = M.glass(accent, { transmission: 0.25, roughness: 0.03, metalness: 0.2, color: C(accent), thickness: 0.05, envMapIntensity: 2.5 });
    const lensPath = (cx, sx, sy, ins = 0) => {
      const p = new THREE.Shape();
      const w = 0.72 * sx - ins, top = 0.52 * sy - ins, bot = -0.46 * sy + ins;
      p.moveTo(cx - w, top - 0.12); p.quadraticCurveTo(cx - w, top, cx - w + 0.2, top);
      p.lineTo(cx + w - 0.2, top); p.quadraticCurveTo(cx + w, top, cx + w, top - 0.14);
      p.bezierCurveTo(cx + w, bot + 0.1, cx + w * 0.55, bot, cx, bot);
      p.bezierCurveTo(cx - w * 0.6, bot, cx - w, bot + 0.18, cx - w, top - 0.12);
      return p;
    };
    const ex = { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4, curveSegments: 48 };
    const rimFor = (cx) => { const outer = lensPath(cx, 1, 1); const hole = lensPath(cx, 1, 1, 0.11); outer.holes.push(new THREE.Path(hole.getPoints(80))); return new THREE.ExtrudeGeometry(outer, ex); };
    const frames = group(mesh(rimFor(-0.78), acetate), mesh(rimFor(0.78), acetate), mesh(ribbon([[-0.12, 0.3, 0.06], [0, 0.34, 0.06], [0.12, 0.3, 0.06]], 0.1, 0.12, 0.03, 20), acetate));
    const lensGeo = (cx) => new THREE.ShapeGeometry(lensPath(cx, 1, 1, 0.09), 48);
    const lenses = group(mesh(lensGeo(-0.78), lensMat, [0, 0, 0.075]), mesh(lensGeo(0.78), lensMat, [0, 0, 0.075]));
    const temple = (s) => group(mesh(ribbon([[s * 1.5, 0.36, 0], [s * 1.56, 0.36, -1.2], [s * 1.54, 0.3, -2.3], [s * 1.46, 0.02, -2.7]], 0.07, 0.16, 0.02, 60), acetate), mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 12), M.metal('#d5d0c4'), [s * 1.5, 0.36, -0.05]));
    const g = group(frames, lenses, temple(-1), temple(1));
    g.position.y = 0.5;
    g.rotation.set(0.0, -0.5, 0);
    return { object: g, view: { hero: { el: 0.18, fill: 0.7 }, detail: { target: [0.5, 0.65, 0.3], fill: 2.6 } } };
  },

  /* Trail insulated bottle */
  async bottle({ color, accent }) {
    const powder = M.softTouch(color, { roughness: 0.62, clearcoat: 0.1, bumpMap: bumpNoise({ count: 9000, r: [0.3, 0.8], repeat: [3, 6] }), bumpScale: 0.25 });
    const body = mesh(lathe([[0, 0], [0.5, 0], [0.56, 0.05], [0.58, 0.2], [0.58, 2.35], [0.52, 2.6], [0.38, 2.78], [0.36, 2.9], [0, 2.9]], 128), powder);
    const cap = M.softTouch(accent, { roughness: 0.45 });
    const lid = mesh(lathe([[0, 2.9], [0.4, 2.9], [0.42, 2.94], [0.42, 3.3], [0.38, 3.36], [0, 3.37]], 96), cap);
    const loop = mesh(new THREE.TorusGeometry(0.2, 0.06, 20, 64, Math.PI), cap, [0, 3.34, 0], [0, 0, 0]);
    const ring = mesh(new THREE.CylinderGeometry(0.365, 0.365, 0.1, 96), M.brushed('#c9ccd1'), [0, 2.86, 0]);
    const decal = label(512, 512, (ctx) => { ctx.clearRect(0, 0, 512, 512); symbolPath(ctx, 170, 150, 3.2, lum(color) > 0.5 ? '#0a0b0d' : '#f7f7f2'); });
    const mark = mesh(new THREE.CylinderGeometry(0.582, 0.582, 0.5, 64, 1, true, -0.35, 0.7), new THREE.MeshStandardMaterial({ map: decal, transparent: true, roughness: 0.5 }), [0, 1.35, 0]);
    const g = group(body, lid, loop, ring, mark);
    g.rotation.y = -0.2;
    return { object: g, view: { detail: { target: [0, 3.0, 0.4], fill: 3 } } };
  },

  /* Solace serum / oil — dropper bottle */
  async serum({ color, accent }) {
    const amber = lum(color) < 0.4 || color === '#c98a3c';
    const glass = M.glass(amber ? '#c98a3c' : '#f3ebe6', { roughness: amber ? 0.05 : 0.35, thickness: 0.5, attenuationColor: C(amber ? '#b36b1e' : '#e9d8ce'), attenuationDistance: 0.8 });
    const bottle = mesh(lathe([[0, 0], [0.5, 0], [0.54, 0.05], [0.54, 1.5], [0.46, 1.65], [0.22, 1.72], [0.2, 1.84], [0, 1.84]], 128), glass);
    const liquid = mesh(lathe([[0, 0.06], [0.48, 0.06], [0.48, 1.2], [0, 1.2]], 96), M.glass(amber ? '#e0a64f' : '#f7f1ea', { transmission: 0.8, roughness: 0.1, thickness: 0.6 }));
    const collar = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.3, 64), M.metal(amber ? '#1c1d20' : '#d9c7a8', { roughness: 0.25 }), [0, 1.98, 0]);
    const bulb = mesh(lathe([[0, 2.13], [0.2, 2.13], [0.22, 2.3], [0.18, 2.6], [0.1, 2.72], [0, 2.74]], 64), M.rubber(accent === '#f1e9dd' ? '#1d1e21' : accent, { roughness: 0.55 }));
    const lbl = label(1024, 512, (ctx, w, h) => {
      ctx.fillStyle = '#f7f4ee'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0a0b0d'; ctx.textAlign = 'center';
      ctx.font = '600 40px Helvetica'; ctx.fillText('S O L A C E', w * 0.25, 150);
      ctx.fillRect(w * 0.25 - 60, 180, 120, 3);
      ctx.font = '300 54px Georgia'; ctx.fillText(amber ? 'Night Recovery' : 'Clarity Serum', w * 0.25, 280);
      ctx.font = '26px Helvetica'; ctx.fillText(amber ? 'SQUALANE + BAKUCHIOL' : '10% NIACINAMIDE + ZINC', w * 0.25, 340);
      ctx.fillText('30 ml · 1 fl oz', w * 0.25, 400);
    });
    const band = mesh(new THREE.CylinderGeometry(0.545, 0.545, 0.8, 96, 1, true, -0.95, 1.9), M.paper('#ffffff', { map: lbl, roughness: 0.7 }), [0, 0.78, 0]);
    const g = group(bottle, liquid, collar, bulb, band);
    g.rotation.y = -0.1;
    return { object: g, view: { detail: { target: [0, 1.9, 0.3], fill: 3 } } };
  },

  /* Premium copy paper — reams */
  async paper({ color, accent }) {
    const wrap = (y, rot, lab) => {
      const tex = label(1024, 512, (ctx, w, h) => {
        ctx.fillStyle = '#fbfbf8'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = accent; ctx.fillRect(0, h * 0.58, w, h * 0.24);
        ctx.fillStyle = '#0a0b0d'; ctx.font = '600 58px Helvetica'; ctx.fillText('BRIGHTLINE', 60, 120);
        ctx.font = '300 44px Helvetica'; ctx.fillText('Premium Copy · A4 · 80 gsm', 60, 186);
        ctx.font = '26px Helvetica'; ctx.fillText('500 SHEETS · CIE 161 · 99.98% JAM-FREE', 60, 236);
        ctx.fillStyle = '#ffffff'; ctx.font = '600 40px Helvetica'; ctx.fillText('A4', 60, h * 0.72);
        ctx.fillText(lab, w - 280, h * 0.72);
      });
      const ream = mesh(rbox(2.97, 0.52, 2.1, 0.03, 3), [M.paper('#fbfbf8', { roughness: 0.55, clearcoat: 0.3 }), M.paper('#fbfbf8'), M.paper('#fbfbf8', { roughness: 0.55 }), M.paper('#fbfbf8'), M.paper('#ffffff', { map: tex, roughness: 0.5, clearcoat: 0.3 }), M.paper('#fbfbf8')], [0, y, 0], [0, rot, 0]);
      return ream;
    };
    const stack = group(wrap(0.26, 0, 'FSC®'), wrap(0.79, 0.05, 'FSC®'), wrap(1.32, -0.08, 'FSC®'));
    const sheets = mesh(new THREE.BoxGeometry(2.9, 0.06, 2.05), M.paper('#ffffff', { map: stripes('#ffffff', 'rgba(0,0,0,0.06)', { gap: 3, width: 1, repeat: [1, 4] }) }), [0.25, 1.62, 0.2], [0, 0.18, 0]);
    const g = group(stack, sheets);
    g.rotation.y = -0.55;
    return { object: g, view: { detail: { target: [-0.6, 1.1, 1.0], fill: 2.4 } } };
  },

  /* Scanline 2D barcode scanner */
  async scanner({ color, accent }) {
    const shell = M.plastic(color, { roughness: 0.45 });
    const grip = M.rubber('#141518', { roughness: 0.8, bumpMap: bumpNoise({ count: 5000, r: [0.4, 1], repeat: [3, 3] }), bumpScale: 0.3 });
    const head = mesh(rbox(1.9, 0.72, 0.8, 0.22, 6), shell, [0.2, 2.2, 0]);
    const nose = mesh(rbox(0.3, 0.8, 0.86, 0.14, 6), grip, [1.18, 2.2, 0]);
    const window = mesh(new THREE.PlaneGeometry(0.62, 0.36), M.glaze('#0e1411', { roughness: 0.05, emissive: accent, emissiveIntensity: 0.25 }), [1.335, 2.2, 0], [0, Math.PI / 2, 0]);
    const handle = mesh(rbox(0.62, 2.0, 0.7, 0.24, 6), grip, [-0.35, 1.15, 0], [0, 0, -0.28]);
    const trigger = mesh(rbox(0.22, 0.44, 0.34, 0.08), M.softTouch(accent), [0.12, 1.72, 0], [0, 0, -0.35]);
    const ledStrip = mesh(new THREE.BoxGeometry(0.4, 0.03, 0.02), M.emissive(accent, 1.5), [0.1, 2.5, 0.401]);
    const cradle = group(
      mesh(rbox(1.7, 0.2, 1.2, 0.08), shell, [-0.3, 0.1, 0]),
      mesh(rbox(0.8, 0.5, 0.95, 0.12), shell, [-0.7, 0.4, 0]),
      mesh(new THREE.BoxGeometry(0.16, 0.02, 0.02), M.emissive('#5967ff', 1.4), [-0.3, 0.21, 0.61]),
    );
    const g = group(head, nose, window, handle, trigger, ledStrip, cradle);
    g.rotation.y = -0.6;
    return { object: g, view: { detail: { target: [0.9, 2.2, 0.3], fill: 2.6 } } };
  },

  /* Shipping carton / mailer */
  async carton({ color, accent, shape }) {
    const mailer = shape === 'mailer';
    const w = mailer ? 2.3 : 2.0, h = mailer ? 0.72 : 1.35, d = mailer ? 1.6 : 1.6;
    reseed(40);
    const kraft = noiseTex(color, [darker(color, 0.25), lighter(color, 0.18), darker(color, 0.12)], { size: 1024, count: 9000, r: [0.3, 1.1], repeat: [2, 2], alpha: 0.35 });
    const card = M.paper('#ffffff', { map: kraft, roughness: 0.88 });
    const parts = [mesh(rbox(w, h, d, 0.025, 4), card, [0, h / 2, 0])];
    if (mailer) {
      parts.push(mesh(new THREE.BoxGeometry(w - 0.06, 0.006, 0.02), M.matte(darker(color, 0.45)), [0, h - 0.01, d / 2 - 0.3]));
      const logo = label(512, 512, (ctx) => { ctx.clearRect(0, 0, 512, 512); symbolPath(ctx, 150, 120, 3.8, lum(color) < 0.3 ? '#c8ff3d' : '#0a0b0d'); ctx.font = '600 44px Helvetica'; ctx.fillStyle = lum(color) < 0.3 ? '#f7f7f2' : '#0a0b0d'; ctx.textAlign = 'center'; ctx.fillText('THANK YOU', 256, 440); });
      parts.push(mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshStandardMaterial({ map: logo, transparent: true, roughness: 0.8 }), [0.2, h + 0.003, 0.05], [-Math.PI / 2, 0, 0]));
      parts.push(mesh(rbox(w * 0.96, 0.62, d * 0.96, 0.02, 3), card, [0.5, 0.31, -2.0], [0, 0.2, 0]));
    } else {
      parts.push(mesh(new THREE.BoxGeometry(0.012, 0.004, d + 0.002), M.matte(darker(color, 0.5)), [0, h + 0.001, 0]));
      const tapeMat = new THREE.MeshPhysicalMaterial({ color: accent === '#c8ff3d' ? '#c8ff3d' : lighter(color, 0.25), roughness: 0.22, clearcoat: 1, transparent: true, opacity: 0.88 });
      parts.push(mesh(new THREE.BoxGeometry(0.36, 0.006, d + 0.02), tapeMat, [0, h + 0.003, 0]));
      parts.push(mesh(new THREE.BoxGeometry(0.36, 0.34, 0.006), tapeMat, [0, h - 0.17, d / 2 + 0.003]));
      const labelTex = label(600, 400, (ctx, W, H) => {
        ctx.fillStyle = '#f7f6f1'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#0a0b0d'; ctx.font = '600 38px Helvetica'; ctx.fillText('PARCEL & CRATE', 32, 64);
        ctx.font = '26px Helvetica'; ctx.fillText('12 × 10 × 8 in  ·  ECT-32', 32, 108); ctx.fillText('25 CARTONS · FSC MIX', 32, 146);
        for (let i = 0; i < 70; i++) { const bw = [2, 3, 5, 2, 4][i % 5]; ctx.fillRect(32 + i * 7.6, 190, bw, 150); }
        ctx.font = '22px monospace'; ctx.fillText('0 48230 11928 4', 60, 372);
      });
      parts.push(mesh(new THREE.PlaneGeometry(0.62, 0.41), M.paper('#ffffff', { map: labelTex, roughness: 0.6 }), [-w / 2 - 0.002, h * 0.42, 0.25], [0, -Math.PI / 2, 0]));
      const arrows = label(256, 256, (ctx) => { ctx.clearRect(0, 0, 256, 256); ctx.strokeStyle = '#1a1b1e'; ctx.lineWidth = 10; for (const x of [70, 150]) { ctx.beginPath(); ctx.moveTo(x, 200); ctx.lineTo(x, 60); ctx.moveTo(x - 30, 95); ctx.lineTo(x, 60); ctx.lineTo(x + 30, 95); ctx.stroke(); } ctx.strokeRect(30, 215, 160, 12); });
      parts.push(mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshPhysicalMaterial({ map: arrows, transparent: true, roughness: 0.9, opacity: 0.7 }), [0.62, h * 0.72, d / 2 + 0.002]));
    }
    const g = group(parts);
    g.rotation.y = mailer ? -0.5 : 0.62;
    return { object: g, view: { detail: { target: mailer ? [0.2, 0.7, 0.3] : [-0.9, 0.6, 0.3], fill: 2.4 } } };
  },

  /* Nitrile gloves — dispenser box + glove */
  async gloves({ color, accent }) {
    const boxTex = label(1024, 512, (ctx, w, h) => {
      ctx.fillStyle = '#f2f3f6'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = color; ctx.fillRect(0, h * 0.55, w, h * 0.45);
      ctx.fillStyle = '#0a0b0d'; ctx.font = '600 64px Helvetica'; ctx.fillText('GUARDLINE', 50, 110);
      ctx.font = '300 48px Helvetica'; ctx.fillText('Nitrile Exam Gloves', 50, 180);
      ctx.font = '26px Helvetica'; ctx.fillText('POWDER-FREE · LATEX-FREE · 4 MIL', 50, 230);
      ctx.fillStyle = lum(color) < 0.3 ? '#f7f7f2' : '#ffffff'; ctx.font = '600 110px Helvetica'; ctx.fillText('100', 50, h - 70);
      ctx.font = '600 44px Helvetica'; ctx.fillText('SIZE L', w - 260, h - 80);
    });
    const plain = M.paper('#f2f3f6', { roughness: 0.6 });
    const box = mesh(rbox(2.4, 1.0, 1.25, 0.02, 3), [plain, plain, plain, plain, M.paper('#ffffff', { map: boxTex, roughness: 0.55 }), plain], [0, 0.5, 0]);
    const slot = mesh(slab(1.3, 0.3, 0.01, 0.14, 0.004), M.matte('#1b1c1f'), [0, 1.002, 0], [-Math.PI / 2, 0, 0]);
    const nitrile = M.softTouch(color, { roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4 });
    const palm = mesh(rbox(0.72, 0.6, 0.22, 0.1, 6), nitrile, [0, 1.25, 0]);
    const fingers = [[-0.27, 0.62, 0.02, 0.1], [-0.09, 0.72, 0.0, 0.03], [0.09, 0.7, 0, -0.03], [0.26, 0.58, 0.02, -0.1]].map(([x, len, z, r]) => mesh(new THREE.CapsuleGeometry(0.085, len, 8, 24), nitrile, [x, 1.55 + len / 2, z], [0, 0, r]));
    const thumb = mesh(new THREE.CapsuleGeometry(0.09, 0.4, 8, 24), nitrile, [-0.48, 1.35, 0.05], [0, 0, 0.75]);
    const cuff = mesh(new THREE.CylinderGeometry(0.4, 0.46, 0.35, 48, 1, true), nitrile, [0, 1.0, 0], [0, 0, 0], [1, 1, 0.45]);
    const hand = group(palm, fingers, thumb, cuff);
    hand.rotation.set(0.15, 0.2, -0.08);
    const g = group(box, slot, hand);
    g.rotation.y = -0.45;
    return { object: g, view: { detail: { target: [0.2, 1.7, 0.2], fill: 2.6 } } };
  },

  /* Vented safety helmet */
  async helmet({ color, accent }) {
    const shell = M.glaze(color, { roughness: 0.22 });
    const domeGeo = new THREE.SphereGeometry(1.25, 96, 64, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeo.scale(1, 0.92, 1.22);
    const dome = mesh(domeGeo, shell, [0, 0.12, 0]);
    const ridge = mesh(ribbon([[0, 0.9, 1.3], [0, 1.25, 0.6], [0, 1.3, -0.3], [0, 1.1, -1.2]], 0.26, 0.08, 0.04, 60), shell);
    const brim = mesh(lathe([[1.22, 0.16], [1.42, 0.1], [1.46, 0.06], [1.36, 0.02], [1.2, 0.06]], 128), shell, [0, 0, 0], [0, 0, 0], [1, 1, 1.22]);
    const peak = mesh(ellipsoid(0.7, 0.05, 0.45, 48, 12), shell, [0, 0.12, 1.55]);
    const vents = [];
    for (const s of [-1, 1]) for (const z of [-0.3, 0.2]) vents.push(mesh(rbox(0.08, 0.05, 0.36, 0.02), M.matte('#1a1b1e'), [s * 0.72, 1.02, z], [0, 0, s * 0.62]));
    const suspension = mesh(new THREE.TorusGeometry(1.0, 0.04, 12, 96), M.softTouch('#2a2c30'), [0, 0.05, 0], [Math.PI / 2, 0, 0], [1, 1.2, 1]);
    const decal = label(512, 256, (ctx) => { ctx.clearRect(0, 0, 512, 256); symbolPath(ctx, 40, 60, 2.4, lum(color) > 0.5 ? '#0a0b0d' : '#f7f7f2'); ctx.fillStyle = lum(color) > 0.5 ? '#0a0b0d' : '#f7f7f2'; ctx.font = '600 52px Helvetica'; ctx.fillText('GUARDLINE', 190, 150); });
    const logo = mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshStandardMaterial({ map: decal, transparent: true, roughness: 0.3 }), [0, 0.62, 1.47], [-0.35, 0, 0]);
    const g = group(dome, ridge, brim, peak, vents, suspension, logo);
    g.rotation.y = -0.5;
    return { object: g, view: { hero: { fill: 0.86 }, angle: { fill: 0.84 }, detail: { target: [0, 0.9, 1.0], fill: 2.4 } } };
  },

  /* Eco surface cleaner — spray bottle */
  async spray({ color, accent }) {
    const hdpe = M.plastic('#f3f2ec', { roughness: 0.3, transmission: 0.35, thickness: 0.5 });
    const body = mesh(lathe([[0, 0], [0.52, 0], [0.58, 0.06], [0.6, 0.2], [0.6, 1.9], [0.5, 2.2], [0.26, 2.4], [0.24, 2.56], [0, 2.56]], 128), hdpe, [0, 0, 0], [0, 0, 0], [1, 1, 0.72]);
    const liquid = mesh(lathe([[0, 0.05], [0.54, 0.05], [0.55, 1.6], [0, 1.6]], 96), M.glass(accent === '#c8ff3d' ? '#dff58e' : '#dde3ea', { transmission: 0.7, roughness: 0.1 }), [0, 0, 0], [0, 0, 0], [0.96, 1, 0.68]);
    const black = M.plastic('#1b1c1f', { roughness: 0.4 });
    const collar = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 48), black, [0, 2.66, 0]);
    const headShape = new THREE.Shape();
    headShape.moveTo(-0.35, 0); headShape.lineTo(0.35, 0); headShape.lineTo(0.42, 0.55); headShape.quadraticCurveTo(0.35, 0.72, 0.1, 0.72); headShape.lineTo(-0.9, 0.62); headShape.quadraticCurveTo(-1.02, 0.55, -0.98, 0.42); headShape.lineTo(-0.35, 0.3); headShape.closePath();
    const headGeo = new THREE.ExtrudeGeometry(headShape, { depth: 0.44, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 });
    headGeo.translate(0, 0, -0.22);
    const head = mesh(headGeo, black, [0, 2.8, 0]);
    const trig = mesh(ribbon([[-0.32, 3.0, 0], [-0.46, 2.7, 0], [-0.42, 2.35, 0]], 0.3, 0.1, 0.04, 30), black);
    const nozzle = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 24), M.softTouch(accent), [-1.02, 3.28, 0], [0, 0, Math.PI / 2]);
    const lbl = label(1024, 512, (ctx, w, h) => {
      ctx.fillStyle = accent === '#c8ff3d' ? '#c8ff3d' : '#e4e7ec'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0a0b0d'; ctx.textAlign = 'center';
      ctx.font = '600 70px Helvetica'; ctx.fillText('ECO', w * 0.25, 160);
      ctx.font = '300 44px Helvetica'; ctx.fillText('Surface Cleaner', w * 0.25, 230);
      ctx.font = '26px Helvetica'; ctx.fillText(accent === '#c8ff3d' ? 'CITRUS · 750 ML' : 'UNSCENTED · 750 ML', w * 0.25, 290);
      symbolPath(ctx, w * 0.25 - 45, 330, 1.7, '#0a0b0d');
    });
    const band = mesh(new THREE.CylinderGeometry(0.605, 0.605, 1.0, 96, 1, true, -0.9, 1.8), M.paper('#ffffff', { map: lbl, roughness: 0.5 }), [0, 1.0, 0], [0, 0, 0], [1, 1, 0.73]);
    const g = group(body, liquid, collar, head, trig, nozzle, band);
    g.rotation.y = -0.4;
    return { object: g, view: { detail: { target: [-0.4, 3.0, 0.3], fill: 2.6 } } };
  },
};
