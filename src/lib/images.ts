import type { Product } from "@/lib/types";
import { PRODUCT_PHOTOS, type ProductPhoto } from "@/lib/catalog/photos";

/**
 * Product imagery. Curated photography (see `lib/catalog/photos.ts`) takes precedence;
 * products without it fall back to the studio renders in /public/products/{slug}/{variant}-{view}.webp.
 */
export type ImageView = "hero" | "angle" | "detail" | "scene";

export const IMAGE_VIEWS: { id: ImageView; label: string }[] = [
  { id: "hero", label: "Front" },
  { id: "angle", label: "Angle" },
  { id: "detail", label: "Detail" },
  { id: "scene", label: "In context" },
];

type ImageProduct = Pick<Product, "slug" | "variants">;

const variantOf = (p: ImageProduct, variantId?: string) => p.variants.find((x) => x.id === variantId) ?? p.variants[0];

/** The photo for a view, if the product has photography. Missing views resolve to undefined. */
export function productPhoto(p: ImageProduct, variantId?: string, view: ImageView = "hero"): ProductPhoto | undefined {
  return PRODUCT_PHOTOS[p.slug]?.[variantOf(p, variantId).id]?.[view];
}

/** The views that exist for a colourway, in display order. */
export function productViews(p: ImageProduct, variantId?: string): { id: ImageView; label: string }[] {
  const set = PRODUCT_PHOTOS[p.slug]?.[variantOf(p, variantId).id];
  return set ? IMAGE_VIEWS.filter((v) => set[v.id]) : IMAGE_VIEWS;
}

export function hasView(p: ImageProduct, view: ImageView, variantId?: string) {
  return productViews(p, variantId).some((v) => v.id === view);
}

/** A square crop from the Unsplash CDN, centred on the photo's focal point. */
export function photoUrl(photo: ProductPhoto, width: number, quality = 75) {
  const u = new URL(photo.src);
  u.searchParams.set("w", String(width));
  u.searchParams.set("h", String(width));
  u.searchParams.set("fit", "crop");
  if (photo.fp) {
    u.searchParams.set("crop", "focalpoint");
    u.searchParams.set("fp-x", String(photo.fp[0]));
    u.searchParams.set("fp-y", String(photo.fp[1]));
    u.searchParams.set("fp-z", String(photo.fp[2]));
  } else {
    u.searchParams.set("crop", "entropy");
  }
  u.searchParams.set("q", String(quality));
  u.searchParams.set("auto", "format");
  return u.href;
}

/** A URL for the view (falls back to the front view when that view doesn't exist). */
export function productImageSrc(p: ImageProduct, variantId?: string, view: ImageView = "hero", width = 1200) {
  const photo = productPhoto(p, variantId, view) ?? productPhoto(p, variantId, "hero");
  if (photo) return photoUrl(photo, width);
  return `/products/${p.slug}/${variantOf(p, variantId).id}-${view}.webp`;
}
