// Renders jobs.json into public/products as WebP. Usage: node batch.js [workerIndex workerCount]
// Needs `npm run serve` running. Existing files are skipped, so the batch can be resumed.
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '../../public/products');
const BASE = process.env.STUDIO_URL || 'http://localhost:8765';
// Software GL by default so it runs anywhere; set GPU=1 on a machine with a real GPU.
const args = process.env.GPU ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const [wi, wn] = [+process.argv[2] || 0, +process.argv[3] || 1];
const jobs = JSON.parse(fs.readFileSync(path.join(here, process.env.JOBS || 'jobs.json'), 'utf8'));
const mine = jobs.filter((j, i) => !j.copyOf && i % wn === wi);

const launch = () => chromium.launch({ args, executablePath: process.env.CHROMIUM_PATH || undefined });
let browser = await launch();
let done = 0;
for (const job of mine) {
  const file = path.join(OUT, job.out + '.webp');
  done++;
  if (fs.existsSync(file)) continue;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const size = +new URLSearchParams(job.qs).get('size');
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const page = await browser.newPage({ viewport: { width: size, height: size } });
      await page.goto(`${BASE}/raster.html?${job.qs}`);
      await page.waitForFunction(() => window.ready, null, { timeout: 180000 });
      const r = await page.evaluate(() => window.render());
      const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
      await sharp(Buffer.from(data.split(',')[1], 'base64')).webp({ quality: 84, alphaQuality: 90, effort: 5 }).toFile(file);
      await page.close();
      console.log(`[w${wi}] ${done}/${mine.length} ${job.out} ${r.ms}ms`);
      break;
    } catch (e) {
      console.log(`[w${wi}] retry ${job.out}: ${e.message.split('\n')[0]}`);
      await browser.close().catch(() => {});
      browser = await launch();
    }
  }
}
await browser.close();
// identical parameter sets are rendered once and copied
if (wi === 0)
  for (const j of jobs.filter((x) => x.copyOf)) {
    const from = path.join(OUT, j.copyOf + '.webp'), to = path.join(OUT, j.out + '.webp');
    if (fs.existsSync(from) && !fs.existsSync(to)) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
console.log(`[w${wi}] finished`);
