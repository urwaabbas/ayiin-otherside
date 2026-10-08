// Turns the soft, semi-transparent pass around each cut-out into a true shadow:
// opaque product pixels are kept; translucent ones become warm-black with alpha scaled by their darkness,
// so pale haze disappears and only real occlusion remains. Usage: node clean-cuts.js
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import fs from 'node:fs';
sharp.cache(false);
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '../../public/products');
for (const dir of fs.readdirSync(OUT)) {
  for (const f of fs.readdirSync(path.join(OUT, dir)).filter((x) => x.endsWith('-cut.webp'))) {
    const file = path.join(OUT, dir, f);
    const { data, info } = await sharp(fs.readFileSync(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255;
      if (a >= 0.985) continue;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      const shade = Math.max(0, Math.min(1, (1 - lum) * 1.6));
      data[i] = 28; data[i + 1] = 24; data[i + 2] = 20;
      data[i + 3] = Math.round(255 * a * shade);
    }
    const buf = await sharp(data, { raw: info }).webp({ quality: 86, alphaQuality: 92, effort: 5 }).toBuffer();
    fs.writeFileSync(file, buf);
    console.log(dir + '/' + f);
  }
}
