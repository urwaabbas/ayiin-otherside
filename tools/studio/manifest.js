// Builds jobs.json from the app catalogue: one job per (product, variant, view).
// `node manifest.js cut` builds jobs-cut.json instead: one transparent cut-out per (product, variant).
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../src');
const jiti = createJiti(import.meta.url, { alias: { '@': src } });
const { products } = await jiti.import(path.join(src, 'lib/catalog/products.ts'));
const hex = (c) => c.replace('#', '').toLowerCase();
const CUT = process.argv[2] === 'cut';
const jobs = [];
const seen = new Map();
for (const p of products) {
  const shape = p.slug === 'kraft-mailer-boxes' ? 'mailer' : '';
  for (const v of p.variants) {
    for (const view of CUT ? ['cut'] : ['hero', 'angle', 'detail', 'scene']) {
      const large = view === 'hero' || view === 'scene' || view === 'cut';
      const qs = `kind=${p.kind}&c=${hex(v.color)}&a=${hex(v.accent ?? v.color)}&t=${hex(p.tint)}&view=${view}&size=${large ? 1100 : 960}&frames=${CUT ? 48 : large ? 40 : 32}${shape ? '&shape=' + shape : ''}`;
      const out = `${p.slug}/${v.id}-${view}`;
      if (seen.has(qs)) jobs.push({ out, copyOf: seen.get(qs) });
      else {
        seen.set(qs, out);
        jobs.push({ out, qs, view });
      }
    }
  }
}
// hero shots first (the site needs them most), then scenes, then the rest; duplicates last
const rank = { hero: 0, cut: 0, scene: 1, angle: 2, detail: 3 };
jobs.sort((a, b) => (a.copyOf ? 9 : rank[a.view]) - (b.copyOf ? 9 : rank[b.view]));
fs.writeFileSync(path.join(here, CUT ? 'jobs-cut.json' : 'jobs.json'), JSON.stringify(jobs, null, 1));
console.log(`${jobs.length} images, ${jobs.filter((j) => !j.copyOf).length} to render`);
