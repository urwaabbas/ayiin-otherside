# Hero product images — temporary prototype assets

Every image in `public/hero/` is a photo from Unsplash, used under the
[Unsplash License](https://unsplash.com/license) (free for commercial use, no
attribution required). The backgrounds were removed locally and the cutouts
trimmed, lightly sharpened and exported as transparent WebP (long edge 1600px).

They are stand-ins. Replace them with owned product photography, or GLB models,
before launch.

| File | Category | Photographer | Source |
| --- | --- | --- | --- |
| `sneaker.webp` | Fashion | Gabre Cameron | https://unsplash.com/photos/a-pair-of-black-and-red-shoes-on-a-white-surface-7y0ywfipHdg |
| `headphones.webp` | Technology | Hazel Z | https://unsplash.com/photos/a-pair-of-headphones-floating-in-the-air-W_lXhs-q-sI |
| `perfume.webp` | Beauty | Akhilesh Sharma | https://unsplash.com/photos/a-bottle-of-perfume-sitting-on-top-of-a-table-vf6DtLlwjTk |
| `gaming-chair.webp` | Home | Hannes Köttner | https://unsplash.com/photos/a-black-and-white-office-chair-sitting-in-a-room-Wxc0hAt0nQI |
| `eyewear.webp` | Accessories | Alondra Lucia | https://unsplash.com/photos/a-pair-of-sunglasses-on-a-white-background-tUyg4nIQHPk |

## Known caveats

- `sneaker.webp` shows a small real manufacturer mark on the sole. Fine for a
  prototype; do not ship it.
- `gaming-chair.webp` shows a real manufacturer name on the lumbar cushion, the
  front caster is cut off by the photo's edge, and a faint smear of background
  survives beside the seat. Fine for a prototype; do not ship it.
- `perfume.webp` was cropped just above the photo's table reflection, so the
  base of the bottle is a straight cut.
- The Unsplash License covers the photograph, not trademarks or product designs
  that appear in it.

## Regenerating

Tooling lives in `asset-tools/` (its own `package.json`):

1. `node cut.mjs <dir-of-jpgs> <out-dir>` — background removal to PNG.
2. `python gc-clean.py <cut.png> <out.png>` — optional; keeps only the main
   object when the cutout has stray leftovers (used for the gaming chair).
3. `node prep.mjs <cut-dir> ../public/hero [name ...]` — clean, trim, resize,
   export WebP. Pass names to export only those. Edit the `JOBS` map at the top
   of `prep.mjs` to change which cutout feeds which file.
