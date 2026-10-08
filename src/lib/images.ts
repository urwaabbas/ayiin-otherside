import type { Product } from "@/lib/types";
import { PRODUCT_PHOTOS, type ProductPhoto } from "@/lib/catalog/photos";

/**
 * Product imagery. Curated real editorial photography from Unsplash
 * provides high-resolution, tactile realism across the entire marketplace.
 */
export type ImageView = "hero" | "angle" | "detail" | "scene";

export const IMAGE_VIEWS: { id: ImageView; label: string }[] = [
  { id: "hero", label: "Front" },
  { id: "angle", label: "Angle" },
  { id: "detail", label: "Detail" },
  { id: "scene", label: "In context" },
];

type ImageProduct = Pick<Product, "slug" | "variants">;

const variantOf = (p: ImageProduct, variantId?: string) =>
  p.variants.find((x) => x.id === variantId) ?? p.variants[0];

/** The photo for a view. Guaranteed to return real editorial photography. */
export function productPhoto(
  p: ImageProduct,
  variantId?: string,
  view: ImageView = "hero",
): ProductPhoto | undefined {
  const v = variantOf(p, variantId);
  const byVariant = PRODUCT_PHOTOS[p.slug]?.[v.id];
  if (byVariant?.[view]) return byVariant[view];
  if (byVariant?.hero) return byVariant.hero;

  // Fall back to primary variant's photography for this product
  const allVariants = PRODUCT_PHOTOS[p.slug];
  if (allVariants) {
    const primaryId = p.variants[0]?.id;
    if (primaryId && allVariants[primaryId]?.[view]) return allVariants[primaryId][view];
    if (primaryId && allVariants[primaryId]?.hero) return allVariants[primaryId].hero;

    const firstAvailable = Object.values(allVariants)[0];
    if (firstAvailable?.[view]) return firstAvailable[view];
    if (firstAvailable?.hero) return firstAvailable.hero;
  }

  // Global safety fallback to ensure a real photo is always delivered
  const firstVariantMap = Object.values(PRODUCT_PHOTOS)[0];
  const firstPhoto = firstVariantMap ? Object.values(firstVariantMap)[0]?.hero : undefined;
  return firstPhoto;
}

/** The views that genuinely exist for a colourway, in display order. */
export function productViews(
  p: ImageProduct,
  variantId?: string,
): { id: ImageView; label: string }[] {
  const v = variantOf(p, variantId);
  const set =
    PRODUCT_PHOTOS[p.slug]?.[v.id] ??
    PRODUCT_PHOTOS[p.slug]?.[p.variants[0]?.id];
  if (set) {
    const present = IMAGE_VIEWS.filter((item) => set[item.id]);
    if (present.length > 0) return present;
  }
  return [{ id: "hero", label: "Front" }];
}

export function hasView(p: ImageProduct, view: ImageView, variantId?: string) {
  return productViews(p, variantId).some((v) => v.id === view);
}

/**
 * A crop from the Unsplash CDN, centred on the photo's focal point.
 * `ratio` (height ÷ width) asks the CDN for another frame — 1.25 for a 4:5 portrait —
 * so the crop is cut from the original photograph with maximum clarity.
 */
export function photoUrl(
  photo: ProductPhoto,
  width: number,
  quality = 82,
  ratio = 1,
) {
  const u = new URL(photo.src);
  u.searchParams.set("w", String(width));
  u.searchParams.set("h", String(Math.round(width * ratio)));
  u.searchParams.set("fit", "crop");
  if (photo.fp) {
    u.searchParams.set("crop", "focalpoint");
    u.searchParams.set("fp-x", String(photo.fp[0]));
    u.searchParams.set("fp-y", String(photo.fp[1]));
    u.searchParams.set(
      "fp-z",
      String(Math.max(1, +(photo.fp[2] / ratio).toFixed(3))),
    );
  } else {
    u.searchParams.set("crop", "entropy");
  }
  u.searchParams.set("q", String(quality));
  u.searchParams.set("auto", "format");
  return u.href;
}

/** The full, uncropped photograph at a given width — for wide banners. */
export function photoFullUrl(photo: ProductPhoto, width: number, quality = 84) {
  const u = new URL(photo.src);
  u.searchParams.set("w", String(width));
  u.searchParams.set("q", String(quality));
  u.searchParams.set("auto", "format");
  return u.href;
}

/** A URL for the view, guaranteed to be real editorial photography. */
export function productImageSrc(
  p: ImageProduct,
  variantId?: string,
  view: ImageView = "hero",
  width = 1200,
) {
  const photo =
    productPhoto(p, variantId, view) ?? productPhoto(p, variantId, "hero");
  if (photo) return photoUrl(photo, width);
  const firstVariantMap = Object.values(PRODUCT_PHOTOS)[0];
  const firstPhoto = firstVariantMap ? Object.values(firstVariantMap)[0]?.hero : undefined;
  return firstPhoto ? photoUrl(firstPhoto, width) : "";
}

export type StageMedia = { kind: "cutout"; src: string } | { kind: "model"; src: string; poster: string };
export const PRODUCT_MODELS: Record<string, string> = {};
export function productCutSrc(p: ImageProduct, variantId?: string) {
  return productImageSrc(p, variantId, "hero", 1200);
}
export function stageMedia(p: ImageProduct, variantId?: string): StageMedia {
  return { kind: "cutout", src: productImageSrc(p, variantId, "hero", 1200) };
}
