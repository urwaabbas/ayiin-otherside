// Contact sheet for model work: node preview.js out.png 360 16 "label|kind=mug&c=a7b39a&t=efe9e0" ...
import { chromium } from 'playwright';
import fs from 'node:fs';

const [out, size, frames, ...items] = process.argv.slice(2);
const BASE = process.env.STUDIO_URL || 'http://localhost:8765';
const browser = await chromium.launch({ args: process.env.GPU ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const cells = [];
for (const item of items) {
  const [label, qs] = item.split('|');
  const page = await browser.newPage({ viewport: { width: +size, height: +size } });
  await page.goto(`${BASE}/raster.html?${qs}&size=${size}&frames=${frames}`);
  await page.waitForFunction(() => window.ready, null, { timeout: 120000 });
  const r = await page.evaluate(() => window.render());
  cells.push(`<figure><img src="${await page.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.9))}"><figcaption>${label} · ${r.ms}ms</figcaption></figure>`);
  await page.close();
}
const sheet = await browser.newPage({ viewport: { width: 4 * +size, height: 400 } });
await sheet.setContent(`<body style="margin:0;background:#111;color:#fff;font:12px sans-serif;display:grid;grid-template-columns:repeat(4,${size}px)">${cells.join('')}<style>figure{margin:0}img{display:block;width:100%}</style></body>`);
fs.writeFileSync(out, await sheet.screenshot({ fullPage: true }));
await browser.close();
console.log('wrote', out);
