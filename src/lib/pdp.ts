import type { Product } from "@/lib/types";
import { PRODUCT_PHOTOS } from "@/lib/catalog/photos";
import { PRODUCT_GALLERY, CATEGORY_HERO, type GalleryPhoto } from "@/lib/catalog/gallery";

/** One photograph on a product page, whichever list it came from. */
export type PdpPhoto = {
  /** Image URL without size parameters */
  src: string;
  /** Where the subject sits (0–1), for framing in wide boxes */
  fp?: readonly [number, number];
  /** Photographer username and links, for the credit */
  by: string;
  profile: string;
  page: string;
};

const base = (src: string) => src.split("?")[0];

function fromGallery(g: GalleryPhoto): PdpPhoto {
  return { src: g.src, by: g.by, profile: g.profile, page: g.page };
}

/**
 * Every photograph of a product, best first: its own photography (all colourways and views), then the
 * extra gallery shots. Duplicates are dropped.
 */
export function productMedia(p: Product): PdpPhoto[] {
  const out: PdpPhoto[] = [];
  const seen = new Set<string>();
  const add = (x: PdpPhoto) => {
    const k = base(x.src);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(x);
  };
  const own = PRODUCT_PHOTOS[p.slug];
  if (own) {
    for (const v of p.variants) {
      for (const view of ["hero", "scene", "angle", "detail"] as const) {
        const ph = own[v.id]?.[view];
        if (ph) add({ src: base(ph.src), fp: ph.fp ? [ph.fp[0], ph.fp[1]] : undefined, by: ph.by, profile: ph.profile, page: ph.page });
      }
    }
  }
  for (const g of PRODUCT_GALLERY[p.slug] ?? []) add(fromGallery(g));
  return out;
}

export function categoryHero(slug: string): PdpPhoto | undefined {
  const g = CATEGORY_HERO[slug];
  return g ? fromGallery(g) : undefined;
}

/** Responsive attributes for a photograph in a box of a given shape. `ratio` is height ÷ width (0 = natural shape). */
export function picAttrs(photo: PdpPhoto, widths: number[], opts: { ratio?: number; quality?: number } = {}) {
  const q = opts.quality ?? 80;
  const url = (w: number) => {
    const u = new URL(photo.src);
    u.searchParams.set("w", String(w));
    if (opts.ratio) {
      u.searchParams.set("h", String(Math.round(w * opts.ratio)));
      u.searchParams.set("fit", "crop");
      if (photo.fp) {
        u.searchParams.set("crop", "focalpoint");
        u.searchParams.set("fp-x", String(photo.fp[0]));
        u.searchParams.set("fp-y", String(photo.fp[1]));
      }
    }
    u.searchParams.set("q", String(q));
    u.searchParams.set("auto", "format");
    return u.href;
  };
  const sorted = [...widths].sort((a, b) => a - b);
  return {
    src: url(sorted[Math.min(1, sorted.length - 1)]),
    srcSet: sorted.map((w) => `${url(w)} ${w}w`).join(", "),
  };
}

/** CSS object-position for a photograph's focal point. */
export function focalPosition(photo: PdpPhoto) {
  return `${(photo.fp?.[0] ?? 0.5) * 100}% ${(photo.fp?.[1] ?? 0.5) * 100}%`;
}

/** First sentence of a product's summary — the one line under its name. */
export function tagline(p: Product) {
  const m = p.summary.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : p.summary).trim();
}

/**
 * The closer-look chapters of a product: each highlight, with one honest line taken from the product's own
 * specs or what its owners say. Nothing is invented — every line comes from the product record.
 */
export function chapters(p: Product) {
  const pros = p.brief.pros;
  return p.highlights.slice(0, 4).map((title, i) => ({
    title,
    // one line from what owners say; the product summary when there are fewer of those than highlights
    body: pros[i] ? `${pros[i]}.` : p.summary,
  }));
}
